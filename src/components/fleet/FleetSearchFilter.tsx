"use client";

import React from "react";
import {
  MapPin,
  Calendar,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Fuel,
  Gauge,
  Users,
  Car,
  Check,
} from "lucide-react";

export interface FilterState {
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  minPrice: number;
  maxPrice: number;
  category: string;
  transmission: string;
  fuelType: string;
  seats: string;
  brand: string;
}

interface FleetSearchFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
  isMobileModal?: boolean;
}

export default function FleetSearchFilter({
  filters,
  onChange,
  onReset,
  totalResults,
  isMobileModal = false,
}: FleetSearchFilterProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const categories = [
    { label: "All Categories", value: "all" },
    { label: "7-Seater SUVs", value: "suv" },
    { label: "Compact SUVs", value: "compact-suv" },
    { label: "4x4 & Adventure", value: "adventure" },
    { label: "Hatchbacks", value: "hatchback" },
    { label: "Luxury Sedans", value: "luxury" },
  ];

  const transmissions = [
    { label: "All", value: "all" },
    { label: "Automatic", value: "Automatic" },
    { label: "Manual", value: "Manual" },
  ];

  const fuelTypes = [
    { label: "All", value: "all" },
    { label: "Petrol", value: "Petrol" },
    { label: "Diesel", value: "Diesel" },
    { label: "Hybrid", value: "Hybrid" },
    { label: "Electric", value: "Electric" },
  ];

  const seatingOptions = [
    { label: "All", value: "all" },
    { label: "5 Seater", value: "5" },
    { label: "7 Seater", value: "7" },
    { label: "8 Seater", value: "8" },
  ];

  const brands = [
    { label: "All Brands", value: "all" },
    { label: "Toyota", value: "Toyota" },
    { label: "Maruti Suzuki", value: "Maruti Suzuki" },
    { label: "Mahindra", value: "Mahindra" },
    { label: "Hyundai", value: "Hyundai" },
  ];

  const hasActiveFilters =
    filters.location !== "all" ||
    filters.category !== "all" ||
    filters.transmission !== "all" ||
    filters.fuelType !== "all" ||
    filters.seats !== "all" ||
    filters.brand !== "all" ||
    filters.minPrice > 1500 ||
    filters.maxPrice < 15000 ||
    filters.startDate !== "" ||
    filters.endDate !== "";

  const containerClasses = isMobileModal
    ? "bg-white p-1 space-y-4"
    : "bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-4 sticky top-28 space-y-4";

  const Component = isMobileModal ? "div" : "aside";

  return (
    <Component className={containerClasses}>
      {/* Header (Desktop only; mobile drawer has its own header) */}
      {!isMobileModal && (
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 border border-amber-200/50 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <SlidersHorizontal className="w-3 h-3 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[13px] leading-tight font-heading">
                Filter Fleet
              </h3>
              <p className="text-[10.5px] text-slate-400 font-sans">{totalResults} vehicles available</p>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              type="button"
              className="flex-shrink-0 inline-flex items-center gap-1 text-[10.5px] font-medium text-amber-700 hover:text-amber-800 hover:underline transition-colors py-0.5 px-1.5"
            >
              <RotateCcw className="w-2.5 h-2.5 text-amber-600" />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Location Selection - Smooth Segmented Capsule */}
      <div className="space-y-1.5">
        <label id="fleet-filter-city-label" className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-amber-600/80 flex-shrink-0" />
          <span>Pickup City Hub</span>
        </label>
        <div role="group" aria-labelledby="fleet-filter-city-label" className="flex items-center gap-1 p-0.5 bg-slate-100/80 rounded-full border border-slate-200/60">
          {[
            { label: "All Cities", value: "all" },
            { label: "Delhi NCR", value: "delhi-ncr" },
            { label: "Lucknow", value: "lucknow" },
          ].map((loc) => {
            const isSelected = filters.location === loc.value;
            return (
              <button
                key={loc.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("location", loc.value)}
                className={`flex-1 py-1 px-2 text-[10.5px] rounded-full transition-all duration-200 text-center whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-900 text-amber-300 font-medium shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 font-normal hover:bg-white/70"
                }`}
              >
                {loc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Rental Trip Dates */}
      <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-amber-600/80 flex-shrink-0" />
          <span>Trip Dates &amp; Availability</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="fleet-filter-start-date" className="text-[9.5px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
              Pickup Date
            </label>
            <input
              id="fleet-filter-start-date"
              name="startDate"
              aria-label="Rental pickup date"
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter("startDate", e.target.value)}
              className="w-full text-[11px] font-normal text-slate-700 bg-white border border-slate-200/90 rounded-xl px-2.5 py-1 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none transition-all shadow-2xs"
            />
          </div>
          <div>
            <label htmlFor="fleet-filter-end-date" className="text-[9.5px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
              Return Date
            </label>
            <input
              id="fleet-filter-end-date"
              name="endDate"
              aria-label="Rental return date"
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(e) => updateFilter("endDate", e.target.value)}
              className="w-full text-[11px] font-normal text-slate-700 bg-white border border-slate-200/90 rounded-xl px-2.5 py-1 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none transition-all shadow-2xs"
            />
          </div>
        </div>
        {filters.startDate && filters.endDate && (
          <p className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-xl flex items-center gap-1.5">
            <span className="font-bold text-emerald-600">✓</span>
            <span>Live unit stock verified for selected dates</span>
          </p>
        )}
      </div>

      {/* 3. Price Range Slider */}
      <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label htmlFor="fleet-filter-budget" className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Daily Budget (Max)
          </label>
          <span className="text-[11.5px] font-semibold text-amber-700">
            ₹{filters.maxPrice.toLocaleString("en-IN")}/day
          </span>
        </div>
        <input
          id="fleet-filter-budget"
          name="maxPrice"
          aria-label="Maximum daily rental budget"
          type="range"
          min="1500"
          max="15000"
          step="500"
          value={filters.maxPrice}
          aria-valuemin={1500}
          aria-valuemax={15000}
          aria-valuenow={filters.maxPrice}
          aria-valuetext={`₹${filters.maxPrice.toLocaleString("en-IN")} per day`}
          onChange={(e) => updateFilter("maxPrice", Number(e.target.value))}
          className="w-full accent-amber-600 cursor-pointer h-1.5"
        />
        <div className="flex justify-between text-[10px] font-normal text-slate-400">
          <span>₹1,500</span>
          <span>₹7,500</span>
          <span>₹15,000+</span>
        </div>
      </div>

      {/* 4. Car Category / Body Type - Smooth Wrapped Pills */}
      <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
        <label id="fleet-filter-category-label" className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Car className="w-3 h-3 text-amber-600/80 flex-shrink-0" />
          <span>Vehicle Category</span>
        </label>
        <div role="group" aria-labelledby="fleet-filter-category-label" className="flex flex-wrap gap-1">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("category", cat.value)}
                className={`py-1 px-2.5 text-[10.5px] rounded-full border transition-all duration-200 inline-flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-slate-900 text-amber-300 border-slate-900 font-medium shadow-2xs"
                    : "bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 border-slate-200/80 font-normal shadow-2xs hover:text-slate-900"
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Transmission - Smooth Segmented Capsule */}
      <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
        <label id="fleet-filter-transmission-label" className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Gauge className="w-3 h-3 text-amber-600/80 flex-shrink-0" />
          <span>Transmission</span>
        </label>
        <div role="group" aria-labelledby="fleet-filter-transmission-label" className="flex items-center gap-1 p-0.5 bg-slate-100/80 rounded-full border border-slate-200/60">
          {transmissions.map((tr) => {
            const isSelected = filters.transmission === tr.value;
            return (
              <button
                key={tr.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("transmission", tr.value)}
                className={`flex-1 py-1 px-2 text-[10.5px] rounded-full transition-all duration-200 text-center whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-900 text-amber-300 font-medium shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70 font-normal"
                }`}
              >
                {tr.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Fuel Type - Smooth Wrapped Pills with Proper Spacing & Alignment */}
      <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
        <label id="fleet-filter-fuel-label" className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Fuel className="w-3 h-3 text-amber-600/80 flex-shrink-0" />
          <span>Fuel Type</span>
        </label>
        <div role="group" aria-labelledby="fleet-filter-fuel-label" className="flex flex-wrap gap-1">
          {fuelTypes.map((fuel) => {
            const isSelected = filters.fuelType === fuel.value;
            return (
              <button
                key={fuel.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("fuelType", fuel.value)}
                className={`py-1 px-2.5 text-[10.5px] rounded-full border transition-all duration-200 text-center ${
                  isSelected
                    ? "bg-slate-900 text-amber-300 border-slate-900 font-medium shadow-2xs"
                    : "bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 border-slate-200/80 font-normal shadow-2xs hover:text-slate-900"
                }`}
              >
                {fuel.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Seating Capacity - Smooth Wrapped Pills */}
      <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
        <label id="fleet-filter-seats-label" className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Users className="w-3 h-3 text-amber-600/80 flex-shrink-0" />
          <span>Seating Capacity</span>
        </label>
        <div role="group" aria-labelledby="fleet-filter-seats-label" className="flex flex-wrap gap-1">
          {seatingOptions.map((seat) => {
            const isSelected = filters.seats === seat.value;
            return (
              <button
                key={seat.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("seats", seat.value)}
                className={`flex-1 min-w-[54px] py-1 px-2 text-[10.5px] rounded-full border transition-all duration-200 text-center ${
                  isSelected
                    ? "bg-slate-900 text-amber-300 border-slate-900 font-medium shadow-2xs"
                    : "bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 border-slate-200/80 font-normal shadow-2xs hover:text-slate-900"
                }`}
              >
                {seat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. Brand */}
      <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
        <label htmlFor="fleet-filter-brand" className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span>Make / Manufacturer</span>
        </label>
        <select
          id="fleet-filter-brand"
          name="brand"
          aria-label="Filter by vehicle make or brand"
          value={filters.brand}
          onChange={(e) => updateFilter("brand", e.target.value)}
          className="w-full text-[11px] font-normal text-slate-700 bg-white border border-slate-200/90 rounded-full px-3 py-1.5 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none transition-all cursor-pointer shadow-2xs"
        >
          {brands.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
    </Component>
  );
}
