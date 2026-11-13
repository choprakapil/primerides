import { NextRequest } from "next/server";
import { getFleetCarsWithAvailability } from "@/server/fleet";
import { apiError, apiSuccess } from "@/server/utils/api-response";

/**
 * GET /api/v1/cars
 * Public endpoint to fetch active luxury fleet inventory with real-time multi-unit availability.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locationParam = searchParams.get("location_id") || searchParams.get("locationId") || searchParams.get("location");
    const locationId = locationParam && !isNaN(parseInt(locationParam, 10)) ? parseInt(locationParam, 10) : undefined;
    const locationSlug = searchParams.get("locationSlug") || (locationParam && isNaN(parseInt(locationParam, 10)) ? locationParam : undefined);
    
    const categoryParam = searchParams.get("categoryId") || searchParams.get("category_id");
    const categoryId = categoryParam && !isNaN(parseInt(categoryParam, 10)) ? parseInt(categoryParam, 10) : undefined;
    const rawCatSlug = searchParams.get("categorySlug") || searchParams.get("category") || searchParams.get("filter") || searchParams.get("type") || (categoryParam && isNaN(parseInt(categoryParam, 10)) ? categoryParam : undefined);
    const categorySlug = rawCatSlug === "sedan" ? "luxury" : (rawCatSlug === "hatchbacks" ? "hatchback" : rawCatSlug);
    const brand = searchParams.get("brand") || undefined;
    const transmission = searchParams.get("transmission") || undefined;
    const fuelType = searchParams.get("fuelType") || searchParams.get("fuel") || undefined;
    const seats = searchParams.get("seats") ? parseInt(searchParams.get("seats")!, 10) : undefined;
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const sort = (searchParams.get("sort") as any) || undefined;
    const search = searchParams.get("search") || undefined;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));
    const skip = (page - 1) * limit;

    const cars = await getFleetCarsWithAvailability({
      locationId,
      locationSlug,
      startDate,
      endDate,
      categoryId,
      categorySlug,
      brand,
      transmission,
      fuelType,
      seats,
      minPrice,
      maxPrice,
      sort,
      search,
      limit,
      skip,
    });

    return apiSuccess({
      cars,
      pagination: { page, limit },
    }, "Fleet vehicles retrieved successfully with live availability.");
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve fleet", 500);
  }
}
