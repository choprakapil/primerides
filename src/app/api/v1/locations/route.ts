import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { apiError, apiSuccess } from "@/server/utils/api-response";

/**
 * GET /api/v1/locations
 * Returns active rental locations / hubs.
 */
export async function GET(req: NextRequest) {
  try {
    const locations = await prisma.location.findMany({
      where: {
        deleted_at: null,
        is_active: true,
      },
      orderBy: { sort_order: "asc" },
    });

    return apiSuccess(locations, "Locations retrieved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch locations", 500);
  }
}
