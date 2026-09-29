import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * PATCH /api/v1/admin/locations/[id]
 * Updates an existing rental location hub.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.FLEET_MANAGE)) {
      return apiError("Forbidden: You lack fleet.manage permission.", 403);
    }

    const { id } = await context.params;
    const locationId = parseInt(id, 10);
    if (isNaN(locationId)) return apiError("Invalid location ID.", 400);

    const existing = await prisma.location.findUnique({
      where: { id: locationId, deleted_at: null },
    });

    if (!existing) return apiError("Rental hub not found.", 404);

    const body = await req.json().catch(() => ({}));
    const { city, name, slug, address, is_active, sort_order } = body;

    const dataToUpdate: any = {};
    if (city !== undefined) dataToUpdate.city = city.trim();
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (slug !== undefined) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
      // If changed, check uniqueness
      if (cleanSlug !== existing.slug) {
        const slugExists = await prisma.location.findFirst({
          where: { slug: cleanSlug, deleted_at: null, id: { not: locationId } },
        });
        if (slugExists) {
          return apiError(`A hub with identifier "${cleanSlug}" already exists.`, 409);
        }
      }
      dataToUpdate.slug = cleanSlug;
    }
    if (address !== undefined) dataToUpdate.address = address?.trim() || null;
    if (is_active !== undefined) dataToUpdate.is_active = !!is_active;
    if (sort_order !== undefined) dataToUpdate.sort_order = parseInt(String(sort_order), 10);

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.location.update({
        where: { id: locationId },
        data: dataToUpdate,
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "LOCATION_UPDATED",
          entity: "Location",
          entity_id: locationId,
          before_state: {
            city: existing.city,
            name: existing.name,
            is_active: existing.is_active,
          },
          after_state: dataToUpdate,
        },
      });

      return result;
    });

    return apiSuccess(updated, "Rental hub updated successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to update rental hub", 500);
  }
}

/**
 * DELETE /api/v1/admin/locations/[id]
 * Soft-delete a rental location hub.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.FLEET_MANAGE)) {
      return apiError("Forbidden: You lack fleet.manage permission.", 403);
    }

    const { id } = await context.params;
    const locationId = parseInt(id, 10);
    if (isNaN(locationId)) return apiError("Invalid location ID.", 400);

    const existing = await prisma.location.findUnique({
      where: { id: locationId, deleted_at: null },
      include: {
        _count: {
          select: {
            cars: { where: { deleted_at: null } },
            bookings: { where: { deleted_at: null, status: { in: ["pending", "confirmed", "active"] } } },
          },
        },
      },
    });

    if (!existing) return apiError("Rental hub not found.", 404);

    if (existing._count.cars > 0) {
      return apiError(
        `Cannot remove hub: There are ${existing._count.cars} vehicles assigned to this hub. Reassign them first.`,
        400
      );
    }

    if (existing._count.bookings > 0) {
      return apiError(
        `Cannot remove hub: There are ${existing._count.bookings} active or upcoming reservations linked to this hub.`,
        400
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.location.update({
        where: { id: locationId },
        data: {
          deleted_at: new Date(),
          is_active: false,
          slug: `${existing.slug}-del-${Date.now()}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "LOCATION_DELETED",
          entity: "Location",
          entity_id: locationId,
          before_state: { city: existing.city, name: existing.name },
          after_state: { deleted_at: new Date() },
        },
      });
    });

    return apiSuccess({ id: locationId }, "Rental hub removed successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete rental hub", 500);
  }
}
