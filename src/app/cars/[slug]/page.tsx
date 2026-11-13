import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCarBySlug, getFleetCars } from "@/server/fleet";
import { getCurrentCustomer } from "@/server/auth/customer";
import CarBookingCard from "@/components/CarBookingCard";
import CarGallery from "@/components/fleet/CarGallery";
import VehicleHeader from "@/components/fleet/VehicleHeader";
import VehicleSpecifications from "@/components/fleet/VehicleSpecifications";
import VehicleOverview from "@/components/fleet/VehicleOverview";
import VehicleFeatures from "@/components/fleet/VehicleFeatures";
import RentalPolicy from "@/components/fleet/RentalPolicy";
import TrustBar from "@/components/TrustBar";
import { formatCarDisplayName } from "@/components/fleet/types";
import { ArrowRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);
  if (!car) return { title: "Vehicle Not Found - PrimeRides" };

  const displayName = formatCarDisplayName(car.brand, car.name);
  const locationCity = car.location?.city || "Delhi NCR";

  return {
    title: `${displayName} Rental in ${locationCity} - PrimeRides Luxury Self Drive`,
    description: `Book the ${displayName} (${car.brand}) with flexible KM packages in ${locationCity}. Starting at ₹${Number(
      car.price_per_day
    ).toLocaleString("en-IN")}.`,
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
  const extraKmRateNum = car.rental_plans?.[0]?.extra_km_rate
    ? Number(car.rental_plans[0].extra_km_rate)
    : 7;

  const displayName = formatCarDisplayName(car.brand, car.name);
  const locationCity = car.location?.city || "Delhi NCR";

  // Parse features safely
  const parsedFeatures = Array.isArray(car.features)
    ? (car.features as string[])
    : null;

  // Parse gallery images safely
  const parsedGallery = Array.isArray(car.gallery_images)
    ? (car.gallery_images as string[])
    : null;

  return (
    <div
      className="min-h-screen bg-[#fcfbf9] text-slate-900 pb-20 font-sans"
      style={{ paddingTop: "145px" }}
    >
      {/* Background Decorative Warm Ambient Gradient */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 5%, rgba(197, 155, 39, 0.06) 0%, transparent 65%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* ========================================================================= */}
        {/* 1. VEHICLE HEADER: Breadcrumb, Status, Badges, Title, Subtitle, Trust Card */}
        {/* ========================================================================= */}
        <VehicleHeader
          car={{
            id: car.id,
            name: car.name,
            slug: car.slug,
            brand: car.brand,
            price_per_day: pricePerDayNum,
            security_deposit: securityDepositNum,
            transmission: car.transmission,
            seats: car.seats,
            doors: car.doors,
            fuel_type: car.fuel_type,
            engine_hp: car.engine_hp,
            badge: car.badge,
            description: car.description,
            features: parsedFeatures,
            primary_image: car.primary_image,
            gallery_images: parsedGallery,
            is_available: car.is_available,
            category: car.category,
            location: car.location,
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
          }}
        />

        {/* ========================================================================= */}
        {/* 2. TWO-COLUMN DETAIL WORKSPACE */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT: Showcase Gallery, Specs, Overview & Policies (7 cols) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive Vehicle Gallery */}
            <CarGallery
              primaryImage={car.primary_image}
              galleryImages={parsedGallery}
              carName={displayName}
              brand={car.brand}
              badge={car.badge}
            />

            {/* Quick Specs Grid (Strictly Dynamic from Database) */}
            <VehicleSpecifications
              seats={car.seats}
              transmission={car.transmission}
              fuelType={car.fuel_type}
              engineHp={car.engine_hp}
              doors={car.doors}
              categoryName={car.category?.name}
            />

            {/* Vehicle Overview, Inclusions & Policies Dossier */}
            <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-2xs space-y-8">
              <VehicleOverview
                displayName={displayName}
                description={car.description}
                locationName={car.location?.name}
                categoryName={car.category?.name}
              />

              <VehicleFeatures
                features={parsedFeatures}
                extraKmRate={extraKmRateNum}
              />

              <RentalPolicy
                securityDeposit={securityDepositNum}
                extraKmRate={extraKmRateNum}
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: Booking Engine Card (5 cols, sticky) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 sticky top-28 sm:top-32">
            <CarBookingCard
              car={{
                id: car.id,
                name: displayName,
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
        {/* 3. SIMILAR VEHICLES IN SAME HUB */}
        {/* ========================================================================= */}
        {otherCars.length > 0 && (
          <div className="pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="location-pill-badge text-[11px] font-bold block w-fit mb-1">
                  More Options
                </span>
                <h3 className="text-2xl font-bold text-[#090e1a] font-heading">
                  Other Cars Available in {locationCity}
                </h3>
              </div>
              <Link
                href="/cars"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
              >
                <span>View All Fleet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherCars.map((other) => {
                const otherDisplayName = formatCarDisplayName(other.brand, other.name);
                return (
                  <div
                    key={other.id}
                    className="modern-car-card d-flex flex-column justify-between"
                  >
                    <div>
                      <div className="modern-car-img-box position-relative">
                        <img
                          src={other.primary_image || "/assets/img/cars/1.jpg"}
                          alt={otherDisplayName}
                          className="modern-car-img"
                        />
                        {other.badge && (
                          <span className="modern-car-badge position-absolute top-0 start-0 m-2">
                            {other.badge}
                          </span>
                        )}
                      </div>

                      <div className="modern-car-body">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          {other.brand}
                        </span>
                        <h4 className="modern-car-name mb-2">
                          {otherDisplayName}
                        </h4>
                        <div className="modern-car-specs d-flex align-items-center gap-3 mb-2">
                          <span>{other.transmission}</span>
                          <span>•</span>
                          <span>{other.fuel_type}</span>
                          <span>•</span>
                          <span>{other.seats} Seats</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">From</span>
                        <span className="text-base font-extrabold text-[#090e1a]">
                          ₹{Number(other.price_per_day).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-slate-500"> / day</span>
                      </div>

                      <Link
                        href={`/cars/${other.slug}`}
                        className="modern-card-btn px-4 py-2 text-decoration-none"
                      >
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 arrow-icon" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. TRUST BAR */}
        {/* ========================================================================= */}
        <div className="pt-10">
          <TrustBar />
        </div>
      </div>
    </div>
  );
}
