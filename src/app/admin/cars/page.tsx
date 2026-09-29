import React from "react";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import ForbiddenCard from "@/components/admin/ForbiddenCard";
import FleetManager from "@/components/admin/FleetManager";

export default async function AdminCarsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasAdminPermission(admin, ADMIN_PERMISSIONS.FLEET_MANAGE)) {
    return <ForbiddenCard permissionRequired="fleet.manage" moduleName="Fleet & Luxury Vehicles" />;
  }

  const [cars, categories, locations] = await Promise.all([
    prisma.car.findMany({
      where: { deleted_at: null },
      include: {
        category: true,
        location: true,
        rental_plans: { orderBy: { free_km: "asc" } },
      },
      orderBy: { sort_order: "asc" },
    }),
    prisma.carCategory.findMany({
      where: { is_active: true },
      orderBy: { sort_order: "asc" },
    }),
    prisma.location.findMany({
      where: { is_active: true },
      orderBy: { sort_order: "asc" },
    }),
  ]);

  const sanitizedCars = cars.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    brand: c.brand,
    category_id: c.category_id,
    category: c.category ? { id: c.category.id, name: c.category.name, slug: c.category.slug } : null,
    location_id: c.location_id,
    location: c.location ? { id: c.location.id, name: c.location.name, city: c.location.city, slug: c.location.slug } : null,
    price_per_day: Number(c.price_per_day),
    security_deposit: c.security_deposit ? Number(c.security_deposit) : 5000,
    transmission: c.transmission,
    seats: c.seats,
    fuel_type: c.fuel_type,
    engine_hp: c.engine_hp,
    primary_image: c.primary_image,
    badge: c.badge,
    description: c.description,
    is_available: c.is_available,
    rental_plans: c.rental_plans.map((p) => ({
      id: p.id,
      name: p.name,
      plan_type: p.plan_type,
      free_km: p.free_km,
      price: Number(p.price),
      extra_km_rate: Number(p.extra_km_rate),
      security_deposit: Number(p.security_deposit),
      duration_days: p.duration_days,
    })),
  }));

  return (
    <FleetManager
      initialCars={sanitizedCars}
      categories={categories.map((cat) => ({ id: cat.id, name: cat.name, slug: cat.slug }))}
      locations={locations.map((loc) => ({ id: loc.id, name: loc.name, city: loc.city, slug: loc.slug }))}
    />
  );
}
