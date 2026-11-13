import { NextRequest } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getAllPageMetas, upsertPageMeta, getPageMeta } from "@/server/seo";

/**
 * GET /api/v1/admin/seo
 * Retrieves all configured page metadata entries or a specific route via ?route=/path
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Forbidden: Insufficient permissions to view SEO settings.", 403);
    }

    const { searchParams } = new URL(req.url);
    const route = searchParams.get("route");

    if (route) {
      const meta = await getPageMeta(route);
      return apiSuccess(meta);
    }

    const metas = await getAllPageMetas();
    return apiSuccess(metas);
  } catch (error: any) {
    console.error("[API Admin SEO GET] Error:", error);
    return apiError("Internal server error fetching SEO configurations.", 500);
  }
}

/**
 * PUT /api/v1/admin/seo
 * Creates or updates metadata for a specific route path
 */
export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Forbidden: Insufficient permissions to update SEO settings.", 403);
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.route_path || !body.meta_title) {
      return apiError("Missing required fields: route_path and meta_title are mandatory.", 400);
    }

    const updated = await upsertPageMeta({
      route_path: String(body.route_path).trim(),
      meta_title: String(body.meta_title).trim(),
      meta_description: body.meta_description ? String(body.meta_description).trim() : null,
      meta_keywords: body.meta_keywords ? String(body.meta_keywords).trim() : null,
      og_title: body.og_title ? String(body.og_title).trim() : null,
      og_description: body.og_description ? String(body.og_description).trim() : null,
      og_image: body.og_image ? String(body.og_image).trim() : null,
      canonical_url: body.canonical_url ? String(body.canonical_url).trim() : null,
      robots: body.robots ? String(body.robots).trim() : "index, follow",
    });

    return apiSuccess(updated, "SEO metadata saved and published successfully.");
  } catch (error: any) {
    console.error("[API Admin SEO PUT] Error:", error);
    return apiError(error.message || "Failed to update SEO settings.", 500);
  }
}
