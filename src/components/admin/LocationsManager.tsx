"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Car,
  CalendarCheck,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowUpRight,
  Compass,
  Eye,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminButton,
  AdminModal,
  AdminEmptyState,
  AdminInput,
  AdminTextarea,
} from "@/components/admin/ui";
import TrendArrowBadge from "./ui/TrendArrowBadge";

export interface LocationItem {
  id: number;
  city: string;
  name: string;
  slug: string;
  address?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  _count: {
    cars: number;
    bookings: number;
  };
}

interface LocationsManagerProps {
  initialLocations: LocationItem[];
  stats: {
    totalHubs: number;
    activeHubs: number;
    totalVehiclesAssigned: number;
    totalReservations: number;
  };
}

export default function LocationsManager({
  initialLocations,
  stats: initialStats,
}: LocationsManagerProps) {
  const [locations, setLocations] = useState<LocationItem[]>(initialLocations);
  const [stats, setStats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LocationItem | null>(null);
  const [formData, setFormData] = useState({
    city: "Delhi NCR",
    name: "",
    slug: "",
    address: "",
    sort_order: 0,
    is_active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingItem, setDeletingItem] = useState<LocationItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract unique cities
  const uniqueCities = useMemo(() => {
    return Array.from(new Set(locations.map((l) => l.city))).filter(Boolean);
  }, [locations]);

  // Filtered Locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (filterCity !== "all" && loc.city !== filterCity) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.city.toLowerCase().includes(q) ||
        loc.slug.toLowerCase().includes(q) ||
        (loc.address && loc.address.toLowerCase().includes(q))
      );
    });
  }, [locations, filterCity, searchQuery]);

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/locations");
      const json = await res.json();
      if (json.success && json.data) {
        setLocations(json.data.locations || []);
        if (json.data.stats) setStats(json.data.stats);
      }
    } catch (err) {
      console.error("Failed to refresh locations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      city: "Delhi NCR",
      name: "",
      slug: "",
      address: "",
      sort_order: locations.length,
      is_active: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: LocationItem) => {
    setEditingItem(item);
    setFormData({
      city: item.city,
      name: item.name,
      slug: item.slug,
      address: item.address || "",
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (item: LocationItem) => {
    try {
      const newStatus = !item.is_active;
      const res = await fetch(`/api/v1/admin/locations/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setLocations((prev) =>
          prev.map((l) => (l.id === item.id ? { ...l, is_active: newStatus } : l))
        );
        setStats((prev) => ({
          ...prev,
          activeHubs: newStatus ? prev.activeHubs + 1 : Math.max(0, prev.activeHubs - 1),
        }));
      }
    } catch (err) {
      console.error("Failed to toggle location status:", err);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim()) {
      setFormError("City and Hub Title are required.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const url = editingItem
        ? `/api/v1/admin/locations/${editingItem.id}`
        : "/api/v1/admin/locations";
      const method = editingItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save rental hub.");
      }

      await refreshList();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/v1/admin/locations/${deletingItem.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to remove rental hub.");
      }

      await refreshList();
      setDeletingItem(null);
    } catch (err: any) {
      setDeleteError(err.message || "Error removing rental hub.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Fleet & Operations"
        title="Rental Locations & Hubs"
        description="Manage regional delivery dispatch zones, airport handover centers, and vehicle inventory assignment points."
        icon={<MapPin className="w-5 h-5 text-emerald-600" />}
        actions={
          <div className="d-flex align-items-center gap-2">
            <AdminButton
              variant="secondary"
              onClick={refreshList}
              disabled={isLoading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#c59b27]" : ""}`} />}
            >
              Refresh
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={handleOpenCreate}
              icon={<Plus className="w-4 h-4" />}
            >
              Add New Hub
            </AdminButton>
          </div>
        }
      />

      {/* 4 Luxury Pastel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* Total Hubs */}
        <div className="card border pastel-card pastel-card-lavender rounded-3xl overflow-hidden shadow-2xs">
          <div className="card-body p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <TrendArrowBadge value={`${stats.totalHubs} Hubs`} period="network" pastelTheme="lavender" />
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Total Hubs
              </div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalHubs}</div>
              <div className="text-[11.5px] text-slate-500 mt-1">
                Regional dispatch centers
              </div>
            </div>
          </div>
        </div>

        {/* Active Operations */}
        <div className="card border pastel-card pastel-card-mint rounded-3xl overflow-hidden shadow-2xs">
          <div className="card-body p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <TrendArrowBadge
                value={`${stats.totalHubs > 0 ? Math.round((stats.activeHubs / stats.totalHubs) * 100) : 0}% Live`}
                period="operational"
                pastelTheme="mint"
              />
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Active Operations
              </div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.activeHubs}</div>
              <div className="text-[11.5px] text-slate-500 mt-1">
                Accepting reservations
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Fleet */}
        <div className="card border pastel-card pastel-card-sky rounded-3xl overflow-hidden shadow-2xs">
          <div className="card-body p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Car className="w-5 h-5" />
              </div>
              <TrendArrowBadge value={`${stats.totalVehiclesAssigned} Cars`} period="fleet" pastelTheme="sky" />
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Assigned Fleet
              </div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalVehiclesAssigned} Cars</div>
              <div className="text-[11.5px] text-slate-500 mt-1">
                Scoped vehicles on ground
              </div>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="card border pastel-card pastel-card-peach rounded-3xl overflow-hidden shadow-2xs">
          <div className="card-body p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <TrendArrowBadge value={`${stats.totalReservations} Trips`} period="traffic" pastelTheme="peach" />
            </div>
            <div>
              <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Total Reservations
              </div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalReservations}</div>
              <div className="text-[11.5px] text-slate-500 mt-1">
                Lifetime trips dispatched
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterCity("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterCity === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Cities ({locations.length})
          </button>
          {uniqueCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setFilterCity(city)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterCity === city
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px] sm:min-w-[300px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="admin-search-locations"
            name="admin-search-locations"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hub, address, code..."
            aria-label="Search locations by hub, address, or code"
            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 focus:bg-white focus:border-[#c59b27] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Hub Cards Grid */}
      {filteredLocations.length === 0 ? (
        <AdminEmptyState
          icon={<MapPin className="w-8 h-8 text-slate-400" />}
          title="No rental hubs found"
          description="Create your first regional operations hub to assign fleet vehicles and enable city-specific reservations."
          action={
            <AdminButton variant="primary" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
              Add Rental Hub
            </AdminButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredLocations.map((hub) => (
            <div
              key={hub.id}
              className="group h-full bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:border-[#c59b27]/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
            >
              {/* Top Accent Gradient on Hover */}
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#c59b27] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0" />

              <div className="p-5 flex flex-col flex-1">
                {/* Top Hub Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shrink-0 shadow-2xs">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h4
                        className="text-base font-extrabold text-[#1c274c] group-hover:text-[#c59b27] transition-colors leading-snug truncate"
                        title={hub.name}
                      >
                        {hub.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">
                          {hub.name.toLowerCase() === hub.city.toLowerCase() ? "Regional Hub" : hub.city}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[10.5px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/80">
                          {hub.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(hub)}
                    title={hub.is_active ? "Click to deactivate this hub" : "Click to activate this hub"}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer ${
                      hub.is_active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300/80 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        hub.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    <span>{hub.is_active ? "Active" : "Disabled"}</span>
                  </button>
                </div>

                {/* Hub Address */}
                <div className="flex items-start gap-2 text-xs text-slate-600 my-2 min-h-[38px] bg-slate-50/70 rounded-xl p-2.5 border border-slate-100/90">
                  <Compass className="w-3.5 h-3.5 text-[#c59b27] shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">
                    {hub.address || "Address details not yet specified for this pickup location."}
                  </span>
                </div>

                {/* Symmetrical 2-Column Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-3 mt-auto border-t border-slate-100">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      Assigned Fleet
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Car className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="font-extrabold text-[#1c274c] text-sm">{hub._count.cars} Vehicles</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                      Reservations
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CalendarCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-extrabold text-[#1c274c] text-sm">{hub._count.bookings} Trips</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/cars?location=${hub.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-[#c59b27] bg-white hover:bg-amber-50/60 text-slate-700 hover:text-[#c59b27] text-xs font-bold transition-all shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>View Cars ({hub._count.cars})</span>
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(hub)}
                    className="w-9.5 h-9.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                    title="Edit Hub Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingItem(hub);
                      setDeleteError(null);
                    }}
                    className="w-9.5 h-9.5 rounded-xl border border-rose-200 hover:border-rose-400 bg-rose-50/80 hover:bg-rose-500 text-rose-600 hover:text-white flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                    title="Remove Hub"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Hub — ${editingItem.name}` : "Create Regional Rental Hub"}
        subtitle="Specify geographic city, address details, and public pickup parameters."
      >
        <form onSubmit={handleSaveSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AdminInput
              label="Regional City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Delhi NCR, Lucknow, Gurgaon"
            />

            <AdminInput
              label="Hub Display Title"
              required
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                setFormData({
                  ...formData,
                  name: val,
                  slug: editingItem ? formData.slug : autoSlug,
                });
              }}
              placeholder="e.g. Aerocity Luxury Lounge"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AdminInput
              label="URL Identifier / Slug"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. aerocity-hub"
              className="font-mono text-xs"
            />

            <AdminInput
              label="Display Sort Order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <AdminTextarea
              label="Physical Pickup Address"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full landmark, airport terminal counter, or valet station address..."
            />
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="isActiveSwitch"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-[#c59b27] focus:ring-[#c59b27] border-slate-300 cursor-pointer"
            />
            <label htmlFor="isActiveSwitch" className="text-xs font-bold text-slate-700 select-none cursor-pointer">
              Hub is Operational &amp; Visible to Customers (Accepting Bookings)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#c59b27] to-[#d4af37] text-slate-950 hover:brightness-105 shadow-sm transition-all cursor-pointer"
            >
              {isSaving ? "Saving..." : editingItem ? "Update Hub" : "Create Hub"}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <AdminModal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          title="Remove Rental Hub"
          subtitle="Are you sure you want to delete this regional operations hub?"
        >
          <div className="space-y-4">
            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {deleteError}
              </div>
            )}
            <p className="text-xs text-slate-600 leading-relaxed mb-0">
              Deleting <strong className="text-slate-900">{deletingItem.name}</strong> will remove it from customer booking options.
              {deletingItem._count.cars > 0 && (
                <span className="text-red-600 font-semibold block mt-2 p-2.5 bg-red-50/80 border border-red-200/80 rounded-xl">
                  Warning: {deletingItem._count.cars} vehicles are currently assigned to this hub. Reassign them before deleting.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </PageContainer>
  );
}
