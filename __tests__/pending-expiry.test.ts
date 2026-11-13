import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { expireStalePendingBookings } from "@/server/booking/cleanup";
import { createBookingSafe } from "@/server/booking";

describe("Issue #4: Abandoned Pending Checkouts Lock Inventory", () => {
  const createdBookingIds: number[] = [];

  afterAll(async () => {
    // Cleanup: delete test bookings and associated records
    if (createdBookingIds.length > 0) {
      await prisma.bookingStatusHistory.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.cancellation.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.priceSnapshot.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.booking.deleteMany({
        where: { id: { in: createdBookingIds } },
      });
    }
  });

  it("Test 1: expireStalePendingBookings correctly expires bookings older than TTL", async () => {
    // Find a car we can use for testing
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: { where: { is_active: true } } },
    });

    if (!car || car.rental_plans.length === 0) {
      console.warn("No available car with rental plans found, skipping test");
      return;
    }

    // Create a booking via the normal flow
    const futureStart = new Date(Date.now() + 86400000 * 50); // 50 days out to avoid conflicts
    const futureEnd = new Date(Date.now() + 86400000 * 52);

    const result = await createBookingSafe({
      fullName: "Expiry Test User",
      phone: "+919000000001",
      carId: car.id,
      rentalPlanId: car.rental_plans[0].id,
      startDate: futureStart,
      endDate: futureEnd,
      idempotencyKey: `expiry-test-${Date.now()}-1`,
    });

    expect(result.success).toBe(true);
    expect(result.booking).toBeDefined();
    createdBookingIds.push(result.booking!.id);

    // Artificially backdate the created_at to simulate an old pending booking
    await prisma.booking.update({
      where: { id: result.booking!.id },
      data: {
        created_at: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      },
    });

    // Verify booking is still "pending"
    const beforeCleanup = await prisma.booking.findUnique({
      where: { id: result.booking!.id },
    });
    expect(beforeCleanup?.status).toBe("pending");

    // Run cleanup with 30 minute TTL — our 45-minute-old booking should be expired
    const cleanupResult = await expireStalePendingBookings(30);

    expect(cleanupResult.expiredCount).toBeGreaterThanOrEqual(1);
    expect(cleanupResult.expiredBookingCodes).toContain(result.booking!.booking_code);

    // Verify booking is now "expired"
    const afterCleanup = await prisma.booking.findUnique({
      where: { id: result.booking!.id },
    });
    expect(afterCleanup?.status).toBe("expired");

    // Verify cancellation record was created
    const cancellation = await prisma.cancellation.findUnique({
      where: { booking_id: result.booking!.id },
    });
    expect(cancellation).toBeDefined();
    expect(cancellation?.cancelled_by).toBe("system");

    // Verify audit trail was created
    const history = await prisma.bookingStatusHistory.findFirst({
      where: {
        booking_id: result.booking!.id,
        to_status: "expired",
      },
    });
    expect(history).toBeDefined();
    expect(history?.from_status).toBe("pending");
    expect(history?.changed_by_role).toBe("system");

    console.log(
      `✅ Booking ${result.booking!.booking_code} correctly expired after 45 min (TTL: 30 min)`
    );
  });

  it("Test 2: Expired pending bookings release inventory for new bookings", async () => {
    // Find a car with fleet_count=1
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null, fleet_count: 1 },
      include: { rental_plans: { where: { is_active: true } } },
    });

    if (!car || car.rental_plans.length === 0) {
      console.warn("No single-unit car with rental plans found, skipping test");
      return;
    }

    // Create a pending booking that will lock the car
    const futureStart = new Date(Date.now() + 86400000 * 60); // 60 days out
    const futureEnd = new Date(Date.now() + 86400000 * 62);

    const staleBooking = await createBookingSafe({
      fullName: "Stale Checkout User",
      phone: "+919000000002",
      carId: car.id,
      rentalPlanId: car.rental_plans[0].id,
      startDate: futureStart,
      endDate: futureEnd,
      idempotencyKey: `expiry-inventory-test-${Date.now()}-2`,
    });

    expect(staleBooking.success).toBe(true);
    createdBookingIds.push(staleBooking.booking!.id);

    // Attempt to book the same car for the same dates — should fail (inventory locked)
    const blockedBooking = await createBookingSafe({
      fullName: "Blocked User",
      phone: "+919000000003",
      carId: car.id,
      rentalPlanId: car.rental_plans[0].id,
      startDate: futureStart,
      endDate: futureEnd,
      idempotencyKey: `expiry-inventory-test-${Date.now()}-3`,
    });

    expect(blockedBooking.success).toBe(false);
    expect(blockedBooking.statusCode).toBe(409);
    console.log(`🔒 Correctly blocked: "${blockedBooking.error}"`);

    // Now backdate the pending booking to simulate abandonment and run cleanup
    await prisma.booking.update({
      where: { id: staleBooking.booking!.id },
      data: {
        created_at: new Date(Date.now() - 35 * 60 * 1000), // 35 minutes ago
      },
    });

    await expireStalePendingBookings(30);

    // Verify the stale booking is now expired
    const expiredBooking = await prisma.booking.findUnique({
      where: { id: staleBooking.booking!.id },
    });
    expect(expiredBooking?.status).toBe("expired");

    // NOW the same car for the same dates should be bookable again
    const releasedBooking = await createBookingSafe({
      fullName: "Released Slot User",
      phone: "+919000000004",
      carId: car.id,
      rentalPlanId: car.rental_plans[0].id,
      startDate: futureStart,
      endDate: futureEnd,
      idempotencyKey: `expiry-inventory-test-${Date.now()}-4`,
    });

    expect(releasedBooking.success).toBe(true);
    expect(releasedBooking.statusCode).toBe(201);
    createdBookingIds.push(releasedBooking.booking!.id);

    console.log(
      `✅ Inventory released: new booking ${releasedBooking.booking!.booking_code} succeeded after stale pending expired`
    );
  });

  it("Test 3: Bookings within TTL window are NOT expired", async () => {
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: { where: { is_active: true } } },
    });

    if (!car || car.rental_plans.length === 0) {
      console.warn("No available car found, skipping test");
      return;
    }

    // Create a fresh pending booking (created_at = now, well within TTL)
    const futureStart = new Date(Date.now() + 86400000 * 70); // 70 days out
    const futureEnd = new Date(Date.now() + 86400000 * 72);

    const freshBooking = await createBookingSafe({
      fullName: "Fresh Checkout User",
      phone: "+919000000005",
      carId: car.id,
      rentalPlanId: car.rental_plans[0].id,
      startDate: futureStart,
      endDate: futureEnd,
      idempotencyKey: `expiry-fresh-test-${Date.now()}-5`,
    });

    expect(freshBooking.success).toBe(true);
    createdBookingIds.push(freshBooking.booking!.id);

    // Run cleanup — fresh booking should NOT be affected
    const cleanupResult = await expireStalePendingBookings(30);

    // Verify the fresh booking is still pending
    const stillPending = await prisma.booking.findUnique({
      where: { id: freshBooking.booking!.id },
    });
    expect(stillPending?.status).toBe("pending");

    // The fresh booking should NOT appear in expired codes
    expect(cleanupResult.expiredBookingCodes).not.toContain(
      freshBooking.booking!.booking_code
    );

    console.log(
      `✅ Fresh booking ${freshBooking.booking!.booking_code} correctly preserved (within TTL)`
    );
  });
});
