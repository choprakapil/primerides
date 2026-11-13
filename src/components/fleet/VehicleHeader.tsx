import React from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Star, ShieldCheck } from "lucide-react";
import { VehicleDetailData, formatCarDisplayName } from "./types";

interface VehicleHeaderProps {
  car: VehicleDetailData;
}

export default function VehicleHeader({ car }: VehicleHeaderProps) {
  const displayName = formatCarDisplayName(car.brand, car.name);
  const locationCity = car.location?.city || "Delhi NCR";
  const categoryName = car.category?.name || "Premium Fleet";
  const isAvailable = car.is_available !== false;

  return (
    <div className="space-y-4 pb-4 border-b border-slate-200/60">
      {/* 1. Sleek Minimal Breadcrumb & Hub Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 font-medium text-slate-500">
          <Link href="/" className="hover:text-amber-700 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/cars" className="hover:text-amber-700 transition-colors">
            Fleet
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link
            href={`/cars?location=${car.location?.slug || (locationCity === "Lucknow" ? "lucknow" : "delhi-ncr")}`}
            className="hover:text-amber-700 transition-colors"
          >
            {locationCity}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-semibold truncate max-w-[220px] sm:max-w-none">
            {displayName}
          </span>
        </nav>

        {/* Status Indicators: Calm & Understated */}
        <div className="flex items-center gap-2">
          {car.location && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100/90 text-slate-700 border border-slate-200/80">
              <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>{car.location.name || `${locationCity} Hub`}</span>
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              isAvailable
                ? "bg-emerald-50/90 text-emerald-800 border border-emerald-200/70"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span>{isAvailable ? "Available to Reserve" : "Booked for Current Dates"}</span>
          </span>
        </div>
      </div>

      {/* 2. Editorial Title Row: Confident, Spacious, Luxury Automotive Hierarchy */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div className="space-y-2">
          {/* Subtle Category & Badge Line */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#c59b27]">
              {car.brand}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {categoryName}
            </span>
            {car.badge && (
              <>
                <span className="text-slate-300">•</span>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-300/80">
                  {car.badge}
                </span>
              </>
            )}
          </div>

          {/* Large Luxury Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight font-heading leading-tight">
            {displayName}
          </h1>

          {/* Calm Dynamic Subtitle */}
          <p className="text-sm text-slate-600 font-normal max-w-2xl">
            Self-Drive or Chauffeur-Driven in {car.location?.name || locationCity} • {car.transmission} • {car.seats} Seats • {car.fuel_type}
          </p>
        </div>

        {/* Subtle Luxury Trust Rating */}
        <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs shrink-0 self-start md:self-auto">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="text-xs border-l border-slate-200 pl-3">
            <span className="font-bold text-slate-900 block">4.96 / 5.0</span>
            <span className="text-[11px] text-slate-400 font-medium">95+ Verified Trips</span>
          </div>
        </div>
      </div>
    </div>
  );
}

