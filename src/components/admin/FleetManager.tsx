"use client";

import React, { useState } from "react";
import {
  Car as CarIcon,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Fuel,
  Gauge,
  Users,
  ExternalLink,
  Search,
  Tag,
  Globe,
  Zap,
  Image as ImageIcon,
  Layers,
  Award,
  ShieldCheck,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminButton,
  AdminCard,
  AdminModal,
  AdminBadge,
  AdminEmptyState,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminCheckbox,
  AdminImageUpload,
} from "@/components/admin/ui";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Location {
  id: number;
  name: string;
  city: string;
  slug: string;
}

interface RentalPlan {
  id?: number;
  name: string;
  plan_type: string;
  free_km: number;
  price: number;
  extra_km_rate: number;
  security_deposit: number;
  duration_days: number;
}

interface CarData {
  id: number;
  name: string;
  slug: string;
  brand: string;
  category_id: number;
  category?: Category | null;
  location_id?: number | null;
  location?: Location | null;
  price_per_day: number | string;
  security_deposit?: number | string | null;
  transmission: string;
  seats: number;
  fuel_type: string;
  engine_hp?: number | null;
  primary_image: string;
  badge?: string | null;
  description?: string | null;
  is_available: boolean;
  rental_plans?: RentalPlan[];
}

interface FleetManagerProps {
  initialCars: CarData[];
  categories: Category[];
  locations: Location[];
}

interface FleetCarCardProps {
  car: CarData;
  onEdit: (car: CarData) => void;
  onDelete: (id: number, name: string) => void;
}

function FleetCarCard({ car, onEdit, onDelete }: FleetCarCardProps) {
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number>(0);

  const basePrice =
    typeof car.price_per_day === "string"
      ? parseFloat(car.price_per_day) || 2500
      : Number(car.price_per_day) || 2500;
  const deposit =
    typeof car.security_deposit === "string"
      ? parseFloat(car.security_deposit) || 5000
      : Number(car.security_deposit) || 5000;

  const fallbackPlans: RentalPlan[] = [
    {
      name: "300 km Package",
      plan_type: "km_package",
      free_km: 300,
      price: basePrice,
      extra_km_rate: 7,
      security_deposit: deposit,
      duration_days: 1,
    },
    {
      name: "450 km Package",
      plan_type: "km_package",
      free_km: 450,
      price: Math.round(basePrice * 1.2),
      extra_km_rate: 7,
      security_deposit: deposit,
      duration_days: 1,
    },
    {
      name: "600 km Package",
      plan_type: "km_package",
      free_km: 600,
      price: Math.round(basePrice * 1.5),
      extra_km_rate: 7,
      security_deposit: deposit,
      duration_days: 1,
    },
    {
      name: "Monthly Flat Package",
      plan_type: "monthly_plan",
      free_km: 5000,
      price: Math.round(basePrice * 16),
      extra_km_rate: 7,
      security_deposit: deposit,
      duration_days: 30,
    },
  ];

  const plans = car.rental_plans && car.rental_plans.length > 0 ? car.rental_plans : fallbackPlans;
  const currentPlan = plans[selectedPlanIdx] || plans[0] || fallbackPlans[0];

  return (
    <div
      className="card h-100 border overflow-hidden"
      
    >
      {/* Car Image Preview with Inset Luxury Framing */}
      <div className="position-relative overflow-hidden bg-light" style={{ height: "200px" }}>
        <img
          src={car.primary_image || "/assets/img/cars/1.jpg"}
          alt={car.name}
          className="w-100 h-100 object-fit-cover"
        />

        {/* Top Floating Badges */}
        <div className="position-absolute top-0 start-0 m-3 d-flex flex-wrap align-items-center gap-1.5">
          {car.location && (
            <span
              className="badge bg-white text-dark border shadow-sm rounded-pill d-inline-flex align-items-center gap-1 px-2.5 py-1"
              
            >
              <MapPin className="w-3 h-3 text-[#5955D1]" />
              <span>{car.location.city}</span>
            </span>
          )}
          {car.badge && (
            <span
              className="px-3 py-1 text-[10.5px] font-bold bg-[#0f172a]/85 text-[#f7d58b] border border-white/10 backdrop-blur-md shadow-xs tracking-wide"
              
            >
              {car.badge}
            </span>
          )}
        </div>

        {/* Top Right Status Badge */}
        <div className="position-absolute top-0 end-0 m-3">
          <span
            className={`px-3 py-1 text-[10.5px] font-bold backdrop-blur-md shadow-xs flex items-center gap-1.5 ${car.is_available
              ? "bg-emerald-600/90 text-white border border-emerald-400/30"
              : "bg-slate-700/85 text-slate-200 border border-white/10"
              }`}
            
          >
            {car.is_available && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
            <span>{car.is_available ? "Available" : "Inactive"}</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 pt-3.5 flex flex-col flex-grow space-y-3.5">
        {/* Brand, Category & Title */}
        <div>
          <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5955D1] block">
            {car.brand} • {car.category?.name || "Luxury"}
          </span>
          <h3
            className="font-heading text-[17.5px] font-extrabold text-[#1c274c] leading-snug mt-0.5 tracking-tight hover:text-[#5955D1] transition-colors truncate"
            title={car.name}
          >
            {car.name}
          </h3>
        </div>

        {/* Specs Row */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium py-2 border-y border-slate-100">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{car.seats} Seats</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{car.transmission}</span>
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{car.fuel_type}</span>
          </span>
        </div>

        {/* Price & Deposit Summary */}
        <div className="flex items-baseline justify-between pt-0.5">
          <div>
            <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider block">
              Daily Plan ({currentPlan.free_km >= 1000 ? `${currentPlan.free_km / 1000}k km` : `${currentPlan.free_km} km`})
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-[#1c274c] tracking-tight">
                ₹{Number(currentPlan.price).toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ day</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider block">
              Security Deposit
            </span>
            <span className="text-xs font-black text-[#5955D1] block mt-0.5">
              ₹{Number(deposit).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* KM Package Pills (Matching Homepage .modern-km-packages) */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
              KM Packages
            </span>
            <span className="text-[10.5px] font-semibold text-slate-500">
              Extra: <strong className="text-slate-700">₹{currentPlan.extra_km_rate || 7}/km</strong>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {plans.slice(0, 4).map((plan, idx) => {
              const isSelected = selectedPlanIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPlanIdx(idx)}
                  className={`btn btn-sm py-1 px-1 text-center w-100 ${isSelected ? "btn-primary" : "btn-light border text-muted"}`}
                  title={`${plan.free_km} km: ₹${Number(plan.price).toLocaleString("en-IN")}`}
                >
                  <span className="block text-[9.5px] font-bold leading-tight">
                    {plan.free_km >= 1000 ? `${plan.free_km / 1000}k km` : `${plan.free_km} km`}
                  </span>
                  <span
                    className={`block text-[11px] font-extrabold mt-0.5 leading-tight ${isSelected ? "text-[#f7d58b]" : "text-[#1c274c]"
                      }`}
                  >
                    ₹{plan.price >= 10000 ? `${Math.round(plan.price / 1000)}k` : Number(plan.price).toLocaleString("en-IN")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 mt-auto border-t border-slate-100 flex items-center gap-2">
          <AdminButton
            variant="secondary"
            size="sm"
            className="flex-1 justify-center shadow-sm"
            icon={<Edit2 className="w-3.5 h-3.5 text-[#5955D1]" />}
            onClick={() => onEdit(car)}
          >
            Edit Vehicle
          </AdminButton>

          <a
            href={`/cars/${car.slug || car.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-3 rounded-full border border-[#e8edf2] hover:border-[#5955D1] bg-white hover:bg-[#eeedfc] text-slate-600 hover:text-[#5955D1] text-xs font-bold flex items-center gap-1.5 transition-all duration-200 shadow-sm shrink-0 cursor-pointer"
            
            title="Preview on public website"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Live</span>
          </a>

          <AdminButton
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => onDelete(car.id, car.name)}
            aria-label={`Delete ${car.name}`}
            className="!px-2.5 shrink-0"
          />
        </div>
      </div>
    </div>
  );
}

export default function FleetManager({
  initialCars,
  categories,
  locations,
}: FleetManagerProps) {
  const [cars, setCars] = useState<CarData[]>(initialCars);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number>(categories[0]?.id || 1);
  const [formLocationId, setFormLocationId] = useState<number>(locations[0]?.id || 1);
  const [formPricePerDay, setFormPricePerDay] = useState("2500");
  const [formSecurityDeposit, setFormSecurityDeposit] = useState("5000");
  const [formTransmission, setFormTransmission] = useState("Automatic");
  const [formSeats, setFormSeats] = useState("5");
  const [formFuelType, setFormFuelType] = useState("Petrol");
  const [formEngineHp, setFormEngineHp] = useState("110");
  const [formImage, setFormImage] = useState("/assets/img/cars/1.jpg");
  const [formBadge, setFormBadge] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  // KM Plans State
  const [plan300Price, setPlan300Price] = useState("2500");
  const [plan450Price, setPlan450Price] = useState("3000");
  const [plan600Price, setPlan600Price] = useState("3750");
  const [planMonthlyPrice, setPlanMonthlyPrice] = useState("40000");

  const openAddModal = () => {
    setEditingCar(null);
    setFormName("");
    setFormSlug("");
    setFormBrand("");
    setFormCategoryId(categories[0]?.id || 1);
    setFormLocationId(locations[0]?.id || 1);
    setFormPricePerDay("2500");
    setFormSecurityDeposit("5000");
    setFormTransmission("Automatic");
    setFormSeats("5");
    setFormFuelType("Petrol");
    setFormEngineHp("110");
    setFormImage("/assets/img/cars/1.jpg");
    setFormBadge("");
    setFormDescription("");
    setFormIsAvailable(true);

    setPlan300Price("2500");
    setPlan450Price("3000");
    setPlan600Price("3750");
    setPlanMonthlyPrice("40000");

    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (car: CarData) => {
    setEditingCar(car);
    setFormName(car.name);
    setFormSlug(car.slug);
    setFormBrand(car.brand);
    setFormCategoryId(car.category_id);
    setFormLocationId(car.location_id || locations[0]?.id || 1);
    setFormPricePerDay(String(car.price_per_day));
    setFormSecurityDeposit(String(car.security_deposit || 5000));
    setFormTransmission(car.transmission);
    setFormSeats(String(car.seats));
    setFormFuelType(car.fuel_type);
    setFormEngineHp(String(car.engine_hp || 90));
    setFormImage(car.primary_image);
    setFormBadge(car.badge || "");
    setFormDescription(car.description || "");
    setFormIsAvailable(car.is_available);

    // Populate plans from existing car
    const p300 = car.rental_plans?.find((p) => p.free_km === 300);
    const p450 = car.rental_plans?.find((p) => p.free_km === 450);
    const p600 = car.rental_plans?.find((p) => p.free_km === 600);
    const pMonthly = car.rental_plans?.find((p) => p.free_km === 5000);

    setPlan300Price(String(p300?.price || car.price_per_day || "2500"));
    setPlan450Price(String(p450?.price || Math.round(Number(car.price_per_day) * 1.2) || "3000"));
    setPlan600Price(String(p600?.price || Math.round(Number(car.price_per_day) * 1.5) || "3750"));
    setPlanMonthlyPrice(String(pMonthly?.price || "40000"));

    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Auto-generate slug from name + location
  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingCar) {
      const loc = locations.find((l) => l.id === formLocationId);
      const locSlug = loc ? `-${loc.slug}` : "";
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormSlug(`${baseSlug}${locSlug}`);
    }
  };

  const handleBasePriceChange = (priceStr: string) => {
    setFormPricePerDay(priceStr);
    const p = parseFloat(priceStr) || 0;
    if (!editingCar) {
      setPlan300Price(String(p));
      setPlan450Price(String(Math.round(p * 1.2)));
      setPlan600Price(String(Math.round(p * 1.5)));
      setPlanMonthlyPrice(String(Math.round(p * 16)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const deposit = parseFloat(formSecurityDeposit) || 5000;

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      brand: formBrand.trim(),
      category_id: formCategoryId,
      location_id: formLocationId,
      price_per_day: parseFloat(formPricePerDay),
      security_deposit: deposit,
      transmission: formTransmission,
      seats: parseInt(formSeats, 10),
      fuel_type: formFuelType,
      engine_hp: parseInt(formEngineHp, 10) || 90,
      primary_image: formImage.trim(),
      badge: formBadge.trim() || null,
      description: formDescription.trim() || null,
      is_available: formIsAvailable,
      rental_plans: [
        {
          name: "300 km Package",
          plan_type: "km_package",
          free_km: 300,
          price: parseFloat(plan300Price),
          extra_km_rate: 7,
          security_deposit: deposit,
          duration_days: 1,
        },
        {
          name: "450 km Package",
          plan_type: "km_package",
          free_km: 450,
          price: parseFloat(plan450Price),
          extra_km_rate: 7,
          security_deposit: deposit,
          duration_days: 1,
        },
        {
          name: "600 km Package",
          plan_type: "km_package",
          free_km: 600,
          price: parseFloat(plan600Price),
          extra_km_rate: 7,
          security_deposit: deposit,
          duration_days: 1,
        },
        {
          name: "Monthly (5,000 km)",
          plan_type: "monthly",
          free_km: 5000,
          price: parseFloat(planMonthlyPrice),
          extra_km_rate: 7,
          security_deposit: deposit,
          duration_days: 30,
        },
      ],
    };

    try {
      const url = editingCar
        ? `/api/v1/admin/cars/${editingCar.id}`
        : "/api/v1/admin/cars";
      const method = editingCar ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.error || "Failed to save vehicle.");
        setIsSubmitting(false);
        return;
      }

      // Refresh list
      const updatedRes = await fetch("/api/v1/admin/cars");
      const updatedData = await updatedRes.json();
      if (updatedData.success && Array.isArray(updatedData.data)) {
        setCars(updatedData.data);
      }

      setIsModalOpen(false);
      setIsSubmitting(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Network error occurred.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (carId: number, carName: string) => {
    if (!confirm(`Are you sure you want to remove '${carName}' from the active fleet?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/cars/${carId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCars((prev) => prev.filter((c) => c.id !== carId));
      } else {
        alert(json.error || "Failed to delete vehicle.");
      }
    } catch (err: any) {
      alert(err.message || "Network error.");
    }
  };

  const filteredCars = cars.filter((c) => {
    if (selectedLocationFilter !== "all" && c.location_id !== parseInt(selectedLocationFilter, 10)) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = c.name?.toLowerCase().includes(q);
    const brandMatch = c.brand?.toLowerCase().includes(q);
    const catMatch = c.category?.name?.toLowerCase().includes(q);
    const fuelMatch = c.fuel_type?.toLowerCase().includes(q);
    const cityMatch = c.location?.city?.toLowerCase().includes(q);
    const badgeMatch = c.badge?.toLowerCase().includes(q);
    return Boolean(nameMatch || brandMatch || catMatch || fuelMatch || cityMatch || badgeMatch);
  });

  return (
    <PageContainer>
      {/* Canonical Page Header with Short, Compact Title */}
      <PageHeader
        eyebrow="Fleet"
        title="Fleet Inventory"
        description="Configure multi-city luxury inventory, KM rental tiers, and vehicle availability."
        icon={<CarIcon className="w-5 h-5" />}
        actions={
          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Location Filter Pills Container */}
            <ul className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0" role="tablist">
              <li className="nav-item">
                <button
                  type="button"
                  onClick={() => setSelectedLocationFilter("all")}
                  className={`nav-link rounded-pill ${selectedLocationFilter === "all" ? "active" : ""}`}
                >
                  All Hubs ({cars.length})
                </button>
              </li>
              {locations.map((loc) => {
                const count = cars.filter((c) => c.location_id === loc.id).length;
                return (
                  <li className="nav-item" key={loc.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedLocationFilter(String(loc.id))}
                      className={`nav-link rounded-pill d-inline-flex align-items-center gap-1 ${selectedLocationFilter === String(loc.id) ? "active" : ""}`}
                    >
                      <MapPin className="w-3 h-3 text-primary" />
                      <span>{loc.city} ({count})</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Instant Model & Brand Search Bar */}
            <div className="position-relative" style={{ minWidth: "220px" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search model, brand, hub..."
                className="form-control form-control-sm ps-5"
              />
              <Search className="w-4 h-4 text-muted position-absolute top-50 start-0 translate-middle-y ms-2.5 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y p-0 me-2 text-muted"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5"
              onClick={openAddModal}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>
        }
      />

      {searchQuery && (
        <div className="text-xs text-slate-500 font-medium px-1 flex items-center justify-between py-1">
          <span>Showing <strong>{filteredCars.length}</strong> of <strong>{cars.length}</strong> vehicles matching &ldquo;{searchQuery}&rdquo;</span>
          <button
            onClick={() => setSearchQuery("")}
            className="text-[#5955D1] hover:underline font-bold cursor-pointer"
          >
            Reset Search
          </button>
        </div>
      )}

      {/* Grid of Cars or Canonical Empty State */}
      {filteredCars.length === 0 ? (
        <AdminEmptyState
          icon={<CarIcon className="w-8 h-8 text-[#5955D1]" />}
          title={searchQuery ? "No Vehicles Match Your Search" : "No Vehicles Found in this Hub"}
          description={
            searchQuery
              ? `No vehicles found matching "${searchQuery}". Try searching by another model, brand, or location.`
              : "There are currently no luxury vehicles allocated to this operational hub."
          }
          action={
            searchQuery ? (
              <AdminButton
                variant="secondary"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Reset Search
              </AdminButton>
            ) : (
              <AdminButton
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={openAddModal}
              >
                Add Vehicle to Hub
              </AdminButton>
            )
          }
        />
      ) : (
        <div className="row g-4 mt-1">
          {filteredCars.map((car) => (
            <div className="col-12 col-md-6 col-xl-4" key={car.id}>
              <FleetCarCard
                car={car}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Luxury Vehicle Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCar ? `Edit ${editingCar.name}` : "Add New Luxury Vehicle"}
        subtitle="Configure vehicle specifications, operational hub placement, and KM pricing tiers."
        size="xl"
      >
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Identity & Categorization */}
          <div className="p-5 rounded-3 bg-[#fafbfc] border border-[#e8edf2] space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#e8edf2]/80">
              <span className="w-5 h-5 rounded-full bg-[#1c274c] text-[#f7d58b] flex items-center justify-center text-[10.5px] font-mono font-bold">1</span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1c274c]">Vehicle Identity & Placement</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <AdminInput
                label="Car Model Name"
                required
                icon={<CarIcon className="w-3.5 h-3.5" />}
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Toyota Fortuner 4x4"
              />
              <AdminInput
                label="Brand / Manufacturer"
                required
                icon={<Tag className="w-3.5 h-3.5" />}
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                placeholder="e.g. Toyota"
              />
              <AdminInput
                label="Public URL Slug"
                required
                icon={<Globe className="w-3.5 h-3.5" />}
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="e.g. toyota-fortuner-delhi"
                className="font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <AdminSelect
                label="Fleet Category"
                required
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(parseInt(e.target.value, 10))}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </AdminSelect>

              <AdminSelect
                label="Assigned Location Hub"
                required
                value={formLocationId}
                onChange={(e) => setFormLocationId(parseInt(e.target.value, 10))}
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.city})
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>

          {/* SECTION 2: Technical Specifications */}
          <div className="p-5 rounded-3 bg-[#fafbfc] border border-[#e8edf2] space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#e8edf2]/80">
              <span className="w-5 h-5 rounded-full bg-[#1c274c] text-[#f7d58b] flex items-center justify-center text-[10.5px] font-mono font-bold">2</span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1c274c]">Engineering & Drivetrain Specifications</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <AdminInput
                label="Seating Capacity"
                type="number"
                min="2"
                max="10"
                required
                icon={<Users className="w-3.5 h-3.5" />}
                suffixAddon="Seats"
                value={formSeats}
                onChange={(e) => setFormSeats(e.target.value)}
              />

              <AdminSelect
                label="Transmission"
                value={formTransmission}
                onChange={(e) => setFormTransmission(e.target.value)}
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </AdminSelect>

              <AdminSelect
                label="Fuel Type"
                value={formFuelType}
                onChange={(e) => setFormFuelType(e.target.value)}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </AdminSelect>

              <AdminInput
                label="Engine Output"
                type="number"
                icon={<Zap className="w-3.5 h-3.5" />}
                suffixAddon="HP"
                value={formEngineHp}
                onChange={(e) => setFormEngineHp(e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 3: Visual Showcase & Fleet Availability with Live Card Preview */}
          <div className="p-5 rounded-3 bg-[#fafbfc] border border-[#e8edf2] space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#e8edf2]/80">
              <span className="w-5 h-5 rounded-full bg-[#1c274c] text-[#f7d58b] flex items-center justify-center text-[10.5px] font-mono font-bold">3</span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1c274c]">Visual Identity &amp; Fleet Status</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-3.5">
                <AdminImageUpload
                  label="Primary Vehicle Image"
                  required
                  value={formImage}
                  onChange={(url) => setFormImage(url)}
                  folder="cars"
                  helperText="Upload vehicle photo or click 'Enter Image URL' for custom link. Auto-displays in preview."
                />

                <AdminInput
                  label="Promotion / Feature Badge"
                  icon={<Award className="w-3.5 h-3.5" />}
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="e.g. Flagship 4x4, Popular Choice, VIP"
                  helperText="Optional badge displayed in upper corner on website."
                />

                {/* Status Toggle Card */}
                <div className="p-3.5 rounded-xl border border-[#e8edf2] bg-white flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${formIsAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    <div>
                      <div className="text-xs font-bold text-[#1c274c]">
                        {formIsAvailable ? "Active in Fleet (Publicly Bookable)" : "Inactive / Maintenance (Hidden)"}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {formIsAvailable ? "Vehicle is visible on web & mobile rental catalogs." : "Vehicle will not accept customer booking dates."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsAvailable(!formIsAvailable)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formIsAvailable ? "bg-[#5955D1]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        formIsAvailable ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Live Mini Preview (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-[#e8edf2] rounded-3 p-3 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>Live Card Preview</span>
                  <Eye className="w-3.5 h-3.5 text-[#5955D1]" />
                </div>
                <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-100 relative">
                  <img
                    src={formImage || "/assets/img/cars/1.jpg"}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/img/cars/1.jpg";
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/95 text-slate-800 border border-[#e8edf2] shadow-sm flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#5955D1]" />
                      <span>{locations.find((l) => l.id === formLocationId)?.city || "Delhi"}</span>
                    </span>
                    {formBadge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#1c274c]/85 text-[#f7d58b] border border-white/10 shadow-sm">
                        {formBadge}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-sm ${formIsAvailable ? "bg-emerald-600" : "bg-slate-700"}`}>
                      {formIsAvailable ? "Available" : "Offline"}
                    </span>
                  </div>
                </div>
                <div className="px-1 pt-1">
                  <div className="text-[10px] uppercase font-bold text-[#5955D1]">
                    {formBrand || "Brand"} • {categories.find((c) => c.id === formCategoryId)?.name || "Luxury"}
                  </div>
                  <div className="text-xs font-bold text-[#1c274c] truncate">
                    {formName || "Vehicle Model Name"}
                  </div>
                  <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-100 text-[11px]">
                    <span className="font-extrabold text-[#1c274c]">₹{Number(plan300Price || 2500).toLocaleString("en-IN")}<span className="text-[9.5px] text-slate-400 font-normal">/day</span></span>
                    <span className="text-[10px] text-[#5955D1] font-bold">Dep: ₹{Number(formSecurityDeposit || 5000).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: KM Rental Packages & Security Deposit */}
          <div className="p-5 rounded-3 bg-[#fafbfc] border border-[#e8edf2] space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#e8edf2]/80">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1c274c] text-[#f7d58b] flex items-center justify-center text-[10.5px] font-mono font-bold">4</span>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1c274c]">KM Rental Packages &amp; Security Deposit</h4>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-600">Security Deposit:</label>
                <div className="flex items-center h-8.5 w-32 rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:border-[#5955D1] focus-within:ring-2 focus-within:ring-[#5955D1]/20 shadow-sm">
                  <span className="h-full px-2.5 bg-slate-50 border-r border-[#e8edf2] text-xs font-extrabold text-[#5955D1] flex items-center justify-center shrink-0 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formSecurityDeposit}
                    onChange={(e) => setFormSecurityDeposit(e.target.value)}
                    className="w-full h-full px-2 bg-transparent border-none outline-none text-xs font-bold text-[#1c274c]"
                  />
                </div>
              </div>
            </div>

            {/* 4 Interactive Luxury Pricing Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Plan 1: 300 km */}
              <div className="p-3.5 rounded-xl border border-[#5955D1]/30 bg-[#eeedfc]/50 hover:bg-[#eeedfc] transition-colors shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#5955D1]">300 KM Package</span>
                  <span className="text-[9.5px] font-bold text-slate-500 bg-white/80 px-1.5 py-0.5 rounded">1 Day</span>
                </div>
                <div className="flex items-center h-10 rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:border-[#5955D1] focus-within:ring-2 focus-within:ring-[#5955D1]/20 shadow-sm">
                  <span className="h-full px-3 bg-slate-50 border-r border-[#e8edf2] text-sm font-extrabold text-[#5955D1] flex items-center justify-center shrink-0 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={plan300Price}
                    onChange={(e) => handleBasePriceChange(e.target.value)}
                    className="w-full h-full px-2.5 bg-transparent border-none outline-none text-sm font-black text-[#1c274c]"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-[#5955D1]/20">
                  <span>Extra KM:</span>
                  <span className="font-bold text-[#1c274c]">₹7 / km</span>
                </div>
              </div>

              {/* Plan 2: 450 km */}
              <div className="p-3.5 rounded-xl border border-[#e8edf2] bg-white hover:border-[#5955D1]/40 transition-colors shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700">450 KM Package</span>
                  <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">1 Day</span>
                </div>
                <div className="flex items-center h-10 rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:border-[#5955D1] focus-within:ring-2 focus-within:ring-[#5955D1]/20 shadow-sm">
                  <span className="h-full px-3 bg-slate-50 border-r border-[#e8edf2] text-sm font-extrabold text-[#5955D1] flex items-center justify-center shrink-0 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={plan450Price}
                    onChange={(e) => setPlan450Price(e.target.value)}
                    className="w-full h-full px-2.5 bg-transparent border-none outline-none text-sm font-black text-[#1c274c]"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Extra KM:</span>
                  <span className="font-bold text-[#1c274c]">₹7 / km</span>
                </div>
              </div>

              {/* Plan 3: 600 km */}
              <div className="p-3.5 rounded-xl border border-[#e8edf2] bg-white hover:border-[#5955D1]/40 transition-colors shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700">600 KM Package</span>
                  <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">1 Day</span>
                </div>
                <div className="flex items-center h-10 rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:border-[#5955D1] focus-within:ring-2 focus-within:ring-[#5955D1]/20 shadow-sm">
                  <span className="h-full px-3 bg-slate-50 border-r border-[#e8edf2] text-sm font-extrabold text-[#5955D1] flex items-center justify-center shrink-0 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={plan600Price}
                    onChange={(e) => setPlan600Price(e.target.value)}
                    className="w-full h-full px-2.5 bg-transparent border-none outline-none text-sm font-black text-[#1c274c]"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Extra KM:</span>
                  <span className="font-bold text-[#1c274c]">₹7 / km</span>
                </div>
              </div>

              {/* Plan 4: Monthly 5,000 km */}
              <div className="p-3.5 rounded-xl border border-[#e8edf2] bg-white hover:border-[#5955D1]/40 transition-colors shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700">Monthly Plan</span>
                  <span className="text-[9.5px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">30 Days</span>
                </div>
                <div className="flex items-center h-10 rounded-lg border border-slate-300 bg-white overflow-hidden focus-within:border-[#5955D1] focus-within:ring-2 focus-within:ring-[#5955D1]/20 shadow-sm">
                  <span className="h-full px-3 bg-slate-50 border-r border-[#e8edf2] text-sm font-extrabold text-[#5955D1] flex items-center justify-center shrink-0 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    value={planMonthlyPrice}
                    onChange={(e) => setPlanMonthlyPrice(e.target.value)}
                    className="w-full h-full px-2.5 bg-transparent border-none outline-none text-sm font-black text-[#1c274c]"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Limit:</span>
                  <span className="font-bold text-[#1c274c]">5,000 km</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Vehicle Overview & Policies */}
          <div className="p-5 rounded-3 bg-[#fafbfc] border border-[#e8edf2] space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#e8edf2]/80">
              <span className="w-5 h-5 rounded-full bg-[#1c274c] text-[#f7d58b] flex items-center justify-center text-[10.5px] font-mono font-bold">5</span>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1c274c]">Vehicle Overview &amp; Policies</h4>
            </div>
            <AdminTextarea
              label="Vehicle Description & Rental Policy"
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Outline luxury trim features, sound system, leather seating, and chauffeured guidelines..."
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <AdminButton
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {editingCar ? "Save Changes" : "Create Vehicle & KM Plans"}
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </PageContainer>
  );
}
