import { NextRequest } from "next/server";
import { getCarBySlug } from "@/server/fleet";
import { apiError, apiSuccess } from "@/server/utils/api-response";

/**
 * GET /api/v1/cars/[slug]
 * Public endpoint to fetch individual vehicle details and specifications.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) return apiError("Car slug is required.", 400);

    const car = await getCarBySlug(slug);
    if (!car || car.deleted_at || !car.is_available) {
      return apiError("Vehicle not found or unavailable.", 404);
    }

    return apiSuccess(car, "Vehicle details retrieved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve vehicle details", 500);
  }
}
