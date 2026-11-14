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
import { useFocusTrap } from "@/lib/useFocusTrap";

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
  const filterModalRef = useFocusTrap({ isOpen: isMobileDrawerOpen, onClose: () => setIsMobileDrawerOpen(false) });

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

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileDrawerOpen]);

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
      <div className="mb-6 bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Filter Fleet trigger capsule + Reset + live count */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="inline-flex items-center justify-center gap-2 py-1.5 px-4 rounded-full bg-gradient-to-b from-[#fffbf0] to-[#fbf5e6] hover:from-[#fff8e7] hover:to-[#f5ecd4] text-[#855f13] hover:text-[#6c4c0b] border border-[#dfb34a] shadow-2xs hover:shadow-xs active:scale-97 transition-all duration-200 cursor-pointer group"
            >
              <div className="w-4.5 h-4.5 rounded-full bg-white/90 border border-[#dfb34a]/60 flex items-center justify-center text-[#936e16] group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="w-2.5 h-2.5 text-[#936e16]" />
              </div>
              <span className="text-xs font-medium tracking-wide">Filter Fleet</span>
              {activeFilterCount > 0 ? (
                <span className="min-w-4 h-4 px-1 rounded-full bg-[#936e16] text-white text-[9.5px] font-semibold flex items-center justify-center shadow-2xs">
                  {activeFilterCount}
                </span>
              ) : (
                <span className="text-[10px] text-amber-800/60 font-light">
                  ({sortedCars.length})
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={handleReset}
                type="button"
                className="inline-flex items-center gap-1 text-[11px] font-light text-amber-700 hover:text-amber-900 hover:underline transition-colors py-1 px-1.5"
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
              className="text-xs font-light text-slate-700 bg-[#f8fafc] border border-slate-200/90 rounded-full px-3.5 py-1.5 focus:bg-white focus:border-[#dfb34a] focus:outline-none transition-colors cursor-pointer shadow-2xs"
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
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fleet-filter-modal-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            ref={filterModalRef}
            className="relative bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] sm:max-h-[88vh] w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl z-10 flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-slate-200/80 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-slate-100 bg-[#fcfbf9]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#fffbf0] border border-[#dfb34a]/40 text-[#936e16] flex items-center justify-center shadow-2xs">
                  <SlidersHorizontal className="w-4 h-4 text-[#936e16]" />
                </div>
                <div>
                  <h3 id="fleet-filter-modal-title" className="font-bold text-slate-800 text-sm sm:text-base font-heading">
                    Filter Fleet Inventory
                  </h3>
                  <p className="text-[11px] text-slate-400 font-light">
                    Refine by city hub, trip dates, category &amp; vehicle specifications ({sortedCars.length} available)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-xs font-light text-amber-700 hover:text-amber-900 hover:underline transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-600" />
                    <span>Reset All</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Close filters modal"
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Filters Body with flex-1 min-h-0 */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 py-4.5 space-y-4">
              <FleetSearchFilter
                filters={filters}
                onChange={setFilters}
                onReset={handleReset}
                totalResults={sortedCars.length}
                isMobileModal={true}
              />
            </div>

            {/* Footer CTA */}
            <div className="px-5 sm:px-7 py-3.5 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-light">
                {activeFilterCount > 0 ? (
                  <span>
                    <strong className="font-semibold text-slate-800">{activeFilterCount}</strong> active filters applied
                  </span>
                ) : (
                  <span>Showing all available verified vehicles</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 sm:flex-initial py-2 px-4 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-light transition-all cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="flex-1 sm:flex-initial py-2.5 px-6 rounded-full bg-gradient-to-r from-[#c59b27] via-[#d4a838] to-[#b88d22] hover:brightness-105 text-[#0b0f19] font-medium text-xs tracking-wide text-center shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  View {sortedCars.length} {sortedCars.length === 1 ? "Vehicle" : "Vehicles"} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
