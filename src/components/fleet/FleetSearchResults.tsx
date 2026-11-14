"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FleetSearchFilter, { FilterState } from "./FleetSearchFilter";
import CarSearchCard from "./CarSearchCard";
import {
  Car,
  MapPin,
  Calendar,
  ArrowUpDown,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
} from "lucide-react";

interface FleetSearchResultsProps {
  initialCars?: any[];
}

export default function FleetSearchResults({
  initialCars = [],
}: FleetSearchResultsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL parameters if available (supporting canonical category as well as legacy filter and type)
  const initialLocation = searchParams?.get("location") || searchParams?.get("city") || "all";
  const initialStartDate = searchParams?.get("startDate") || "";
  const initialEndDate = searchParams?.get("endDate") || "";
  const rawInitialCategory = searchParams?.get("category") || searchParams?.get("filter") || searchParams?.get("type") || "all";
  const initialCategory = rawInitialCategory === "sedan" ? "luxury" : (rawInitialCategory === "hatchbacks" ? "hatchback" : rawInitialCategory);

  const [filters, setFilters] = useState<FilterState>({
    location: initialLocation,
    startDate: initialStartDate,
    startTime: "10:00",
    endDate: initialEndDate,
    endTime: "10:00",
    minPrice: 1500,
    maxPrice: 15000,
    category: initialCategory,
    transmission: "all",
    fuelType: "all",
    seats: "all",
    brand: "all",
  });

  const [sortBy, setSortBy] = useState<string>("popular");
  const [cars, setCars] = useState<any[]>(initialCars);
  const [loading, setLoading] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close mobile filter drawer on Escape key or outside interaction
  useEffect(() => {
    if (!isMobileDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileDrawerOpen]);

  // Sync state if searchParams change dynamically (e.g., client navigation from footer or header)
  useEffect(() => {
    const rawCat = searchParams?.get("category") || searchParams?.get("filter") || searchParams?.get("type");
    const normalizedCat = rawCat ? (rawCat === "sedan" ? "luxury" : (rawCat === "hatchbacks" ? "hatchback" : rawCat)) : undefined;
    const paramLocation = searchParams?.get("location") || searchParams?.get("city") || undefined;
    const paramStartDate = searchParams?.get("startDate") ?? undefined;
    const paramEndDate = searchParams?.get("endDate") ?? undefined;

    setFilters((prev) => {
      let changed = false;
      const next = { ...prev };
      if (normalizedCat !== undefined && normalizedCat !== prev.category) {
        next.category = normalizedCat;
        changed = true;
      }
      if (paramLocation !== undefined && paramLocation !== prev.location) {
        next.location = paramLocation;
        changed = true;
      }
      if (paramStartDate !== undefined && paramStartDate !== prev.startDate) {
        next.startDate = paramStartDate;
        changed = true;
      }
      if (paramEndDate !== undefined && paramEndDate !== prev.endDate) {
        next.endDate = paramEndDate;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [searchParams]);

  // Fetch cars when key query parameters change
  useEffect(() => {
    let isCancelled = false;

    async function fetchFilteredCars() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (filters.location && filters.location !== "all") {
          query.set("locationSlug", filters.location);
        }
        if (filters.startDate) {
          query.set("startDate", filters.startDate);
        }
        if (filters.endDate) {
          query.set("endDate", filters.endDate);
        }
        if (filters.category && filters.category !== "all") {
          query.set("categorySlug", filters.category);
        }
        if (filters.transmission && filters.transmission !== "all") {
          query.set("transmission", filters.transmission);
        }
        if (filters.fuelType && filters.fuelType !== "all") {
          query.set("fuelType", filters.fuelType);
        }
        if (filters.seats && filters.seats !== "all") {
          query.set("seats", filters.seats);
        }
        if (filters.brand && filters.brand !== "all") {
          query.set("brand", filters.brand);
        }
        if (filters.maxPrice < 15000) {
          query.set("maxPrice", filters.maxPrice.toString());
        }

        const res = await fetch(`/api/v1/cars?${query.toString()}`);
        const data = await res.json();
        const carList = Array.isArray(data?.data?.cars)
          ? data.data.cars
          : Array.isArray(data?.data)
          ? data.data
          : [];
        if (!isCancelled && (data?.success || carList.length > 0)) {
          setCars(carList);
        }
      } catch (err) {
        console.error("Failed to load filtered cars:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    fetchFilteredCars();

    return () => {
      isCancelled = true;
    };
  }, [
    filters.location,
    filters.startDate,
    filters.endDate,
    filters.category,
    filters.transmission,
    filters.fuelType,
    filters.seats,
    filters.brand,
    filters.maxPrice,
  ]);

  const handleReset = () => {
    setFilters({
      location: "all",
      startDate: "",
      startTime: "10:00",
      endDate: "",
      endTime: "10:00",
      minPrice: 1500,
      maxPrice: 15000,
      category: "all",
      transmission: "all",
      fuelType: "all",
      seats: "all",
      brand: "all",
    });
    router.push("/cars");
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.transmission !== "all") count++;
    if (filters.fuelType !== "all") count++;
    if (filters.seats !== "all") count++;
    if (filters.brand !== "all") count++;
    if (filters.maxPrice < 15000) count++;
    if (filters.startDate !== "") count++;
    return count;
  }, [filters]);

  const sortedCars = useMemo(() => {
    return [...cars].sort((a, b) => {
      const getCarPrice = (car: any) => {
        return car.rental_plans?.[0]?.price
          ? Number(car.rental_plans[0].price)
          : Number(car.price_per_day);
      };

      if (sortBy === "price_asc") {
        return getCarPrice(a) - getCarPrice(b);
      }
      if (sortBy === "price_desc") {
        return getCarPrice(b) - getCarPrice(a);
      }
      if (sortBy === "name_asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      // default: 'popular'
      if (a.is_sold_out && !b.is_sold_out) return 1;
      if (!a.is_sold_out && b.is_sold_out) return -1;
      return (b.fleet_count || 1) - (a.fleet_count || 1);
    });
  }, [cars, sortBy]);

  const isAllCities = filters.location === "all" || !filters.location;
  const activeCityName =
    filters.location === "delhi-ncr"
      ? "Delhi NCR"
      : filters.location === "lucknow"
      ? "Lucknow"
      : "All Cities";

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Universal Top Filter & Sorting Control Bar */}
      <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Filter Fleet trigger button + Reset + live count */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#0b0f19] hover:bg-slate-800 text-[#f7d58b] text-xs font-medium shadow-sm active:scale-98 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#f7d58b]" />
              <span>Filter Fleet</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#c59b27] text-white text-[9.5px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={handleReset}
                type="button"
                className="inline-flex items-center gap-1 text-[11px] font-light text-amber-700 hover:text-amber-800 hover:underline transition-colors py-1 px-1.5"
              >
                <RotateCcw className="w-3 h-3 text-amber-600" />
                <span>Reset</span>
              </button>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="text-xs font-medium text-slate-800">
                {sortedCars.length} {sortedCars.length === 1 ? "Vehicle" : "Vehicles"} Available
              </span>
              <span className="text-xs text-slate-400 font-light hidden sm:inline">• In {activeCityName}</span>
            </div>
          </div>

          {/* Right: Sort Control */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-light text-slate-400 whitespace-nowrap flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-[#c59b27]" />
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort cars"
              className="text-xs font-light text-slate-700 bg-[#f8fafc] border border-slate-200/90 rounded-xl px-3 py-1.5 focus:bg-white focus:border-[#c59b27] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="popular">Popularity &amp; Stock</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Model Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Location & Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 pt-1 border-t border-slate-100 scrollbar-none">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {[
              { label: "All Cities", value: "all" },
              { label: "Delhi NCR", value: "delhi-ncr" },
              { label: "Lucknow", value: "lucknow" },
            ].map((loc) => {
              const isSel = filters.location === loc.value;
              return (
                <button
                  key={loc.value}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, location: loc.value }))}
                  className={`px-3 py-1 rounded-full text-[10.5px] whitespace-nowrap border transition-all ${
                    isSel
                      ? "bg-[#fffbf0] text-[#936e16] border-[#dfb34a] font-normal shadow-2xs"
                      : "bg-white text-slate-500 border-slate-200/70 hover:border-slate-300 font-light shadow-2xs hover:text-slate-800"
                  }`}
                >
                  {loc.label}
                </button>
              );
            })}
          </div>

          <span className="text-slate-200 text-xs flex-shrink-0">|</span>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {[
              { label: "All Types", value: "all" },
              { label: "7-Seater SUVs", value: "suv" },
              { label: "Compact SUVs", value: "compact-suv" },
              { label: "4x4 Adventure", value: "4x4" },
              { label: "Hatchbacks", value: "hatchback" },
              { label: "Luxury Sedans", value: "luxury" },
            ].map((cat) => {
              const isSel = filters.category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, category: cat.value }))}
                  className={`px-2.5 py-1 rounded-full text-[10.5px] whitespace-nowrap border transition-all ${
                    isSel
                      ? "bg-[#fffbf0] text-[#936e16] border-[#dfb34a] font-normal shadow-2xs"
                      : "bg-white text-slate-500 border-slate-200/70 hover:border-slate-300 font-light shadow-2xs hover:text-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-Width Cars Grid (4 Cards in a Row on Desktop) */}
      <div className="space-y-6">
        {loading ? (
          <div className="min-h-[360px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <RefreshCw className="w-8 h-8 text-[#c59b27] animate-spin mb-3" />
            <p className="text-sm font-bold text-[#0b0f19]">
              Checking Live Fleet Telemetry...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Verifying real-time car availability in {activeCityName}
            </p>
          </div>
        ) : sortedCars.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#fffdf7] text-[#c59b27] border border-[#e5b94f]/40 mx-auto flex items-center justify-center shadow-xs">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0b0f19] font-heading">
                No Cars Found For Selected Filters
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-sans">
                We could not find any vehicles matching all your criteria in{" "}
                {activeCityName}. Try changing dates or clearing some filters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b0f19] text-[#c59b27] font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {sortedCars.map((car) => (
              <CarSearchCard
                key={car.id}
                car={car}
                startDate={filters.startDate}
                endDate={filters.endDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal / Drawer (Responsive on Mobile & Desktop) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer / Modal Body */}
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh] w-full sm:max-w-xl z-10 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-[#fcfbf9]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#c59b27]" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base font-heading">
                  Filter Fleet ({sortedCars.length} available)
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-light text-amber-700 hover:underline"
                  >
                    Reset All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filters */}
            <div className="p-5 overflow-y-auto space-y-5">
              <FleetSearchFilter
                filters={filters}
                onChange={setFilters}
                onReset={handleReset}
                totalResults={sortedCars.length}
                isMobileModal={true}
              />
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#d4a838] to-[#b88d22] text-[#0b0f19] font-bold text-xs uppercase tracking-wider text-center shadow-md active:scale-98 transition-all"
              >
                View {sortedCars.length} Vehicles →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
