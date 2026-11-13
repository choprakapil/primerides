"use client";

import React, { useState } from "react";
import {
  Car as CarIcon,
  Copy,
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
import TrendArrowBadge from "./ui/TrendArrowBadge";

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
  fleet_count?: number;
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
  onPublishToHub: (car: CarData) => void;
}

function FleetCarCard({ car, onEdit, onDelete, onPublishToHub }: FleetCarCardProps) {
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
    <div className="group h-full bg-white rounded-3xl border border-slate-300 shadow-sm hover:border-[#c59b27]/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top subtle golden glow accent on hover */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#c59b27] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0" />

      {/* Car Image Preview with Inset Luxury Framing & Vignette */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-950">
        <img
          src={car.primary_image || "/assets/img/cars/1.jpg"}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Subtle Luxury Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {car.location && (
            <span className="backdrop-blur-md bg-white/95 text-slate-800 border border-slate-200/70 shadow-xs rounded-full px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#c59b27]" />
              <span>{car.location.city}</span>
            </span>
          )}
          <span
            className="backdrop-blur-md bg-white/95 text-slate-800 border border-slate-200/70 shadow-xs rounded-full px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1"
            title="Total fleet quantity deployed at this hub"
          >
            <Layers className="w-3 h-3 text-[#c59b27]" />
            <span>{car.fleet_count || 1} Units</span>
          </span>
          {car.badge && (
            <span className="backdrop-blur-md bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-full px-2.5 py-1 shadow-xs border border-amber-300/40">
              {car.badge}
            </span>
          )}
        </div>

        {/* Top Right Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs inline-flex items-center gap-1.5 ${
              car.is_available
                ? "bg-emerald-600 text-white border border-emerald-400/40"
                : "bg-slate-900/85 text-slate-300 border border-white/20"
            }`}
          >
            {car.is_available && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
            <span>{car.is_available ? "Available" : "Inactive"}</span>
          </span>
        </div>

        {/* Bottom Image Watermark Trim */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white pointer-events-none">
          <span className="text-[10.5px] font-black uppercase tracking-widest text-[#f7d58b] drop-shadow-md">
            {car.brand} &bull; {car.category?.name || "Luxury"}
          </span>
          {car.engine_hp ? (
            <span className="backdrop-blur-md bg-black/60 text-white/90 border border-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
              {car.engine_hp} HP
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 gap-3.5">
        {/* Car Title */}
        <div>
          <h3
            className="font-heading text-xl font-black text-[#1c274c] leading-snug tracking-tight group-hover:text-[#c59b27] transition-colors truncate"
            title={car.name}
          >
            {car.name}
          </h3>
        </div>

        {/* Specs Bar: Full text visible, zero truncation, spacious and clean */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-semibold whitespace-nowrap">
            <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{car.seats} Seats</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-semibold whitespace-nowrap">
            <Gauge className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{car.transmission}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-semibold whitespace-nowrap">
            <Fuel className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{car.fuel_type}</span>
          </div>
        </div>

        {/* Elevated Rate & Security Deposit Box */}
        <div className="bg-gradient-to-br from-slate-50 via-white to-amber-50/30 rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#c59b27] shrink-0" />
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider truncate">
                DAILY TIER ({currentPlan.free_km >= 1000 ? `${currentPlan.free_km / 1000}k KM` : `${currentPlan.free_km} KM`})
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5 whitespace-nowrap">
              <span className="text-2xl font-black text-[#1c274c] tracking-tight font-heading">
                ₹{Number(currentPlan.price).toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-400 font-bold whitespace-nowrap">/ day</span>
            </div>
          </div>

          <div className="text-right border-l border-slate-200/80 pl-3.5 shrink-0">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
              SECURITY DEPOSIT
            </span>
            <div className="mt-0.5">
              <span className="text-base font-black text-[#c59b27] font-heading block">
                ₹{Number(deposit).toLocaleString("en-IN")}
              </span>
              <span className="text-[9.5px] font-bold text-emerald-600 inline-flex items-center gap-0.5 whitespace-nowrap">
                <Check className="w-2.5 h-2.5 shrink-0" /> 100% Refundable
              </span>
            </div>
          </div>
        </div>

        {/* KM Packages Interactive Selector */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#c59b27]" />
              KM Rental Packages
            </span>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md">
              Extra: <strong className="text-[#1c274c]">₹{currentPlan.extra_km_rate || 7}/km</strong>
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
                  className={`py-2 px-1 text-center rounded-xl transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#1c274c] text-white shadow-md ring-2 ring-[#c59b27]"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                  }`}
                  title={`${plan.free_km} km: ₹${Number(plan.price).toLocaleString("en-IN")}`}
                >
                  <span className={`block text-[10px] font-bold leading-tight ${isSelected ? "text-amber-200" : "text-slate-500"}`}>
                    {plan.free_km >= 1000 ? `${plan.free_km / 1000}k km` : `${plan.free_km} km`}
                  </span>
                  <span className={`block text-xs font-black mt-0.5 leading-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                    ₹{plan.price >= 10000 ? `${Math.round(plan.price / 1000)}k` : Number(plan.price).toLocaleString("en-IN")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Footer Actions - Fully visible, responsive, zero clipping */}
        <div className="pt-3.5 mt-auto border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(car)}
            className="flex-1 h-10 bg-gradient-to-r from-[#1c274c] to-[#253360] hover:from-[#111827] hover:to-[#1c274c] text-white text-xs font-bold px-3.5 rounded-xl shadow-xs hover:shadow transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer min-w-0"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#f7d58b] shrink-0" />
            <span className="truncate">Edit Vehicle</span>
          </button>

          <button
            type="button"
            onClick={() => onPublishToHub(car)}
            title="Deploy instance to another regional hub"
            aria-label="Deploy to another regional hub"
            className="w-10 h-10 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/80 text-slate-700 hover:text-indigo-600 flex items-center justify-center transition-all duration-200 shadow-2xs shrink-0 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            <span className="sr-only">Hub</span>
          </button>

          <a
            href={`/cars/${car.slug || car.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview on public live website"
            aria-label="Preview on live website"
            className="w-10 h-10 rounded-xl border border-slate-200 hover:border-[#c59b27] bg-white hover:bg-amber-50/80 text-slate-700 hover:text-[#c59b27] flex items-center justify-center transition-all duration-200 shadow-2xs shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#c59b27]" />
            <span className="sr-only">Live</span>
          </a>

          <button
            type="button"
            onClick={() => onDelete(car.id, car.name)}
            aria-label={`Delete ${car.name}`}
            title={`Remove ${car.name}`}
            className="w-10 h-10 rounded-xl border border-red-200 hover:border-red-400 bg-red-50/80 hover:bg-red-500 text-red-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Multi-Hub Publishing / Cloning State
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloningCar, setCloningCar] = useState<CarData | null>(null);
  const [targetHubId, setTargetHubId] = useState<number>(locations[0]?.id || 1);
  const [targetFleetCount, setTargetFleetCount] = useState<string>("1");
  const [isCloning, setIsCloning] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [formFleetCount, setFormFleetCount] = useState("1");

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
    setFormFleetCount("1");

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
    setFormFleetCount(String(car.fleet_count || 1));

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
      fleet_count: parseInt(formFleetCount, 10) || 1,
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

    const handlePublishToHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloningCar) return;

    setIsCloning(true);
    setCloneError(null);

    try {
      const targetLoc = locations.find((l) => l.id === targetHubId);
      const locSlug = targetLoc?.slug || `hub-${targetHubId}`;
      const baseSlug = cloningCar.slug.replace(/-(delhi-ncr|delhi|gurgaon|lucknow|noida|airport)$/i, "");
      const newSlug = `${baseSlug}-${locSlug}`;

      const payload = {
        name: cloningCar.name,
        slug: newSlug,
        brand: cloningCar.brand,
        category_id: cloningCar.category_id,
        location_id: targetHubId,
        fleet_count: parseInt(targetFleetCount, 10) || 1,
        price_per_day: cloningCar.price_per_day,
        security_deposit: cloningCar.security_deposit || 5000,
        transmission: cloningCar.transmission,
        seats: cloningCar.seats,
        fuel_type: cloningCar.fuel_type,
        engine_hp: cloningCar.engine_hp || 90,
        primary_image: cloningCar.primary_image,
        badge: cloningCar.badge || null,
        description: cloningCar.description || null,
        is_available: true,
        rental_plans: cloningCar.rental_plans && cloningCar.rental_plans.length > 0 ? cloningCar.rental_plans : undefined,
      };

      const res = await fetch("/api/v1/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to publish vehicle to target hub.");
      }

      // Refresh fleet
      const updatedRes = await fetch("/api/v1/admin/cars");
      const updatedData = await updatedRes.json();
      if (updatedData.success && Array.isArray(updatedData.data)) {
        setCars(updatedData.data);
      }

      setIsCloneModalOpen(false);
      setCloningCar(null);
    } catch (err: any) {
      setCloneError(err.message || "Network error.");
    } finally {
      setIsCloning(false);
    }
  };

  // Real-time Fleet Telemetry Stats (Matching Dashboard KPI cards)
  const totalFleetUnits = cars.reduce((acc, c) => acc + (c.fleet_count || 1), 0);
  const availableCars = cars.filter((c) => c.is_available).length;
  const activeHubs = locations.length;
  const avgDailyRate = cars.length > 0
    ? Math.round(cars.reduce((acc, c) => acc + (Number(c.price_per_day) || 2500), 0) / cars.length)
    : 2500;

  const filteredCars = cars.filter((c) => {
    if (selectedLocationFilter !== "all" && c.location_id !== parseInt(selectedLocationFilter, 10)) {
      return false;
    }
    if (statusFilter === "available" && !c.is_available) return false;
    if (statusFilter === "inactive" && c.is_available) return false;
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
      {/* Canonical Page Header */}
      <PageHeader
        eyebrow="Fleet Operations"
        title="Fleet Inventory & Hubs"
        description="Configure multi-city luxury inventory, KM rental tiers, and vehicle availability."
        icon={<CarIcon className="w-5 h-5 text-[#c59b27]" />}
        actions={
          <AdminButton
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={openAddModal}
          >
            Add Luxury Vehicle
          </AdminButton>
        }
      />

      {/* ── KPI Metric Strip (Matching Dashboard Theme) ──────────────── */}
      <div className="dash-kpi-grid mb-5">
        <div className="dash-kpi-card kpi-card-purple">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon kpi-icon-purple">
              <CarIcon className="w-5 h-5" />
            </div>
            <TrendArrowBadge value={`${cars.length} Models`} period="active" pastelTheme="lavender" />
          </div>
          <div className="dash-kpi-label">Active Fleet Models</div>
          <div className="dash-kpi-value">{totalFleetUnits} Units</div>
          <div className="dash-kpi-sub">Across all regional operational hubs</div>
        </div>

        <div className="dash-kpi-card kpi-card-emerald">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon kpi-icon-emerald">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <TrendArrowBadge value={`${Math.round((availableCars / (cars.length || 1)) * 100)}%`} period="ready" pastelTheme="mint" />
          </div>
          <div className="dash-kpi-label">Available for Booking</div>
          <div className="dash-kpi-value">{availableCars} Vehicles</div>
          <div className="dash-kpi-sub">Instant reservation ready on live catalog</div>
        </div>

        <div className="dash-kpi-card kpi-card-sky">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon kpi-icon-sky">
              <MapPin className="w-5 h-5" />
            </div>
            <TrendArrowBadge value="Multi-Hub" period="active" pastelTheme="sky" />
          </div>
          <div className="dash-kpi-label">Operational Hubs</div>
          <div className="dash-kpi-value">{activeHubs} Cities</div>
          <div className="dash-kpi-sub">{locations.map((l) => l.city).join(" & ")} networks</div>
        </div>

        <div className="dash-kpi-card kpi-card-amber">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon kpi-icon-amber">
              <Sparkles className="w-5 h-5" />
            </div>
            <TrendArrowBadge value="Base Tier" period="avg" pastelTheme="peach" />
          </div>
          <div className="dash-kpi-label">Average Daily Rental</div>
          <div className="dash-kpi-value">₹{avgDailyRate.toLocaleString("en-IN")}</div>
          <div className="dash-kpi-sub">Starting daily plan benchmark</div>
        </div>
      </div>

      {/* ── Luxury Filter & Search Toolbar (Matching Dashboard Design) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Hub Filter Tabs & Status Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hub Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/60">
            <button
              type="button"
              onClick={() => setSelectedLocationFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                selectedLocationFilter === "all"
                  ? "bg-[#1c274c] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Hubs ({cars.length})
            </button>
            {locations.map((loc) => {
              const count = cars.filter((c) => c.location_id === loc.id).length;
              const isSelected = selectedLocationFilter === String(loc.id);
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedLocationFilter(String(loc.id))}
                  className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#1c274c] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? "text-[#f7d58b]" : "text-[#c59b27]"}`} />
                  <span>{loc.city} ({count})</span>
                </button>
              );
            })}
          </div>

          {/* Status Quick Toggle */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/60">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("available")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer inline-flex items-center gap-1 ${
                statusFilter === "available"
                  ? "bg-emerald-500 text-white shadow-2xs"
                  : "text-emerald-700 hover:text-emerald-900"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Available ({availableCars})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                statusFilter === "inactive"
                  ? "bg-slate-700 text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Inactive ({cars.length - availableCars})
            </button>
          </div>
        </div>

        {/* Right side: Search Bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-search-fleet"
              name="admin-search-fleet"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, brand, hub..."
              aria-label="Search fleet by model, brand, or hub"
              className="w-full h-9 pl-9 pr-8 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#c59b27] focus:ring-2 focus:ring-[#c59b27]/20 outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className="text-xs text-slate-500 font-medium px-1 flex items-center justify-between py-1 mb-2">
          <span>Showing <strong>{filteredCars.length}</strong> of <strong>{cars.length}</strong> vehicles matching &ldquo;{searchQuery}&rdquo;</span>
          <button
            onClick={() => setSearchQuery("")}
            className="text-[#c59b27] hover:underline font-bold cursor-pointer"
          >
            Reset Search
          </button>
        </div>
      )}

      {/* Grid of Cars or Canonical Empty State */}
      {filteredCars.length === 0 ? (
        <AdminEmptyState
          icon={<CarIcon className="w-8 h-8 text-[#c59b27]" />}
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
        <div className="row g-4 mt-0">
          {filteredCars.map((car) => (
            <div className="col-12 col-lg-6 col-xl-4" key={car.id}>
              <FleetCarCard
                car={car}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onPublishToHub={(c) => {
                  setCloningCar(c);
                  const otherLoc = locations.find((l) => l.id !== c.location_id) || locations[0];
                  setTargetHubId(otherLoc?.id || 1);
                  setTargetFleetCount("1");
                  setCloneError(null);
                  setIsCloneModalOpen(true);
                }}
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

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* SECTION 1: Identity & Categorization */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#c59b27]/40 hover:shadow-xs transition-all duration-200 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1c274c] to-[#253360] text-[#f7d58b] flex items-center justify-center text-[11px] font-black shadow-2xs shrink-0 ring-1 ring-[#c59b27]/30">
                  01
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1c274c]">
                      Vehicle Identity &amp; Placement
                    </h4>
                    <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.2 rounded">
                      Essential
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    Model designation, manufacturer brand, public slug, and hub assignment.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <AdminInput
                label="Car Model Name"
                required
                icon={<CarIcon className="w-3.5 h-3.5 text-[#c59b27]" />}
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Toyota Fortuner 4x4"
              />
              <AdminInput
                label="Brand / Manufacturer"
                required
                icon={<Tag className="w-3.5 h-3.5 text-indigo-500" />}
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
                placeholder="e.g. Toyota"
              />
              <AdminInput
                label="Public URL Slug"
                required
                icon={<Globe className="w-3.5 h-3.5 text-slate-400" />}
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="e.g. toyota-fortuner-delhi"
                className="font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
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

              <AdminInput
                label="Total Fleet Units (Quantity)"
                type="number"
                min="1"
                max="50"
                required
                icon={<Layers className="w-3.5 h-3.5 text-[#c59b27]" />}
                value={formFleetCount}
                onChange={(e) => setFormFleetCount(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          {/* SECTION 2: Technical Specifications */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#c59b27]/40 hover:shadow-xs transition-all duration-200 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1c274c] to-[#253360] text-[#f7d58b] flex items-center justify-center text-[11px] font-black shadow-2xs shrink-0 ring-1 ring-[#c59b27]/30">
                  02
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1c274c]">
                      Engineering &amp; Drivetrain Specifications
                    </h4>
                    <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.2 rounded">
                      Hardware
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    Seating capacity, transmission gearbox, fuel dynamics, and horsepower.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <AdminInput
                label="Seating Capacity"
                type="number"
                min="2"
                max="10"
                required
                icon={<Users className="w-3.5 h-3.5 text-indigo-500" />}
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
                icon={<Zap className="w-3.5 h-3.5 text-amber-500" />}
                suffixAddon="HP"
                value={formEngineHp}
                onChange={(e) => setFormEngineHp(e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 3: Visual Showcase & Fleet Availability with Live Card Preview */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#c59b27]/40 hover:shadow-xs transition-all duration-200 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1c274c] to-[#253360] text-[#f7d58b] flex items-center justify-center text-[11px] font-black shadow-2xs shrink-0 ring-1 ring-[#c59b27]/30">
                  03
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1c274c]">
                      Visual Identity &amp; Fleet Status
                    </h4>
                    <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded">
                      Showcase
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    Exterior photography showcase, promotional ribbons, and live preview.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
              {/* Controls (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-2.5">
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
                  icon={<Award className="w-3.5 h-3.5 text-[#c59b27]" />}
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="e.g. Flagship 4x4, Popular Choice, VIP"
                  helperText="Optional badge displayed in upper corner on website."
                />

                {/* Status Toggle Card */}
                <div
                  className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-200 flex items-center justify-between shadow-2xs ${
                    formIsAvailable
                      ? "bg-gradient-to-r from-emerald-50/70 via-white to-white border-emerald-200/90"
                      : "bg-slate-50/80 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        formIsAvailable
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                          : "bg-slate-200 text-slate-600 border-slate-300"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#1c274c]">
                          {formIsAvailable ? "Active in Fleet (Publicly Bookable)" : "Inactive / Maintenance (Hidden)"}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            formIsAvailable ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {formIsAvailable ? "Live Online" : "Hidden"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {formIsAvailable
                          ? "Vehicle is publicly visible and accepting customer booking dates."
                          : "Vehicle will not accept customer bookings."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formIsAvailable}
                    aria-label="Toggle fleet vehicle active status"
                    onClick={() => setFormIsAvailable(!formIsAvailable)}
                    className={`relative inline-flex h-5.5 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#c59b27]/30 ${
                      formIsAvailable ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        formIsAvailable ? "translate-x-5.5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Live Catalog Card Preview (5 cols) */}
              <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 via-white to-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-0.5">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Sparkles className="w-3 h-3 text-[#c59b27]" />
                    Live Catalog Preview
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/60">
                    Live Mirror
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col flex-1">
                  {/* Image with Vignette */}
                  <div className="h-32 w-full overflow-hidden bg-slate-950 relative">
                    <img
                      src={formImage || "/assets/img/cars/1.jpg"}
                      alt={formName ? `${formName} Preview` : "Vehicle Image Preview"}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/img/cars/1.jpg";
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/30 pointer-events-none" />

                    {/* Floating Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                      <span className="backdrop-blur-md bg-white/95 text-slate-800 border border-slate-200/70 shadow-2xs rounded-full px-2 py-0.5 text-[9px] font-bold inline-flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-[#c59b27]" />
                        <span>{locations.find((l) => l.id === formLocationId)?.city || "Delhi"}</span>
                      </span>
                      <span className="backdrop-blur-md bg-white/95 text-slate-800 border border-slate-200/70 shadow-2xs rounded-full px-2 py-0.5 text-[9px] font-bold inline-flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5 text-[#c59b27]" />
                        <span>{formFleetCount || 1} Units</span>
                      </span>
                      {formBadge && (
                        <span className="backdrop-blur-md bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold text-[8.5px] uppercase tracking-wider rounded-full px-2 py-0.5 shadow-2xs border border-amber-300/40">
                          {formBadge}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 z-10">
                      <span
                        className={`backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold shadow-2xs inline-flex items-center gap-1 ${
                          formIsAvailable
                            ? "bg-emerald-600 text-white border border-emerald-400/40"
                            : "bg-slate-900/85 text-slate-300 border border-white/20"
                        }`}
                      >
                        {formIsAvailable && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                        <span>{formIsAvailable ? "Available" : "Offline"}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-1.5 left-2 right-2 z-10 flex items-center justify-between text-white pointer-events-none">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#f7d58b] drop-shadow-md">
                        {formBrand || "Brand"} &bull; {categories.find((c) => c.id === formCategoryId)?.name || "Luxury"}
                      </span>
                      {formEngineHp ? (
                        <span className="backdrop-blur-md bg-black/60 text-white/90 border border-white/20 px-1.5 py-0.2 rounded-full text-[8.5px] font-bold shadow-2xs">
                          {formEngineHp} HP
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-2.5 space-y-2">
                    <h4 className="font-heading text-sm font-black text-[#1c274c] truncate">
                      {formName || "Vehicle Model Name"}
                    </h4>

                    {/* Horizontal Specs Bar */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-lg px-2 py-1 flex items-center justify-between text-[10.5px] text-slate-700">
                      <span className="flex items-center gap-1 font-semibold whitespace-nowrap">
                        <Users className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span>{formSeats} Seats</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 font-semibold whitespace-nowrap">
                        <Gauge className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{formTransmission}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 font-semibold whitespace-nowrap">
                        <Fuel className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{formFuelType}</span>
                      </span>
                    </div>

                    {/* Price & Deposit Box */}
                    <div className="bg-gradient-to-br from-slate-50 via-white to-amber-50/30 rounded-lg p-2 border border-slate-200/90 flex items-center justify-between gap-1.5">
                      <div>
                        <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">
                          DAILY TIER (300 KM)
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5 whitespace-nowrap">
                          <span className="text-sm font-black text-[#1c274c] font-heading">
                            ₹{Number(plan300Price || 2500).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">/ day</span>
                        </div>
                      </div>
                      <div className="text-right border-l border-slate-200/80 pl-2">
                        <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider block">
                          SECURITY DEPOSIT
                        </span>
                        <span className="text-[11px] font-black text-[#c59b27] font-heading block mt-0.5">
                          ₹{Number(formSecurityDeposit || 5000).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[8px] font-bold text-emerald-600 inline-flex items-center gap-0.5 whitespace-nowrap">
                          <Check className="w-2 h-2" /> 100% Refundable
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: KM Rental Packages & Security Deposit */}
          {/* SECTION 4: KM Rental Packages & Security Deposit */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#c59b27]/40 hover:shadow-xs transition-all duration-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1c274c] to-[#253360] text-[#f7d58b] flex items-center justify-center text-[11px] font-black shadow-2xs shrink-0 ring-1 ring-[#c59b27]/30">
                  04
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1c274c]">
                      KM Rental Packages &amp; Security Deposit
                    </h4>
                    <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.2 rounded">
                      Pricing Architecture
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    Set daily rental rates for 300km, 450km, 600km tiers and monthly plans.
                  </p>
                </div>
              </div>

              {/* Security Deposit Badge & Input */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50/70 via-slate-50/90 to-slate-50/90 border border-emerald-200/90 rounded-xl px-2.5 py-1 shadow-2xs self-start sm:self-auto">
                <div className="text-left pr-1">
                  <span className="block text-[9px] uppercase font-black text-slate-700 tracking-wider">
                    Security Deposit
                  </span>
                  <span className="text-[8.5px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <Check className="w-2.5 h-2.5" /> 100% Refundable
                  </span>
                </div>
                <div className="flex items-center h-8 w-28 rounded-lg border border-slate-400 hover:border-slate-500 bg-white focus-within:border-[#c59b27] focus-within:ring-2 focus-within:ring-[#c59b27]/25 shadow-2xs overflow-hidden">
                  <span className="h-full px-2.5 bg-slate-100 border-r border-slate-300 text-xs font-black text-[#c59b27] flex items-center justify-center shrink-0 select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formSecurityDeposit}
                    onChange={(e) => setFormSecurityDeposit(e.target.value)}
                    className="w-full h-full px-2 bg-transparent border-none outline-none text-xs font-black text-[#1c274c]"
                  />
                </div>
              </div>
            </div>

            {/* 4 Interactive Luxury Pricing Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Plan 1: 300 km (Base Tier) */}
              <div className="p-3 rounded-2xl border-2 border-[#c59b27] bg-gradient-to-b from-amber-50/70 via-white to-white shadow-xs space-y-2 ring-2 ring-[#c59b27]/15">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#c59b27]">
                    300 KM Package
                  </span>
                  <span className="text-[9px] font-black text-[#c59b27] bg-amber-100/90 border border-amber-300/90 px-2 py-0.5 rounded-full">
                    Base Plan
                  </span>
                </div>
                <div className="flex items-center h-9 rounded-xl border border-slate-400 hover:border-slate-500 bg-white focus-within:border-[#c59b27] focus-within:ring-2 focus-within:ring-[#c59b27]/25 shadow-2xs overflow-hidden">
                  <span className="h-full px-2.5 bg-amber-50 border-r border-slate-300 text-xs font-black text-[#c59b27] flex items-center justify-center shrink-0 select-none">
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
                <div className="flex items-center justify-between text-[10.5px] pt-1.5 border-t border-amber-200/60">
                  <span className="font-medium text-slate-500">Extra KM Rate:</span>
                  <span className="font-black text-[#1c274c] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 text-[10px]">₹7 / km</span>
                </div>
              </div>

              {/* Plan 2: 450 km */}
              <div className="p-3 rounded-2xl border border-slate-300 hover:border-[#c59b27]/60 bg-gradient-to-b from-slate-50/50 via-white to-white transition-all shadow-2xs hover:shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                    450 KM Package
                  </span>
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    1 Day
                  </span>
                </div>
                <div className="flex items-center h-9 rounded-xl border border-slate-400 hover:border-slate-500 bg-white focus-within:border-[#c59b27] focus-within:ring-2 focus-within:ring-[#c59b27]/25 shadow-2xs overflow-hidden">
                  <span className="h-full px-2.5 bg-slate-100 border-r border-slate-300 text-xs font-black text-[#c59b27] flex items-center justify-center shrink-0 select-none">
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
                <div className="flex items-center justify-between text-[10.5px] pt-1.5 border-t border-slate-100">
                  <span className="font-medium text-slate-500">Extra KM Rate:</span>
                  <span className="font-black text-[#1c274c] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60 text-[10px]">₹7 / km</span>
                </div>
              </div>

              {/* Plan 3: 600 km */}
              <div className="p-3 rounded-2xl border border-slate-300 hover:border-[#c59b27]/60 bg-gradient-to-b from-slate-50/50 via-white to-white transition-all shadow-2xs hover:shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                    600 KM Package
                  </span>
                  <span className="text-[9px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                    1 Day
                  </span>
                </div>
                <div className="flex items-center h-9 rounded-xl border border-slate-400 hover:border-slate-500 bg-white focus-within:border-[#c59b27] focus-within:ring-2 focus-within:ring-[#c59b27]/25 shadow-2xs overflow-hidden">
                  <span className="h-full px-2.5 bg-slate-100 border-r border-slate-300 text-xs font-black text-[#c59b27] flex items-center justify-center shrink-0 select-none">
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
                <div className="flex items-center justify-between text-[10.5px] pt-1.5 border-t border-slate-100">
                  <span className="font-medium text-slate-500">Extra KM Rate:</span>
                  <span className="font-black text-[#1c274c] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60 text-[10px]">₹7 / km</span>
                </div>
              </div>

              {/* Plan 4: Monthly 5,000 km */}
              <div className="p-3 rounded-2xl border border-indigo-200/90 bg-gradient-to-b from-indigo-50/40 via-white to-white hover:border-indigo-400 transition-all shadow-2xs hover:shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-950">
                    Monthly Plan
                  </span>
                  <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-100/80 border border-indigo-200 px-2 py-0.5 rounded-full">
                    30 Days
                  </span>
                </div>
                <div className="flex items-center h-9 rounded-xl border border-slate-400 hover:border-slate-500 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-400/20 shadow-2xs overflow-hidden">
                  <span className="h-full px-2.5 bg-indigo-50 border-r border-slate-300 text-xs font-black text-indigo-600 flex items-center justify-center shrink-0 select-none">
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
                <div className="flex items-center justify-between text-[10.5px] pt-1.5 border-t border-indigo-100/60">
                  <span className="font-medium text-slate-500">Distance Limit:</span>
                  <span className="font-black text-indigo-900 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60 text-[10px]">5,000 km</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Vehicle Overview & Policies */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#c59b27]/40 hover:shadow-xs transition-all duration-200 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1c274c] to-[#253360] text-[#f7d58b] flex items-center justify-center text-[11px] font-black shadow-2xs shrink-0 ring-1 ring-[#c59b27]/30">
                  05
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1c274c]">
                      Vehicle Overview &amp; Policies
                    </h4>
                    <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 border border-slate-200/60 px-1.5 py-0.2 rounded">
                      Customer Experience
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    Detailed interior highlights, luxury sound system, luggage capacity, and chauffeured terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick-add luxury feature badges */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Quick Feature Highlights (Click to add or remove)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Reflects in catalog amenities
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  "Panoramic Sunroof",
                  "Harman Kardon Audio",
                  "Ventilated Leather Seats",
                  "Zero Security Hassle",
                  "Chauffeur Option Available",
                ].map((pill, i) => {
                  const isSelected = formDescription.includes(pill);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          const updated = formDescription
                            .replace(new RegExp(`( • ${pill}|${pill} • |${pill})`, "g"), "")
                            .trim();
                          setFormDescription(updated);
                        } else {
                          setFormDescription(
                            formDescription ? `${formDescription} • ${pill}` : pill
                          );
                        }
                      }}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-150 cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                        isSelected
                          ? "bg-amber-50 text-[#c59b27] border-amber-300 ring-1 ring-amber-400/30"
                          : "bg-slate-50 hover:bg-[#1c274c] text-slate-700 hover:text-[#f7d58b] border-slate-300 hover:border-[#1c274c]"
                      }`}
                    >
                      <span className="text-xs">{isSelected ? "✓" : "+"}</span>
                      <span>{pill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <AdminTextarea
              label="Vehicle Description & Rental Policy"
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Outline luxury trim features, sound system, leather seating, and chauffeured guidelines..."
              helperText="Highlight premium amenities, luggage capacity, and terms for web & mobile clients."
            />
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold shadow-2xs w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Catalog changes synchronize automatically to web &amp; mobile views</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-9 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-2xs transition-all duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 rounded-xl bg-gradient-to-r from-[#c59b27] via-[#d4af37] to-[#c59b27] hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-xs shadow-md shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
                <span>{editingCar ? "Save Changes" : "Create Vehicle & KM Plans"}</span>
              </button>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Publish / Clone to Another Hub Modal */}
      {isCloneModalOpen && cloningCar && (
        <AdminModal
          isOpen={isCloneModalOpen}
          onClose={() => {
            setIsCloneModalOpen(false);
            setCloningCar(null);
          }}
          title={`Publish ${cloningCar.name} to Another Hub`}
          subtitle="Deploy an independent regional fleet instance with its own quantity and inventory controls."
          size="md"
        >
          {cloneError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-semibold">{cloneError}</span>
            </div>
          )}

          <form onSubmit={handlePublishToHubSubmit} className="space-y-4">
            {/* Source Vehicle Summary Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3.5">
              <img
                src={cloningCar.primary_image || "/assets/img/cars/1.jpg"}
                alt={cloningCar.name}
                className="w-16 h-12 rounded-xl border border-slate-200 object-cover shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-900 truncate">{cloningCar.name}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#c59b27]" />
                    <span>{cloningCar.location?.name || "Delhi NCR Hub"}</span>
                  </span>
                  <span>•</span>
                  <span>{cloningCar.fleet_count || 1} Units</span>
                </div>
              </div>
            </div>

            <AdminSelect
              label="Target Rental Hub"
              required
              value={targetHubId}
              onChange={(e) => setTargetHubId(parseInt(e.target.value, 10))}
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} disabled={loc.id === cloningCar.location_id}>
                  {loc.name} ({loc.city}) {loc.id === cloningCar.location_id ? "— Current Hub" : ""}
                </option>
              ))}
            </AdminSelect>

            <AdminInput
              label="Quantity at Target Hub (Total Fleet Units)"
              type="number"
              min="1"
              max="50"
              required
              icon={<Layers className="w-3.5 h-3.5 text-[#c59b27]" />}
              value={targetFleetCount}
              onChange={(e) => setTargetFleetCount(e.target.value)}
              placeholder="e.g. 2"
              helperText={`Specifies how many identical ${cloningCar.name} units are stationed at this new hub.`}
            />

            <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 space-y-1">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                Target URL Slug Preview:
              </span>
              <code className="text-xs font-mono font-bold text-[#1c274c] block break-all">
                {cloningCar.slug.replace(/-(delhi-ncr|delhi|gurgaon|lucknow|noida|airport)$/i, "")}-{locations.find((l) => l.id === targetHubId)?.slug || `hub-${targetHubId}`}
              </code>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <AdminButton
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setIsCloneModalOpen(false);
                  setCloningCar(null);
                }}
              >
                Cancel
              </AdminButton>
              <AdminButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isCloning}
                isLoading={isCloning}
                icon={<Copy className="w-3.5 h-3.5" />}
              >
                Publish to Hub
              </AdminButton>
            </div>
          </form>
        </AdminModal>
      )}
    </PageContainer>
  );
}
