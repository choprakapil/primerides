import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getPoliciesConfig, savePoliciesConfig } from "@/server/settings";

/**
 * GET /api/v1/admin/cms/policies
 * Fetch rental policies, cancellation rules, deposit SLAs, and travel guidelines
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const config = getPoliciesConfig();
    return apiSuccess(config);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch policies configuration", 500);
  }
}

/**
 * PUT /api/v1/admin/cms/policies
 * Update rental policies, cancellation rules, deposit SLAs, and travel guidelines
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Insufficient permission to modify rental policies.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const updated = savePoliciesConfig(body);

    return apiSuccess(updated, "Rental policies and compliance disclosures saved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to save policies configuration", 500);
  }
}
