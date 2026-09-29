import { NextRequest } from "next/server";
import { getCurrentCustomer } from "@/server/auth/customer";
import { cancelBookingForCustomer } from "@/server/booking";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

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
      { booking_id: bookingId, status: "cancelled" },
      "Your reservation has been cancelled successfully."
    );
  } catch (err: any) {
    console.error("Cancel booking error:", err);
    return apiError(err.message || "Failed to cancel reservation.", 500);
  }
}
