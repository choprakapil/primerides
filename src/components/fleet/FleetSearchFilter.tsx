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
}

export default function FleetSearchFilter({
  filters,
  onChange,
  onReset,
  totalResults,
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

  return (
    <aside className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-5 md:p-6 sticky top-28 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              Filters
            </h3>
            <p className="text-xs text-slate-500">{totalResults} vehicles found</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors py-1 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        )}
      </div>

      {/* 1. Location Selection */}
      <div className="space-y-2.5">
        <label id="fleet-filter-city-label" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-700" />
          Pickup City
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
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                  isSelected
                    ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
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
        <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-700" />
          Trip Dates &amp; Availability
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label htmlFor="fleet-filter-start-date" className="text-[11px] font-medium text-slate-500 block mb-1">
              Pickup Date
            </label>
            <input
              id="fleet-filter-start-date"
              name="startDate"
              aria-label="Rental pickup date"
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter("startDate", e.target.value)}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:bg-white focus:border-amber-600 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="fleet-filter-end-date" className="text-[11px] font-medium text-slate-500 block mb-1">
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
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:bg-white focus:border-amber-600 focus:outline-none transition-colors"
            />
          </div>
        </div>
        {filters.startDate && filters.endDate && (
          <p className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
            ✓ Showing inventory with live unit stock for your dates
          </p>
        )}
      </div>

      {/* 3. Price Range Slider */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label htmlFor="fleet-filter-budget" className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Daily Budget (Max)
          </label>
          <span className="text-xs font-bold text-amber-700">
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
          className="w-full accent-amber-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-600">
          <span>₹1,500</span>
          <span>₹7,500</span>
          <span>₹15,000+</span>
        </div>
      </div>

      {/* 4. Car Category / Body Type */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label id="fleet-filter-category-label" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-amber-700" />
          Body Type
        </label>
        <div role="group" aria-labelledby="fleet-filter-category-label" className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const currentCat = filters.category === "sedan" ? "luxury" : (filters.category === "hatchbacks" ? "hatchback" : filters.category);
            const isSelected = currentCat === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("category", cat.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  isSelected
                    ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
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
        <label id="fleet-filter-transmission-label" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-amber-700" />
          Transmission
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
                className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center ${
                  isSelected
                    ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
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
        <label id="fleet-filter-fuel-label" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Fuel className="w-3.5 h-3.5 text-amber-700" />
          Fuel Type
        </label>
        <div role="group" aria-labelledby="fleet-filter-fuel-label" className="grid grid-cols-2 gap-1.5">
          {fuelTypes.map((fuel) => {
            const isSelected = filters.fuelType === fuel.value;
            return (
              <button
                key={fuel.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateFilter("fuelType", fuel.value)}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center ${
                  isSelected
                    ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
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
        <label id="fleet-filter-seats-label" className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-amber-700" />
          Seats
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
                className={`py-1.5 px-1 text-xs font-medium rounded-lg border transition-all text-center ${
                  isSelected
                    ? "bg-slate-900 text-amber-400 border-slate-900 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
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
        <label htmlFor="fleet-filter-brand" className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Make / Brand
        </label>
        <select
          id="fleet-filter-brand"
          name="brand"
          aria-label="Filter by vehicle make or brand"
          value={filters.brand}
          onChange={(e) => updateFilter("brand", e.target.value)}
          className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:bg-white focus:border-amber-600 focus:outline-none transition-colors"
        >
          {brands.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
