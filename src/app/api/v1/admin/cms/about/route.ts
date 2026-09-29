import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getAboutConfig, saveAboutConfig } from "@/server/settings";

/**
 * GET /api/v1/admin/cms/about
 * Fetch persisted about narrative, mission, vision, and stats
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const config = getAboutConfig();
    return apiSuccess(config);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch about page configuration", 500);
  }
}

/**
 * PUT /api/v1/admin/cms/about
 * Update persisted about page configuration
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Insufficient permission to modify about page content.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const updated = saveAboutConfig(body);

    return apiSuccess(updated, "About us narrative and company stats saved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to save about configuration", 500);
  }
}
