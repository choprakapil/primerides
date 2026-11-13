import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { POST as processAdminRefund } from "@/app/api/v1/admin/bookings/[id]/refund/route";
import { NextRequest } from "next/server";
import { createAccessToken } from "@/server/auth/jwt";

describe("Risk #10 Audit: Admin Cannot Trigger or Approve Gateway Refunds", () => {
  const createdBookingIds: number[] = [];
  let authHeader: string;
  let testCarId: number;

  beforeAll(async () => {
    // 1. Locate existing admin user with superadmin / bookings.manage permissions
    const adminUser = await prisma.adminUser.findFirst({
      where: { deleted_at: null, is_active: true },
    });
    expect(adminUser).toBeDefined();

    const token = await createAccessToken({
      id: adminUser!.id,
      username: adminUser!.username,
      type: "admin",
      role: adminUser!.role,
    });
    authHeader = `Bearer ${token}`;

    // 2. Fetch a test car
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
    });
    expect(car).toBeDefined();
    testCarId = car!.id;
  });

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
  });

  it("Test 1: Rejects unauthenticated or unauthorized requests", async () => {
    const fakeReq = new NextRequest("http://localhost:3000/api/v1/admin/bookings/9999/refund", {
      method: "POST",
      body: JSON.stringify({ refundAmount: 1000 }),
    });

    const res = await processAdminRefund(fakeReq, {
      params: Promise.resolve({ id: "9999" }),
    });

    expect(res.status).toBe(401);
  });

  it("Test 2: Rejects refund on booking with zero captured payments", async () => {
    // Create an unpaid booking
    const unpaidBooking = await prisma.booking.create({
      data: {
        booking_code: `PR/TEST/${Date.now().toString().slice(-6)}`,
        car_id: testCarId,
        full_name: "Unpaid Customer",
        phone: "+919876543290",
        start_date: new Date(Date.now() + 86400000 * 10),
        end_date: new Date(Date.now() + 86400000 * 12),
        total_amount: 5000,
        status: "pending",
      },
    });
    createdBookingIds.push(unpaidBooking.id);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/bookings/${unpaidBooking.id}/refund`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refundAmount: 2000 }),
    });

    const res = await processAdminRefund(req, {
      params: Promise.resolve({ id: String(unpaidBooking.id) }),
    });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/No captured payments found/);
  });

  it("Test 3: Full admin gateway refund triggers Razorpay execution, creates refund payment row, and cancels booking", async () => {
    const booking = await prisma.booking.create({
      data: {
        booking_code: `PR/TEST/${Date.now().toString().slice(-6)}`,
        car_id: testCarId,
        full_name: "Vikram Malhotra",
        phone: "+919876543291",
        email: "vikram@primerides.in",
        start_date: new Date(Date.now() + 86400000 * 15),
        end_date: new Date(Date.now() + 86400000 * 18),
        total_amount: 7500,
        status: "confirmed",
        payments: {
          create: {
            amount: 7500,
            currency: "INR",
            gateway: "razorpay",
            status: "captured",
            payment_method: "card",
            transaction_ref: `pay_sim_${Date.now()}`,
          },
        },
      },
      include: { payments: true },
    });
    createdBookingIds.push(booking.id);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/bookings/${booking.id}/refund`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refundAmount: 7500,
        reason: "Customer schedule conflict — approved by admin",
        cancelBooking: true,
      }),
    });

    const res = await processAdminRefund(req, {
      params: Promise.resolve({ id: String(booking.id) }),
    });
    const data = await res.json();

    console.log("Full Admin Refund Response:", data);

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.refundAmount).toBe(7500);
    expect(data.data.remainingBalance).toBe(0);
    expect(data.data.bookingStatus).toBe("cancelled");
    expect(data.data.refundId).toMatch(/^rfnd_/);

    // Verify Database state
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: { payments: true, cancellation: true, status_history: true },
    });

    expect(updatedBooking?.status).toBe("cancelled");
    expect(updatedBooking?.cancellation?.cancelled_by).toBe("admin");
    expect(Number(updatedBooking?.cancellation?.refund_amount)).toBe(7500);

    // Verify refund ledger row in tbl_payments
    const refundPayment = updatedBooking?.payments.find((p) => p.payment_method === "refund");
    expect(refundPayment).toBeDefined();
    expect(Number(refundPayment?.amount)).toBe(7500);
    expect(refundPayment?.status).toBe("refunded");
  });

  it("Test 4: Partial admin refunds track remaining balance and prevent over-refunding", async () => {
    const booking = await prisma.booking.create({
      data: {
        booking_code: `PR/TEST/${Date.now().toString().slice(-6)}`,
        car_id: testCarId,
        full_name: "Ananya Roy",
        phone: "+919876543292",
        start_date: new Date(Date.now() + 86400000 * 20),
        end_date: new Date(Date.now() + 86400000 * 22),
        total_amount: 10000,
        status: "confirmed",
        payments: {
          create: {
            amount: 10000,
            currency: "INR",
            gateway: "razorpay",
            status: "captured",
            payment_method: "upi",
            transaction_ref: `pay_sim_${Date.now()}`,
          },
        },
      },
    });
    createdBookingIds.push(booking.id);

    // 1. Partial refund of ₹4000 (without cancelling trip)
    const req1 = new NextRequest(`http://localhost:3000/api/v1/admin/bookings/${booking.id}/refund`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refundAmount: 4000,
        reason: "Vehicle switch goodwill partial credit",
        cancelBooking: false,
      }),
    });

    const res1 = await processAdminRefund(req1, {
      params: Promise.resolve({ id: String(booking.id) }),
    });
    const data1 = await res1.json();

    expect(res1.status).toBe(200);
    expect(data1.data.refundAmount).toBe(4000);
    expect(data1.data.remainingBalance).toBe(6000);
    expect(data1.data.bookingStatus).toBe("confirmed");

    // 2. Attempt to refund ₹7000 (exceeds ₹6000 remaining balance)
    const reqExcess = new NextRequest(`http://localhost:3000/api/v1/admin/bookings/${booking.id}/refund`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refundAmount: 7000,
      }),
    });

    const resExcess = await processAdminRefund(reqExcess, {
      params: Promise.resolve({ id: String(booking.id) }),
    });
    const dataExcess = await resExcess.json();

    expect(resExcess.status).toBe(400);
    expect(dataExcess.error).toMatch(/exceeds available refundable balance/);

    // 3. Complete remaining refund of ₹6000 and cancel booking
    const req2 = new NextRequest(`http://localhost:3000/api/v1/admin/bookings/${booking.id}/refund`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refundAmount: 6000,
        reason: "Trip cancelled, remaining balance refunded",
        cancelBooking: true,
      }),
    });

    const res2 = await processAdminRefund(req2, {
      params: Promise.resolve({ id: String(booking.id) }),
    });
    const data2 = await res2.json();

    expect(res2.status).toBe(200);
    expect(data2.data.refundAmount).toBe(6000);
    expect(data2.data.remainingBalance).toBe(0);
    expect(data2.data.bookingStatus).toBe("cancelled");

    // 4. Attempt refund on fully-refunded booking -> rejected with 400
    const req3 = new NextRequest(`http://localhost:3000/api/v1/admin/bookings/${booking.id}/refund`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refundAmount: 500 }),
    });

    const res3 = await processAdminRefund(req3, {
      params: Promise.resolve({ id: String(booking.id) }),
    });
    expect(res3.status).toBe(400);
  });
});
