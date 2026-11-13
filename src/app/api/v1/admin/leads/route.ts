import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * GET /api/v1/admin/leads
 * List all customer contact inquiries
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.contactLead.findMany({
        where: { deleted_at: null },
        orderBy: { created_at: "desc" },
        take: limit,
        skip,
      }),
      prisma.contactLead.count({ where: { deleted_at: null } }),
    ]);

    return apiSuccess({ leads, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch contact leads", 500);
  }
}

/**
 * PATCH /api/v1/admin/leads
 * Update lead status (e.g. new -> contacted -> converted)
 */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const body = await req.json().catch(() => ({}));
    const { id, status } = body;

    if (!id || !status) return apiError("Lead ID and new status required.", 400);

    const updated = await prisma.contactLead.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });

    return apiSuccess(updated, "Lead status updated.");
  } catch (err: any) {
    return apiError(err.message || "Failed to update lead", 500);
  }
}
