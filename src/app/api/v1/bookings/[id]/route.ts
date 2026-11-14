import { NextRequest } from "next/server";
import { getCurrentCustomer } from "@/server/auth/customer";
import { cancelBookingForCustomer, validateCoupon } from "@/server/booking";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { prisma } from "@/server/db/client";

/**
 * PATCH /api/v1/bookings/[id]
 * Customer updates a pending reservation:
 * - Apply promo/coupon code
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return apiUnauthorized("Authentication required.");
    }

    const { id } = await context.params;
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId) || bookingId <= 0) {
      return apiError("Invalid booking ID.", 400);
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, customer_id: customer.id, deleted_at: null },
      include: { car: true, rental_plan: true, price_snapshot: true },
    });

    if (!booking) {
      return apiError("Booking not found.", 404);
    }

    if (booking.status !== "pending") {
      return apiError("Only pending reservations can be modified or discounted.", 400);
    }

    const body = await req.json().catch(() => ({}));
    const { couponCode } = body;

    if (couponCode && typeof couponCode === "string") {
      const grossAmount = Number(booking.base_amount || booking.total_amount || 0);
      const couponRes = await validateCoupon(couponCode.trim(), grossAmount, {
        customerId: customer.id,
        phone: customer.phone,
        platform: "web",
      });

      if (!couponRes.valid || !couponRes.coupon) {
        return apiError(couponRes.error || "Invalid coupon code.", 400);
      }

      const discountAmount = couponRes.discountAmount || 0;
      const basePlusExtras =
        Number(booking.base_amount || 0) +
        Number(booking.chauffeur_fee || 0) +
        Number(booking.security_deposit || 0);
      const newTotal = Math.max(0, basePlusExtras - discountAmount);

      const updated = await prisma.$transaction(async (tx) => {
        const b = await tx.booking.update({
          where: { id: bookingId },
          data: {
            coupon_id: couponRes.coupon!.id,
            coupon_code: couponRes.coupon!.code,
            discount_amount: discountAmount,
            total_amount: newTotal,
          },
        });

        if (booking.price_snapshot) {
          await tx.priceSnapshot.update({
            where: { id: booking.price_snapshot.id },
            data: {
              coupon_code: couponRes.coupon!.code,
              discount_amount: discountAmount,
              total_calculated: newTotal,
            },
          });
        }

        return b;
      });

      return apiSuccess(
        updated,
        `Coupon ${couponRes.coupon.code} applied successfully! Saved ₹${discountAmount.toLocaleString("en-IN")}.`
      );
    }

    return apiError("No valid fields to update.", 400);
  } catch (err: any) {
    console.error("Update booking error:", err);
    return apiError(err.message || "Failed to update reservation.", 500);
  }
}

/**
 * DELETE /api/v1/bookings/[id]
 * Customer self-cancels a booking.
 * Restricted to `pending` and `confirmed` status only.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return apiUnauthorized("Authentication required to cancel a reservation.");
    }

    const { id } = await context.params;
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId) || bookingId <= 0) {
      return apiError("Invalid booking ID.", 400);
    }

    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason.trim() : undefined;

    const result = await cancelBookingForCustomer(bookingId, customer.id, reason);

    if (!result.success) {
      return apiError(result.error || "Failed to cancel reservation.", result.statusCode || 400);
    }

    return apiSuccess(
      {
        booking_id: bookingId,
        status: "cancelled",
        refund_amount: result.refundAmount,
        penalty_amount: result.penaltyAmount,
        refund_policy_tier: result.refundPolicyTier,
        refund_gateway_ref: result.refundGatewayRef,
      },
      result.refundAmount && result.refundAmount > 0
        ? `Your reservation has been cancelled. A refund of ₹${result.refundAmount.toLocaleString("en-IN")} has been initiated to your original payment method.`
        : "Your reservation has been cancelled successfully."
    );
  } catch (err: any) {
    console.error("Cancel booking error:", err);
    return apiError(err.message || "Failed to cancel reservation.", 500);
  }
}
