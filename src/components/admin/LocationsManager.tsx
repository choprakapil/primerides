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
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#5955D1]" : ""}`} />}
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
      <div className="row g-3 mb-4">
        {/* Total Hubs */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-lavender">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-purple-100 text-purple-700 d-flex align-items-center justify-content-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Operational" period="Hubs" pastelTheme="lavender" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Total Hubs
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.totalHubs}</div>
              <div className="text-[11px] text-muted mt-1">
                Regional dispatch centers
              </div>
            </div>
          </div>
        </div>

        {/* Active Operations */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-mint">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-emerald-100 text-emerald-700 d-flex align-items-center justify-content-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="100% Live" period="online" pastelTheme="mint" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Active Operations
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.activeHubs}</div>
              <div className="text-[11px] text-muted mt-1">
                Accepting reservations
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Fleet */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-sky">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-sky-100 text-sky-700 d-flex align-items-center justify-content-center">
                  <Car className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="+14.2%" period="fleet" pastelTheme="sky" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Assigned Fleet
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.totalVehiclesAssigned} Cars</div>
              <div className="text-[11px] text-muted mt-1">
                Scoped vehicles on ground
              </div>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-peach">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-amber-100 text-amber-700 d-flex align-items-center justify-content-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="+29.5%" period="traffic" pastelTheme="peach" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Total Reservations
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.totalReservations}</div>
              <div className="text-[11px] text-muted mt-1">
                Lifetime trips dispatched
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border mb-4 shadow-2xs rounded-4">
        <div className="card-body p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <ul className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0" role="tablist">
            <li className="nav-item">
              <button
                type="button"
                onClick={() => setFilterCity("all")}
                className={`nav-link rounded-pill ${filterCity === "all" ? "active" : ""}`}
              >
                All Cities ({locations.length})
              </button>
            </li>
            {uniqueCities.map((city) => (
              <li className="nav-item" key={city}>
                <button
                  type="button"
                  onClick={() => setFilterCity(city)}
                  className={`nav-link rounded-pill ${filterCity === city ? "active" : ""}`}
                >
                  {city}
                </button>
              </li>
            ))}
          </ul>

          <div className="position-relative" style={{ minWidth: "260px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hub, address, code..."
              className="form-control form-control-sm ps-5 rounded-pill"
            />
            <Search className="w-4 h-4 text-muted position-absolute top-50 start-0 translate-middle-y ms-3 pointer-events-none" />
          </div>
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
        <div className="row g-4">
          {filteredLocations.map((hub) => (
            <div className="col-12 col-md-6 col-xl-4" key={hub.id}>
              <div className="card h-100 border pastel-card pastel-card-sky rounded-4 shadow-2xs overflow-hidden d-flex flex-column justify-content-between">
                <div className="p-4">
                  {/* Top Hub Card Header */}
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2.5">
                      <div className="avatar avatar-md rounded-3 bg-sky-100 text-sky-700 border border-sky-200 d-flex align-items-center justify-content-center fw-bold shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold text-dark">{hub.name}</h5>
                        <div className="d-flex align-items-center gap-1.5 text-xs text-muted mt-0.5">
                          <span className="fw-bold text-dark">{hub.city}</span>
                          <span>•</span>
                          <span className="badge bg-light border text-muted font-monospace text-[10.5px]">
                            {hub.slug}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(hub)}
                      title={hub.is_active ? "Click to deactivate" : "Click to activate"}
                      className={`badge rounded-pill border px-2.5 py-1 text-xs font-bold cursor-pointer transition-all ${
                        hub.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {hub.is_active ? "Active" : "Disabled"}
                    </button>
                  </div>

                  {/* Hub Address */}
                  <p className="text-muted small mb-3 lh-base" style={{ minHeight: "38px" }}>
                    {hub.address || "Address details not yet specified for this pickup location."}
                  </p>

                  {/* Symmetrical 2-Column Metrics */}
                  <div className="row g-2 pt-2 border-top border-sky-100">
                    <div className="col-6">
                      <div className="p-2.5 rounded-3 bg-white border border-sky-200/60 shadow-2xs">
                        <span className="text-muted text-[10px] fw-bold text-uppercase tracking-wider d-block">
                          Assigned Fleet
                        </span>
                        <div className="d-flex align-items-center gap-1.5 mt-0.5">
                          <Car className="w-3.5 h-3.5 text-purple-600" />
                          <span className="fw-bold text-dark fs-6">{hub._count.cars} Vehicles</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="p-2.5 rounded-3 bg-white border border-sky-200/60 shadow-2xs">
                        <span className="text-muted text-[10px] fw-bold text-uppercase tracking-wider d-block">
                          Reservations
                        </span>
                        <div className="d-flex align-items-center gap-1.5 mt-0.5">
                          <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="fw-bold text-dark fs-6">{hub._count.bookings} Trips</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 py-3 bg-light/70 border-top d-flex align-items-center justify-content-between">
                  <Link
                    href={`/admin/cars?location=${hub.id}`}
                    className="btn btn-sm btn-white border shadow-2xs text-muted hover:text-dark rounded-pill px-3 d-inline-flex align-items-center gap-1.5 text-xs font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>View Cars ({hub._count.cars})</span>
                  </Link>

                  <div className="d-flex align-items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(hub)}
                      className="btn btn-sm btn-white border shadow-2xs rounded-circle p-1.5 text-muted hover:text-dark"
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
                      className="btn btn-sm btn-white border shadow-2xs rounded-circle p-1.5 text-danger hover:bg-rose-50"
                      title="Remove Hub"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
        <form onSubmit={handleSaveSubmit} className="d-flex flex-column gap-3">
          {formError && (
            <div className="p-3 bg-danger-subtle border border-danger-subtle text-danger small rounded-3 font-medium">
              {formError}
            </div>
          )}

          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <label className="form-label fw-bold small text-dark mb-1">
                Regional City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Delhi NCR, Lucknow, Gurgaon"
                className="form-control form-control-sm"
              />
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label fw-bold small text-dark mb-1">
                Hub Display Title *
              </label>
              <input
                type="text"
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
                className="form-control form-control-sm"
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <label className="form-label fw-bold small text-dark mb-1">
                URL Identifier / Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. aerocity-hub"
                className="form-control form-control-sm font-monospace"
              />
            </div>

            <div className="col-12 col-sm-6">
              <label className="form-label fw-bold small text-dark mb-1">
                Display Sort Order
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="form-control form-control-sm"
              />
            </div>
          </div>

          <div>
            <label className="form-label fw-bold small text-dark mb-1">
              Physical Pickup Address
            </label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full landmark, airport terminal counter, or valet station address..."
              className="form-control form-control-sm"
            />
          </div>

          <div className="form-check form-switch pt-2">
            <input
              type="checkbox"
              id="isActiveSwitch"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="form-check-input"
            />
            <label htmlFor="isActiveSwitch" className="form-check-label fw-bold small text-dark">
              Hub is Operational &amp; Visible to Customers
            </label>
          </div>

          <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-sm btn-white border rounded-pill px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-sm btn-primary rounded-pill px-4"
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
          <div className="d-flex flex-column gap-3">
            {deleteError && (
              <div className="p-3 bg-danger-subtle border border-danger-subtle text-danger small rounded-3">
                {deleteError}
              </div>
            )}
            <p className="text-muted small mb-0">
              Deleting <strong>{deletingItem.name}</strong> will remove it from customer booking options.
              {deletingItem._count.cars > 0 && (
                <span className="text-danger d-block mt-2 font-medium">
                  Warning: {deletingItem._count.cars} vehicles are currently assigned to this hub. Reassign them before deleting.
                </span>
              )}
            </p>
            <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="btn btn-sm btn-white border rounded-pill px-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="btn btn-sm btn-danger rounded-pill px-3"
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
