import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getSiteSettings, saveSiteSettings } from "@/server/settings";

/**
 * GET /api/v1/admin/settings
 * Fetch current site configuration and contact details
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const settings = getSiteSettings();
    return apiSuccess(settings);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch settings", 500);
  }
}

/**
 * PUT /api/v1/admin/settings
 * Update site configuration (phone, whatsapp, address, social, etc.)
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.ADMINS_MANAGE)) {
      return apiError("Insufficient permission to modify site settings.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const updated = saveSiteSettings(body);

    return apiSuccess(updated, "Site configuration saved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to save settings", 500);
  }
}
