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
      className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white ${
        isSoldOut
          ? "border-rose-200 opacity-80 shadow-sm"
          : "border-slate-200/90 hover:border-[#c59b27]/70 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(197,155,39,0.12)]"
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
          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#0b0f19]/80 backdrop-blur-md text-[#c59b27] border border-[#c59b27]/30 shadow-sm flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#c59b27]" />
            {car.location?.city || "Delhi NCR"}
          </span>

          {car.category?.name && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-[#0b0f19] shadow-sm">
              {car.category.name}
            </span>
          )}
        </div>

        {/* Bottom Image Overlay: Live Inventory Availability Badge */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10">
          {isSoldOut ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-600/95 backdrop-blur-md text-white border border-rose-400/30 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sold Out for Selected Dates</span>
            </div>
          ) : availableUnits === 1 ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#b88d22]/95 backdrop-blur-md text-white border border-[#e5b94f]/40 shadow-sm animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Only 1 Car Left in {car.location?.city || "Delhi NCR"}!</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600/90 backdrop-blur-md text-white border border-emerald-400/30 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {availableUnits} Units Available in {car.location?.city || "Delhi NCR"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Brand & Title */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-extrabold text-[#936e16]">
                {car.brand}
              </p>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0b0f19] leading-tight font-heading mt-0.5">
                {car.name}
              </h3>
            </div>
            {car.badge && (
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-[#fffdf7] text-[#936e16] border border-[#e5b94f]/50 flex-shrink-0">
                {car.badge}
              </span>
            )}
          </div>

          {/* Quick Specs Strip */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-slate-600 text-xs">
            <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1.5 rounded-xl border border-slate-200/60">
              <Users className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span className="truncate font-semibold text-slate-700">{car.seats} Seats</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1.5 rounded-xl border border-slate-200/60">
              <Gauge className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span className="truncate font-semibold text-slate-700">{car.transmission}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f8fafc] px-2.5 py-1.5 rounded-xl border border-slate-200/60">
              <Fuel className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
              <span className="truncate font-semibold text-slate-700">{car.fuel_type}</span>
            </div>
          </div>

          {/* KM Rental Plans Selector */}
          {car.rental_plans && car.rental_plans.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Select Kilometer Package:</span>
                <span className="text-[10px] text-[#936e16] font-bold">
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
                      className={`py-2 px-1.5 rounded-xl text-center text-xs transition-all ${
                        isSelected
                          ? "bg-[#0b0f19] text-[#c59b27] shadow-sm ring-2 ring-[#c59b27]/30 font-extrabold"
                          : "bg-[#f8fafc] text-slate-700 hover:bg-[#fffdf7] hover:border-[#c59b27]/50 border border-slate-200/80 font-bold"
                      }`}
                    >
                      <span className="block text-[11px] leading-tight">
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
              <span className="text-xl sm:text-2xl font-black text-[#0b0f19]">
                ₹{priceToDisplay.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ 300 km</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={bookingUrl}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                isSoldOut
                  ? "bg-slate-200 text-slate-500 pointer-events-none cursor-not-allowed"
                  : "bg-gradient-to-r from-[#c59b27] via-[#d4a838] to-[#b88d22] text-[#0b0f19] shadow-[0_4px_16px_rgba(197,155,39,0.35)] hover:brightness-105 active:scale-98"
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
