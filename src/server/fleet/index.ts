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

export function buildCategoryWhere(categoryId?: number, categorySlug?: string) {
  if (categoryId) {
    return { category_id: categoryId };
  }
  if (!categorySlug || categorySlug === "all") {
    return {};
  }
  const slug = categorySlug.toLowerCase();
  if (slug === "hatchback") {
    return { category: { slug: { in: ["hatchback", "premium-hatchbacks", "hatchbacks"] } } };
  }
  if (slug === "suv") {
    return { category: { slug: { in: ["suv", "suvs", "7-seater-suv"] } } };
  }
  if (slug === "compact-suv") {
    return { category: { slug: { in: ["compact-suv", "compact-suvs"] } } };
  }
  if (slug === "adventure") {
    return { category: { slug: { in: ["adventure", "4x4", "adventure-4x4"] } } };
  }
  if (slug === "luxury" || slug === "sedan") {
    return { category: { slug: { in: ["luxury", "sedan", "sedans", "luxury-sedans"] } } };
  }
  return { category: { slug } };
}

export interface GetCarsWithAvailabilityOptions extends GetCarsOptions {
  startDate?: string | Date;
  endDate?: string | Date;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "seats-desc" | "featured";
  limit?: number;
  skip?: number;
}

export async function getFleetCarsWithAvailability(options?: GetCarsWithAvailabilityOptions) {
  try {
    const categoryClause = buildCategoryWhere(options?.categoryId, options?.categorySlug);

    const cars = await prisma.car.findMany({
      where: {
        deleted_at: null,
        is_available: true,
        ...(options?.locationId ? { location_id: options.locationId } : {}),
        ...(options?.locationSlug ? { location: { slug: options.locationSlug } } : {}),
        ...categoryClause,
        ...(options?.featuredOnly ? { is_featured: true } : {}),
        ...(options?.brand ? { brand: { contains: options.brand } } : {}),
        ...(options?.transmission ? { transmission: options.transmission } : {}),
        ...(options?.fuelType ? { fuel_type: options.fuelType } : {}),
        ...(options?.seats ? { seats: options.seats } : {}),
        ...(options?.minPrice || options?.maxPrice
          ? {
              price_per_day: {
                ...(options?.minPrice ? { gte: options.minPrice } : {}),
                ...(options?.maxPrice ? { lte: options.maxPrice } : {}),
              },
            }
          : {}),
        ...(options?.search
          ? {
              OR: [
                { name: { contains: options.search } },
                { brand: { contains: options.search } },
                { description: { contains: options.search } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
        location: true,
        rental_plans: {
          where: { is_active: true },
          orderBy: { price: "asc" },
        },
      },
      orderBy:
        options?.sort === "price-asc"
          ? { price_per_day: "asc" }
          : options?.sort === "price-desc"
          ? { price_per_day: "desc" }
          : options?.sort === "seats-desc"
          ? { seats: "desc" }
          : { sort_order: "asc" },
      ...(options?.skip ? { skip: options.skip } : {}),
      ...(options?.limit ? { take: options.limit } : {}),
    });

    if (options?.startDate && options?.endDate) {
      const start = new Date(options.startDate);
      const end = new Date(options.endDate);

      const activeBookings = await prisma.booking.findMany({
        where: {
          status: { in: ["pending", "confirmed", "active"] },
          start_date: { lt: end },
          end_date: { gt: start },
        },
        select: { car_id: true },
      });

      const bookedCountMap: Record<number, number> = {};
      for (const b of activeBookings) {
        if (b.car_id) {
          bookedCountMap[b.car_id] = (bookedCountMap[b.car_id] || 0) + 1;
        }
      }

      return cars.map((c) => {
        const fleetCount = (c as any).fleet_count ?? 1;
        const booked = bookedCountMap[c.id] || 0;
        const availableUnits = Math.max(0, fleetCount - booked);
        return {
          ...c,
          fleet_count: fleetCount,
          available_units: availableUnits,
          is_sold_out: availableUnits <= 0,
        };
      });
    }

    return cars.map((c) => {
      const fleetCount = (c as any).fleet_count ?? 1;
      return {
        ...c,
        fleet_count: fleetCount,
        available_units: fleetCount,
        is_sold_out: false,
      };
    });
  } catch (err) {
    console.error("Failed to fetch fleet with availability:", err);
    return [];
  }
}

/**
 * Public & Admin: Fetches active fleet vehicles from MySQL, optionally filtered by Location.
 */
export async function getFleetCars(options?: GetCarsOptions) {
  try {
    const categoryClause = buildCategoryWhere(options?.categoryId, options?.categorySlug);

    const cars = await prisma.car.findMany({
      where: {
        deleted_at: null,
        is_available: true,
        ...(options?.locationId ? { location_id: options.locationId } : {}),
        ...(options?.locationSlug ? { location: { slug: options.locationSlug } } : {}),
        ...categoryClause,
        ...(options?.featuredOnly ? { is_featured: true } : {}),
        ...(options?.brand ? { brand: { contains: options.brand } } : {}),
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
    const slugAliases: Record<string, string> = {
      cullinan: "rolls-royce",
      urus: "lamborghini-urus",
    };
    const lookupSlug = slugAliases[slug.toLowerCase()] || slug;

    return await prisma.car.findUnique({
      where: { slug: lookupSlug },
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
