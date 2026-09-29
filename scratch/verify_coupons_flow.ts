import { prisma } from "../src/server/db/client";
import { validateCoupon, createBookingSafe } from "../src/server/booking";

async function main() {
  console.log("=== STEP 1: SEEDING PROMOTIONAL COUPONS ===");

  // Clean up any previous test coupons
  await prisma.coupon.deleteMany({
    where: { code: { in: ["PRIME10", "LUXURY500", "EXPIRED50"] } },
  });

  const prime10 = await prisma.coupon.create({
    data: {
      code: "PRIME10",
      description: "10% Luxury Welcome Discount",
      discount_type: "percentage",
      discount_value: 10,
      min_booking_amount: 3000,
      max_discount_amount: 2000,
      usage_limit: 50,
      is_active: true,
    },
  });
  console.log("Created coupon:", prime10.code, "(10% off up to ₹2,000, min ₹3,000)");

  const luxury500 = await prisma.coupon.create({
    data: {
      code: "LUXURY500",
      description: "Flat ₹500 Off Luxury Fleet",
      discount_type: "fixed",
      discount_value: 500,
      min_booking_amount: 2000,
      usage_limit: 100,
      is_active: true,
    },
  });
  console.log("Created coupon:", luxury500.code, "(Flat ₹500 off, min ₹2,000)");

  console.log("\n=== STEP 2: UNIT TESTING VALIDATE COUPON ENGINE ===");

  // Test A: Normal 10% calculation on ₹8,000
  const check1 = await validateCoupon("PRIME10", 8000);
  console.log("Check 1 (PRIME10 on ₹8,000):", {
    valid: check1.valid,
    discountAmount: check1.discountAmount,
    netPayable: check1.netPayableAmount,
  });
  if (check1.discountAmount !== 800 || check1.netPayableAmount !== 7200) {
    throw new Error("Check 1 failed: Expected ₹800 discount on ₹8,000");
  }

  // Test B: Cap enforcement on ₹30,000
  const check2 = await validateCoupon("PRIME10", 30000);
  console.log("Check 2 (PRIME10 on ₹30,000 - Capped at ₹2,000):", {
    valid: check2.valid,
    discountAmount: check2.discountAmount,
    netPayable: check2.netPayableAmount,
  });
  if (check2.discountAmount !== 2000 || check2.netPayableAmount !== 28000) {
    throw new Error("Check 2 failed: Expected cap of ₹2,000 on ₹30,000");
  }

  // Test C: Minimum spend threshold violation
  const check3 = await validateCoupon("PRIME10", 2000);
  console.log("Check 3 (PRIME10 below min spend ₹3,000):", {
    valid: check3.valid,
    error: check3.error,
  });
  if (check3.valid !== false) {
    throw new Error("Check 3 failed: Expected threshold error for ₹2,000 spend");
  }

  // Test D: Flat discount
  const check4 = await validateCoupon("LUXURY500", 6000);
  console.log("Check 4 (LUXURY500 on ₹6,000):", {
    valid: check4.valid,
    discountAmount: check4.discountAmount,
    netPayable: check4.netPayableAmount,
  });
  if (check4.discountAmount !== 500 || check4.netPayableAmount !== 5500) {
    throw new Error("Check 4 failed: Expected ₹500 flat discount on ₹6,000");
  }

  console.log("\n=== STEP 3: TESTING BOOKING ENGINE WITH COUPON DEDUCTION ===");

  // Find a test car and rental plan with price >= 3000 (or pick a premium car)
  const car = await prisma.car.findFirst({
    where: {
      deleted_at: null,
      rental_plans: {
        some: { price: { gte: 3000 } },
      },
    },
    include: {
      rental_plans: {
        where: { price: { gte: 3000 } },
        orderBy: { price: "asc" },
      },
      location: true,
    },
  }) || await prisma.car.findFirst({
    where: { deleted_at: null },
    include: { rental_plans: true, location: true },
  });

  if (!car || car.rental_plans.length === 0) {
    throw new Error("No car or rental plan found in database");
  }

  const selectedPlan = car.rental_plans[0];
  const grossPlanPrice = Number(selectedPlan.price);
  console.log(`Using car: ${car.name}, Plan: ${selectedPlan.name} (Gross: ₹${grossPlanPrice})`);

  // Create booking with PRIME10
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const bookingResult = await createBookingSafe({
    fullName: "Aryan Sharma",
    phone: "9876543210",
    email: "aryan.sharma@example.com",
    carId: car.id,
    rentalPlanId: selectedPlan.id,
    locationId: car.location_id || undefined,
    startDate: tomorrow.toISOString(),
    endDate: dayAfter.toISOString(),
    couponCode: "PRIME10",
    notes: "VIP airport pickup with coupon discount",
  });

  if (!bookingResult.success || !bookingResult.booking) {
    throw new Error("Booking creation with coupon failed: " + bookingResult.error);
  }

  const created = bookingResult.booking;
  console.log("Created Booking with Coupon:", {
    booking_code: created.booking_code,
    base_amount: Number(created.base_amount),
    coupon_code: created.coupon_code,
    discount_amount: Number(created.discount_amount),
    total_amount: Number(created.total_amount),
  });

  if (created.coupon_code !== "PRIME10") {
    throw new Error("Coupon code was not attached to booking");
  }

  if (Number(created.discount_amount) <= 0) {
    throw new Error("Discount amount was not computed or saved");
  }

  const expectedNet = Number(created.base_amount) - Number(created.discount_amount);
  if (Math.abs(Number(created.total_amount) - expectedNet) > 0.01) {
    throw new Error(`Net bill mismatch: ${created.total_amount} !== ${expectedNet}`);
  }

  // Verify price snapshot
  const snapshot = await prisma.priceSnapshot.findFirst({
    where: { booking_id: created.id },
  });
  console.log("Price Snapshot Verification:", {
    plan_name: snapshot?.plan_name,
    coupon_code: snapshot?.coupon_code,
    discount_amount: Number(snapshot?.discount_amount),
    total_calculated: Number(snapshot?.total_calculated),
  });

  if (snapshot?.coupon_code !== "PRIME10" || Number(snapshot?.discount_amount) !== Number(created.discount_amount)) {
    throw new Error("Price snapshot coupon details do not match booking");
  }

  // Verify coupon used_count incremented
  const updatedCoupon = await prisma.coupon.findUnique({
    where: { code: "PRIME10" },
  });
  console.log(`Coupon PRIME10 used_count is now: ${updatedCoupon?.used_count}`);
  if (!updatedCoupon || updatedCoupon.used_count < 1) {
    throw new Error("Coupon used_count was not incremented!");
  }

  console.log("\n✅ ALL COUPON CODE MANAGEMENT TESTS PASSED PERFECTLY!");
}

main()
  .catch((err) => {
    console.error("❌ TEST FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
