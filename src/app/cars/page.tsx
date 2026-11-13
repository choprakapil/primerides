import React, { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import FleetSearchResults from "@/components/fleet/FleetSearchResults";
import { getFleetCarsWithAvailability } from "@/server/fleet";

export const metadata = {
  title: "Verified Fleet Inventory & Live Pricing - PrimeRides Delhi NCR & Lucknow",
  description:
    "Explore PrimeRides verified self-drive fleet with live availability: 7-Seater Innova Crysta, Fortuner 4x4, Thar 4x4, Creta, Baleno and luxury cruisers with zero deposit.",
};

export default async function CarsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; filter?: string; location?: string }>;
} = {}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const category = resolvedParams.category || resolvedParams.filter;
  const location = resolvedParams.location;

  let initialCars: any[] = [];
  try {
    const rawCars = await getFleetCarsWithAvailability({
      categorySlug: category && category !== "all" ? category : undefined,
      locationSlug: location && location !== "all" ? location : undefined,
    });
    initialCars = JSON.parse(JSON.stringify(rawCars));
  } catch (err) {
    console.error("[CarsPage] Failed to load server-side fleet:", err);
  }

  return (
    <>
      <PageHeader
        title="Verified Car Rental Fleet"
        breadcrumb="Fleet Inventory"
      />
      <Suspense fallback={<div className="text-center py-12 text-slate-500 font-medium">Loading Live Fleet Inventory...</div>}>
        <FleetSearchResults initialCars={initialCars} />
      </Suspense>
    </>
  );
}
