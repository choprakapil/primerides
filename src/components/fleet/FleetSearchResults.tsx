"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FleetSearchFilter, { FilterState } from "./FleetSearchFilter";
import CarSearchCard from "./CarSearchCard";
import {
  Car,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Search,
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
  };

  // Sort cars
  const sortedCars = useMemo(() => {
    const list = [...cars];
    if (sortBy === "price_asc") {
      return list.sort((a, b) => Number(a.price_per_day) - Number(b.price_per_day));
    }
    if (sortBy === "price_desc") {
      return list.sort((a, b) => Number(b.price_per_day) - Number(a.price_per_day));
    }
    if (sortBy === "name_asc") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    // Default: Popular / Available first
    return list.sort((a, b) => {
      if (a.is_sold_out && !b.is_sold_out) return 1;
      if (!a.is_sold_out && b.is_sold_out) return -1;
      return (b.fleet_count || 1) - (a.fleet_count || 1);
    });
  }, [cars, sortBy]);

  const activeCityName =
    filters.location === "delhi-ncr"
      ? "Delhi NCR"
      : filters.location === "lucknow"
      ? "Lucknow"
      : "All Cities";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Top Breadcrumb & Title Bar */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Cardekhen Verified Self-Drive Fleet</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Self-Drive Car Rental in{" "}
              <span className="text-amber-700">{activeCityName}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Choose from verified SUVs, luxury sedans, and 4x4 off-roaders with live fleet inventory.
            </p>
          </div>

          {/* Quick Stats or Booking Guarantee Pill */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
              <span className="font-bold text-slate-900">Zero</span> Security Deposit
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
              <span className="font-bold text-slate-900">Doorstep</span> Handover
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout (Cardekhen style: Filter on left, Cars on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Filter Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <FleetSearchFilter
            filters={filters}
            onChange={setFilters}
            onReset={handleReset}
            totalResults={sortedCars.length}
          />
        </div>

        {/* Right Column: Search Results & Cards */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Results Summary and Sorting Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm shadow-sm">
                {sortedCars.length}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {sortedCars.length === 1
                    ? "1 Vehicle Available"
                    : `${sortedCars.length} Vehicles Available`}
                </p>
                <p className="text-xs text-slate-500">
                  {filters.startDate && filters.endDate
                    ? `For ${filters.startDate} to ${filters.endDate}`
                    : `In ${activeCityName}`}
                </p>
              </div>
            </div>

            {/* Sort Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort cars"
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-amber-400 focus:outline-none transition-colors"
              >
                <option value="popular">Popularity &amp; Stock</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Model Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Cars Grid / Loading / Empty State */}
          {loading ? (
            <div className="min-h-[360px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-800">
                Checking Live Fleet Inventory...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Verifying car availability in {activeCityName}
              </p>
            </div>
          ) : sortedCars.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  No Cars Found For Selected Filters
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  We could not find any vehicles matching all your criteria in{" "}
                  {activeCityName}. Try changing dates or clearing some filters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-amber-400 font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}
