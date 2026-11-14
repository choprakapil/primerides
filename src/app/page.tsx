import React from "react";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ChooseLocation from "@/components/ChooseLocation";
import CarsCategory from "@/components/CarsCategory";
import OffersSection from "@/components/OffersSection";
import AboutSection from "@/components/AboutSection";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import FaqSection from "@/components/FaqSection";
import SeoContentSection from "@/components/SeoContentSection";
import { getHomepageConfig } from "@/server/settings";
import { getFleetCars } from "@/server/fleet";
import { prisma } from "@/server/db/client";
import { getBlogs, getFaqs, getTestimonials } from "@/server/cms";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = getHomepageConfig();
  const [liveFleet, activeCoupons, liveLocations, liveBlogs, liveFaqs, liveTestimonials] = await Promise.all([
    getFleetCars().catch(() => []),
    prisma.coupon
      .findMany({
        where: {
          is_active: true,
          deleted_at: null,
          OR: [
            { valid_until: null },
            { valid_until: { gte: new Date() } },
          ],
        },
        take: 6,
        orderBy: { created_at: "desc" },
      })
      .catch(() => []),
    prisma.location
      .findMany({
        where: { deleted_at: null, is_active: true },
        orderBy: { name: "asc" },
      })
      .catch(() => []),
    getBlogs(6).catch(() => []),
    getFaqs(5).catch(() => []),
    getTestimonials(10).catch(() => []),
  ]);

  return (
    <>
      <HeroSection heroData={config.heroData} />
      <TrustBar items={config.trustHighlights} />
      <ChooseLocation initialLocations={liveLocations} />
      <CarsCategory initialCars={liveFleet} />
      <OffersSection initialOffers={activeCoupons} />
      <AboutSection />
      <Testimonials initialTestimonials={liveTestimonials} />
      <BlogSection initialBlogs={liveBlogs} />
      <FaqSection items={liveFaqs} />
      <SeoContentSection />
    </>
  );
}
