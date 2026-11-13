import { describe, it, expect, afterAll } from "vitest";
import { calculateGst, SAC_CODE, GST_RATE_PERCENT, CGST_RATE_PERCENT, SGST_RATE_PERCENT } from "@/server/invoicing/gst";
import { prisma } from "@/server/db/client";
import { createBookingSafe } from "@/server/booking";

describe("Issue #5: GST Calculation & Tax Invoice Compliance", () => {
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

  it("Test 1: GST engine calculates correct 18% GST with CGST/SGST split (intra-state)", () => {
    const result = calculateGst({
      rentalAmount: 2500,
      chauffeurFee: 0,
      discountAmount: 0,
      securityDeposit: 5000,
      isInterState: false,
    });

    // Taxable = 2500 (rental only, deposit excluded)
    expect(result.taxableAmount).toBe(2500);

    // GST = 18% of 2500 = 450
    expect(result.totalGst).toBe(450);

    // CGST = 9% of 2500 = 225
    expect(result.cgstAmount).toBe(225);
    expect(result.cgstRate).toBe(9);

    // SGST = 9% of 2500 = 225
    expect(result.sgstAmount).toBe(225);
    expect(result.sgstRate).toBe(9);

    // No IGST for intra-state
    expect(result.igstAmount).toBe(0);
    expect(result.igstRate).toBe(0);

    // Grand total = 2500 (taxable) + 450 (GST) + 5000 (deposit) = 7950
    expect(result.grandTotal).toBe(7950);

    // SAC code
    expect(result.sacCode).toBe("996601");
    expect(result.isInterState).toBe(false);

    console.log("✅ GST intra-state: ₹2500 → CGST ₹225 + SGST ₹225 = ₹450 GST, Grand Total ₹7950");
  });

  it("Test 2: GST engine calculates IGST for inter-state supply", () => {
    const result = calculateGst({
      rentalAmount: 3000,
      chauffeurFee: 1500,
      discountAmount: 500,
      securityDeposit: 3000,
      isInterState: true,
    });

    // Taxable = 3000 + 1500 - 500 = 4000
    expect(result.taxableAmount).toBe(4000);

    // IGST = 18% of 4000 = 720
    expect(result.totalGst).toBe(720);
    expect(result.igstAmount).toBe(720);
    expect(result.igstRate).toBe(18);

    // No CGST/SGST for inter-state
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);

    // Grand total = 4000 + 720 + 3000 = 7720
    expect(result.grandTotal).toBe(7720);

    console.log("✅ GST inter-state: ₹4000 taxable → IGST ₹720, Grand Total ₹7720");
  });

  it("Test 3: GST excludes security deposit from taxable value", () => {
    // Same amounts but different deposit — deposit should NOT affect GST
    const withSmallDeposit = calculateGst({
      rentalAmount: 5000,
      chauffeurFee: 0,
      discountAmount: 0,
      securityDeposit: 1000,
    });

    const withLargeDeposit = calculateGst({
      rentalAmount: 5000,
      chauffeurFee: 0,
      discountAmount: 0,
      securityDeposit: 50000,
    });

    // GST should be identical regardless of deposit
    expect(withSmallDeposit.totalGst).toBe(withLargeDeposit.totalGst);
    expect(withSmallDeposit.cgstAmount).toBe(withLargeDeposit.cgstAmount);
    expect(withSmallDeposit.sgstAmount).toBe(withLargeDeposit.sgstAmount);

    // But grand totals should differ by the deposit difference
    expect(withLargeDeposit.grandTotal - withSmallDeposit.grandTotal).toBe(49000);

    console.log("✅ Security deposit correctly excluded from GST taxable value");
  });

  it("Test 4: GST handles discount reducing taxable value to zero", () => {
    const result = calculateGst({
      rentalAmount: 2500,
      chauffeurFee: 0,
      discountAmount: 3000, // Discount exceeds rental
      securityDeposit: 5000,
    });

    // Taxable should be 0 (not negative)
    expect(result.taxableAmount).toBe(0);
    expect(result.totalGst).toBe(0);
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);

    // Grand total = 0 + 0 + 5000 = 5000 (only deposit)
    expect(result.grandTotal).toBe(5000);

    console.log("✅ GST correctly handles zero taxable value (discount > rental)");
  });

  it("Test 5: SAC code and GST rate constants are correct for car rental", () => {
    expect(SAC_CODE).toBe("996601");
    expect(GST_RATE_PERCENT).toBe(18);
    expect(CGST_RATE_PERCENT).toBe(9);
    expect(SGST_RATE_PERCENT).toBe(9);

    console.log("✅ SAC 996601 and 18% GST rate confirmed");
  });

  it("Test 6: Live booking creates price snapshot with real GST breakdown (not zero)", async () => {
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: { where: { is_active: true } } },
    });

    if (!car || car.rental_plans.length === 0) {
      console.warn("No available car found, skipping live GST test");
      return;
    }

    const futureStart = new Date(Date.now() + 86400000 * 80); // 80 days out
    const futureEnd = new Date(Date.now() + 86400000 * 82);

    const result = await createBookingSafe({
      fullName: "GST Test User",
      phone: "+919000000010",
      carId: car.id,
      rentalPlanId: car.rental_plans[0].id,
      startDate: futureStart,
      endDate: futureEnd,
      idempotencyKey: `gst-test-${Date.now()}-10`,
    });

    expect(result.success).toBe(true);
    createdBookingIds.push(result.booking!.id);

    // Fetch the price snapshot
    const snapshot = await prisma.priceSnapshot.findUnique({
      where: { booking_id: result.booking!.id },
    });

    expect(snapshot).toBeDefined();

    // tax_amount should NOT be 0 anymore
    const taxAmount = Number(snapshot!.tax_amount);
    expect(taxAmount).toBeGreaterThan(0);

    // Verify GST breakdown in snapshot_data
    const data = snapshot!.snapshot_data as any;
    expect(data.sacCode).toBe("996601");
    expect(data.gstin).toBeDefined();
    expect(data.gstRate).toBe(18);
    expect(data.cgstRate).toBe(9);
    expect(data.sgstRate).toBe(9);
    expect(data.cgstAmount).toBeGreaterThan(0);
    expect(data.sgstAmount).toBeGreaterThan(0);
    expect(data.totalGst).toBe(taxAmount);
    expect(data.taxableAmount).toBeGreaterThan(0);

    // Verify: CGST + SGST = totalGst
    expect(data.cgstAmount + data.sgstAmount).toBe(data.totalGst);

    // Verify: grandTotal = taxableAmount + totalGst + securityDeposit
    const expectedGrand = data.taxableAmount + data.totalGst + Number(snapshot!.security_deposit);
    expect(data.grandTotal).toBe(expectedGrand);

    const planPrice = Number(car.rental_plans[0].price);
    const expectedGst = Math.round(planPrice * 18) / 100;
    expect(taxAmount).toBe(expectedGst);

    console.log(
      `✅ Live booking ${result.booking!.booking_code}: plan ₹${planPrice}, GST ₹${taxAmount} (CGST ₹${data.cgstAmount} + SGST ₹${data.sgstAmount}), SAC ${data.sacCode}`
    );
  });
});
