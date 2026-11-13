import { NextRequest } from "next/server";
import { getCurrentCustomer } from "@/server/auth/customer";
import { extendBookingSafe } from "@/server/booking";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) {
      return apiError("Invalid booking ID", 400);
    }

    const customer = await getCurrentCustomer(req);
    if (!customer) {
      return apiUnauthorized("You must be logged in to extend a booking.");
    }

    const body = await req.json().catch(() => ({}));
    const { newEndDate, reason } = body;

    if (!newEndDate) {
      return apiError("Field 'newEndDate' is required to extend a booking.", 400);
    }

    const result = await extendBookingSafe({
      bookingId,
      newEndDate,
      customerId: customer.id,
      reason,
    });

    if (!result.success) {
      return apiError(result.error || "Extension failed", result.statusCode || 400);
    }

    return apiSuccess(result.data, result.message, result.statusCode || 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to extend booking", 500);
  }
}
