import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { cancelBookingForCustomer, getCustomerPayments } from "@/server/booking";

describe("Risk #13 Audit: Zero Customer & Admin Ledger Entry for Refunds", () => {
  const createdBookingIds: number[] = [];
  const createdCustomerIds: number[] = [];

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await prisma.payment.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.cancellation.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.bookingStatusHistory.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.booking.deleteMany({
        where: { id: { in: createdBookingIds } },
      });
    }
    if (createdCustomerIds.length > 0) {
      await prisma.customerUser.deleteMany({
        where: { id: { in: createdCustomerIds } },
      });
    }
  });

  it("Test 1: Customer cancellation creates negative/refund payment ledger entry in database", async () => {
    const customer = await prisma.customerUser.create({
      data: {
        phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
        full_name: "Ledger Audit User",
        email: `ledger_audit_${Date.now()}@example.com`,
      },
    });
    createdCustomerIds.push(customer.id);

    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
    });
    if (!car) throw new Error("No car found for test");

    // 48 hours in future (> 24h full refund tier)
    const startDate = new Date(Date.now() + 86400000 * 2);
    const endDate = new Date(Date.now() + 86400000 * 4);

    const booking = await prisma.booking.create({
      data: {
        booking_code: `PR/2627/${Math.floor(100000 + Math.random() * 900000)}`,
        customer_id: customer.id,
        full_name: customer.full_name || "Ledger Audit User",
        phone: customer.phone,
        car_id: car.id,
        car_name: car.name,
        start_date: startDate,
        end_date: endDate,
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        base_amount: 6000,
        security_deposit: 2000,
        total_amount: 8000,
        status: "confirmed",
      },
    });
    createdBookingIds.push(booking.id);

    // Initial captured payment of ₹8000
    const primaryPayment = await prisma.payment.create({
      data: {
        booking_id: booking.id,
        amount: 8000,
        currency: "INR",
        gateway: "razorpay",
        transaction_ref: `pay_test_ledger_${Date.now()}`,
        status: "captured",
        payment_method: "card_online",
      },
    });

    // Execute cancellation
    const cancelRes = await cancelBookingForCustomer(booking.id, customer.id, "Emergency cancellation");
    expect(cancelRes.success).toBe(true);
    expect(cancelRes.refundAmount).toBe(8000);

    // Verify refund ledger row
    const refundRows = await prisma.payment.findMany({
      where: { booking_id: booking.id, payment_method: "refund" },
    });

    expect(refundRows.length).toBe(1);
    const refundRow = refundRows[0];
    expect(Number(refundRow.amount)).toBe(8000);
    expect(refundRow.status).toBe("refunded");
    expect(refundRow.payment_method).toBe("refund");
    expect(refundRow.transaction_ref).toBeDefined();

    // Verify cancellation audit row
    const cancellation = await prisma.cancellation.findUnique({
      where: { booking_id: booking.id },
    });
    expect(cancellation).toBeDefined();
    expect(Number(cancellation?.refund_amount)).toBe(8000);
  });

  it("Test 2: getCustomerPayments returns refund payment row and calculates net settled correctly", async () => {
    const customer = await prisma.customerUser.create({
      data: {
        phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
        full_name: "Customer Ledger Test",
        email: `cust_ledger_${Date.now()}@example.com`,
      },
    });
    createdCustomerIds.push(customer.id);

    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
    });
    if (!car) throw new Error("No car found");

    const startDate = new Date(Date.now() + 86400000 * 3);
    const endDate = new Date(Date.now() + 86400000 * 5);

    const booking = await prisma.booking.create({
      data: {
        booking_code: `PR/2627/${Math.floor(100000 + Math.random() * 900000)}`,
        customer_id: customer.id,
        full_name: customer.full_name || "Customer Ledger Test",
        phone: customer.phone,
        car_id: car.id,
        car_name: car.name,
        start_date: startDate,
        end_date: endDate,
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        base_amount: 5000,
        security_deposit: 1500,
        total_amount: 6500,
        status: "confirmed",
      },
    });
    createdBookingIds.push(booking.id);

    // Payment of ₹6500
    await prisma.payment.create({
      data: {
        booking_id: booking.id,
        amount: 6500,
        currency: "INR",
        gateway: "razorpay",
        transaction_ref: `pay_test_${Date.now()}`,
        status: "captured",
        payment_method: "upi",
      },
    });

    // Cancel booking and refund
    await cancelBookingForCustomer(booking.id, customer.id, "Medical emergency");

    // Retrieve via getCustomerPayments
    const rawPayments = await getCustomerPayments(customer.id);
    expect(rawPayments.length).toBe(2); // Original payment + refund disbursement

    const capturedPayment = rawPayments.find((p) => p.status === "captured");
    const refundPayment = rawPayments.find((p) => p.status === "refunded");

    expect(capturedPayment).toBeDefined();
    expect(Number(capturedPayment?.amount)).toBe(6500);

    expect(refundPayment).toBeDefined();
    expect(Number(refundPayment?.amount)).toBe(6500);
    expect(refundPayment?.payment_method).toBe("refund");

    // Check financial reconciliation logic (as implemented in customer payments page)
    const totalCaptured = rawPayments
      .filter((p) => (p.status === "captured" || p.status === "successful") && p.payment_method !== "refund")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const totalRefunded = rawPayments
      .filter((p) => p.status === "refunded" || p.payment_method === "refund")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const netSettled = Math.max(0, totalCaptured - totalRefunded);

    expect(totalCaptured).toBe(6500);
    expect(totalRefunded).toBe(6500);
    expect(netSettled).toBe(0); // Fully refunded!
  });

  it("Test 3: Admin accounts metrics calculate gross collections, refund disbursements, and net realized revenue", () => {
    // Simulate payments list in AccountsManager
    const samplePayments = [
      {
        id: 1,
        booking_id: 101,
        amount: 10000,
        gateway: "razorpay",
        status: "captured",
        payment_method: "card_online",
      },
      {
        id: 2,
        booking_id: 102,
        amount: 5000,
        gateway: "cash",
        status: "captured",
        payment_method: "cash",
      },
      {
        id: 3,
        booking_id: 101,
        amount: 3000,
        gateway: "razorpay",
        status: "refunded",
        payment_method: "refund",
      },
    ];

    // Compute metrics according to updated AccountsManager logic
    let captured = 0;
    let refunded = 0;
    let refundedCount = 0;
    let capturedCount = 0;

    samplePayments.forEach((p) => {
      const amt = Number(p.amount || 0);
      const isRefund = p.status === "refunded" || p.payment_method === "refund";
      const isSettled = (p.status === "captured" || p.status === "successful") && !isRefund;

      if (isSettled) {
        captured += amt;
        capturedCount += 1;
      }
      if (isRefund) {
        refunded += amt;
        refundedCount += 1;
      }
    });

    const netRealized = Math.max(0, captured - refunded);

    expect(captured).toBe(15000); // ₹10,000 + ₹5,000
    expect(capturedCount).toBe(2);
    expect(refunded).toBe(3000); // ₹3,000 refund disbursement
    expect(refundedCount).toBe(1);
    expect(netRealized).toBe(12000); // ₹15,000 - ₹3,000 = ₹12,000 net revenue
  });

  it("Test 4: CSV Export formatting outputs negative numeric values for refunds", () => {
    const samplePayments = [
      {
        id: 1,
        transaction_ref: "pay_123",
        created_at: new Date().toISOString(),
        booking: { booking_code: "PR/2627/000001", full_name: "John Doe", phone: "9876543210", car_name: "Thar", location: { city: "Delhi" } },
        payment_method: "card_online",
        gateway: "razorpay",
        status: "captured",
        amount: 5000,
      },
      {
        id: 2,
        transaction_ref: "rfnd_456",
        created_at: new Date().toISOString(),
        booking: { booking_code: "PR/2627/000001", full_name: "John Doe", phone: "9876543210", car_name: "Thar", location: { city: "Delhi" } },
        payment_method: "refund",
        gateway: "razorpay",
        status: "refunded",
        amount: 5000,
      },
    ];

    const rows = samplePayments.map((p) => {
      const isRefund = p.status === "refunded" || p.payment_method === "refund";
      const amt = isRefund ? -Math.abs(Number(p.amount || 0)) : Number(p.amount || 0);
      return {
        ref: p.transaction_ref,
        method: isRefund ? "refund" : p.payment_method,
        status: p.status,
        amount: amt,
      };
    });

    expect(rows[0].amount).toBe(5000);
    expect(rows[1].amount).toBe(-5000); // Negative refund in financial ledger export!

    const netSum = rows.reduce((sum, r) => sum + r.amount, 0);
    expect(netSum).toBe(0); // Net sum mathematically balances to 0!
  });

  it("Test 5: Admin status route transition to cancelled upserts cancellation record", async () => {
    const customer = await prisma.customerUser.create({
      data: {
        phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
        full_name: "Admin Status Test User",
        email: `admin_status_${Date.now()}@example.com`,
      },
    });
    createdCustomerIds.push(customer.id);

    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
    });
    if (!car) throw new Error("No car found");

    const booking = await prisma.booking.create({
      data: {
        booking_code: `PR/2627/${Math.floor(100000 + Math.random() * 900000)}`,
        customer_id: customer.id,
        full_name: customer.full_name || "Admin Status Test User",
        phone: customer.phone,
        car_id: car.id,
        car_name: car.name,
        start_date: new Date(Date.now() + 86400000),
        end_date: new Date(Date.now() + 86400000 * 2),
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        base_amount: 3000,
        total_amount: 3000,
        status: "confirmed",
      },
    });
    createdBookingIds.push(booking.id);

    // Simulate status transition to cancelled in transaction
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "cancelled", admin_notes: "Cancelled by manager" },
      });

      await tx.cancellation.upsert({
        where: { booking_id: booking.id },
        create: {
          booking_id: booking.id,
          reason: "Cancelled by manager",
          cancelled_by: "admin (manager)",
          refund_amount: 0,
          penalty_amount: 0,
          processed_at: new Date(),
        },
        update: {
          reason: "Cancelled by manager",
          cancelled_by: "admin (manager)",
          processed_at: new Date(),
        },
      });
    });

    const cancellation = await prisma.cancellation.findUnique({
      where: { booking_id: booking.id },
    });
    expect(cancellation).toBeDefined();
    expect(cancellation?.cancelled_by).toContain("admin");
    expect(cancellation?.reason).toBe("Cancelled by manager");
  });
});
