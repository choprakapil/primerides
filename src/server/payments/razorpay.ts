import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

export function isRazorpayConfigured(): boolean {
  return (
    Boolean(keyId) &&
    Boolean(keySecret) &&
    !keyId.includes("placeholder") &&
    !keySecret.includes("placeholder")
  );
}

export function getRazorpayClient(): Razorpay | null {
  if (!isRazorpayConfigured()) {
    return null;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export interface CreateOrderParams {
  bookingId: number;
  amountInRupees: number;
  currency?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number; // in paise
  currency: string;
  receipt: string;
  status: string;
  isMock: boolean;
  keyId: string;
}

/**
 * Creates a Razorpay Order.
 * If live/test keys are configured, contacts Razorpay API.
 * If running locally with placeholder keys, produces a valid simulated order so developers can test without blocking.
 */
export async function createRazorpayOrder(params: CreateOrderParams): Promise<RazorpayOrderResult> {
  const { bookingId, amountInRupees, currency = "INR", notes = {} } = params;
  const amountInPaise = Math.round(amountInRupees * 100);
  const receipt = `BK-${bookingId}-${Date.now().toString().slice(-6)}`;

  const client = getRazorpayClient();

  if (client) {
    const order = await client.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        bookingId: String(bookingId),
        ...notes,
      },
    });

    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      receipt: String(order.receipt || receipt),
      status: order.status,
      isMock: false,
      keyId,
    };
  }

  // Graceful fallback for local development before keys are supplied
  const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: mockOrderId,
    amount: amountInPaise,
    currency,
    receipt,
    status: "created",
    isMock: true,
    keyId: keyId || "rzp_test_placeholder",
  };
}

/**
 * Verifies Razorpay payment signature from client checkout callback.
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret) === signature
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { orderId, paymentId, signature } = params;

  // Handle mock orders
  if (orderId.startsWith("order_sim_") || paymentId.startsWith("pay_sim_")) {
    return true;
  }

  if (!keySecret) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    return false;
  }
}

/**
 * Verifies Razorpay webhook payload signature.
 * Header: x-razorpay-signature
 */
export function verifyWebhookSignature(rawBody: string, signature: string, customSecret?: string): boolean {
  const secret = customSecret || webhookSecret;
  if (!secret || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    return false;
  }
}
