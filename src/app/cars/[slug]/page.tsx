import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCarBySlug, getFleetCars } from "@/server/fleet";
import { getCurrentCustomer } from "@/server/auth/customer";
import CarBookingCard from "@/components/CarBookingCard";
import CarGallery from "@/components/fleet/CarGallery";
import { formatCarDisplayName } from "@/components/fleet/types";
import {
  ChevronLeft,
  Fuel,
  Gauge,
  Zap,
  Check,
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  MapPin,
  Star,
  Shield,
  Clock,
  Car as CarIcon,
  CreditCard,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return { title: "Vehicle Not Found - PrimeRides" };

  return {
    title: `${car.name} Rental in ${car.location?.city || "Delhi NCR"} - PrimeRides Luxury Self Drive`,
    description: `Book the ${car.name} (${car.brand}) with KM packages in ${car.location?.city || "Delhi NCR"}. Starting at ₹${Number(car.price_per_day).toLocaleString("en-IN")}.`,
  };
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [car, customer] = await Promise.all([
    getCarBySlug(slug),
    getCurrentCustomer(),
  ]);

  if (!car || car.deleted_at) {
    notFound();
  }

  // Fetch similar cars in same location for recommendations
  const relatedCars = await getFleetCars({
    locationId: car.location_id || undefined,
  });
  const otherCars = relatedCars
    .filter((c) => c.id !== car.id)
    .slice(0, 3);

  const pricePerDayNum = Number(car.price_per_day);
  const securityDepositNum = car.security_deposit ? Number(car.security_deposit) : 5000;

  const featuresList = (Array.isArray(car.features) && car.features.length > 0
    ? car.features
    : [
        "Flexible 300 km / 450 km / 600 km Package Options",
        "Comprehensive Commercial Insurance Included",
        "24/7 Roadside Emergency & Concierge Assistance",
        "Sanitized & Detailed Cabin Before Every Handover",
        "Active FASTag & GPS Telemetry Enabled",
        "Transparent ₹7/km Extra KM Tariff with Zero Hidden Fees",
        "Curbside Doorstep Delivery & Airport Pickup Available",
        "100% Refundable Security Deposit Policy",
      ]) as string[];

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20 font-sans"
      style={{ paddingTop: "145px" }}
    >
      {/* Background Decorative Warm Gradient */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(197, 155, 39, 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* BREADCRUMB & LOCATION STATUS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link
              href="/"
              className="hover:text-amber-700 transition-colors flex items-center gap-1"
            >
              <span>Home</span>
            </Link>
            <span>/</span>
            <Link href="/cars" className="hover:text-amber-700 transition-colors">
              <span>Fleet Inventory</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{car.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {car.location && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Stationed: {car.location.city}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available for Booking</span>
            </span>
          </div>
        </div>

        {/* MAIN TITLE & STAR RATING HEADER */}
        <div className="space-y-2 pb-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0b0f19] text-[#c59b27] border border-[#0b0f19]">
              {car.brand}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#fffdf7] text-[#936e16] border border-[#e5b94f]/50">
              {car.category?.name || "Luxury SUV"}
            </span>
            {car.badge && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-2xs">
                {car.badge}
              </span>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="!text-3xl sm:!text-4xl lg:!text-[38px] font-extrabold text-[#0b0f19] tracking-tight font-heading leading-tight">
                {car.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Self-Drive or Chauffeur-Driven Luxury Car Rental in {car.location?.name || "Delhi NCR"}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-2xs shrink-0">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs border-l border-slate-200 pl-3">
                <span className="font-extrabold text-[#0b0f19] block">4.96 / 5.0</span>
                <span className="text-[10.5px] text-slate-400 font-medium">95+ Happy Renters</span>
              </div>
            </div>
          </div>
        </div>

        {/* HERO TWO-COLUMN WORKSPACE: LEFT = MEDIA & SPECS, RIGHT = BOOKING ENGINE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT: Vehicle Image, Specs & Overview (7 cols) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Vehicle Interactive Image Gallery */}
            <CarGallery
              primaryImage={car.primary_image}
              galleryImages={car.gallery_images as string[]}
              carName={car.name}
              brand={car.brand}
              badge={car.badge}
            />

            {/* Quick Specs Grid (Light Luxury Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#c59b27]/60 transition-all space-y-1">
                <div className="flex items-center gap-1.5 text-[#936e16] text-[11px] font-bold uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Seating</span>
                </div>
                <p className="text-base font-extrabold text-[#0b0f19]">{car.seats} Adults</p>
                <span className="text-[10px] text-slate-400 block font-medium">Luggage Capacity: 2 Large</span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#c59b27]/60 transition-all space-y-1">
                <div className="flex items-center gap-1.5 text-[#936e16] text-[11px] font-bold uppercase tracking-wider">
                  <Gauge className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Transmission</span>
                </div>
                <p className="text-base font-extrabold text-[#0b0f19]">{car.transmission}</p>
                <span className="text-[10px] text-slate-400 block font-medium">Smooth Paddle Shift</span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#c59b27]/60 transition-all space-y-1">
                <div className="flex items-center gap-1.5 text-[#936e16] text-[11px] font-bold uppercase tracking-wider">
                  <Fuel className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Fuel Type</span>
                </div>
                <p className="text-base font-extrabold text-[#0b0f19]">{car.fuel_type}</p>
                <span className="text-[10px] text-slate-400 block font-medium">High Mileage Economy</span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#c59b27]/60 transition-all space-y-1">
                <div className="flex items-center gap-1.5 text-[#936e16] text-[11px] font-bold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-[#c59b27]" />
                  <span>Engine Output</span>
                </div>
                <p className="text-base font-extrabold text-[#0b0f19]">{car.engine_hp || 105} HP</p>
                <span className="text-[10px] text-slate-400 block font-medium">Responsive Drive</span>
              </div>
            </div>

            {/* Vehicle Overview Dossier */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-6">
              <div>
                <h2 className="!text-lg sm:!text-xl font-bold text-[#0b0f19] font-heading mb-2 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 text-[#c59b27] flex items-center justify-center shrink-0">
                    <CarIcon className="w-4 h-4" />
                  </span>
                  <span>Vehicle Overview &amp; Driving Experience</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {car.description ||
                    `The ${car.brand} ${car.name} is built for seamless highway journeys, weekend escapes, and city business itineraries. Stationed at ${car.location?.name || "our fleet hub"}, every booking comes with pre-trip inspection, sanitized interiors, fast-tag toll auto-debit, and 24/7 concierge assistance.`}
                </p>
              </div>

              {/* Inclusions Checkmarks */}
              <div>
                <h3 className="!text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                  <span>Guaranteed Inclusions with Every Booking</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {featuresList.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#f8fafc] border border-slate-100 text-xs text-slate-700 font-medium"
                    >
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fair Rental Policy & Security Deposit Guarantee */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#fffdf7] border border-[#e5b94f]/40 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-[#936e16] uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-[#c59b27]" />
                  <span>Transparent Rental Policy &amp; Security Deposit</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[#0b0f19] font-bold block">100% Refundable Deposit</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      ₹{securityDepositNum.toLocaleString("en-IN")} released within 24-48 hrs post-trip.
                    </p>
                  </div>
                  <div>
                    <span className="text-[#0b0f19] font-bold block">Fair Extra KM Tariff</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Flat ₹7/km if your journey exceeds chosen package.
                    </p>
                  </div>
                  <div>
                    <span className="text-[#0b0f19] font-bold block">Fuel Policy</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Same-to-same return level. No inflated refueling markups.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: Booking Engine Card (5 cols, sticky) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 sticky top-28 sm:top-32">
            <CarBookingCard
              car={{
                id: car.id,
                name: car.name,
                slug: car.slug,
                brand: car.brand,
                pricePerDay: pricePerDayNum,
                securityDeposit: securityDepositNum,
                primaryImage: car.primary_image || undefined,
                location: car.location,
                rentalPlans: car.rental_plans.map((p) => ({
                  id: p.id,
                  name: p.name,
                  plan_type: p.plan_type,
                  free_km: p.free_km,
                  price: Number(p.price),
                  security_deposit: Number(p.security_deposit),
                  extra_km_rate: Number(p.extra_km_rate),
                  duration_days: p.duration_days,
                })),
              }}
              customer={customer}
              slug={slug}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SIMILAR FLEET VEHICLES IN SAME HUB */}
        {/* ========================================================================= */}
        {otherCars.length > 0 && (
          <div className="pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-[#936e16] uppercase tracking-widest block">
                  More Options
                </span>
                <h3 className="!text-2xl font-bold text-[#0b0f19] font-heading mt-0.5">
                  Other Cars Available in {car.location?.city || "Delhi NCR"}
                </h3>
              </div>
              <Link
                href="/cars"
                className="text-xs font-bold text-[#c59b27] hover:text-[#936e16] flex items-center gap-1 transition-colors"
              >
                <span>View All Fleet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherCars.map((other) => {
                const displayName = formatCarDisplayName(other.brand, other.name);
                const startingPlan = other.rental_plans?.[0];
                const otherCity = other.location?.city || car.location?.city || "Delhi NCR";

                return (
                  <div key={other.id} className="modern-car-card d-flex flex-column h-100">
                    {/* Car Image Preview */}
                    <Link
                      href={`/cars/${other.slug}`}
                      className="modern-car-img-box position-relative d-block text-decoration-none"
                    >
                      <img
                        src={other.primary_image || "/assets/img/cars/1.jpg"}
                        alt={`${displayName} Rental Car`}
                        className="modern-car-img"
                      />
                      {/* Modern Car Badge */}
                      <span className="modern-car-badge position-absolute top-0 start-0 m-2">
                        {other.badge || "Prime Certified"}
                      </span>
                      {/* Location Pill */}
                      <span className="position-absolute bottom-0 end-0 m-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs border border-slate-200 d-inline-flex align-items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#c59b27]" />
                        <span>{otherCity}</span>
                      </span>
                    </Link>

                    {/* Card Body */}
                    <div className="modern-car-body d-flex flex-column flex-grow-1 justify-content-between">
                      <div>
                        {/* Brand & Category Subtitle */}
                        <div className="d-flex align-items-center gap-1 text-[11px] font-bold text-uppercase text-muted mb-1">
                          <span className="text-[#c59b27]">{other.brand}</span>
                          <span>•</span>
                          <span>{other.category?.name || "Luxury Class"}</span>
                        </div>

                        {/* Car Name */}
                        <Link href={`/cars/${other.slug}`} className="text-decoration-none text-dark d-block">
                          <h3 className="modern-car-name mb-2">
                            {displayName}
                          </h3>
                        </Link>

                        {/* Specs Row */}
                        <div className="modern-car-specs d-flex align-items-center gap-3 mb-2">
                          <span className="spec-item d-flex align-items-center gap-1">
                            <i className="fa-solid fa-gear text-muted"></i>
                            <span>{other.transmission.toLowerCase().includes("auto") ? "Auto" : "Manual"}</span>
                          </span>
                          <span className="spec-item d-flex align-items-center gap-1">
                            <i className="fa-solid fa-gas-pump text-muted"></i>
                            <span>{other.fuel_type}</span>
                          </span>
                          <span className="spec-item d-flex align-items-center gap-1">
                            <i className="fa-solid fa-user-group text-muted"></i>
                            <span>{other.seats} Seats</span>
                          </span>
                        </div>

                        {/* Price Line */}
                        <div className="modern-car-price mb-2">
                          <span className="price-val">₹{Number(other.price_per_day).toLocaleString("en-IN")}</span>
                          <span className="price-unit"> / {startingPlan?.name || "300 km"}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Link
                          href={`/cars/${other.slug}`}
                          className="modern-card-btn w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none"
                        >
                          <span>Explore &amp; Book</span>
                          <i className="fa-solid fa-arrow-right arrow-icon"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
