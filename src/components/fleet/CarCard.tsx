"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

export interface CarCardProps {
  car: any;
  startDate?: string;
  endDate?: string;
  variant?: "catalog" | "carousel" | "similar" | "admin";
  onAdminEdit?: (car: any) => void;
}

/**
 * PrimeRides Canonical Luxury Vehicle Card Component
 *
 * Used across:
 * 1. Fleet Catalog (/cars)
 * 2. Homepage Carousel (Most Booked Cars)
 * 3. Similar Vehicles (/cars/[slug])
 * 4. Admin Fleet Workspace (/admin/cars)
 */
export default function CarCard({
  car,
  startDate,
  endDate,
  variant = "catalog",
  onAdminEdit,
}: CarCardProps) {
  // Normalize fields between Prisma DB Car and static CarItem fallback
  const slug = car.slug || car.id || "luxury-car";
  const carName = car.name || "PrimeRides Luxury Vehicle";
  const brand = car.brand || "Prime";
  const categoryName = car.category?.name || car.categoryLabel || "Luxury Class";
  const carImg = car.primary_image || car.img || "/assets/img/car.png";
  const badge = car.badge || (car.is_featured ? "Top Rated" : "Prime Certified");
  const city = car.location?.city || (typeof car.location === "string" ? car.location : "Delhi NCR");
  const fuel = car.fuel_type || car.fuel || "Petrol";
  const transmissionText = (car.transmission || "Automatic").toLowerCase().includes("auto") ? "Auto" : "Manual";

  let seatsText = "5 Seats";
  if (typeof car.seats === "number") {
    seatsText = `${car.seats} Seats`;
  } else if (typeof car.seats === "string") {
    seatsText = car.seats.includes("Seats") ? car.seats : `${car.seats.split(" ")[0]} Seats`;
  }

  // Normalize rental plans
  const rawPlans = Array.isArray(car.rental_plans) && car.rental_plans.length > 0
    ? car.rental_plans
    : [
        {
          id: 101,
          free_km: 300,
          price: Number(car.priceRaw || car.price_per_day || (typeof car.price === "string" ? car.price.replace(/[^0-9]/g, "") : 3999)),
        },
        {
          id: 102,
          free_km: 450,
          price: Math.round(Number(car.priceRaw || car.price_per_day || 3999) * 1.25),
        },
        {
          id: 103,
          free_km: 600,
          price: Math.round(Number(car.priceRaw || car.price_per_day || 3999) * 1.5),
        },
      ];

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(rawPlans[0]?.id || null);

  const selectedPlan = rawPlans.find((p: any) => p.id === selectedPlanId) || rawPlans[0];
  const priceToDisplay = selectedPlan
    ? Number(selectedPlan.price)
    : Number(car.priceRaw || car.price_per_day || 3999);

  const bookingUrl = `/cars/${slug}${
    startDate && endDate
      ? `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(
          endDate
        )}&location=${encodeURIComponent(car.location?.name || city || "")}`
      : car.location?.name
      ? `?location=${encodeURIComponent(car.location.name)}`
      : city
      ? `?location=${encodeURIComponent(city)}`
      : ""
  }`;

  const availableUnits = car.available_units ?? car.fleet_count ?? 1;
  const isSoldOut = car.is_sold_out || availableUnits <= 0;

  return (
    <div className={`modern-car-card d-flex flex-column h-100 ${isSoldOut ? "opacity-75" : ""}`}>
      {/* Car Image Preview */}
      <Link href={bookingUrl} className="modern-car-img-box position-relative d-block text-decoration-none">
        <img
          src={carImg}
          alt={car.name ? `${car.name} Rental Car in ${car.location?.city || "Delhi NCR"}` : "PrimeRides Luxury Rental Car"}
          className="modern-car-img"
          loading="lazy"
        />

        {/* Floating Modern Badge */}
        {badge && (
          <span className="modern-car-badge position-absolute top-0 start-0 m-2">
            {badge}
          </span>
        )}

        {/* Category Pill on Top Right */}
        {categoryName && (
          <span className="position-absolute top-0 end-0 m-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-uppercase bg-white/95 text-slate-900 shadow-xs border border-slate-200">
            {categoryName}
          </span>
        )}

        {/* Location Pill on Bottom Right */}
        {city && (
          <span className="position-absolute bottom-0 end-0 m-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs border border-slate-200 d-inline-flex align-items-center gap-1">
            <MapPin className="w-3 h-3 text-[#c59b27]" />
            <span>{city}</span>
          </span>
        )}

        {/* Sold Out / Scarcity Badge on Bottom Left */}
        {isSoldOut ? (
          <span className="position-absolute bottom-0 start-0 m-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-danger text-white shadow-xs">
            Sold Out
          </span>
        ) : availableUnits === 1 ? (
          <span className="position-absolute bottom-0 start-0 m-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning text-dark shadow-xs animate-pulse">
            1 Car Left
          </span>
        ) : null}
      </Link>

      {/* Card Body */}
      <div className="modern-car-body d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          {/* Brand & Category Subtitle */}
          <div className="d-flex align-items-center gap-1 text-[11px] font-bold text-uppercase text-muted mb-1">
            <span className="text-[#c59b27]">{brand}</span>
            <span>•</span>
            <span>{categoryName}</span>
          </div>

          {/* Car Name */}
          <Link href={bookingUrl} className="text-decoration-none text-dark d-block">
            <h3 className="modern-car-name mb-2">
              {carName}
            </h3>
          </Link>

          {/* Specs Row: Transmission, Fuel, Seats */}
          <div className="modern-car-specs d-flex align-items-center gap-3 mb-2">
            <span className="spec-item d-flex align-items-center gap-1">
              <i className="fa-solid fa-gear text-muted"></i>
              <span>{transmissionText}</span>
            </span>
            <span className="spec-item d-flex align-items-center gap-1">
              <i className="fa-solid fa-gas-pump text-muted"></i>
              <span>{fuel}</span>
            </span>
            <span className="spec-item d-flex align-items-center gap-1">
              <i className="fa-solid fa-user-group text-muted"></i>
              <span>{seatsText}</span>
            </span>
          </div>

          {/* Price Line */}
          <div className="modern-car-price mb-2">
            <span className="price-val">₹{priceToDisplay.toLocaleString("en-IN")}</span>
            <span className="price-unit"> / {selectedPlan?.free_km ? `${selectedPlan.free_km} km` : "day"}</span>
          </div>

          {/* KM Package Selector */}
          {rawPlans && rawPlans.length > 0 && (
            <div className="modern-km-packages d-flex align-items-center gap-1 mb-3">
              {rawPlans.slice(0, 3).map((plan: any) => {
                const isSelected = plan.id === selectedPlanId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    className={`km-pill-btn ${isSelected ? "active" : ""}`}
                    aria-pressed={isSelected}
                    aria-label={`Select ${plan.free_km} KM package for ${carName}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <span className={`km-checkbox ${isSelected ? "checked" : ""}`} aria-hidden="true">
                      {isSelected && <i className="fa-solid fa-check" />}
                    </span>
                    <span>{plan.free_km} KM</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* View Car Details / Book Button or Admin Controls */}
        <div className="pt-2">
          {variant === "admin" && onAdminEdit ? (
            <button
              type="button"
              onClick={() => onAdminEdit(car)}
              className="modern-card-btn w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <span>Edit Fleet Unit</span>
              <i className="fa-solid fa-pen-to-square arrow-icon"></i>
            </button>
          ) : (
            <Link
              href={bookingUrl}
              className={`modern-card-btn w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none ${
                isSoldOut ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <span>{isSoldOut ? "Sold Out" : "View Details & Book"}</span>
              {!isSoldOut && <i className="fa-solid fa-arrow-right arrow-icon"></i>}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
