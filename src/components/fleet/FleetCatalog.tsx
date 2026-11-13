"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Users,
  Gauge,
  Fuel,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Check,
  ShieldCheck,
} from "lucide-react";
import { formatCarDisplayName } from "./types";

export interface SerializedRentalPlan {
  id: number;
  name: string;
  plan_type: string;
  free_km: number;
  price: number;
  security_deposit: number;
  extra_km_rate: number;
  duration_days: number;
}

export interface SerializedFleetCar {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price_per_day: number;
  security_deposit?: number | null;
  seats: number;
  transmission: string;
  fuel_type: string;
  engine_hp?: number | null;
  doors?: number | null;
  badge?: string | null;
  primary_image?: string | null;
  is_available: boolean;
  is_featured: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  location?: {
    id: number;
    name: string;
    city: string;
    slug: string;
  } | null;
  rental_plans: SerializedRentalPlan[];
}

interface FleetCatalogProps {
  cars: SerializedFleetCar[];
  locations: Array<{ id: number; name: string; city: string; slug: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  initialLocation?: string;
}

export default function FleetCatalog({
  cars,
  locations,
  categories,
  initialLocation,
}: FleetCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state synchronization
  const locationParam = searchParams.get("location") || initialLocation || "all";
  const categoryParam = searchParams.get("category") || "all";

  // Filter States
  const [selectedLocation, setSelectedLocation] = useState<string>(locationParam);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam !== "all" ? [categoryParam] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<string>("all"); // 'all' | 'under-4000' | '4000-8000' | '8000-15000' | 'above-15000'
  const [sortBy, setSortBy] = useState<string>("featured"); // 'featured' | 'price-asc' | 'price-desc' | 'seats-desc'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync when URL param changes
  useEffect(() => {
    const loc = searchParams.get("location");
    if (loc) {
      setSelectedLocation(loc);
    }
  }, [searchParams]);

  // Unique Filter Options extracted from the actual database cars
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    cars.forEach((c) => {
      if (c.brand) set.add(c.brand);
    });
    return Array.from(set).sort();
  }, [cars]);

  const availableFuels = useMemo(() => {
    const set = new Set<string>();
    cars.forEach((c) => {
      if (c.fuel_type) set.add(c.fuel_type);
    });
    return Array.from(set).sort();
  }, [cars]);

  const availableTransmissions = useMemo(() => {
    const set = new Set<string>();
    cars.forEach((c) => {
      if (c.transmission) set.add(c.transmission);
    });
    return Array.from(set).sort();
  }, [cars]);

  const availableSeats = useMemo(() => {
    const set = new Set<number>();
    cars.forEach((c) => {
      if (c.seats) set.add(c.seats);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [cars]);

  // Location switch handler
  const handleLocationChange = (slug: string) => {
    setSelectedLocation(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("location");
    } else {
      params.set("location", slug);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Toggle filter helper
  const toggleItem = <T,>(list: T[], item: T, setter: (val: T[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedLocation("all");
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedFuelTypes([]);
    setSelectedTransmissions([]);
    setSelectedSeats([]);
    setPriceRange("all");
    setSortBy("featured");
    router.replace(pathname, { scroll: false });
  };

  // Active filter count calculation
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLocation !== "all") count++;
    if (searchQuery.trim().length > 0) count++;
    count += selectedCategories.length;
    count += selectedBrands.length;
    count += selectedFuelTypes.length;
    count += selectedTransmissions.length;
    count += selectedSeats.length;
    if (priceRange !== "all") count++;
    return count;
  }, [
    selectedLocation,
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedFuelTypes,
    selectedTransmissions,
    selectedSeats,
    priceRange,
  ]);

  // Main Filtering Logic
  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      // 1. Location Filter
      if (selectedLocation !== "all") {
        const carLocSlug = car.location?.slug || (car.location?.city === "Lucknow" ? "lucknow" : "delhi-ncr");
        if (carLocSlug !== selectedLocation) return false;
      }

      // 2. Search Query (Name, Brand, or Category)
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = car.name.toLowerCase().includes(q);
        const brandMatch = car.brand.toLowerCase().includes(q);
        const catMatch = car.category?.name.toLowerCase().includes(q);
        if (!nameMatch && !brandMatch && !catMatch) return false;
      }

      // 3. Category Filter
      if (selectedCategories.length > 0) {
        const catSlug = car.category?.slug;
        const catName = car.category?.name;
        const matchesCategory = selectedCategories.some(
          (slug) => slug === catSlug || slug === catName
        );
        if (!matchesCategory) return false;
      }

      // 4. Brand Filter
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(car.brand)) return false;
      }

      // 5. Fuel Type Filter
      if (selectedFuelTypes.length > 0) {
        if (!selectedFuelTypes.includes(car.fuel_type)) return false;
      }

      // 6. Transmission Filter
      if (selectedTransmissions.length > 0) {
        if (!selectedTransmissions.includes(car.transmission)) return false;
      }

      // 7. Seats Filter
      if (selectedSeats.length > 0) {
        if (!selectedSeats.includes(car.seats)) return false;
      }

      // 8. Price Range Filter
      if (priceRange !== "all") {
        const p = car.price_per_day;
        if (priceRange === "under-4000" && p >= 4000) return false;
        if (priceRange === "4000-8000" && (p < 4000 || p > 8000)) return false;
        if (priceRange === "8000-15000" && (p < 8000 || p > 15000)) return false;
        if (priceRange === "above-15000" && p < 15000) return false;
      }

      return true;
    });
  }, [
    cars,
    selectedLocation,
    searchQuery,
    selectedCategories,
    selectedBrands,
    selectedFuelTypes,
    selectedTransmissions,
    selectedSeats,
    priceRange,
  ]);

  // Sorting Logic
  const sortedCars = useMemo(() => {
    const list = [...filteredCars];
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price_per_day - b.price_per_day);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price_per_day - a.price_per_day);
    } else if (sortBy === "seats-desc") {
      list.sort((a, b) => b.seats - a.seats);
    } else {
      // Featured / default
      list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }
    return list;
  }, [filteredCars, sortBy]);

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* TOP LOCATION TABS (Cardekhen-style Quick Location Hub Switcher) */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200/80 sticky top-[72px] sm:top-[76px] z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Location Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
                <MapPin className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Hub:</span>
              </span>
              <button
                type="button"
                onClick={() => handleLocationChange("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedLocation === "all"
                    ? "bg-[#090e1a] text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
                }`}
              >
                All Locations ({cars.length})
              </button>
              {locations.map((loc) => {
                const count = cars.filter(
                  (c) =>
                    c.location?.slug === loc.slug ||
                    (c.location?.city === "Lucknow" && loc.slug === "lucknow") ||
                    (c.location?.city === "Delhi NCR" && loc.slug === "delhi-ncr")
                ).length;
                const isSelected = selectedLocation === loc.slug;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleLocationChange(loc.slug)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#c59b27] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
                    }`}
                  >
                    <span>{loc.city}</span>
                    <span className="text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search & Sort Bar */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search model, brand..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-full text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c59b27] focus:border-[#c59b27] text-slate-900 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#c59b27]" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>

              {/* Sort Dropdown */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-slate-400 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#c59b27] cursor-pointer"
                >
                  <option value="featured">Featured / Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="seats-desc">Seating Capacity</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CATALOG WORKSPACE: Sidebar Filters + Car Cards Grid */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* DESKTOP FILTER SIDEBAR (Cardekhen-style sticky left rail) */}
          {/* ========================================================================= */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-36 space-y-6 bg-white/90 backdrop-blur-xs p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            {/* Header + Clear All */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#c59b27]" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* 1. Category / Body Type Filter */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                Category &amp; Body Type
              </span>
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const count = cars.filter(
                    (c) =>
                      c.category?.slug === cat.slug ||
                      c.category?.name.toLowerCase() === cat.name.toLowerCase()
                  ).length;
                  if (count === 0) return null;
                  const isChecked = selectedCategories.includes(cat.slug);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none py-0.5"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            toggleItem(selectedCategories, cat.slug, setSelectedCategories)
                          }
                          className="rounded text-[#c59b27] focus:ring-[#c59b27] w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className={isChecked ? "font-bold text-[#090e1a]" : "font-normal"}>
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-slate-400">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Brand Filter */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                Vehicle Brand
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableBrands.map((brand) => {
                  const count = cars.filter((c) => c.brand === brand).length;
                  const isChecked = selectedBrands.includes(brand);
                  return (
                    <label
                      key={brand}
                      className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none py-0.5"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(selectedBrands, brand, setSelectedBrands)}
                          className="rounded text-[#c59b27] focus:ring-[#c59b27] w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className={isChecked ? "font-bold text-[#090e1a]" : "font-normal"}>
                          {brand}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-slate-400">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Budget / Daily Price Range */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                Daily Price Range
              </span>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: "all", label: "All Rates" },
                  { id: "under-4000", label: "Under ₹4,000 / day" },
                  { id: "4000-8000", label: "₹4,000 – ₹8,000 / day" },
                  { id: "8000-15000", label: "₹8,000 – ₹15,000 / day" },
                  { id: "above-15000", label: "Luxury Above ₹15,000" },
                ].map((tier) => (
                  <label
                    key={tier.id}
                    className="flex items-center gap-2 text-slate-700 hover:text-slate-900 cursor-pointer select-none py-0.5"
                  >
                    <input
                      type="radio"
                      name="priceRangeDesktop"
                      checked={priceRange === tier.id}
                      onChange={() => setPriceRange(tier.id)}
                      className="text-[#c59b27] focus:ring-[#c59b27] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className={priceRange === tier.id ? "font-bold text-[#090e1a]" : "font-normal"}>
                      {tier.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Transmission */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                Transmission
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableTransmissions.map((t) => {
                  const isChecked = selectedTransmissions.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleItem(selectedTransmissions, t, setSelectedTransmissions)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#fdfaf2] text-[#c59b27] border-[#c59b27]"
                          : "bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Fuel Type */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                Fuel Type
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableFuels.map((f) => {
                  const isChecked = selectedFuelTypes.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleItem(selectedFuelTypes, f, setSelectedFuelTypes)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#fdfaf2] text-[#c59b27] border-[#c59b27]"
                          : "bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Seating Capacity */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                Seating Capacity
              </span>
              <div className="flex gap-2">
                {availableSeats.map((s) => {
                  const isChecked = selectedSeats.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleItem(selectedSeats, s, setSelectedSeats)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#090e1a] text-white border-[#090e1a]"
                          : "bg-slate-50 text-slate-700 border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      {s} Seats
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* VEHICLE CARDS RESULTS (9 cols on desktop) */}
          {/* ========================================================================= */}
          <main className="lg:col-span-9 space-y-6">
            {/* Results Header + Active Badges */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">
                    {selectedLocation === "all"
                      ? "All Fleet Vehicles"
                      : `${selectedLocation === "lucknow" ? "Lucknow" : "Delhi NCR"} Fleet Collection`}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal">
                    Showing <strong className="text-slate-900">{sortedCars.length}</strong> of {cars.length} verified self-drive &amp; luxury chauffeur cars
                  </p>
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-slate-400 font-medium">Applied:</span>
                  {selectedLocation !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                      <span>Hub: {selectedLocation === "lucknow" ? "Lucknow" : "Delhi NCR"}</span>
                      <button
                        type="button"
                        onClick={() => handleLocationChange("all")}
                        className="hover:text-amber-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      <span>&ldquo;{searchQuery}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedCategories.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      <span className="capitalize">{c}</span>
                      <button
                        type="button"
                        onClick={() => toggleItem(selectedCategories, c, setSelectedCategories)}
                        className="hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedBrands.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() => toggleItem(selectedBrands, b, setSelectedBrands)}
                        className="hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedSeats.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      <span>{s} Seats</span>
                      <button
                        type="button"
                        onClick={() => toggleItem(selectedSeats, s, setSelectedSeats)}
                        className="hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Results Grid */}
            {sortedCars.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-[#c59b27] flex items-center justify-center mx-auto">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Vehicles Match Your Selected Filters</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try clearing some filter criteria, broadening your price range, or switching hubs to discover available cars.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="modern-card-btn inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedCars.map((car) => {
                  const displayName = formatCarDisplayName(car.brand, car.name);
                  const locationCity = car.location?.city || "Delhi NCR";
                  const primaryImg = car.primary_image || "/assets/img/cars/1.jpg";
                  const startingPlan = car.rental_plans?.[0];

                  return (
                    <div
                      key={car.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-amber-300/80 transition-all duration-300 flex flex-col overflow-hidden group"
                    >
                      {/* Image Showcase Stage */}
                      <Link
                        href={`/cars/${car.slug}`}
                        className="relative h-48 w-full bg-slate-900 overflow-hidden block"
                      >
                        <img
                          src={primaryImg}
                          alt={displayName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#090e1a]/85 text-[#f7d58b] backdrop-blur-md shadow-xs border border-[#c59b27]/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#c59b27]" />
                            <span>Prime Certified</span>
                          </span>
                          {car.badge && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-xs">
                              {car.badge}
                            </span>
                          )}
                        </div>

                        {/* Location Pill */}
                        <div className="absolute bottom-3 right-3 pointer-events-none">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 backdrop-blur-md shadow-xs border border-slate-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#c59b27]" />
                            <span>{locationCity}</span>
                          </span>
                        </div>
                      </Link>

                      {/* Content Dossier */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          {/* Brand & Category Subtitle */}
                          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            <span className="text-[#c59b27]">{car.brand}</span>
                            <span>•</span>
                            <span>{car.category?.name || "Luxury Class"}</span>
                          </div>

                          {/* Title */}
                          <Link
                            href={`/cars/${car.slug}`}
                            className="text-base sm:text-lg font-bold text-slate-950 hover:text-amber-700 transition-colors block leading-snug line-clamp-1"
                          >
                            {displayName}
                          </Link>

                          {/* Dynamic Specs Pill Grid */}
                          <div className="grid grid-cols-3 gap-2 py-3 mt-2 border-y border-slate-100 text-[11px] text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-semibold">{car.seats} Seats</span>
                            </div>
                            <div className="flex items-center gap-1.5 truncate">
                              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-semibold truncate">
                                {car.transmission.toLowerCase().includes("auto") ? "Auto" : "Manual"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-semibold truncate">{car.fuel_type}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Action Row */}
                        <div className="pt-1 flex items-end justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Starting Package
                            </span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-black text-slate-950 tracking-tight">
                                ₹{car.price_per_day.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] text-slate-500 font-semibold">
                                / {startingPlan?.name || "300 km"}
                              </span>
                            </div>
                          </div>

                          <Link
                            href={`/cars/${car.slug}`}
                            className="modern-card-btn text-xs py-2 px-3.5 flex items-center gap-1.5 text-decoration-none shadow-xs shrink-0"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5 arrow-icon" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE FILTER DRAWER */}
      {/* ========================================================================= */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Body */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#c59b27]" />
                  <h3 className="text-base font-bold text-slate-900">Filters</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Location Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Location Hub
                </span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleLocationChange("all")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                      selectedLocation === "all"
                        ? "bg-[#090e1a] text-white"
                        : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    All Locations ({cars.length})
                  </button>
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleLocationChange(loc.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                        selectedLocation === loc.slug
                          ? "bg-[#c59b27] text-white"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {loc.city} Hub
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Categories */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Categories
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {categories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.slug);
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 text-xs text-slate-700 py-1"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            toggleItem(selectedCategories, cat.slug, setSelectedCategories)
                          }
                          className="rounded text-[#c59b27]"
                        />
                        <span>{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Brands */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Brands
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {availableBrands.map((b) => (
                    <label key={b} className="flex items-center gap-2 text-xs text-slate-700 py-1">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b)}
                        onChange={() => toggleItem(selectedBrands, b, setSelectedBrands)}
                        className="rounded text-[#c59b27]"
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="modern-card-btn w-full flex items-center justify-center gap-2 py-2.5 shadow-md"
              >
                <span>View {sortedCars.length} Cars</span>
              </button>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full text-center text-xs text-rose-600 font-semibold py-1.5"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
