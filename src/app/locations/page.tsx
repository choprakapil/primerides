import React from "react";
import LocationsPageClient from "@/components/locations/LocationsPageClient";
import { getPageMeta } from "@/server/seo";

export async function generateMetadata() {
  const customMeta = await getPageMeta("/locations");
  return {
    title: customMeta?.meta_title || "PrimeRides Mobility Hubs - Delhi NCR & Lucknow Airport Desks",
    description:
      customMeta?.meta_description ||
      "Find PrimeRides vehicle dispatch and pickup hubs across Delhi IGI Airport, Gurugram Cyber Hub, Noida, Aerocity, and CCS International Airport Lucknow.",
    keywords: customMeta?.meta_keywords ? customMeta.meta_keywords.split(",") : undefined,
    openGraph: {
      title: customMeta?.og_title || customMeta?.meta_title || "PrimeRides Mobility Hubs",
      description: customMeta?.og_description || customMeta?.meta_description || "",
      images: customMeta?.og_image ? [customMeta.og_image] : undefined,
    },
  };
}

import { prisma } from "@/server/db/client";

export default async function LocationsPage() {
  let dbLocations: Array<{ id: number; name: string; city: string; address?: string | null; slug: string }> = [];
  try {
    dbLocations = await prisma.location.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { sort_order: "asc" },
      select: { id: true, name: true, city: true, address: true, slug: true },
    });
  } catch (error) {
    console.error("[Locations Page] Failed to query live locations:", error);
  }

  return <LocationsPageClient dbLocations={dbLocations} />;
}
