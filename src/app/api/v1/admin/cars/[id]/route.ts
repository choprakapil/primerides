import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * PUT /api/v1/admin/cars/[id]
 * Update car details and rental plans (fleet.manage required)
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.FLEET_MANAGE)) {
      return apiError("Forbidden: You lack fleet.manage permission to edit vehicles.", 403);
    }

    const { id } = await context.params;
    const carId = parseInt(id, 10);
    if (isNaN(carId)) return apiError("Invalid car ID.", 400);

    const existingCar = await prisma.car.findUnique({
      where: { id: carId },
      include: { rental_plans: true },
    });
    if (!existingCar || existingCar.deleted_at) {
      return apiError("Vehicle not found.", 404);
    }

    const body = await req.json().catch(() => ({}));
    const {
      name,
      slug,
      brand,
      category_id,
      location_id,
      price_per_day,
      security_deposit,
      transmission,
      seats,
      doors,
      fuel_type,
      engine_hp,
      primary_image,
      badge,
      description,
      is_available,
      rental_plans,
    } = body;

    // Check slug uniqueness if changed
    if (slug && slug !== existingCar.slug) {
      const slugCheck = await prisma.car.findUnique({ where: { slug } });
      if (slugCheck) return apiError("A car with this slug already exists.", 409);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const car = await tx.car.update({
        where: { id: carId },
        data: {
          ...(name ? { name } : {}),
          ...(slug ? { slug } : {}),
          ...(brand ? { brand } : {}),
          ...(category_id ? { category_id: parseInt(category_id, 10) } : {}),
          ...(location_id ? { location_id: parseInt(location_id, 10) } : {}),
          ...(price_per_day ? { price_per_day: parseFloat(price_per_day) } : {}),
          ...(security_deposit ? { security_deposit: parseFloat(security_deposit) } : {}),
          ...(transmission ? { transmission } : {}),
          ...(seats ? { seats: parseInt(seats, 10) } : {}),
          ...(doors ? { doors: parseInt(doors, 10) } : {}),
          ...(fuel_type ? { fuel_type } : {}),
          ...(engine_hp ? { engine_hp: parseInt(engine_hp, 10) } : {}),
          ...(primary_image ? { primary_image } : {}),
          badge: badge !== undefined ? badge : existingCar.badge,
          description: description !== undefined ? description : existingCar.description,
          is_available: is_available !== undefined ? Boolean(is_available) : existingCar.is_available,
        },
      });

      // Update rental plans if provided
      if (Array.isArray(rental_plans) && rental_plans.length > 0) {
        // Delete old plans and re-create updated plans
        await tx.rentalPlan.deleteMany({ where: { car_id: carId } });
        for (const p of rental_plans) {
          await tx.rentalPlan.create({
            data: {
              car_id: carId,
              name: p.name,
              plan_type: p.plan_type || "km_package",
              free_km: parseInt(p.free_km, 10),
              price: parseFloat(p.price),
              security_deposit: p.security_deposit ? parseFloat(p.security_deposit) : 5000,
              extra_km_rate: p.extra_km_rate ? parseFloat(p.extra_km_rate) : 7,
              duration_days: p.duration_days ? parseInt(p.duration_days, 10) : 1,
              is_active: true,
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "CAR_UPDATED",
          entity: "Car",
          entity_id: carId,
          before_state: { name: existingCar.name, is_available: existingCar.is_available },
          after_state: { name: car.name, is_available: car.is_available },
        },
      });

      return car;
    });

    return apiSuccess(updated, "Vehicle updated successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to update vehicle", 500);
  }
}

/**
 * DELETE /api/v1/admin/cars/[id]
 * Soft delete a car
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.FLEET_MANAGE)) {
      return apiError("Forbidden: You lack fleet.manage permission to delete vehicles.", 403);
    }

    const { id } = await context.params;
    const carId = parseInt(id, 10);
    if (isNaN(carId)) return apiError("Invalid car ID.", 400);

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car || car.deleted_at) {
      return apiError("Vehicle not found.", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.car.update({
        where: { id: carId },
        data: {
          deleted_at: new Date(),
          is_available: false,
        },
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "CAR_DELETED",
          entity: "Car",
          entity_id: carId,
          before_state: { name: car.name, slug: car.slug },
        },
      });
    });

    return apiSuccess({ deletedId: carId }, "Vehicle deleted successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to delete vehicle", 500);
  }
}
