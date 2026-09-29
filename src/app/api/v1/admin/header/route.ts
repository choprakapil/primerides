import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getHeaderConfig, saveHeaderConfig } from "@/server/settings";

/**
 * GET /api/v1/admin/header
 * Fetch header menu links, brand logo, and action buttons configuration
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const config = getHeaderConfig();
    return apiSuccess(config);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch header configuration", 500);
  }
}

/**
 * PUT /api/v1/admin/header
 * Update header navigation links, action buttons, and logo settings
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Insufficient permission to modify header configuration.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const updated = saveHeaderConfig(body);

    return apiSuccess(updated, "Header buttons and menu navigation saved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to save header configuration", 500);
  }
}
