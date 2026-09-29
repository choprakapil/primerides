import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentCustomer } from "@/server/auth/customer";
import { getCurrentAdmin } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { verifyPaymentSignature } from "@/server/payments/razorpay";
import { notifyBookingConfirmed } from "@/server/notifications";
import { paymentRateLimiter } from "@/lib/rateLimit";

/**
 * POST /api/v1/payments/verify
 * Validates Razorpay HMAC signature and confirms payment into immutable ledger.
 */
export async function POST(req: NextRequest) {
  // Apply rate limiting (20 requests per hour)
  const rateLimitResult = await paymentRateLimiter(req);
  if (rateLimitResult) return rateLimitResult;
  try {
    const customer = await getCurrentCustomer();
    const admin = await getCurrentAdmin();

    if (!customer && !admin) {
      return apiUnauthorized("Authentication required. Please log in.");
    }

    const body = await req.json().catch(() => ({}));
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id) {
      return apiError("Missing required payment verification fields.", 400);
    }

    const bId = parseInt(String(bookingId), 10);

    // 1. Verify Cryptographic Signature
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature || "",
    });

    if (!isValid) {
      // Record failed attempt in payment record if exists
      await prisma.payment.updateMany({
        where: { transaction_ref: razorpay_order_id },
        data: {
          status: "failed",
          metadata: {
            failedReason: "Invalid cryptographic signature",
            attemptedAt: new Date().toISOString(),
          },
        },
      });

      return apiError("Payment signature verification failed. Transaction was not captured.", 400);
    }

    // 2. Fetch booking and confirm existence
    const booking = await prisma.booking.findUnique({
      where: { id: bId },
      include: { customer: true, car: true },
    });

    if (!booking) {
      return apiError("Booking reservation not found.", 404);
    }

    // 3. Atomically update Payment record and Booking status
    const result = await prisma.$transaction(async (tx) => {
      // Find the existing pending payment for this order
      const existingPayment = await tx.payment.findFirst({
        where: {
          booking_id: booking.id,
          transaction_ref: razorpay_order_id,
        },
      });

      let updatedPayment;
      if (existingPayment) {
        updatedPayment = await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            transaction_ref: razorpay_payment_id,
            status: "successful",
            payment_method: "online_gateway",
            metadata: {
              ...(existingPayment.metadata as object),
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              verifiedAt: new Date().toISOString(),
            },
          },
        });
      } else {
        updatedPayment = await tx.payment.create({
          data: {
            booking_id: booking.id,
            transaction_ref: razorpay_payment_id,
            gateway: "razorpay",
            amount: booking.total_amount || 0,
            currency: "INR",
            status: "successful",
            payment_method: "online_gateway",
            metadata: {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
              verifiedAt: new Date().toISOString(),
            },
          },
        });
      }

      // Transition booking from pending to confirmed if needed
      let updatedBooking = booking;
      if (booking.status === "pending") {
        updatedBooking = await tx.booking.update({
          where: { id: booking.id },
          data: { status: "confirmed" },
          include: { customer: true, car: true },
        });
      }

      // Record in tbl_audit_logs
      await tx.auditLog.create({
        data: {
          actor_id: customer?.id || admin?.id || booking.customer_id || 0,
          actor_type: admin ? "admin" : "customer",
          action: "PAYMENT_CAPTURED",
          entity: "Payment",
          entity_id: updatedPayment.id,
          before_state: {
            bookingId: booking.id,
            previousStatus: booking.status,
          },
          after_state: {
            paymentId: updatedPayment.id,
            amount: updatedPayment.amount,
            status: "successful",
            newBookingStatus: updatedBooking.status,
            razorpayPaymentId: razorpay_payment_id,
          },
        },
      });

      return { payment: updatedPayment, booking: updatedBooking };
    });

    // 4. Dispatch booking confirmation notification asynchronously
    notifyBookingConfirmed({
      customerName: result.booking.full_name || result.booking.customer?.full_name || "Customer",
      customerEmail: result.booking.email || result.booking.customer?.email,
      customerPhone: result.booking.phone || result.booking.customer?.phone || "",
      bookingCode: result.booking.booking_code,
      carName: result.booking.car_name || result.booking.car?.name || "Vehicle",
      startDate: result.booking.start_date,
      endDate: result.booking.end_date,
      totalAmount: Number(result.booking.total_amount || 0),
      pickupLocation: result.booking.pickup_location,
    }).catch((err) =>
      console.error("Failed to send booking payment confirmation:", err)
    );

    return apiSuccess(
      {
        paymentId: result.payment.id,
        transactionRef: result.payment.transaction_ref,
        bookingId: result.booking.id,
        bookingCode: result.booking.booking_code,
        bookingStatus: result.booking.status,
        amount: Number(result.payment.amount),
      },
      "Payment verified successfully! Your reservation has been confirmed."
    );
  } catch (err: any) {
    console.error("Error verifying payment signature:", err);
    return apiError(err.message || "Failed to verify payment", 500);
  }
}
