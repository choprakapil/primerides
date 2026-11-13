import React from "react";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ChooseLocation from "@/components/ChooseLocation";
import CarsCategory from "@/components/CarsCategory";
import OffersSection from "@/components/OffersSection";
import AboutSection from "@/components/AboutSection";
import CtaSection from "@/components/CtaSection";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import FaqSection from "@/components/FaqSection";
import SeoContentSection from "@/components/SeoContentSection";
import { getHomepageConfig } from "@/server/settings";
import { prisma } from "@/server/db/client";
import { getFaqs, getBlogs } from "@/server/cms";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = getHomepageConfig();

  // Parallel non-blocking fetch from database with complete fallback safety
  const [dbLocations, dbCars, dbCoupons, dbTestimonials, dbBlogs, dbFaqs] = await Promise.all([
    prisma.location
      .findMany({
        where: { is_active: true, deleted_at: null },
        orderBy: { sort_order: "asc" },
        select: { id: true, name: true, city: true },
      })
      .catch(() => []),
    prisma.car
      .findMany({
        where: { is_available: true, deleted_at: null },
        include: { category: true },
        orderBy: [{ is_featured: "desc" }, { sort_order: "asc" }],
        take: 12,
      })
      .catch(() => []),
    prisma.coupon
      .findMany({
        where: { is_active: true, deleted_at: null },
        take: 3,
        orderBy: [{ show_in_slider: "desc" }, { created_at: "desc" }],
      })
      .catch(() => []),
    prisma.testimonial
      .findMany({
        where: { deleted_at: null },
        orderBy: [{ is_featured: "desc" }, { created_at: "desc" }],
        take: 10,
      })
      .catch(() => []),
    getBlogs().catch(() => []),
    getFaqs().catch(() => []),
  ]);

  // Map live cars to CarItem format if present in DB
  const mappedCars =
    dbCars && dbCars.length > 0
      ? dbCars.map((c) => ({
          id: c.slug || String(c.id),
          name: c.name,
          category: (c.category?.slug as any) || "suv",
          categoryLabel: c.category?.name || "Luxury",
          brand: c.brand,
          price: `₹${Number(c.price_per_day).toLocaleString("en-IN")}`,
          priceRaw: String(c.price_per_day),
          img: c.primary_image || "/assets/img/cars/1.jpg",
          seats: `${c.seats} Seats`,
          transmission: c.transmission,
          fuel: c.fuel_type,
          badge: c.badge || (c.is_featured ? "Featured" : undefined),
        }))
      : undefined;

  // Map live coupons to OfferItem format if present in DB
  const mappedOffers =
    dbCoupons && dbCoupons.length > 0
      ? dbCoupons.map((cp, idx) => ({
          id: `coupon-${cp.id}`,
          tag:
            cp.discount_type === "percentage"
              ? `${Number(cp.discount_value)}% Discount`
              : `Flat ₹${Number(cp.discount_value)} OFF`,
          title: cp.description || cp.code,
          discount:
            cp.discount_type === "percentage"
              ? `Flat ${Number(cp.discount_value)}% OFF`
              : `₹${Number(cp.discount_value)} OFF`,
          subtext: cp.min_booking_amount
            ? `Valid on bookings above ₹${Number(cp.min_booking_amount)}`
            : "Special PrimeRides promo deal",
          code: cp.code,
          carImg:
            idx === 0
              ? "/assets/img/cars/11.jpg"
              : idx === 1
              ? "/assets/img/cars/7.jpg"
              : "/assets/img/cars/3.jpg",
          bgGradient:
            idx === 0
              ? "linear-gradient(135deg, #ea580c 0%, #f97316 45%, #c2410c 100%)"
              : idx === 1
              ? "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #111827 100%)"
              : "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)",
          textColor: "#ffffff",
          accentColor: idx === 0 ? "#fef08a" : idx === 1 ? "#f59e0b" : "#7dd3fc",
          pillBg: idx === 1 ? "#fef3c7" : "rgba(255, 255, 255, 0.95)",
          validUntil: cp.valid_until
            ? cp.valid_until.toISOString().split("T")[0]
            : undefined,
        }))
      : undefined;

  // Map live blogs to BlogPost format if present
  const mappedBlogs =
    dbBlogs && dbBlogs.length > 0
      ? dbBlogs.map((b) => ({
          slug: b.slug,
          img: b.featuredImage,
          tag: b.categoryName,
          date: b.publishedAt,
          readTime: b.readTime,
          title: b.title,
          excerpt: b.summary || b.content.slice(0, 120),
          author: b.authorName,
        }))
      : undefined;

  // Map live FAQs to FaqItem format if present
  const mappedFaqs =
    dbFaqs && dbFaqs.length > 0
      ? dbFaqs.map((f) => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          category: f.category,
        }))
      : undefined;

  // Map live testimonials if present in DB
  const mappedTestimonials =
    dbTestimonials && dbTestimonials.length > 0
      ? dbTestimonials.map((t) => ({
          id: `test-${t.id}`,
          name: t.client_name,
          trip: t.role_title || "Verified Guest",
          car: "",
          img: t.avatar_url || "/assets/img/team/1.jpg",
          text: t.comment,
          rating: t.rating || 5,
          isVerified: true,
        }))
      : undefined;

  return (
    <>
      <HeroSection
        heroData={config.heroData}
        locations={dbLocations.length > 0 ? dbLocations : undefined}
      />
      <TrustBar items={config.trustHighlights} />
      <ChooseLocation />
      <CarsCategory cars={mappedCars && mappedCars.length >= 6 ? mappedCars : undefined} />
      <OffersSection offers={mappedOffers && mappedOffers.length >= 3 ? mappedOffers : undefined} />
      <AboutSection />
      <CtaSection />
      <Testimonials initialTestimonials={mappedTestimonials && mappedTestimonials.length >= 3 ? mappedTestimonials : undefined} />
      <BlogSection blogs={mappedBlogs} />
      <FaqSection items={mappedFaqs} />
      <SeoContentSection />
    </>
  );
}
