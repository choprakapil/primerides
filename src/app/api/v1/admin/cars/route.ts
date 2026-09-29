import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiCreated, apiUnauthorized } from "@/server/utils/api-response";

/**
 * GET /api/v1/admin/cars
 * List all cars for admin management
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    const cars = await prisma.car.findMany({
      where: { deleted_at: null },
      include: {
        category: true,
        location: true,
        rental_plans: { orderBy: { free_km: "asc" } },
      },
      orderBy: { sort_order: "asc" },
    });

    return apiSuccess(cars);
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch cars", 500);
  }
}

/**
 * POST /api/v1/admin/cars
 * Create a new vehicle with rental plans (fleet.manage required)
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.FLEET_MANAGE)) {
      return apiError("Forbidden: You lack fleet.manage permission to add vehicles.", 403);
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

    if (!name || !slug || !brand || !category_id || !location_id || !primary_image) {
      return apiError("Required fields: name, slug, brand, category_id, location_id, primary_image.", 400);
    }

    // Check slug uniqueness
    const existing = await prisma.car.findUnique({ where: { slug } });
    if (existing) {
      return apiError(`A car with slug '${slug}' already exists. Please choose a unique slug.`, 409);
    }

    const result = await prisma.$transaction(async (tx) => {
      const basePrice = price_per_day ? parseFloat(price_per_day) : 2500;
      const deposit = security_deposit ? parseFloat(security_deposit) : 5000;

      const newCar = await tx.car.create({
        data: {
          name,
          slug,
          brand,
          category_id: parseInt(category_id, 10),
          location_id: parseInt(location_id, 10),
          price_per_day: basePrice,
          security_deposit: deposit,
          transmission: transmission || "Automatic",
          seats: seats ? parseInt(seats, 10) : 5,
          doors: doors ? parseInt(doors, 10) : 4,
          fuel_type: fuel_type || "Petrol",
          engine_hp: engine_hp ? parseInt(engine_hp, 10) : 90,
          primary_image,
          badge: badge || null,
          description: description || null,
          is_available: is_available !== undefined ? Boolean(is_available) : true,
        },
      });

      // Create standard rental plans if provided or use defaults
      const plansToCreate = Array.isArray(rental_plans) && rental_plans.length > 0
        ? rental_plans
        : [
            { name: "300 km Package", plan_type: "km_package", free_km: 300, price: basePrice, security_deposit: deposit, extra_km_rate: 7, duration_days: 1 },
            { name: "450 km Package", plan_type: "km_package", free_km: 450, price: Math.round(basePrice * 1.2), security_deposit: deposit, extra_km_rate: 7, duration_days: 1 },
            { name: "600 km Package", plan_type: "km_package", free_km: 600, price: Math.round(basePrice * 1.5), security_deposit: deposit, extra_km_rate: 7, duration_days: 1 },
            { name: "Monthly (5,000 km)", plan_type: "monthly", free_km: 5000, price: Math.round(basePrice * 16), security_deposit: deposit, extra_km_rate: 7, duration_days: 30 },
          ];

      for (const p of plansToCreate) {
        await tx.rentalPlan.create({
          data: {
            car_id: newCar.id,
            name: p.name,
            plan_type: p.plan_type || "km_package",
            free_km: parseInt(p.free_km, 10),
            price: parseFloat(p.price),
            security_deposit: p.security_deposit ? parseFloat(p.security_deposit) : deposit,
            extra_km_rate: p.extra_km_rate ? parseFloat(p.extra_km_rate) : 7,
            duration_days: p.duration_days ? parseInt(p.duration_days, 10) : 1,
            is_active: true,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "CAR_CREATED",
          entity: "Car",
          entity_id: newCar.id,
          after_state: { name, slug, brand, location_id, plansCount: plansToCreate.length },
        },
      });

      return newCar;
    });

    return apiCreated(result, "Vehicle created successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to create vehicle", 500);
  }
}
