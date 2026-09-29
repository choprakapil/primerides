import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentCustomer } from "@/server/auth/customer";
import { getCurrentAdmin } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { createRazorpayOrder } from "@/server/payments/razorpay";
import { paymentRateLimiter } from "@/lib/rateLimit";

/**
 * POST /api/v1/payments/create-order
 * Creates a verified Razorpay order for an active/pending booking.
 * Amount is calculated strictly server-side from booking records.
 */
export async function POST(req: NextRequest) {
  // Apply rate limiting (20 requests per hour)
  const rateLimitResult = await paymentRateLimiter(req);
  if (rateLimitResult) return rateLimitResult;
  try {
    const customer = await getCurrentCustomer();
    const admin = await getCurrentAdmin();

    if (!customer && !admin) {
      return apiUnauthorized("Authentication required. Please log in to process payment.");
    }

    const body = await req.json().catch(() => ({}));
    const { bookingId } = body;

    if (!bookingId || isNaN(parseInt(String(bookingId), 10))) {
      return apiError("A valid bookingId is required.", 400);
    }

    const bId = parseInt(String(bookingId), 10);

    const booking = await prisma.booking.findUnique({
      where: { id: bId },
      include: {
        customer: true,
        car: true,
        price_snapshot: true,
        payments: true,
      },
    });

    if (!booking) {
      return apiError("Booking reservation not found.", 404);
    }

    // Ownership check: Customer must own the booking, unless admin
    if (customer && !admin && booking.customer_id !== customer.id) {
      return apiError("Unauthorized: You do not have permission to pay for this reservation.", 403);
    }

    if (booking.status === "cancelled") {
      return apiError("Cannot process payment for a cancelled reservation.", 400);
    }

    // Server-side calculation of remaining balance
    const totalAmount = Number(booking.total_amount || 0);
    const paidAmount = booking.payments
      .filter((p) => p.status === "successful" || p.status === "captured")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const remainingBalance = Math.max(0, totalAmount - paidAmount);

    if (remainingBalance <= 0) {
      return apiError("This booking is already fully paid.", 400);
    }

    const customerName = booking.full_name || booking.customer?.full_name || "Customer";
    const customerPhone = booking.phone || booking.customer?.phone || "";
    const customerEmail = booking.email || booking.customer?.email || "";
    const carName = booking.car_name || booking.car?.name || "Self-Drive Vehicle";

    // Create order with Razorpay
    const order = await createRazorpayOrder({
      bookingId: booking.id,
      amountInRupees: remainingBalance,
      currency: "INR",
      notes: {
        bookingCode: booking.booking_code,
        customerName,
        carName,
      },
    });

    // Create or update pending payment record in tbl_payments
    await prisma.payment.upsert({
      where: { transaction_ref: order.id },
      create: {
        booking_id: booking.id,
        transaction_ref: order.id,
        gateway: "razorpay",
        amount: remainingBalance,
        currency: "INR",
        status: "pending",
        metadata: {
          orderId: order.id,
          receipt: order.receipt,
          isMock: order.isMock,
          createdAt: new Date().toISOString(),
        },
      },
      update: {
        amount: remainingBalance,
        metadata: {
          orderId: order.id,
          receipt: order.receipt,
          isMock: order.isMock,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    return apiSuccess(
      {
        orderId: order.id,
        amount: order.amount, // in paise
        amountInRupees: remainingBalance,
        currency: order.currency,
        keyId: order.keyId,
        bookingId: booking.id,
        bookingCode: booking.booking_code,
        customerName,
        customerPhone,
        customerEmail,
        isMock: order.isMock,
      },
      "Razorpay payment order generated successfully."
    );
  } catch (err: any) {
    console.error("Error creating Razorpay order:", err);
    return apiError(err.message || "Failed to create payment order", 500);
  }
}
