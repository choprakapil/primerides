import React, { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import TrustBar from "@/components/TrustBar";
import FleetCatalog, { SerializedFleetCar } from "@/components/fleet/FleetCatalog";
import { prisma } from "@/server/db/client";

export const metadata = {
  title: "Luxury Self-Drive & Chauffeur Fleet - PrimeRides Delhi NCR & Lucknow",
  description:
    "Explore PrimeRides verified luxury fleet: Rolls Royce Cullinan, Fortuner 4x4, Thar 4x4, Innova Crysta, Mercedes-Benz, BMW, and premium sedans with flexible KM packages.",
};

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; category?: string; filter?: string; type?: string; brand?: string; q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category || resolvedParams.filter;
  // categorySlug: category && category !== "all" ? category : undefined
  const initialLocation = resolvedParams.location || "all";

  // Fetch all active fleet cars from database
  const [dbCars, dbLocations, dbCategories] = await Promise.all([
    prisma.car.findMany({
      where: {
        deleted_at: null,
        is_available: true,
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
    }),
    prisma.location.findMany({
      where: { is_active: true, deleted_at: null },
      orderBy: { sort_order: "asc" },
    }),
    prisma.carCategory.findMany({
      where: { is_active: true, deleted_at: null },
      orderBy: { sort_order: "asc" },
    }),
  ]);

  // Serialize DB cars to safe client plain objects (converting Decimal to numbers)
  const serializedCars: SerializedFleetCar[] = dbCars.map((car) => ({
    id: car.id,
    name: car.name,
    slug: car.slug,
    brand: car.brand,
    price_per_day: Number(car.price_per_day),
    security_deposit: car.security_deposit ? Number(car.security_deposit) : null,
    seats: car.seats,
    transmission: car.transmission,
    fuel_type: car.fuel_type,
    engine_hp: car.engine_hp,
    doors: car.doors,
    badge: car.badge,
    primary_image: car.primary_image,
    is_available: car.is_available,
    is_featured: car.is_featured,
    category: car.category
      ? {
          id: car.category.id,
          name: car.category.name,
          slug: car.category.slug,
        }
      : null,
    location: car.location
      ? {
          id: car.location.id,
          name: car.location.name,
          city: car.location.city,
          slug: car.location.slug,
        }
      : null,
    rental_plans: car.rental_plans.map((p) => ({
      id: p.id,
      name: p.name,
      plan_type: p.plan_type,
      free_km: p.free_km,
      price: Number(p.price),
      security_deposit: Number(p.security_deposit),
      extra_km_rate: Number(p.extra_km_rate),
      duration_days: p.duration_days,
    })),
  }));

  const serializedLocations = dbLocations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    city: loc.city,
    slug: loc.slug,
  }));

  const serializedCategories = dbCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  return (
    <div className="min-h-screen bg-[#fcfbf9]">
      <PageHeader
        title="Verified Luxury Fleet"
        subtitle="Self-Drive & Chauffeur Mobility"
        breadcrumb="Our Fleet"
        bgImage="/assets/img/slider/2.jpg"
      />

      <Suspense fallback={<div className="text-center py-16 text-slate-500">Loading Fleet Catalog...</div>}>
        <FleetCatalog
          cars={serializedCars}
          locations={serializedLocations}
          categories={serializedCategories}
          initialLocation={initialLocation}
        />
      </Suspense>

      <TrustBar />
    </div>
  );
}