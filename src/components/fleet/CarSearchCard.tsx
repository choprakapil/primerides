"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface CarSearchCardProps {
  car: any;
  startDate?: string;
  endDate?: string;
}

export default function CarSearchCard({ car, startDate, endDate }: CarSearchCardProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(
    car.rental_plans?.[0]?.id || null
  );

  const selectedPlan =
    car.rental_plans?.find((p: any) => p.id === selectedPlanId) ||
    car.rental_plans?.[0];

  const priceToDisplay = selectedPlan
    ? Number(selectedPlan.price)
    : Number(car.price_per_day);

  const bookingUrl = `/cars/${car.slug}${
    startDate && endDate
      ? `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(
          endDate
        )}&location=${encodeURIComponent(car.location?.name || "")}`
      : car.location?.name
      ? `?location=${encodeURIComponent(car.location.name)}`
      : ""
  }`;

  const availableUnits = car.available_units ?? car.fleet_count ?? 1;
  const isSoldOut = car.is_sold_out || availableUnits <= 0;

  return (
    <div className={`modern-car-card d-flex flex-column h-100 ${isSoldOut ? "opacity-75" : ""}`}>
      {/* Car Image Preview */}
      <Link href={bookingUrl} className="modern-car-img-box position-relative d-block text-decoration-none">
        <img
          src={car.primary_image || "/assets/img/car.png"}
          alt={car.name ? `${car.name} Rental Car in ${car.location?.city || "Delhi NCR"}` : "PrimeRides Luxury Rental Car"}
          className="modern-car-img"
        />

        {/* Floating Modern Badge */}
        <span className="modern-car-badge position-absolute top-0 start-0 m-2">
          {car.badge || "Prime Certified"}
        </span>

        {/* Category Pill on Top Right */}
        {car.category?.name && (
          <span className="position-absolute top-0 end-0 m-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-uppercase bg-white/95 text-slate-900 shadow-xs border border-slate-200">
            {car.category.name}
          </span>
        )}

        {/* Location Pill on Bottom Right */}
        {car.location?.city && (
          <span className="position-absolute bottom-0 end-0 m-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs border border-slate-200 d-inline-flex align-items-center gap-1">
            <MapPin className="w-3 h-3 text-[#c59b27]" />
            <span>{car.location.city}</span>
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
            <span className="text-[#c59b27]">{car.brand}</span>
            <span>•</span>
            <span>{car.category?.name || "Luxury Class"}</span>
          </div>

          {/* Car Name */}
          <Link href={bookingUrl} className="text-decoration-none text-dark d-block">
            <h3 className="modern-car-name mb-2">
              {car.name}
            </h3>
          </Link>

          {/* Specs Row: Transmission, Fuel, Seats */}
          <div className="modern-car-specs d-flex align-items-center gap-3 mb-2">
            <span className="spec-item d-flex align-items-center gap-1">
              <i className="fa-solid fa-gear text-muted"></i>
              <span>{car.transmission?.toLowerCase().includes("auto") ? "Auto" : "Manual"}</span>
            </span>
            <span className="spec-item d-flex align-items-center gap-1">
              <i className="fa-solid fa-gas-pump text-muted"></i>
              <span>{car.fuel_type || car.fuel || "Petrol"}</span>
            </span>
            <span className="spec-item d-flex align-items-center gap-1">
              <i className="fa-solid fa-user-group text-muted"></i>
              <span>{car.seats} Seats</span>
            </span>
          </div>

          {/* Price Line */}
          <div className="modern-car-price mb-2">
            <span className="price-val">₹{priceToDisplay.toLocaleString("en-IN")}</span>
            <span className="price-unit"> / {selectedPlan?.free_km ? `${selectedPlan.free_km} km` : "day"}</span>
          </div>

          {/* KM Package Selector */}
          {car.rental_plans && car.rental_plans.length > 0 && (
            <div className="modern-km-packages d-flex align-items-center gap-1 mb-3">
              {car.rental_plans.slice(0, 3).map((plan: any) => {
                const isSelected = plan.id === selectedPlanId;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    className={`km-pill-btn ${isSelected ? "active" : ""}`}
                    aria-pressed={isSelected}
                    aria-label={`Select ${plan.free_km} KM package for ${car.name}`}
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

        {/* View Car Details / Book Button */}
        <div className="pt-2">
          <Link
            href={bookingUrl}
            className={`modern-card-btn w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none ${
              isSoldOut ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <span>{isSoldOut ? "Sold Out" : "View Details & Book"}</span>
            {!isSoldOut && <i className="fa-solid fa-arrow-right arrow-icon"></i>}
          </Link>
        </div>
      </div>
    </div>
  );
}
