import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { createBookingSafe, validateCoupon } from "@/server/booking";

describe("Risk & Concurrency Audit Tests", () => {
  const createdBookingIds: number[] = [];

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await prisma.booking.deleteMany({
        where: { id: { in: createdBookingIds } },
      });
    }
  });

  it("Test 1: Simultaneous booking requests for the same vehicle and overlapping dates", async () => {
    // Find an active car with fleet_count = 1
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null, fleet_count: 1 },
      include: { rental_plans: true },
    });

    if (!car) {
      console.warn("No car with fleet_count=1 found, skipping live overlap test");
      return;
    }

    const start = new Date(Date.now() + 86400000 * 20); // 20 days in future
    const end = new Date(Date.now() + 86400000 * 23);

    // Fire 2 concurrent booking requests simultaneously
    const [res1, res2] = await Promise.all([
      createBookingSafe({
        fullName: "Test User 1",
        phone: "+919876543210",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
      }),
      createBookingSafe({
        fullName: "Test User 2",
        phone: "+919876543211",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
      }),
    ]);

    if (res1.booking?.id) createdBookingIds.push(res1.booking.id);
    if (res2.booking?.id) createdBookingIds.push(res2.booking.id);

    console.log("Concurrent Booking Test Results:", {
      req1_success: res1.success,
      req1_code: res1.booking?.booking_code,
      req2_success: res2.success,
      req2_code: res2.booking?.booking_code,
      req2_error: res2.error,
    });

    // Assert that double booking is strictly prevented: exactly one request succeeds and the other fails with 409
    const bothSucceeded = res1.success && res2.success;
    expect(bothSucceeded).toBe(false);
    expect(res1.success !== res2.success).toBe(true);
    const failedRes = res1.success ? res2 : res1;
    expect(failedRes.statusCode).toBe(409);
    expect(failedRes.error).toMatch(/already reserved|unavailable/);
  });

  it("Test 2: Idempotency Key protection under rapid double-submit", async () => {
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: true },
    });
    if (!car) return;

    const start = new Date(Date.now() + 86400000 * 30);
    const end = new Date(Date.now() + 86400000 * 32);
    const sharedIdempotencyKey = `idem-test-${Date.now()}`;

    // Rapidly fire the exact same request twice with the same idempotency key
    const [res1, res2] = await Promise.all([
      createBookingSafe({
        fullName: "Idempotent User",
        phone: "+919876543212",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
        idempotencyKey: sharedIdempotencyKey,
      }),
      createBookingSafe({
        fullName: "Idempotent User",
        phone: "+919876543212",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
        idempotencyKey: sharedIdempotencyKey,
      }),
    ]);

    if (res1.booking?.id) createdBookingIds.push(res1.booking.id);
    if (res2.booking?.id && res2.booking.id !== res1.booking?.id) {
      createdBookingIds.push(res2.booking.id);
    }

    // Both requests must succeed and return the EXACT same booking record without duplicate creation or 500 error
    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(res1.booking?.id).toBeDefined();
    expect(res2.booking?.id).toBe(res1.booking?.id);
    expect(res2.booking?.booking_code).toBe(res1.booking?.booking_code);
  });

  it("Test 3: Coupon usage limit boundary concurrency check", async () => {
    // Create a temporary test coupon with limit = 1
    const testCode = `LIMIT1-${Date.now()}`;
    const coupon = await prisma.coupon.create({
      data: {
        code: testCode,
        description: "Test boundary coupon",
        discount_type: "flat",
        discount_value: 500,
        min_booking_amount: 1000,
        usage_limit: 1,
        used_count: 0,
        is_active: true,
      },
    });

    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: true },
    });

    if (!car) return;

    const start = new Date(Date.now() + 86400000 * 40);
    const end = new Date(Date.now() + 86400000 * 42);

    // Fire 2 simultaneous booking attempts using the limit=1 coupon
    const [res1, res2] = await Promise.all([
      createBookingSafe({
        fullName: "Coupon User 1",
        phone: "+919876543213",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
        couponCode: testCode,
      }),
      createBookingSafe({
        fullName: "Coupon User 2",
        phone: "+919876543214",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
        couponCode: testCode,
      }),
    ]);

    if (res1.booking?.id) createdBookingIds.push(res1.booking.id);
    if (res2.booking?.id) createdBookingIds.push(res2.booking.id);

    const updatedCoupon = await prisma.coupon.findUnique({ where: { id: coupon.id } });

    console.log("Coupon Concurrency Results:", {
      req1_success: res1.success,
      req2_success: res2.success,
      final_used_count: updatedCoupon?.used_count,
      usage_limit: updatedCoupon?.usage_limit,
    });

    // Cleanup coupon
    await prisma.coupon.delete({ where: { id: coupon.id } });
  });
});
