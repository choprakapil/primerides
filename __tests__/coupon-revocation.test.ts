import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { createBookingSafe, validateCoupon } from "@/server/booking";

describe("Risk #12 Audit: Coupon Revocation Mid-Checkout Not Re-Validated", () => {
  const createdBookingIds: number[] = [];
  const createdCouponIds: number[] = [];
  let testCar: any = null;

  beforeAll(async () => {
    testCar = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: true, location: true },
    });
  });

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await prisma.bookingStatusHistory.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.priceSnapshot.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.payment.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.booking.deleteMany({
        where: { id: { in: createdBookingIds } },
      });
    }

    if (createdCouponIds.length > 0) {
      await prisma.coupon.deleteMany({
        where: { id: { in: createdCouponIds } },
      });
    }
  });

  it("Test 1: Admin deactivates coupon mid-checkout -> in-transaction lock aborts booking submission", async () => {
    const code = `MIDREVOKED-${Date.now()}`;
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: "Deactivation test coupon",
        discount_type: "fixed",
        discount_value: 500,
        min_booking_amount: 1000,
        is_active: true,
      },
    });
    createdCouponIds.push(coupon.id);

    // 1. Customer validates coupon on checkout screen (2:00 PM) -> VALID
    const initialValidation = await validateCoupon(code, 4000);
    expect(initialValidation.valid).toBe(true);

    // 2. Admin deactivates coupon mid-checkout (2:05 PM)
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { is_active: false },
    });

    // 3. Customer submits booking (2:10 PM) -> In-transaction lock catches revocation
    const start = new Date(Date.now() + 86400000 * 70);
    const end = new Date(Date.now() + 86400000 * 72);
    const bookingResult = await createBookingSafe({
      fullName: "Late Submitter",
      phone: "+919876543290",
      carId: testCar.id,
      rentalPlanId: testCar.rental_plans[0]?.id,
      startDate: start,
      endDate: end,
      couponCode: code,
    });

    expect(bookingResult.success).toBe(false);
    expect(bookingResult.statusCode).toBe(400);
    expect(bookingResult.error).toMatch(/no longer active|Invalid, expired, or inactive coupon/);

    // Verify zero booking was created in DB
    const dbBooking = await prisma.booking.findFirst({
      where: { phone: "+919876543290", coupon_code: code },
    });
    expect(dbBooking).toBeNull();
  });

  it("Test 2: Admin soft-deletes/retires coupon mid-checkout -> in-transaction lock aborts booking submission", async () => {
    const code = `MIDDELETED-${Date.now()}`;
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: "Deletion test coupon",
        discount_type: "percentage",
        discount_value: 10,
        min_booking_amount: 1000,
        is_active: true,
      },
    });
    createdCouponIds.push(coupon.id);

    // 1. Customer validates coupon -> VALID
    const initialValidation = await validateCoupon(code, 4000);
    expect(initialValidation.valid).toBe(true);

    // 2. Admin deletes coupon mid-checkout
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { deleted_at: new Date() },
    });

    // 3. Customer attempts to finalize booking -> REJECTED
    const start = new Date(Date.now() + 86400000 * 73);
    const end = new Date(Date.now() + 86400000 * 75);
    const bookingResult = await createBookingSafe({
      fullName: "Deleted Coupon Submitter",
      phone: "+919876543291",
      carId: testCar.id,
      rentalPlanId: testCar.rental_plans[0]?.id,
      startDate: start,
      endDate: end,
      couponCode: code,
    });

    expect(bookingResult.success).toBe(false);
    expect(bookingResult.statusCode).toBe(400);
    expect(bookingResult.error).toMatch(/no longer active|Invalid, expired, or inactive coupon/);
  });

  it("Test 3: Coupon reaches expiration date mid-checkout -> in-transaction lock aborts booking submission", async () => {
    const code = `MIDEXPIRED-${Date.now()}`;
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: "Expiry test coupon",
        discount_type: "fixed",
        discount_value: 400,
        min_booking_amount: 1000,
        valid_until: new Date(Date.now() + 3600000), // Valid for 1 hour
        is_active: true,
      },
    });
    createdCouponIds.push(coupon.id);

    // 1. Customer validates coupon -> VALID
    const initialValidation = await validateCoupon(code, 4000);
    expect(initialValidation.valid).toBe(true);

    // 2. Coupon expires mid-checkout (backdate valid_until)
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { valid_until: new Date(Date.now() - 60000) }, // Expired 1 min ago
    });

    // 3. Customer submits booking -> REJECTED
    const start = new Date(Date.now() + 86400000 * 76);
    const end = new Date(Date.now() + 86400000 * 78);
    const bookingResult = await createBookingSafe({
      fullName: "Expired Coupon Submitter",
      phone: "+919876543292",
      carId: testCar.id,
      rentalPlanId: testCar.rental_plans[0]?.id,
      startDate: start,
      endDate: end,
      couponCode: code,
    });

    expect(bookingResult.success).toBe(false);
    expect(bookingResult.statusCode).toBe(400);
    expect(bookingResult.error).toContain("has expired");
  });

  it("Test 4: Admin increases minimum spend mid-checkout -> in-transaction lock rejects below-threshold booking", async () => {
    const code = `MIDMINSPEND-${Date.now()}`;
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: "Min spend test coupon",
        discount_type: "fixed",
        discount_value: 300,
        min_booking_amount: 1000,
        is_active: true,
      },
    });
    createdCouponIds.push(coupon.id);

    // 1. Customer validates coupon on booking with amount 2500 -> VALID
    const initialValidation = await validateCoupon(code, 2500);
    expect(initialValidation.valid).toBe(true);

    // 2. Admin raises minimum spend to 50000 mid-checkout
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { min_booking_amount: 50000 },
    });

    // 3. Customer submits booking for 2500 -> REJECTED inside transaction
    const start = new Date(Date.now() + 86400000 * 79);
    const end = new Date(Date.now() + 86400000 * 81);
    const bookingResult = await createBookingSafe({
      fullName: "Low Spend Submitter",
      phone: "+919876543293",
      carId: testCar.id,
      rentalPlanId: testCar.rental_plans[0]?.id,
      startDate: start,
      endDate: end,
      couponCode: code,
    });

    expect(bookingResult.success).toBe(false);
    expect(bookingResult.statusCode).toBe(400);
    expect(bookingResult.error).toContain("Minimum booking value");
  });

  it("Test 5: Active, unrevoked coupon succeeds and applies correct discount", async () => {
    const code = `STABLE-${Date.now()}`;
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: "Stable valid coupon",
        discount_type: "fixed",
        discount_value: 500,
        min_booking_amount: 1000,
        is_active: true,
      },
    });
    createdCouponIds.push(coupon.id);

    const start = new Date(Date.now() + 86400000 * 82);
    const end = new Date(Date.now() + 86400000 * 84);
    const bookingResult = await createBookingSafe({
      fullName: "Happy Customer",
      phone: "+919876543294",
      carId: testCar.id,
      rentalPlanId: testCar.rental_plans[0]?.id,
      startDate: start,
      endDate: end,
      couponCode: code,
    });

    expect(bookingResult.success).toBe(true);
    expect(bookingResult.statusCode).toBe(201);
    expect(bookingResult.booking?.coupon_code).toBe(code);
    expect(Number(bookingResult.booking?.discount_amount)).toBe(500);
    if (bookingResult.booking?.id) createdBookingIds.push(bookingResult.booking.id);
  });
});
