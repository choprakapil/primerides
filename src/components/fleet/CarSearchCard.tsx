"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Gauge,
  Fuel,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
} from "lucide-react";

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
    <div
      className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white ${
        isSoldOut
          ? "border-rose-200 opacity-80 shadow-sm"
          : "border-slate-200/90 hover:border-amber-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(197,155,39,0.12)]"
      }`}
    >
      {/* Card Header & Image */}
      <div className="relative group overflow-hidden bg-slate-100 aspect-[16/10]">
        <img
          src={car.primary_image || "/assets/img/car.png"}
          alt={car.name ? `${car.name} Rental Car in ${car.location?.city || "Delhi NCR"}` : "PrimeRides Luxury Rental Car"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30 shadow-sm flex items-center gap-1">
            <MapPin className="w-3 h-3 text-amber-400" />
            {car.location?.city || "Delhi NCR"}
          </span>

          {car.category?.name && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
              {car.category.name}
            </span>
          )}
        </div>

        {/* Bottom Image Overlay: Live Inventory Availability Badge */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10">
          {isSoldOut ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-600/90 backdrop-blur-md text-white border border-rose-400/30 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sold Out for Selected Dates</span>
            </div>
          ) : availableUnits === 1 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-600/90 backdrop-blur-md text-white border border-amber-400/40 shadow-sm animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Only 1 Car Left in {car.location?.city || "Delhi NCR"}!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600/90 backdrop-blur-md text-white border border-emerald-400/30 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {availableUnits} Units Available in {car.location?.city || "Delhi NCR"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Brand & Title */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-amber-700">
                {car.brand}
              </p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {car.name}
              </h3>
            </div>
            {car.badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200 flex-shrink-0">
                {car.badge}
              </span>
            )}
          </div>

          {/* Quick Specs Strip */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-slate-600 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg">
              <Users className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span className="truncate">{car.seats} Seats</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg">
              <Gauge className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span className="truncate">{car.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-lg">
              <Fuel className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span className="truncate">{car.fuel_type}</span>
            </div>
          </div>

          {/* KM Rental Plans Selector */}
          {car.rental_plans && car.rental_plans.length > 0 && (
            <div className="mt-3.5">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Select Kilometer Package:</span>
                <span className="text-[10px] text-amber-700 font-bold">
                  ₹{Number(selectedPlan?.extra_km_rate || 7)}/extra km
                </span>
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {car.rental_plans.slice(0, 3).map((plan: any) => {
                  const isSelected = plan.id === selectedPlanId;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`py-1.5 px-2 rounded-lg text-center text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/20"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                      }`}
                    >
                      <span className="block text-[11px] leading-tight font-extrabold">
                        {plan.free_km} KM
                      </span>
                      <span className="block text-[10px] opacity-90 leading-tight mt-0.5">
                        ₹{Number(plan.price).toLocaleString("en-IN")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Pricing & Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Package Rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-950">
                ₹{priceToDisplay.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={bookingUrl}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                isSoldOut
                  ? "bg-slate-200 text-slate-500 pointer-events-none cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <span>{isSoldOut ? "Sold Out" : "Book Now"}</span>
              {!isSoldOut && <ArrowRight className="w-3.5 h-3.5" />}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
