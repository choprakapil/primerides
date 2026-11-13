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
  Sparkles,
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
      className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white group ${
        isSoldOut
          ? "border-rose-200 opacity-80 shadow-sm"
          : "border-slate-200/90 hover:border-[#c59b27]/70 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_35px_rgba(15,23,42,0.09)]"
      }`}
    >
      {/* Card Header & Image */}
      <Link href={bookingUrl} className="relative block overflow-hidden bg-slate-900 aspect-[16/10]">
        <img
          src={car.primary_image || "/assets/img/car.png"}
          alt={car.name ? `${car.name} Rental Car in ${car.location?.city || "Delhi NCR"}` : "PrimeRides Luxury Rental Car"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#090e1a]/85 text-[#f7d58b] backdrop-blur-md shadow-xs border border-[#c59b27]/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#c59b27]" />
            <span>{car.badge || "Prime Certified"}</span>
          </span>
        </div>

        <div className="absolute top-3 right-3 pointer-events-none z-10">
          {car.category?.name && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-900 shadow-xs border border-slate-200">
              {car.category.name}
            </span>
          )}
        </div>

        {/* Bottom Location Pill */}
        <div className="absolute bottom-2.5 right-3 pointer-events-none z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 backdrop-blur-md shadow-xs border border-slate-200 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#c59b27]" />
            <span>{car.location?.city || "Delhi NCR"}</span>
          </span>
        </div>

        {/* Status indicator on bottom-left */}
        <div className="absolute bottom-2.5 left-3 pointer-events-none z-10">
          {isSoldOut ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/95 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Sold Out</span>
            </span>
          ) : availableUnits === 1 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/95 text-slate-950 backdrop-blur-md shadow-xs flex items-center gap-1 animate-pulse">
              <Clock className="w-3 h-3" />
              <span>1 Car Left</span>
            </span>
          ) : null}
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <span className="text-[#c59b27]">{car.brand}</span>
            <span>•</span>
            <span>{car.category?.name || "Luxury Class"}</span>
          </div>

          <Link
            href={bookingUrl}
            className="text-base sm:text-lg font-bold !text-[#0b0f19] hover:!text-[#c59b27] transition-colors block leading-snug line-clamp-1 font-heading"
          >
            {car.name}
          </Link>

          {/* Quick Specs Strip */}
          <div className="grid grid-cols-3 gap-2 py-2 mt-2 border-y border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold truncate">{car.seats} Seats</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold truncate">
                {car.transmission?.toLowerCase().includes("auto") ? "Auto" : "Manual"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold truncate">{car.fuel_type}</span>
            </div>
          </div>

          {/* KM Rental Plans Selector */}
          {car.rental_plans && car.rental_plans.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                <span>Select Package:</span>
                <span className="text-[10px] font-bold text-[#936e16]">
                  ₹{Number(selectedPlan?.extra_km_rate || 7)}/extra km
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {car.rental_plans.slice(0, 3).map((plan: any) => {
                  const isSelected = plan.id === selectedPlanId;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`py-1.5 px-1 rounded-xl text-center transition-all ${
                        isSelected
                          ? "bg-[#0b0f19] text-[#c59b27] shadow-xs border border-[#0b0f19] font-bold"
                          : "bg-[#f8fafc] text-slate-700 hover:bg-[#fffdf7] hover:border-[#c59b27]/40 border border-slate-200/80 font-medium"
                      }`}
                    >
                      <span className="block text-[11px] font-extrabold leading-tight">
                        {plan.free_km} KM
                      </span>
                      <span className="block text-[10px] leading-tight opacity-85 mt-0.5">
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
              <span className="text-xs text-slate-500 font-medium">
                / {selectedPlan?.free_km || 300} km
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={bookingUrl}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                isSoldOut
                  ? "bg-slate-200 text-slate-500 pointer-events-none cursor-not-allowed"
                  : "bg-gradient-to-r from-[#c59b27] via-[#d4a838] to-[#b88d22] text-[#0b0f19] shadow-[0_4px_16px_rgba(197,155,39,0.3)] hover:brightness-105 active:scale-98"
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
