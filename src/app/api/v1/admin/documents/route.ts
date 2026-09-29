import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { getAdminDocumentsWithSignedUrls } from "@/server/kyc";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * GET /api/v1/admin/documents?status=pending|verified|rejected|all
 * Lists identity documents for administrative review.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, [ADMIN_PERMISSIONS.DOCUMENTS_MANAGE, ADMIN_PERMISSIONS.BOOKINGS_VIEW])) {
      return apiError("Forbidden: You lack documents.manage permission.", 403);
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "all";
    const customerIdParam = url.searchParams.get("customerId");
    const customerId = customerIdParam ? parseInt(customerIdParam, 10) : undefined;

    const documents = await getAdminDocumentsWithSignedUrls(status, customerId);
    return apiSuccess(documents, "Admin documents retrieved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve documents for admin review", 500);
  }
}
