import React from "react";
import { Users, Gauge, Fuel, Zap, Car } from "lucide-react";

interface VehicleSpecificationsProps {
  seats: number;
  transmission: string;
  fuelType: string;
  engineHp?: number | null;
  doors?: number | null;
  categoryName?: string;
}

export default function VehicleSpecifications({
  seats,
  transmission,
  fuelType,
  engineHp,
  doors,
  categoryName,
}: VehicleSpecificationsProps) {
  const hasHp = typeof engineHp === "number" && engineHp > 0;

  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x lg:divide-slate-200/60">
        {/* 1. Seating Capacity */}
        <div className="space-y-1 lg:px-4 first:lg:pl-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            <Users className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Seating</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight pt-0.5">
            {seats} Adults
          </p>
          <span className="text-[11px] text-slate-500 block font-normal">
            {seats >= 7 ? "Spacious 3-Row Cabin" : seats >= 5 ? "Comfortable 5-Seater" : "Executive 4-Seater"}
          </span>
        </div>

        {/* 2. Transmission */}
        <div className="space-y-1 lg:px-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            <Gauge className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Transmission</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight pt-0.5 truncate">
            {transmission}
          </p>
          <span className="text-[11px] text-slate-500 block font-normal">
            {transmission.toLowerCase().includes("auto") ? "Smooth Shift" : "Direct Manual"}
          </span>
        </div>

        {/* 3. Fuel Type */}
        <div className="space-y-1 lg:px-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            <Fuel className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Fuel Type</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight pt-0.5">
            {fuelType}
          </p>
          <span className="text-[11px] text-slate-500 block font-normal">
            Full-to-Full Tank
          </span>
        </div>

        {/* 4. Engine Power or Category */}
        <div className="space-y-1 lg:px-4 last:lg:pr-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            {hasHp ? <Zap className="w-3.5 h-3.5 text-[#c59b27]" /> : <Car className="w-3.5 h-3.5 text-[#c59b27]" />}
            <span>{hasHp ? "Power Output" : "Class"}</span>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight pt-0.5">
            {hasHp ? `${engineHp} HP` : `${doors || 4} Doors`}
          </p>
          <span className="text-[11px] text-slate-500 block font-normal truncate">
            {hasHp ? "Engine Output" : categoryName || "Luxury Class"}
          </span>
        </div>
      </div>
    </div>
  );
}

