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
    ? "bg-white p-1 space-y-6"
    : "bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-5 lg:p-6 sticky top-28 space-y-6";

  const Component = isMobileModal ? "div" : "aside";

  return (
    <Component className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#fffdf7] text-[#c59b27] border border-[#e5b94f]/50 flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="w-4 h-4 text-[#c59b27]" />
          </div>
          <div>
            <h3 className="font-bold text-[#0b0f19] text-base leading-tight font-heading">
              Filter Fleet
            </h3>
            <p className="text-xs text-slate-500 font-sans">{totalResults} vehicles found</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            type="button"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#c59b27] hover:text-[#936e16] hover:underline transition-colors py-1 px-2"
          >
            <RotateCcw className="w-3 h-3 text-[#c59b27]" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 1. Location Selection */}
      <div className="space-y-2.5">
        <label id="fleet-filter-city-label" className="text-xs font-bold uppercase tracking-wider text-[#0b0f19] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-700" />
          <span>Pickup City Hub</span>
        </label>
        <div role="group" aria-labelledby="fleet-filter-city-label" className="grid grid-cols-3 gap-2">
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
                className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all text-center ${
                  isSelected
                    ? "bg-[#0b0f19] text-[#c59b27] border-[#0b0f19] shadow-xs font-bold"
                    : "bg-[#f8fafc] hover:bg-[#fffdf7] hover:border-[#c59b27]/60 text-slate-700 border-slate-200"
                }`}
              >
                {loc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Rental Trip Dates */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="text-xs font-bold uppercase tracking-wider text-[#0b0f19] flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-700" />
          <span>Trip Dates &amp; Availability</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label htmlFor="fleet-filter-start-date" className="text-[11px] font-semibold text-slate-500 block mb-1">
              Pickup Date
            </label>
            <input
              id="fleet-filter-start-date"
              name="startDate"
              aria-label="Rental pickup date"
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter("startDate", e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-[#f8fafc] border border-slate-200 rounded-xl px-2.5 py-2 focus:bg-white focus:border-[#c59b27] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="fleet-filter-end-date" className="text-[11px] font-semibold text-slate-500 block mb-1">
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
              className="w-full text-xs font-medium text-slate-800 bg-[#f8fafc] border border-slate-200 rounded-xl px-2.5 py-2 focus:bg-white focus:border-[#c59b27] focus:outline-none transition-colors"
            />
          </div>
        </div>
        {filters.startDate && filters.endDate && (
          <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
            <span>✓</span>
            <span>Live unit stock verified for selected dates</span>
          </p>
        )}
      </div>

      {/* 3. Price Range Slider */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label htmlFor="fleet-filter-budget" className="text-xs font-bold uppercase tracking-wider text-[#0b0f19]">
            Daily Budget (Max)
          </label>
          <span className="text-xs font-extrabold text-amber-700">
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
          className="w-full accent-[#c59b27] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-medium text-slate-500">
          <span>₹1,500</span>
          <span>₹7,500</span>
          <span>₹15,000+</span>
        </div>
      </div>

      {/* 4. Car Category / Body Type */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label id="fleet-filter-category-label" className="text-xs font-bold uppercase tracking-wider text-[#0b0f19] flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-amber-700" />
          <span>Vehicle Category</span>
        </label>
        <div role="group" aria-labelledby="fleet-filter-category-label" className="grid grid-cols-2 gap-2">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("category", cat.value)}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center truncate ${
                  isSelected
                    ? "bg-[#0b0f19] text-[#c59b27] border-[#0b0f19] shadow-xs font-bold"
                    : "bg-[#f8fafc] hover:bg-[#fffdf7] hover:border-[#c59b27]/60 text-slate-700 border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Transmission */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label id="fleet-filter-transmission-label" className="text-xs font-bold uppercase tracking-wider text-[#0b0f19] flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-amber-700" />
          <span>Transmission</span>
        </label>
        <div role="group" aria-labelledby="fleet-filter-transmission-label" className="grid grid-cols-3 gap-2">
          {transmissions.map((tr) => {
            const isSelected = filters.transmission === tr.value;
            return (
              <button
                key={tr.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("transmission", tr.value)}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                  isSelected
                    ? "bg-[#0b0f19] text-[#c59b27] border-[#0b0f19] shadow-xs font-bold"
                    : "bg-[#f8fafc] hover:bg-[#fffdf7] hover:border-[#c59b27]/60 text-slate-700 border-slate-200"
                }`}
              >
                {tr.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Fuel Type */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label id="fleet-filter-fuel-label" className="text-xs font-bold uppercase tracking-wider text-[#0b0f19] flex items-center gap-1.5">
          <Fuel className="w-3.5 h-3.5 text-amber-700" />
          <span>Fuel Type</span>
        </label>
        <div role="group" aria-labelledby="fleet-filter-fuel-label" className="grid grid-cols-2 gap-2">
          {fuelTypes.map((fuel) => {
            const isSelected = filters.fuelType === fuel.value;
            return (
              <button
                key={fuel.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("fuelType", fuel.value)}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                  isSelected
                    ? "bg-[#0b0f19] text-[#c59b27] border-[#0b0f19] shadow-xs font-bold"
                    : "bg-[#f8fafc] hover:bg-[#fffdf7] hover:border-[#c59b27]/60 text-slate-700 border-slate-200"
                }`}
              >
                {fuel.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Seating Capacity */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label id="fleet-filter-seats-label" className="text-xs font-bold uppercase tracking-wider text-[#0b0f19] flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-amber-700" />
          <span>Seating Capacity</span>
        </label>
        <div role="group" aria-labelledby="fleet-filter-seats-label" className="grid grid-cols-4 gap-1.5">
          {seatingOptions.map((seat) => {
            const isSelected = filters.seats === seat.value;
            return (
              <button
                key={seat.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("seats", seat.value)}
                className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all text-center ${
                  isSelected
                    ? "bg-[#0b0f19] text-[#c59b27] border-[#0b0f19] shadow-xs font-bold"
                    : "bg-[#f8fafc] hover:bg-[#fffdf7] hover:border-[#c59b27]/60 text-slate-700 border-slate-200"
                }`}
              >
                {seat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. Brand */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label htmlFor="fleet-filter-brand" className="text-xs font-bold uppercase tracking-wider text-[#0b0f19]">
          Make / Manufacturer
        </label>
        <select
          id="fleet-filter-brand"
          name="brand"
          aria-label="Filter by vehicle make or brand"
          value={filters.brand}
          onChange={(e) => updateFilter("brand", e.target.value)}
          className="w-full text-xs font-semibold text-slate-800 bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-[#c59b27] focus:outline-none transition-colors"
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
