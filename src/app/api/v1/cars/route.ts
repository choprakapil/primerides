import { NextRequest } from "next/server";
import { getFleetCars } from "@/server/fleet";
import { apiError, apiSuccess } from "@/server/utils/api-response";

/**
 * GET /api/v1/cars
 * Public endpoint to fetch active luxury fleet inventory, filtered by location/category.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locationParam = searchParams.get("location_id") || searchParams.get("locationId") || searchParams.get("location");
    const locationId = locationParam && !isNaN(parseInt(locationParam, 10)) ? parseInt(locationParam, 10) : undefined;
    const locationSlug = searchParams.get("locationSlug") || (locationParam && isNaN(parseInt(locationParam, 10)) ? locationParam : undefined);
    
    const categoryId = searchParams.get("categoryId") ? parseInt(searchParams.get("categoryId")!, 10) : undefined;
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const featuredOnly = searchParams.get("featured") === "true";
    const search = searchParams.get("search") || undefined;

    const cars = await getFleetCars({
      locationId,
      locationSlug,
      categoryId,
      categorySlug,
      brand,
      featuredOnly,
      search,
    });

    return apiSuccess(cars, "Fleet vehicles retrieved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve fleet", 500);
  }
}
