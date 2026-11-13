import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { createBookingSafe } from "@/server/booking";
import { getFinancialYearCode, getSeriesPrefix, generateSequentialBookingCode } from "@/server/invoicing/sequence";

describe("Issue #6: Sequential Invoice Numbering (GST Rule 46)", () => {
  const createdBookingIds: number[] = [];

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await prisma.bookingStatusHistory.deleteMany({
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

  it("Test 1: Financial year code is correct for Oct 2026 (FY 2026-27 = '2627')", () => {
    // October 2026 falls in FY Apr 2026 - Mar 2027
    const oct2026 = new Date(2026, 9, 1); // month 9 = October
    expect(getFinancialYearCode(oct2026)).toBe("2627");

    // January 2027 still falls in FY 2026-27 (Jan-Mar = previous FY start)
    const jan2027 = new Date(2027, 0, 15);
    expect(getFinancialYearCode(jan2027)).toBe("2627");

    // April 2027 starts FY 2027-28
    const apr2027 = new Date(2027, 3, 1);
    expect(getFinancialYearCode(apr2027)).toBe("2728");

    console.log("✅ Financial year codes: Oct 2026 → 2627, Jan 2027 → 2627, Apr 2027 → 2728");
  });

  it("Test 2: Series prefix format is correct", () => {
    const oct2026 = new Date(2026, 9, 1);
    expect(getSeriesPrefix(oct2026)).toBe("PR/2627");

    console.log("✅ Series prefix: PR/2627");
  });

  it("Test 3: Sequential booking codes are strictly monotonic", async () => {
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: { where: { is_active: true } } },
    });

    if (!car || car.rental_plans.length === 0) {
      console.warn("No available car found, skipping sequential test");
      return;
    }

    // Create 3 bookings in sequence with non-overlapping dates
    const codes: string[] = [];

    for (let i = 0; i < 3; i++) {
      const futureStart = new Date(Date.now() + 86400000 * (90 + i * 5));
      const futureEnd = new Date(Date.now() + 86400000 * (92 + i * 5));

      const result = await createBookingSafe({
        fullName: `Sequential Test User ${i + 1}`,
        phone: `+91900000002${i}`,
        carId: car.id,
        rentalPlanId: car.rental_plans[0].id,
        startDate: futureStart,
        endDate: futureEnd,
        idempotencyKey: `seq-test-${Date.now()}-${i}`,
      });

      expect(result.success).toBe(true);
      createdBookingIds.push(result.booking!.id);
      codes.push(result.booking!.booking_code);
    }

    // All codes should follow the PR/FYFY/NNNNNN format
    const codePattern = /^PR\/\d{4}\/\d{6}$/;
    for (const code of codes) {
      expect(code).toMatch(codePattern);
    }

    // Extract sequence numbers and verify they are strictly increasing
    // Extract sequence numbers and verify they are strictly increasing
    const numbers = codes.map((c) => parseInt(c.split("/")[2], 10));
    for (let i = 1; i < numbers.length; i++) {
      expect(numbers[i]).toBeGreaterThan(numbers[i - 1]);
    }

    console.log(`✅ Sequential codes: ${codes.join(", ")} — strictly monotonic: ${numbers.join(" → ")}`);
  });

  it("Test 4: Concurrent booking requests still produce unique sequential codes", async () => {
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null, fleet_count: { gte: 3 } },
      include: { rental_plans: { where: { is_active: true } } },
    });

    if (!car || car.rental_plans.length === 0) {
      // Try any car if no multi-unit car exists — use non-overlapping dates
      const singleCar = await prisma.car.findFirst({
        where: { is_available: true, deleted_at: null },
        include: { rental_plans: { where: { is_active: true } } },
      });

      if (!singleCar || singleCar.rental_plans.length === 0) {
        console.warn("No available car found, skipping concurrent test");
        return;
      }

      // For a single-unit car, use non-overlapping dates
      const results = await Promise.all(
        [0, 1, 2].map((i) => {
          const start = new Date(Date.now() + 86400000 * (120 + i * 10));
          const end = new Date(Date.now() + 86400000 * (122 + i * 10));
          return createBookingSafe({
            fullName: `Concurrent User ${i + 1}`,
            phone: `+91900000003${i}`,
            carId: singleCar.id,
            rentalPlanId: singleCar.rental_plans[0].id,
            startDate: start,
            endDate: end,
            idempotencyKey: `concurrent-seq-${Date.now()}-${i}`,
          });
        })
      );

      const successfulResults = results.filter((r) => r.success);
      for (const r of successfulResults) {
        createdBookingIds.push(r.booking!.id);
      }

      // All successful results should have unique codes in sequential format
      const codes = successfulResults.map((r) => r.booking!.booking_code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);

      // All should match format
      for (const code of codes) {
        expect(code).toMatch(/^PR\/\d{4}\/\d{6}$/);
      }

      console.log(`✅ Concurrent sequential codes (non-overlapping): ${codes.join(", ")} — all unique`);
      return;
    }

    // Multi-unit car: fire 3 concurrent requests for same dates
    const start = new Date(Date.now() + 86400000 * 150);
    const end = new Date(Date.now() + 86400000 * 152);

    const results = await Promise.all(
      [0, 1, 2].map((i) =>
        createBookingSafe({
          fullName: `Concurrent User ${i + 1}`,
          phone: `+91900000003${i}`,
          carId: car.id,
          rentalPlanId: car.rental_plans[0].id,
          startDate: start,
          endDate: end,
          idempotencyKey: `concurrent-seq-${Date.now()}-${i}`,
        })
      )
    );

    const successfulResults = results.filter((r) => r.success);
    for (const r of successfulResults) {
      createdBookingIds.push(r.booking!.id);
    }

    const codes = successfulResults.map((r) => r.booking!.booking_code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);

    for (const code of codes) {
      expect(code).toMatch(/^PR\/\d{4}\/\d{6}$/);
    }

    console.log(`✅ Concurrent sequential codes: ${codes.join(", ")} — all unique, no duplicates`);
  });

  it("Test 5: No more random Math.random() codes (regression guard)", async () => {
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: { where: { is_active: true } } },
    });

    if (!car || car.rental_plans.length === 0) {
      console.warn("No available car found, skipping regression test");
      return;
    }

    const futureStart = new Date(Date.now() + 86400000 * 200);
    const futureEnd = new Date(Date.now() + 86400000 * 202);

    const result = await createBookingSafe({
      fullName: "Regression Test User",
      phone: "+919000000039",
      carId: car.id,
      rentalPlanId: car.rental_plans[0].id,
      startDate: futureStart,
      endDate: futureEnd,
      idempotencyKey: `regression-seq-${Date.now()}`,
    });

    expect(result.success).toBe(true);
    createdBookingIds.push(result.booking!.id);

    const code = result.booking!.booking_code;

    // Must NOT match old random pattern: PR-YYYY-NNNNNN
    expect(code).not.toMatch(/^PR-\d{4}-\d{6}$/);

    // Must match new sequential pattern: PR/FYFY/NNNNNN
    expect(code).toMatch(/^PR\/\d{4}\/\d{6}$/);

    console.log(`✅ Regression guard: "${code}" matches new format, old random format rejected`);
  });
});
