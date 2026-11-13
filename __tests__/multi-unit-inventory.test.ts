import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { createBookingSafe } from "@/server/booking";

describe("Risk #7 Audit: Multi-Unit Inventory Overbooking Under Load", () => {
  const createdBookingIds: number[] = [];
  let testCarId: number | null = null;
  let originalFleetCount: number = 1;

  afterAll(async () => {
    // Clean up any test bookings
    if (createdBookingIds.length > 0) {
      await prisma.booking.deleteMany({
        where: { id: { in: createdBookingIds } },
      });
    }

    // Restore original fleet count if changed
    if (testCarId !== null) {
      await prisma.car.update({
        where: { id: testCarId },
        data: { fleet_count: originalFleetCount },
      });
    }
  });

  it("Multi-unit fleet_count=2 with 3 simultaneous booking attempts: exactly 2 succeed, exactly 1 fails with 409", async () => {
    // 1. Locate an active vehicle and set fleet_count = 2 for this test
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: true },
    });

    expect(car).toBeDefined();
    if (!car) return;

    testCarId = car.id;
    originalFleetCount = car.fleet_count;

    // Explicitly set fleet_count = 2
    await prisma.car.update({
      where: { id: car.id },
      data: { fleet_count: 2 },
    });

    const start = new Date(Date.now() + 86400000 * 55); // 55 days in future
    const end = new Date(Date.now() + 86400000 * 58);   // 58 days in future

    // Ensure clean slate for this car and date range
    await prisma.booking.deleteMany({
      where: {
        car_id: car.id,
        start_date: { lt: end },
        end_date: { gt: start },
      },
    });

    // 2. Fire 3 concurrent booking requests simultaneously
    const [res1, res2, res3] = await Promise.all([
      createBookingSafe({
        fullName: "Multi-Unit User A",
        phone: "+919876543221",
        email: "userA@primerides.in",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
      }),
      createBookingSafe({
        fullName: "Multi-Unit User B",
        phone: "+919876543222",
        email: "userB@primerides.in",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
      }),
      createBookingSafe({
        fullName: "Multi-Unit User C",
        phone: "+919876543223",
        email: "userC@primerides.in",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
      }),
    ]);

    // Track for cleanup
    if (res1.booking?.id) createdBookingIds.push(res1.booking.id);
    if (res2.booking?.id) createdBookingIds.push(res2.booking.id);
    if (res3.booking?.id) createdBookingIds.push(res3.booking.id);

    const results = [res1, res2, res3];
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    console.log("Multi-Unit Concurrency Results (fleet_count=2, 3 attempts):", {
      success_count: successes.length,
      failure_count: failures.length,
      success_codes: successes.map((s) => s.booking?.booking_code),
      failure_errors: failures.map((f) => ({ status: f.statusCode, error: f.error })),
    });

    // 3. Assertions
    // Exactly 2 bookings must succeed
    expect(successes.length).toBe(2);

    // Exactly 1 booking must be rejected
    expect(failures.length).toBe(1);

    // The rejected request must return 409 Conflict with clear multi-unit capacity messaging
    expect(failures[0].statusCode).toBe(409);
    expect(failures[0].error).toMatch(/All 2 units of .* are already reserved/);

    // The 2 successful bookings must have distinct booking codes and IDs
    expect(successes[0].booking?.id).not.toBe(successes[1].booking?.id);
    expect(successes[0].booking?.booking_code).not.toBe(successes[1].booking?.booking_code);

    // 4. Verify Database state: exactly 2 bookings in DB for this window
    const dbBookings = await prisma.booking.findMany({
      where: {
        car_id: car.id,
        deleted_at: null,
        status: { in: ["pending", "confirmed", "active"] },
        AND: [{ start_date: { lt: end } }, { end_date: { gt: start } }],
      },
    });

    expect(dbBookings.length).toBe(2);
  });

  it("Single-unit fleet_count=1: 2 simultaneous booking attempts: exactly 1 succeeds, 1 fails with 409", async () => {
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: true },
    });

    if (!car) return;

    testCarId = car.id;
    originalFleetCount = car.fleet_count;

    await prisma.car.update({
      where: { id: car.id },
      data: { fleet_count: 1 },
    });

    const start = new Date(Date.now() + 86400000 * 60);
    const end = new Date(Date.now() + 86400000 * 63);

    const [res1, res2] = await Promise.all([
      createBookingSafe({
        fullName: "Single-Unit User 1",
        phone: "+919876543231",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
      }),
      createBookingSafe({
        fullName: "Single-Unit User 2",
        phone: "+919876543232",
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
      }),
    ]);

    if (res1.booking?.id) createdBookingIds.push(res1.booking.id);
    if (res2.booking?.id) createdBookingIds.push(res2.booking.id);

    const successes = [res1, res2].filter((r) => r.success);
    const failures = [res1, res2].filter((r) => !r.success);

    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
    expect(failures[0].statusCode).toBe(409);
    expect(failures[0].error).toMatch(/All 1 units of .* are already reserved/);
  });

  it("High-load multi-unit test: fleet_count=3 with 5 simultaneous booking attempts: exactly 3 succeed, exactly 2 fail with 409", async () => {
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: true },
    });

    if (!car) return;

    testCarId = car.id;
    originalFleetCount = car.fleet_count;

    await prisma.car.update({
      where: { id: car.id },
      data: { fleet_count: 3 },
    });

    const start = new Date(Date.now() + 86400000 * 70);
    const end = new Date(Date.now() + 86400000 * 73);

    // Fire 5 concurrent booking requests
    const attempts = [1, 2, 3, 4, 5].map((idx) =>
      createBookingSafe({
        fullName: `Multi-Load User ${idx}`,
        phone: `+91987654324${idx}`,
        carId: car.id,
        rentalPlanId: car.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
      })
    );

    const results = await Promise.all(attempts);

    results.forEach((r) => {
      if (r.booking?.id) createdBookingIds.push(r.booking.id);
    });

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    console.log("High-load Multi-Unit (fleet=3, 5 attempts):", {
      success_count: successes.length,
      failure_count: failures.length,
      success_codes: successes.map((s) => s.booking?.booking_code),
    });

    // Exactly 3 must succeed, exactly 2 must be rejected
    expect(successes.length).toBe(3);
    expect(failures.length).toBe(2);

    // All successful codes must be unique
    const uniqueCodes = new Set(successes.map((s) => s.booking?.booking_code));
    expect(uniqueCodes.size).toBe(3);

    // Both failures must be 409 with multi-unit messaging
    failures.forEach((f) => {
      expect(f.statusCode).toBe(409);
      expect(f.error).toMatch(/All 3 units of .* are already reserved/);
    });
  });
});
