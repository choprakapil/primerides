import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getFleetConfig, saveFleetConfig } from "@/server/settings";

/**
 * GET /api/v1/admin/cms/fleet
 * Returns the persisted fleet catalog headlines and disclosures
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const config = getFleetConfig();
    return apiSuccess(config);
  } catch (error: any) {
    console.error("[API Admin Fleet CMS GET] Error:", error);
    return apiError("Internal error loading fleet configuration.", 500);
  }
}

/**
 * PUT /api/v1/admin/cms/fleet
 * Updates and persists fleet catalog headlines and settings to persistedFleet.json
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Forbidden: You lack content.manage permission.", 403);
    }

    const body = await req.json().catch(() => null);
    if (!body) return apiError("Invalid request body.", 400);

    const updated = saveFleetConfig({
      eyebrow: body.eyebrow,
      title: body.title,
      subtitle: body.subtitle,
    });

    return apiSuccess(updated, "Fleet catalog configuration saved and published successfully.");
  } catch (error: any) {
    console.error("[API Admin Fleet CMS PUT] Error:", error);
    return apiError(error.message || "Failed to update fleet catalog settings.", 500);
  }
}
