import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * PATCH /api/v1/admin/testimonials/[id]
 * Update an existing testimonial or toggle featured state.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Forbidden: You lack content.manage permission.", 403);
    }

    const { id } = await context.params;
    const testimonialId = parseInt(id, 10);
    if (isNaN(testimonialId)) return apiError("Invalid testimonial ID.", 400);

    const existing = await prisma.testimonial.findUnique({
      where: { id: testimonialId, deleted_at: null },
    });

    if (!existing) return apiError("Testimonial not found.", 404);

    const body = await req.json().catch(() => ({}));
    const { client_name, role_title, rating, comment, avatar_url, is_featured } = body;

    const dataToUpdate: any = {};
    if (client_name !== undefined) dataToUpdate.client_name = client_name.trim();
    if (role_title !== undefined) dataToUpdate.role_title = role_title?.trim() || null;
    if (rating !== undefined) dataToUpdate.rating = Math.min(5, Math.max(1, parseInt(String(rating), 10)));
    if (comment !== undefined) dataToUpdate.comment = comment.trim();
    if (avatar_url !== undefined) dataToUpdate.avatar_url = avatar_url?.trim() || null;
    if (is_featured !== undefined) dataToUpdate.is_featured = !!is_featured;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.testimonial.update({
        where: { id: testimonialId },
        data: dataToUpdate,
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "TESTIMONIAL_UPDATED",
          entity: "Testimonial",
          entity_id: testimonialId,
          before_state: {
            client_name: existing.client_name,
            rating: existing.rating,
            is_featured: existing.is_featured,
          },
          after_state: dataToUpdate,
        },
      });

      return result;
    });

    return apiSuccess(updated, "Testimonial updated successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to update testimonial", 500);
  }
}

/**
 * DELETE /api/v1/admin/testimonials/[id]
 * Soft-delete a testimonial.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Forbidden: You lack content.manage permission.", 403);
    }

    const { id } = await context.params;
    const testimonialId = parseInt(id, 10);
    if (isNaN(testimonialId)) return apiError("Invalid testimonial ID.", 400);

    const existing = await prisma.testimonial.findUnique({
      where: { id: testimonialId, deleted_at: null },
    });

    if (!existing) return apiError("Testimonial not found.", 404);

    await prisma.$transaction(async (tx) => {
      await tx.testimonial.update({
        where: { id: testimonialId },
        data: { deleted_at: new Date(), is_featured: false },
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "TESTIMONIAL_DELETED",
          entity: "Testimonial",
          entity_id: testimonialId,
          before_state: {
            client_name: existing.client_name,
            role_title: existing.role_title,
          },
          after_state: { deleted_at: new Date() },
        },
      });
    });

    return apiSuccess({ id: testimonialId }, "Testimonial removed successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete testimonial", 500);
  }
}
