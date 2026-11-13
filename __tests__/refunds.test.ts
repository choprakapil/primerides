import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { cancelBookingForCustomer } from "@/server/booking";

describe("Refund & Cancellation Flow Tests (Rank #3)", () => {
  const createdBookingIds: number[] = [];

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await prisma.booking.deleteMany({
        where: { id: { in: createdBookingIds } },
      });
    }
  });

  it("Test 1: Full Refund (> 24 hours before pickup)", async () => {
    // 1. Create a customer
    let customer = await prisma.customerUser.findFirst();
    if (!customer) {
      customer = await prisma.customerUser.create({
        data: {
          phone: "+919876549999",
          full_name: "Refund Test User",
          email: "refund-test@primerides.in",
        },
      });
    }

    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
    });
    if (!car) throw new Error("No car found for refund test");

    // Booking starts 48 hours in future (> 24h tier)
    const startDate = new Date(Date.now() + 86400000 * 2);
    const endDate = new Date(Date.now() + 86400000 * 4);

    const booking = await prisma.booking.create({
      data: {
        booking_code: `PR-REFUND-FULL-${Date.now().toString().slice(-4)}`,
        customer_id: customer.id,
        full_name: customer.full_name || "Refund Test User",
        phone: customer.phone,
        car_id: car.id,
        car_name: car.name,
        start_date: startDate,
        end_date: endDate,
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        base_amount: 5000,
        security_deposit: 2000,
        total_amount: 7000,
        status: "confirmed",
      },
    });
    createdBookingIds.push(booking.id);

    // Create a captured payment
    await prisma.payment.create({
      data: {
        booking_id: booking.id,
        amount: 7000,
        currency: "INR",
        gateway: "razorpay",
        transaction_ref: `pay_test_${Date.now()}`,
        status: "captured",
        payment_method: "upi",
      },
    });

    // Execute cancellation
    const cancelRes = await cancelBookingForCustomer(booking.id, customer.id, "Change of plans");

    expect(cancelRes.success).toBe(true);
    expect(cancelRes.refundAmount).toBe(7000);
    expect(cancelRes.penaltyAmount).toBe(0);
    expect(cancelRes.refundPolicyTier).toContain("100% full refund");
    expect(cancelRes.refundGatewayRef).toBeDefined();

    // Verify database state:
    // A. Booking status must be cancelled
    const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(updatedBooking?.status).toBe("cancelled");

    // B. Cancellation record must exist with refund details
    const cancellation = await prisma.cancellation.findUnique({ where: { booking_id: booking.id } });
    expect(cancellation).toBeDefined();
    expect(Number(cancellation?.refund_amount)).toBe(7000);
    expect(Number(cancellation?.penalty_amount)).toBe(0);

    // C. Payment ledger must have a refund record
    const refundPayment = await prisma.payment.findFirst({
      where: { booking_id: booking.id, payment_method: "refund" },
    });
    expect(refundPayment).toBeDefined();
    expect(Number(refundPayment?.amount)).toBe(7000);
    expect(refundPayment?.status).toBe("refunded");
  });

  it("Test 2: Tiered Partial Refund (12–24 hours before pickup: 50% rental fee)", async () => {
    const customer = await prisma.customerUser.findFirst();
    if (!customer) throw new Error("No customer found");
    const car = await prisma.car.findFirst({ where: { is_available: true, deleted_at: null } });
    if (!car) throw new Error("No car found");

    // Booking starts in 18 hours (falls in 12-24h tier)
    const startDate = new Date(Date.now() + 1000 * 60 * 60 * 18);
    const endDate = new Date(Date.now() + 86400000 * 3);

    const booking = await prisma.booking.create({
      data: {
        booking_code: `PR-REFUND-PART-${Date.now().toString().slice(-4)}`,
        customer_id: customer.id,
        full_name: customer.full_name || "Refund Test User",
        phone: customer.phone,
        car_id: car.id,
        car_name: car.name,
        start_date: startDate,
        end_date: endDate,
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        base_amount: 4000,
        security_deposit: 1000,
        total_amount: 5000,
        status: "confirmed",
      },
    });
    createdBookingIds.push(booking.id);

    // Paid ₹5000 (₹4000 rental + ₹1000 deposit)
    await prisma.payment.create({
      data: {
        booking_id: booking.id,
        amount: 5000,
        currency: "INR",
        gateway: "razorpay",
        transaction_ref: `pay_test_${Date.now()}_2`,
        status: "captured",
        payment_method: "card",
      },
    });

    const cancelRes = await cancelBookingForCustomer(booking.id, customer.id, "Emergency reschedule");

    expect(cancelRes.success).toBe(true);
    // 50% of ₹4000 rental (= ₹2000) + 100% of ₹1000 deposit (= ₹1000) = ₹3000 refund
    expect(cancelRes.refundAmount).toBe(3000);
    expect(cancelRes.penaltyAmount).toBe(2000);
    expect(cancelRes.refundPolicyTier).toContain("50% cancellation fee");

    // Check refund row in ledger
    const refundPayment = await prisma.payment.findFirst({
      where: { booking_id: booking.id, payment_method: "refund" },
    });
    expect(refundPayment).toBeDefined();
    expect(Number(refundPayment?.amount)).toBe(3000);
  });

  it("Test 3: Last-minute Cancellation (< 12 hours: 100% rental cancellation fee, deposit refunded)", async () => {
    const customer = await prisma.customerUser.findFirst();
    if (!customer) throw new Error("No customer found");
    const car = await prisma.car.findFirst({ where: { is_available: true, deleted_at: null } });
    if (!car) throw new Error("No car found");

    // Booking starts in 4 hours (< 12h tier)
    const startDate = new Date(Date.now() + 1000 * 60 * 60 * 4);
    const endDate = new Date(Date.now() + 86400000 * 2);

    const booking = await prisma.booking.create({
      data: {
        booking_code: `PR-REFUND-LATE-${Date.now().toString().slice(-4)}`,
        customer_id: customer.id,
        full_name: customer.full_name || "Refund Test User",
        phone: customer.phone,
        car_id: car.id,
        car_name: car.name,
        start_date: startDate,
        end_date: endDate,
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        base_amount: 3000,
        security_deposit: 1500,
        total_amount: 4500,
        status: "confirmed",
      },
    });
    createdBookingIds.push(booking.id);

    await prisma.payment.create({
      data: {
        booking_id: booking.id,
        amount: 4500,
        currency: "INR",
        gateway: "razorpay",
        transaction_ref: `pay_test_${Date.now()}_3`,
        status: "captured",
        payment_method: "card",
      },
    });

    const cancelRes = await cancelBookingForCustomer(booking.id, customer.id, "Late cancellation");

    expect(cancelRes.success).toBe(true);
    // 0% of ₹3000 rental (= ₹0) + 100% of ₹1500 deposit (= ₹1500) = ₹1500 refund
    expect(cancelRes.refundAmount).toBe(1500);
    expect(cancelRes.penaltyAmount).toBe(3000);
    expect(cancelRes.refundPolicyTier).toContain("100% cancellation fee on rental (<12h)");

    const refundPayment = await prisma.payment.findFirst({
      where: { booking_id: booking.id, payment_method: "refund" },
    });
    expect(refundPayment).toBeDefined();
    expect(Number(refundPayment?.amount)).toBe(1500);
  });
});
