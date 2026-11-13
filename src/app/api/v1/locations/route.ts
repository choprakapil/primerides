import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { apiError, apiSuccess } from "@/server/utils/api-response";

/**
 * GET /api/v1/locations
 * Returns active rental locations / hubs.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where: {
          deleted_at: null,
          is_active: true,
        },
        orderBy: { sort_order: "asc" },
        take: limit,
        skip,
      }),
      prisma.location.count({ where: { deleted_at: null, is_active: true } }),
    ]);

    return apiSuccess({ locations, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }, "Locations retrieved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch locations", 500);
  }
}
