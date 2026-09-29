import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getNotificationSettings, saveNotificationSettings } from "@/server/settings";

/**
 * GET /api/v1/admin/notifications
 * Fetch announcement bar and notification templates
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const notifications = getNotificationSettings();
    return apiSuccess(notifications);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch notification settings", 500);
  }
}

/**
 * PUT /api/v1/admin/notifications
 * Update announcement bar, message templates, or alert rules
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Insufficient permission to modify notification settings.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const updated = saveNotificationSettings(body);

    return apiSuccess(updated, "Notification settings saved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to save notification settings", 500);
  }
}
