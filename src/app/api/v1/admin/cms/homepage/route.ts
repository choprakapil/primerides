import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getHomepageConfig, saveHomepageConfig } from "@/server/settings";

/**
 * GET /api/v1/admin/cms/homepage
 * Fetch persisted homepage hero, hubs, trust highlights, offers, and reviews
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const config = getHomepageConfig();
    return apiSuccess(config);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch homepage configuration", 500);
  }
}

/**
 * PUT /api/v1/admin/cms/homepage
 * Update persisted homepage configuration
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Insufficient permission to modify homepage content.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const updated = saveHomepageConfig(body);

    return apiSuccess(updated, "Homepage content and propositions saved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to save homepage configuration", 500);
  }
}
