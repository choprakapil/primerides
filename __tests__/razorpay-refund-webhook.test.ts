import { describe, it, expect, beforeAll, afterAll } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { POST } from "@/app/api/v1/payments/webhook/route";

describe("Risk #14 Audit: Missing Razorpay Webhook Reconciliation for Refunds", () => {
  const testSecret = "test_webhook_secret_key_12345";
  const createdBookingIds: number[] = [];
  const createdCustomerIds: number[] = [];

  beforeAll(() => {
    process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;
  });

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await prisma.payment.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.cancellation.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.auditLog.deleteMany({
        where: { action: { in: ["WEBHOOK_REFUND_PROCESSED", "WEBHOOK_EXTERNAL_REFUND_RECONCILED", "WEBHOOK_REFUND_FAILED_ALERT"] } },
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

  function createSignedRequest(payload: any, signatureOverride?: string): NextRequest {
    const rawBody = JSON.stringify(payload);
    const signature =
      signatureOverride !== undefined
        ? signatureOverride
        : crypto.createHmac("sha256", testSecret).update(rawBody).digest("hex");

    return new NextRequest("http://localhost:3000/api/v1/payments/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": signature,
      },
      body: rawBody,
    });
  }

  it("Test 1: Webhook rejects invalid or missing signatures with 400 Bad Request", async () => {
    // Missing signature
    const reqNoSig = new NextRequest("http://localhost:3000/api/v1/payments/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "refund.processed" }),
    });
    const resNoSig = await POST(reqNoSig);
    expect(resNoSig.status).toBe(400);

    // Invalid signature
    const reqBadSig = createSignedRequest({ event: "refund.processed" }, "invalid_forged_signature_hash");
    const resBadSig = await POST(reqBadSig);
    expect(resBadSig.status).toBe(400);
  });

  it("Test 2: refund.processed updates existing refund payment row and writes audit log", async () => {
    const customer = await prisma.customerUser.create({
      data: {
        phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
        full_name: "Webhook User 1",
        email: `webhook1_${Date.now()}@example.com`,
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
        full_name: customer.full_name || "Webhook User 1",
        phone: customer.phone,
        car_id: car.id,
        car_name: car.name,
        start_date: new Date(Date.now() + 86400000),
        end_date: new Date(Date.now() + 86400000 * 2),
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        base_amount: 5000,
        total_amount: 5000,
        status: "cancelled",
      },
    });
    createdBookingIds.push(booking.id);

    const refundId = `rfnd_test_${Date.now()}`;

    // Create existing pending refund row
    const existingRefund = await prisma.payment.create({
      data: {
        booking_id: booking.id,
        amount: 5000,
        currency: "INR",
        gateway: "razorpay",
        transaction_ref: refundId,
        payment_method: "refund",
        status: "pending",
        metadata: {
          initiated_by: "admin",
        },
      },
    });

    const payload = {
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            id: refundId,
            payment_id: "pay_test_orig_123",
            amount: 500000, // in paise = ₹5000
            currency: "INR",
            status: "processed",
            speed_processed: "normal",
            notes: {
              bookingId: String(booking.id),
              bookingCode: booking.booking_code,
            },
          },
        },
      },
    };

    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify refund row updated
    const updatedRefund = await prisma.payment.findUnique({
      where: { id: existingRefund.id },
    });
    expect(updatedRefund?.status).toBe("refunded");
    const meta = updatedRefund?.metadata as any;
    expect(meta?.webhookProcessedAt).toBeDefined();
    expect(meta?.razorpayRefundStatus).toBe("processed");

    // Verify audit log
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: "WEBHOOK_REFUND_PROCESSED",
        entity_id: existingRefund.id,
      },
    });
    expect(audit).toBeDefined();
  });

  it("Test 3: External refund in Razorpay Dashboard reconciles ledger and upserts cancellation", async () => {
    const customer = await prisma.customerUser.create({
      data: {
        phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
        full_name: "External Refund User",
        email: `ext_ref_${Date.now()}@example.com`,
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
        full_name: customer.full_name || "External Refund User",
        phone: customer.phone,
        car_id: car.id,
        car_name: car.name,
        start_date: new Date(Date.now() + 86400000),
        end_date: new Date(Date.now() + 86400000 * 2),
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        base_amount: 8000,
        total_amount: 8000,
        status: "confirmed",
      },
    });
    createdBookingIds.push(booking.id);

    const origPaymentId = `pay_orig_${Date.now()}`;
    await prisma.payment.create({
      data: {
        booking_id: booking.id,
        amount: 8000,
        currency: "INR",
        gateway: "razorpay",
        transaction_ref: origPaymentId,
        payment_method: "card_online",
        status: "successful",
      },
    });

    const externalRefundId = `rfnd_external_${Date.now()}`;
    const payload = {
      event: "refund.processed",
      payload: {
        refund: {
          entity: {
            id: externalRefundId,
            payment_id: origPaymentId,
            amount: 800000, // ₹8000 in paise
            currency: "INR",
            status: "processed",
            speed_processed: "optimum",
            notes: {
              bookingId: String(booking.id),
              bookingCode: booking.booking_code,
              reason: "Courtesy refund issued via Razorpay dashboard",
            },
          },
        },
      },
    };

    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify refund payment ledger row was automatically created
    const createdRefund = await prisma.payment.findFirst({
      where: { transaction_ref: externalRefundId },
    });
    expect(createdRefund).toBeDefined();
    expect(Number(createdRefund?.amount)).toBe(8000);
    expect(createdRefund?.status).toBe("refunded");
    expect(createdRefund?.payment_method).toBe("refund");

    // Verify cancellation record was upserted
    const cancellation = await prisma.cancellation.findUnique({
      where: { booking_id: booking.id },
    });
    expect(cancellation).toBeDefined();
    expect(Number(cancellation?.refund_amount)).toBe(8000);

    // Verify reconciliation audit log
    const audit = await prisma.auditLog.findFirst({
      where: {
        action: "WEBHOOK_EXTERNAL_REFUND_RECONCILED",
        entity_id: createdRefund?.id,
      },
    });
    expect(audit).toBeDefined();
  });

  it("Test 4: refund.failed updates refund payment status to failed and logs critical staff alert", async () => {
    const customer = await prisma.customerUser.create({
      data: {
        phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
        full_name: "Failed Refund User",
        email: `fail_ref_${Date.now()}@example.com`,
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
        full_name: customer.full_name || "Failed Refund User",
        phone: customer.phone,
        car_id: car.id,
        car_name: car.name,
        start_date: new Date(Date.now() + 86400000),
        end_date: new Date(Date.now() + 86400000 * 2),
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        base_amount: 4000,
        total_amount: 4000,
        status: "cancelled",
      },
    });
    createdBookingIds.push(booking.id);

    const failedRefundId = `rfnd_failing_${Date.now()}`;
    const refundPayment = await prisma.payment.create({
      data: {
        booking_id: booking.id,
        amount: 4000,
        currency: "INR",
        gateway: "razorpay",
        transaction_ref: failedRefundId,
        payment_method: "refund",
        status: "refunded", // initially marked refunded
      },
    });

    const payload = {
      event: "refund.failed",
      payload: {
        refund: {
          entity: {
            id: failedRefundId,
            payment_id: "pay_orig_xyz",
            amount: 400000,
            error_code: "BANK_ACCOUNT_CLOSED",
            error_description: "Customer card account is permanently closed.",
          },
        },
      },
    };

    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify refund row transitioned to failed
    const updatedPayment = await prisma.payment.findUnique({
      where: { id: refundPayment.id },
    });
    expect(updatedPayment?.status).toBe("failed");
    const meta = updatedPayment?.metadata as any;
    expect(meta?.errorCode).toBe("BANK_ACCOUNT_CLOSED");
    expect(meta?.errorDescription).toContain("closed");

    // Verify critical alert audit log was created
    const alertAudit = await prisma.auditLog.findFirst({
      where: {
        action: "WEBHOOK_REFUND_FAILED_ALERT",
        entity_id: refundPayment.id,
      },
    });
    expect(alertAudit).toBeDefined();
    const alertState = alertAudit?.after_state as any;
    expect(alertState?.alert).toBe("ATTENTION_REQUIRED_MANUAL_PAYOUT");
  });

  it("Test 5: refund.speed_changed updates speed metadata without corrupting payment status", async () => {
    const customer = await prisma.customerUser.create({
      data: {
        phone: `+9198765${Math.floor(10000 + Math.random() * 90000)}`,
        full_name: "Speed Change User",
        email: `speed_${Date.now()}@example.com`,
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
        full_name: customer.full_name || "Speed Change User",
        phone: customer.phone,
        car_id: car.id,
        car_name: car.name,
        start_date: new Date(Date.now() + 86400000),
        end_date: new Date(Date.now() + 86400000 * 2),
        pickup_location: "Delhi Hub",
        drop_location: "Delhi Hub",
        base_amount: 3500,
        total_amount: 3500,
        status: "cancelled",
      },
    });
    createdBookingIds.push(booking.id);

    const speedRefundId = `rfnd_speed_${Date.now()}`;
    const refundPayment = await prisma.payment.create({
      data: {
        booking_id: booking.id,
        amount: 3500,
        currency: "INR",
        gateway: "razorpay",
        transaction_ref: speedRefundId,
        payment_method: "refund",
        status: "refunded",
      },
    });

    const payload = {
      event: "refund.speed_changed",
      payload: {
        refund: {
          entity: {
            id: speedRefundId,
            speed_requested: "optimum",
            speed_processed: "normal",
          },
        },
      },
    };

    const req = createSignedRequest(payload);
    const res = await POST(req);
    expect(res.status).toBe(200);

    const updated = await prisma.payment.findUnique({
      where: { id: refundPayment.id },
    });
    expect(updated?.status).toBe("refunded");
    const meta = updated?.metadata as any;
    expect(meta?.speedRequested).toBe("optimum");
    expect(meta?.speedProcessed).toBe("normal");
  });
});
