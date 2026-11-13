import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { createBookingSafe, validateCoupon } from "@/server/booking";

describe("Risk #11 Audit & Coupon Management Controls", () => {
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

  it("Test 1 (Risk #11): Concurrency row-locking prevents usage_limit overbooking under parallel checkouts", async () => {
    // Create a coupon with usage_limit = 1
    const testCode = `CONCUR1-${Date.now()}`;
    const coupon = await prisma.coupon.create({
      data: {
        code: testCode,
        description: "Strict 1-use concurrency test coupon",
        discount_type: "fixed",
        discount_value: 500,
        min_booking_amount: 1000,
        usage_limit: 1,
        used_count: 0,
        per_user_limit: 1,
        is_active: true,
      },
    });
    createdCouponIds.push(coupon.id);

    const start = new Date(Date.now() + 86400000 * 50);
    const end = new Date(Date.now() + 86400000 * 52);

    // Fire 3 simultaneous booking attempts racing for the exact same 1-usage coupon
    const results = await Promise.all([
      createBookingSafe({
        fullName: "Racer 1",
        phone: "+919999900001",
        carId: testCar.id,
        rentalPlanId: testCar.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
        couponCode: testCode,
      }),
      createBookingSafe({
        fullName: "Racer 2",
        phone: "+919999900002",
        carId: testCar.id,
        rentalPlanId: testCar.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
        couponCode: testCode,
      }),
      createBookingSafe({
        fullName: "Racer 3",
        phone: "+919999900003",
        carId: testCar.id,
        rentalPlanId: testCar.rental_plans[0]?.id,
        startDate: start,
        endDate: end,
        couponCode: testCode,
      }),
    ]);

    for (const r of results) {
      if (r.booking?.id) createdBookingIds.push(r.booking.id);
    }

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    // Exactly 1 request must succeed; 2 must be rejected because usage_limit was 1
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(2);

    // Failed requests must explicitly report coupon limit exceeded
    for (const f of failures) {
      expect(f.error).toMatch(/maximum redemption limit|already reserved/);
      expect([400, 409]).toContain(f.statusCode);
    }

    // Verify the coupon in the database has used_count = 1, NOT 2 or 3
    const updatedCoupon = await prisma.coupon.findUnique({ where: { id: coupon.id } });
    expect(updatedCoupon?.used_count).toBe(1);
  });

  it("Test 2: Platform targeting restrictions (Website vs Android vs iOS)", async () => {
    // Create coupon valid only on mobile app (Android & iOS)
    const mobileCode = `MOBONLY-${Date.now()}`;
    const mobileCoupon = await prisma.coupon.create({
      data: {
        code: mobileCode,
        description: "Mobile App Exclusive Offer",
        discount_type: "percentage",
        discount_value: 15,
        min_booking_amount: 1000,
        applicable_platforms: "android,ios",
        is_active: true,
      },
    });
    createdCouponIds.push(mobileCoupon.id);

    // 1. Validation attempt from Website -> Must fail
    const webValidation = await validateCoupon(mobileCode, 5000, { platform: "web" });
    expect(webValidation.valid).toBe(false);
    expect(webValidation.error).toContain("PrimeRides Mobile App");

    // 2. Validation attempt from Android App -> Must succeed
    const androidValidation = await validateCoupon(mobileCode, 5000, { platform: "android" });
    expect(androidValidation.valid).toBe(true);
    expect(androidValidation.discountAmount).toBe(750); // 15% of 5000

    // 3. Validation attempt from iOS App -> Must succeed
    const iosValidation = await validateCoupon(mobileCode, 5000, { platform: "ios" });
    expect(iosValidation.valid).toBe(true);

    // 4. Booking attempt on Website with mobile-only coupon -> Must fail in transaction
    const start = new Date(Date.now() + 86400000 * 55);
    const end = new Date(Date.now() + 86400000 * 57);
    const webBooking = await createBookingSafe({
      fullName: "Web Tester",
      phone: "+919999900010",
      carId: testCar.id,
      rentalPlanId: testCar.rental_plans[0]?.id,
      startDate: start,
      endDate: end,
      couponCode: mobileCode,
      platform: "web",
    });
    expect(webBooking.success).toBe(false);
    expect(webBooking.error).toMatch(/PrimeRides Mobile App|not valid on Website/);
  });

  it("Test 3: First-time customers only restriction (new_users_only: true)", async () => {
    const newUserCode = `NEWBIE-${Date.now()}`;
    const newUserCoupon = await prisma.coupon.create({
      data: {
        code: newUserCode,
        description: "First-Time Customers Exclusive Offer",
        discount_type: "fixed",
        discount_value: 1000,
        min_booking_amount: 2000,
        new_users_only: true,
        is_active: true,
      },
    });
    createdCouponIds.push(newUserCoupon.id);

    const existingPhone = "+919999900020";

    // 1. Create a prior completed booking for this customer phone
    const priorBooking = await prisma.booking.create({
      data: {
        booking_code: `PR/TEST/PRIOR${Date.now().toString().slice(-4)}`,
        full_name: "Returning Customer",
        phone: existingPhone,
        car_id: testCar.id,
        car_name: testCar.name,
        rental_plan_id: testCar.rental_plans[0]?.id,
        start_date: new Date(Date.now() - 86400000 * 10),
        end_date: new Date(Date.now() - 86400000 * 8),
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        total_amount: 5000,
        status: "confirmed",
      },
    });
    createdBookingIds.push(priorBooking.id);

    // 2. Returning customer attempts to validate -> Rejected
    const returningValidation = await validateCoupon(newUserCode, 4000, { phone: existingPhone });
    expect(returningValidation.valid).toBe(false);
    expect(returningValidation.error).toContain("first-time customers");

    // 3. Brand new customer with zero bookings attempts to validate -> Accepted
    const freshPhone = "+919999900099";
    const newCustomerValidation = await validateCoupon(newUserCode, 4000, { phone: freshPhone });
    expect(newCustomerValidation.valid).toBe(true);
    expect(newCustomerValidation.discountAmount).toBe(1000);
  });

  it("Test 4: Per-user usage limit controls (per_user_limit: 1)", async () => {
    const userLimitCode = `ONCEPERUSER-${Date.now()}`;
    const userLimitCoupon = await prisma.coupon.create({
      data: {
        code: userLimitCode,
        description: "Max 1 per user offer",
        discount_type: "fixed",
        discount_value: 300,
        min_booking_amount: 1000,
        usage_limit: 100, // Open global pool
        per_user_limit: 1, // But strictly 1 per customer
        is_active: true,
      },
    });
    createdCouponIds.push(userLimitCoupon.id);

    const customerPhone = "+919999900030";

    // First use: Valid
    const firstValidation = await validateCoupon(userLimitCode, 3000, { phone: customerPhone });
    expect(firstValidation.valid).toBe(true);

    // Simulate customer completing their first booking using this coupon
    const booking1 = await prisma.booking.create({
      data: {
        booking_code: `PR/TEST/USE1-${Date.now().toString().slice(-4)}`,
        full_name: "Loyal Customer",
        phone: customerPhone,
        car_id: testCar.id,
        car_name: testCar.name,
        rental_plan_id: testCar.rental_plans[0]?.id,
        start_date: new Date(Date.now() + 86400000 * 60),
        end_date: new Date(Date.now() + 86400000 * 62),
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        total_amount: 3000,
        coupon_id: userLimitCoupon.id,
        coupon_code: userLimitCode,
        status: "confirmed",
      },
    });
    createdBookingIds.push(booking1.id);

    // Second use attempt by same customer -> Must be rejected
    const secondValidation = await validateCoupon(userLimitCode, 3000, { phone: customerPhone });
    expect(secondValidation.valid).toBe(false);
    expect(secondValidation.error).toContain("maximum allowed times (1)");

    // A different customer can still use it
    const otherPhone = "+919999900031";
    const otherValidation = await validateCoupon(userLimitCode, 3000, { phone: otherPhone });
    expect(otherValidation.valid).toBe(true);
  });

  it("Test 5: Homepage slider visibility flag (show_in_slider: true)", async () => {
    const sliderCode = `SLIDER-${Date.now()}`;
    const sliderCoupon = await prisma.coupon.create({
      data: {
        code: sliderCode,
        description: "Homepage Slider Featured Promo",
        discount_type: "percentage",
        discount_value: 20,
        min_booking_amount: 2500,
        show_in_slider: true,
        is_active: true,
      },
    });
    createdCouponIds.push(sliderCoupon.id);

    // Query coupons prioritized for the homepage slider
    const featuredCoupons = await prisma.coupon.findMany({
      where: { is_active: true, deleted_at: null, show_in_slider: true },
      orderBy: { created_at: "desc" },
    });

    expect(featuredCoupons.some((c) => c.code === sliderCode)).toBe(true);
  });
});
