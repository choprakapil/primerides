import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCarBySlug, getFleetCars } from "@/server/fleet";
import { getCurrentCustomer } from "@/server/auth/customer";
import CarBookingCard from "@/components/CarBookingCard";
import TrustBar from "@/components/TrustBar";
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pt-28 sm:pt-32 pb-20 font-sans">
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
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-900 text-white">
              {car.brand}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#fdfaf2] text-amber-800 border border-amber-300">
              {car.category?.name || "Luxury SUV"}
            </span>
            {car.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-xs">
                {car.badge}
              </span>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#090e1a] tracking-tight font-heading leading-tight">
                {car.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Self-Drive or Chauffeur-Driven Luxury Car Rental in {car.location?.name || "Delhi NCR"}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs shrink-0">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-xs border-l border-slate-200 pl-3">
                <span className="font-extrabold text-[#090e1a] block">4.96 / 5.0</span>
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
            {/* Main Vehicle Showcase Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.06)] p-3 relative overflow-hidden group">
              <div className="relative h-72 sm:h-[400px] w-full rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={car.primary_image || "/assets/img/cars/1.jpg"}
                  alt={car.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/95 text-[#090e1a] backdrop-blur-md shadow-md border border-slate-200/60 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Prime Handover Guaranteed</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Specs Grid (Light Luxury Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Seating</span>
                </div>
                <p className="text-base font-extrabold text-[#090e1a]">{car.seats} Adults</p>
                <span className="text-[10px] text-slate-400 block font-medium">Luggage Capacity: 2 Large</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider">
                  <Gauge className="w-4 h-4 text-amber-600" />
                  <span>Transmission</span>
                </div>
                <p className="text-base font-extrabold text-[#090e1a]">{car.transmission}</p>
                <span className="text-[10px] text-slate-400 block font-medium">Smooth Paddle Shift</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider">
                  <Fuel className="w-4 h-4 text-amber-600" />
                  <span>Fuel Type</span>
                </div>
                <p className="text-base font-extrabold text-[#090e1a]">{car.fuel_type}</p>
                <span className="text-[10px] text-slate-400 block font-medium">High Mileage Economy</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 transition-all space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>Engine Output</span>
                </div>
                <p className="text-base font-extrabold text-[#090e1a]">{car.engine_hp || 105} HP</p>
                <span className="text-[10px] text-slate-400 block font-medium">Responsive Drive</span>
              </div>
            </div>

            {/* Vehicle Overview Dossier */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.04)] space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#090e1a] font-heading mb-2 flex items-center gap-2">
                  <CarIcon className="w-5 h-5 text-amber-600" />
                  <span>Vehicle Overview &amp; Driving Experience</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {car.description ||
                    `The ${car.brand} ${car.name} is built for seamless highway journeys, weekend escapes, and city business itineraries. Stationed at ${car.location?.name || "our fleet hub"}, every booking comes with pre-trip inspection, sanitized interiors, fast-tag toll auto-debit, and 24/7 concierge assistance.`}
                </p>
              </div>

              {/* Inclusions Checkmarks */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Guaranteed Inclusions with Every Booking</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {featuresList.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
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
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Transparent Rental Policy &amp; Security Deposit</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-amber-800 font-bold block">100% Refundable Deposit</span>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      ₹{securityDepositNum.toLocaleString("en-IN")} released within 24-48 hrs post-trip.
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-800 font-bold block">Fair Extra KM Tariff</span>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      Flat ₹7/km if your journey exceeds chosen package.
                    </p>
                  </div>
                  <div>
                    <span className="text-amber-800 font-bold block">Fuel Policy</span>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
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
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
                  More Options
                </span>
                <h3 className="text-2xl font-bold text-[#090e1a] font-heading mt-0.5">
                  Other Cars Available in {car.location?.city || "Delhi NCR"}
                </h3>
              </div>
              <Link
                href="/cars"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>View All Fleet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherCars.map((other) => (
                <div
                  key={other.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={other.primary_image || "/assets/img/cars/1.jpg"}
                        alt={other.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      {other.badge && (
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-black shadow-xs">
                          {other.badge}
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {other.brand}
                      </span>
                      <h4 className="text-lg font-bold text-[#090e1a] font-heading">
                        {other.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        <span>{other.transmission}</span>
                        <span>•</span>
                        <span>{other.fuel_type}</span>
                        <span>•</span>
                        <span>{other.seats} Seats</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">From</span>
                      <span className="text-base font-extrabold text-[#090e1a]">
                        ₹{Number(other.price_per_day).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-500"> / day</span>
                    </div>

                    <Link
                      href={`/cars/${other.slug}`}
                      className="px-4 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, #d8a834 0%, #c59b27 100%)",
                      }}
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRUST BAR FOOTER */}
        <div className="pt-10">
          <TrustBar />
        </div>
      </div>
    </div>
  );
}
