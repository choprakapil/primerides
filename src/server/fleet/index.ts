import { prisma } from "../db/client";
import { revalidatePath } from "next/cache";
import { requireAdminPermission, ADMIN_PERMISSIONS } from "../auth/rbac";

export interface GetCarsOptions {
  categoryId?: number;
  categorySlug?: string;
  locationId?: number;
  locationSlug?: string;
  brand?: string;
  featuredOnly?: boolean;
  search?: string;
}

/**
 * Public & Admin: Fetches active fleet vehicles from MySQL, optionally filtered by Location.
 */
export async function getFleetCars(options?: GetCarsOptions) {
  try {
    const cars = await prisma.car.findMany({
      where: {
        deleted_at: null,
        is_available: true,
        ...(options?.locationId ? { location_id: options.locationId } : {}),
        ...(options?.locationSlug ? { location: { slug: options.locationSlug } } : {}),
        ...(options?.categoryId ? { category_id: options.categoryId } : {}),
        ...(options?.featuredOnly ? { is_featured: true } : {}),
        ...(options?.brand ? { brand: { contains: options.brand } } : {}),
        ...(options?.categorySlug ? { category: { slug: options.categorySlug } } : {}),
        ...(options?.search ? {
          OR: [
            { name: { contains: options.search } },
            { brand: { contains: options.search } },
            { description: { contains: options.search } },
          ],
        } : {}),
      },
      include: {
        category: true,
        location: true,
        rental_plans: {
          where: { is_active: true },
          orderBy: { price: "asc" },
        },
      },
      orderBy: { sort_order: "asc" },
    });

    return cars;
  } catch (err) {
    console.error("Failed to fetch fleet from database:", err);
    return [];
  }
}

/**
 * Public & Admin: Fetches a single car by its slug including Location & RentalPlans.
 */
export async function getCarBySlug(slug: string) {
  try {
    return await prisma.car.findUnique({
      where: { slug },
      include: {
        category: true,
        location: true,
        rental_plans: {
          where: { is_active: true },
          orderBy: { price: "asc" },
        },
      },
    });
  } catch (err) {
    console.error(`Failed to fetch car with slug ${slug}:`, err);
    return null;
  }
}

/**
 * Admin Fleet CRUD Operations (Enforces fleet.manage RBAC permission)
 */
export async function createCar(data: any) {
  const admin = await requireAdminPermission(ADMIN_PERMISSIONS.FLEET_MANAGE);

  try {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const car = await prisma.car.create({
      data: {
        ...data,
        slug,
      },
      include: { location: true, rental_plans: true },
    });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "CAR_CREATED",
        entity: "Car",
        entity_id: car.id,
        after_state: { name: car.name, brand: car.brand, slug: car.slug, location_id: car.location_id },
      },
    });

    revalidatePath("/admin/cars");
    revalidatePath("/cars");
    revalidatePath("/");
    return { success: true, data: car };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCar(id: number, data: any) {
  const admin = await requireAdminPermission(ADMIN_PERMISSIONS.FLEET_MANAGE);

  try {
    const car = await prisma.car.update({
      where: { id },
      data,
      include: { location: true, rental_plans: true },
    });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "CAR_UPDATED",
        entity: "Car",
        entity_id: car.id,
        after_state: data,
      },
    });

    revalidatePath("/admin/cars");
    revalidatePath(`/cars/${car.slug}`);
    revalidatePath("/cars");
    revalidatePath("/");
    return { success: true, data: car };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCar(id: number) {
  const admin = await requireAdminPermission(ADMIN_PERMISSIONS.FLEET_MANAGE);

  try {
    const car = await prisma.car.update({
      where: { id },
      data: { deleted_at: new Date(), is_available: false },
    });

    // Write AuditLog
    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "CAR_DELETED",
        entity: "Car",
        entity_id: car.id,
      },
    });

    revalidatePath("/admin/cars");
    revalidatePath("/cars");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
