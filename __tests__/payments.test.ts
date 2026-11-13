import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import {
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "@/server/payments/razorpay";

describe("Payment Module — Signature Verification & HMAC Security", () => {
  const testSecret = "test_razorpay_secret_key_12345";
  const originalSecret = process.env.RAZORPAY_KEY_SECRET;

  beforeEach(() => {
    process.env.RAZORPAY_KEY_SECRET = testSecret;
  });

  afterEach(() => {
    process.env.RAZORPAY_KEY_SECRET = originalSecret;
  });

  it("should successfully verify authentic Razorpay checkout HMAC SHA256 signatures", () => {
    const orderId = "order_N9K9g8Hj76Gfd5";
    const paymentId = "pay_N9K9xYz1234567";

    const signature = crypto
      .createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    expect(isValid).toBe(true);
  });

  it("should reject forged, tampered, or mismatched payment signatures", () => {
    const orderId = "order_N9K9g8Hj76Gfd5";
    const paymentId = "pay_N9K9xYz1234567";
    const forgedSignature = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";

    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature: forgedSignature,
    });

    expect(isValid).toBe(false);
  });

  it("should verify authentic webhook payloads using custom webhook secret", () => {
    const webhookSecret = "whsec_test_secret_for_events_9988";
    const payload = JSON.stringify({
      entity: "event",
      event: "payment.captured",
      contains: ["payment"],
      payload: { payment: { entity: { id: "pay_12345", status: "captured" } } },
    });

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    const isValid = verifyWebhookSignature(payload, expectedSignature, webhookSecret);
    expect(isValid).toBe(true);

    const isInvalid = verifyWebhookSignature(payload, "invalid_sig_string", webhookSecret);
    expect(isInvalid).toBe(false);
  });

  it("should accept simulated order IDs during local testing", () => {
    const isMockValid = verifyPaymentSignature({
      orderId: "order_sim_123456789",
      paymentId: "pay_sim_987654321",
      signature: "arbitrary_simulated_sig",
    });

    expect(isMockValid).toBe(true);
  });
});
