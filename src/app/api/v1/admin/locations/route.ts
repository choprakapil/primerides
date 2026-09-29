import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiCreated, apiUnauthorized } from "@/server/utils/api-response";

/**
 * GET /api/v1/admin/locations
 * Fetch all rental hubs/locations with assigned fleet and booking counts.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (
      !hasAdminPermission(admin, [
        ADMIN_PERMISSIONS.FLEET_MANAGE,
        ADMIN_PERMISSIONS.BOOKINGS_VIEW,
      ])
    ) {
      return apiError("Forbidden: You lack fleet.manage or bookings.view permission.", 403);
    }

    const locations = await prisma.location.findMany({
      where: { deleted_at: null },
      include: {
        _count: {
          select: {
            cars: { where: { deleted_at: null } },
            bookings: { where: { deleted_at: null } },
          },
        },
      },
      orderBy: { sort_order: "asc" },
    });

    const stats = {
      totalHubs: locations.length,
      activeHubs: locations.filter((l) => l.is_active).length,
      totalVehiclesAssigned: locations.reduce((sum, l) => sum + l._count.cars, 0),
      totalReservations: locations.reduce((sum, l) => sum + l._count.bookings, 0),
    };

    return apiSuccess({ locations, stats }, "Locations retrieved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch locations", 500);
  }
}

/**
 * POST /api/v1/admin/locations
 * Create a new operational vehicle rental hub.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.FLEET_MANAGE)) {
      return apiError("Forbidden: You lack fleet.manage permission to create rental hubs.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const { city, name, slug, address, is_active, sort_order } = body;

    if (!city || !name) {
      return apiError("City name and Hub title are required.", 400);
    }

    // Auto-generate slug if not provided
    const hubSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existing = await prisma.location.findUnique({
      where: { slug: hubSlug },
    });
    let finalSlug = hubSlug;
    if (existing) {
      if (!existing.deleted_at) {
        return apiError(`A rental hub with the URL identifier "${hubSlug}" already exists.`, 409);
      } else {
        finalSlug = `${hubSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const location = await prisma.$transaction(async (tx) => {
      const created = await tx.location.create({
        data: {
          city: city.trim(),
          name: name.trim(),
          slug: finalSlug,
          address: address?.trim() || null,
          is_active: is_active !== undefined ? !!is_active : true,
          sort_order: parseInt(String(sort_order || 0), 10),
        },
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "LOCATION_CREATED",
          entity: "Location",
          entity_id: created.id,
          before_state: {},
          after_state: {
            city: created.city,
            name: created.name,
            slug: created.slug,
            is_active: created.is_active,
          },
        },
      });

      return created;
    });

    return apiCreated(location, "Rental hub created successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to create rental hub", 500);
  }
}
