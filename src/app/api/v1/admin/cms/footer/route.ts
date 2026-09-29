import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getFooterConfig, saveFooterConfig } from "@/server/settings";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/cms/footer
 * Fetch footer branding, quick navigation links, NCR hubs, and copyright text
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const config = getFooterConfig();
    return apiSuccess(config);
  } catch (err: any) {
    return apiError(err.message || "Failed to load footer configuration", 500);
  }
}

/**
 * PUT /api/v1/admin/cms/footer
 * Update footer content, links, and operational details
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Insufficient permission to modify website content.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const updated = saveFooterConfig(body);

    return apiSuccess(updated, "Footer configuration saved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to update footer configuration", 500);
  }
}
