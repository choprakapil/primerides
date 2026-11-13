import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { createRazorpayRefund } from "@/server/payments/razorpay";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * POST /api/v1/admin/bookings/[id]/refund
 * Triggers a payment gateway refund via Razorpay and reconciles booking ledger.
 * 
 * Required RBAC: BOOKINGS_MANAGE
 * 
 * Body:
 * - refundAmount: number (optional, defaults to maximum available refundable balance)
 * - reason: string (optional, notes for refund)
 * - cancelBooking: boolean (optional, whether to transition booking status to "cancelled")
 * - penaltyAmount: number (optional, cancellation fee retained by business)
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin(req);
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.BOOKINGS_MANAGE)) {
      return apiError("Forbidden: You lack bookings.manage permission to issue refunds.", 403);
    }

    const { id } = await context.params;
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) return apiError("Invalid booking ID.", 400);

    const body = await req.json().catch(() => ({}));
    const {
      refundAmount: inputRefundAmount,
      reason = "Admin triggered gateway refund",
      cancelBooking = false,
      penaltyAmount = 0,
    } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!booking || booking.deleted_at) {
      return apiError("Booking not found.", 404);
    }

    // Calculate captured and refunded amounts
    const capturedPayments = (booking.payments || []).filter(
      (p) => (p.status === "captured" || p.status === "successful") && p.payment_method !== "refund"
    );
    const totalCaptured = capturedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const refundedPayments = (booking.payments || []).filter(
      (p) => p.status === "refunded" || p.payment_method === "refund"
    );
    const totalAlreadyRefunded = refundedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const refundableBalance = Math.max(0, totalCaptured - totalAlreadyRefunded);

    if (totalCaptured <= 0) {
      return apiError("Cannot issue refund: No captured payments found for this reservation.", 400);
    }

    if (refundableBalance <= 0) {
      return apiError(
        `Cannot issue refund: All captured funds (₹${totalCaptured.toLocaleString("en-IN")}) have already been refunded.`,
        400
      );
    }

    const refundAmount = inputRefundAmount !== undefined ? Number(inputRefundAmount) : refundableBalance;

    if (isNaN(refundAmount) || refundAmount <= 0) {
      return apiError("Refund amount must be a positive number.", 400);
    }

    if (refundAmount > refundableBalance) {
      return apiError(
        `Refund amount (₹${refundAmount.toLocaleString("en-IN")}) exceeds available refundable balance of ₹${refundableBalance.toLocaleString("en-IN")}.`,
        400
      );
    }

    // 1. Identify primary payment reference for gateway refund
    const primaryPayment = capturedPayments[0];
    if (!primaryPayment || !primaryPayment.transaction_ref) {
      return apiError("Cannot process gateway refund: Missing transaction reference on captured payment.", 400);
    }

    // 2. Execute Real Gateway Refund via Razorpay API adapter
    let gatewayRefund;
    try {
      gatewayRefund = await createRazorpayRefund({
        paymentId: primaryPayment.transaction_ref,
        amountInRupees: refundAmount,
        notes: {
          bookingCode: booking.booking_code,
          bookingId: String(booking.id),
          admin: admin.username,
          adminId: String(admin.id),
          reason: String(reason).trim(),
        },
      });
    } catch (gatewayErr: any) {
      console.error("[AdminRefund:GatewayError] Razorpay refund failed:", gatewayErr);
      return apiError(
        `Gateway refund failed: ${gatewayErr.message || "Unknown error from payment gateway"}.`,
        502
      );
    }

    // 3. Atomic Database Ledger & Status Updates
    const remainingBalance = Math.max(0, refundableBalance - refundAmount);
    const shouldCancel = Boolean(cancelBooking);

    await prisma.$transaction(async (tx) => {
      // A. Insert Refund Payment ledger entry
      await tx.payment.create({
        data: {
          booking_id: bookingId,
          amount: refundAmount,
          currency: "INR",
          status: "refunded",
          gateway: primaryPayment.gateway || "razorpay",
          transaction_ref: gatewayRefund.id,
          payment_method: "refund",
          metadata: {
            initiated_by: "admin",
            admin_username: admin.username,
            admin_id: admin.id,
            reason: String(reason).trim(),
            original_payment_ref: primaryPayment.transaction_ref,
            remaining_refundable_balance: remainingBalance,
            refunded_at: new Date().toISOString(),
          },
        },
      });

      // B. If cancelling booking or requested
      if (shouldCancel && booking.status !== "cancelled") {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: "cancelled" },
        });

        await tx.cancellation.upsert({
          where: { booking_id: bookingId },
          create: {
            booking_id: bookingId,
            reason: String(reason).trim(),
            cancelled_by: "admin",
            refund_amount: refundAmount,
            penalty_amount: Number(penaltyAmount) || 0,
            processed_at: new Date(),
          },
          update: {
            reason: String(reason).trim(),
            cancelled_by: "admin",
            refund_amount: (totalAlreadyRefunded + refundAmount),
            penalty_amount: Number(penaltyAmount) || 0,
            processed_at: new Date(),
          },
        });
      }

      // C. Audit Trail
      await tx.bookingStatusHistory.create({
        data: {
          booking_id: bookingId,
          from_status: booking.status,
          to_status: shouldCancel ? "cancelled" : booking.status,
          changed_by_user_id: admin.id,
          changed_by_role: `admin (${admin.username})`,
          reason: `Admin refund of ₹${refundAmount.toLocaleString("en-IN")} processed via ${gatewayRefund.id}. ${
            shouldCancel ? "Reservation cancelled." : ""
          } Reason: ${reason}`,
        },
      });
    });

    return apiSuccess({
      success: true,
      refundId: gatewayRefund.id,
      refundAmount,
      remainingBalance,
      bookingStatus: shouldCancel ? "cancelled" : booking.status,
      message: `Successfully processed refund of ₹${refundAmount.toLocaleString("en-IN")} (Ref: ${gatewayRefund.id}).`,
    });
  } catch (err: any) {
    console.error("[AdminRefund:Exception]", err);
    return apiError(err.message || "Failed to process admin refund.", 500);
  }
}
