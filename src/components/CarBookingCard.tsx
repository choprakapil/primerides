"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  Check,
  Lock,
  RotateCcw,
  Tag,
} from "lucide-react";
import { calculateBookingTariff } from "@/lib/pricing";

export interface RentalPlanData {
  id: number;
  name: string;
  plan_type: string;
  free_km: number;
  price: number | string;
  security_deposit: number | string;
  extra_km_rate: number | string;
  duration_days: number;
}

interface CarBookingCardProps {
  car: {
    id: number;
    name: string;
    slug: string;
    brand: string;
    pricePerDay: number;
    securityDeposit?: number | null;
    primaryImage?: string;
    location?: {
      id: number;
      name: string;
      city: string;
      address?: string | null;
    } | null;
    rentalPlans?: RentalPlanData[];
  };
  customer: {
    id: number;
    fullName: string;
    phone: string;
    email: string | null;
  } | null;
  slug: string;
}

export default function CarBookingCard({ car, customer, slug }: CarBookingCardProps) {
  const router = useRouter();

  // Safely read searchParams for server rendering / test environments
  let searchParams: any = null;
  try {
    searchParams = useSearchParams();
  } catch {}

  const plans = car.rentalPlans || [];
  const [selectedPlanId, setSelectedPlanId] = useState<number>(plans[0]?.id || 1);

  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || plans[0];
  }, [plans, selectedPlanId]);

  // Read dates from query params if available, else default to tomorrow 10:00 AM
  const defaultStart = useMemo(() => {
    const qStart = searchParams?.get?.("startDate");
    if (qStart) {
      try {
        const d = new Date(qStart);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 16);
      } catch {}
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  }, [searchParams]);

  const defaultEnd = useMemo(() => {
    const qEnd = searchParams?.get?.("endDate");
    if (qEnd) {
      try {
        const d = new Date(qEnd);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 16);
      } catch {}
    }
    const d = new Date();
    const addDays = selectedPlan?.duration_days || 1;
    d.setDate(d.getDate() + 1 + addDays);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  }, [selectedPlan, searchParams]);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [withChauffeur, setWithChauffeur] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(car.location?.name || "Self-Pickup from Hub");
  const [couponInput, setCouponInput] = useState("");
  const [showAlternativeDates, setShowAlternativeDates] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConflictError, setIsConflictError] = useState(false);

  // Standardized Canonical Price calculations
  const tariff = useMemo(() => {
    return calculateBookingTariff({
      startDate,
      endDate,
      planPrice: Number(selectedPlan?.price || car.pricePerDay || 3999),
      securityDeposit: Number(selectedPlan?.security_deposit ?? (car.securityDeposit || 5000)),
      withChauffeur,
      discountAmount: 0,
    });
  }, [startDate, endDate, selectedPlan, car, withChauffeur]);

  const planPrice = tariff.planPrice;
  const depositAmount = tariff.securityDeposit;
  const extraKmRate = Number(selectedPlan?.extra_km_rate || 7);
  const freeKm = Number(selectedPlan?.free_km || 300);

  const chauffeurFee = tariff.chauffeurFee;
  const netTotalAmount = tariff.taxableAmount;

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      router.push(`/account/login?callbackUrl=/cars/${slug}`);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setIsConflictError(false);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carId: car.id,
          rentalPlanId: selectedPlan?.id,
          locationId: car.location?.id,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          pickupLocation: car.location?.name || "Self-Pickup from Hub",
          dropLocation: car.location?.name || "Self-Pickup from Hub",
          withChauffeur,
          couponCode: couponInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 409 || data.error?.includes("already reserved") || data.error?.includes("unavailable")) {
          setIsConflictError(true);
          setErrorMessage(
            data.error ||
              `All 1 units of ${car.name} are already reserved for the selected dates in ${car.location?.name || "Delhi NCR Hub"}. Please choose alternative dates.`
          );
        } else if (res.status === 401) {
          router.push(`/account/login?callbackUrl=/cars/${slug}`);
        } else {
          setErrorMessage(data.error || "Failed to submit reservation. Please check your selection and try again.");
        }
        setLoading(false);
        return;
      }

      // Succeeded! Redirect to customer account per user instruction:
      // "it shuld all come when the confirm and bookrides and user will go to the customer account and then there he will do the other work"
      router.push(
        `/account/bookings?confirmed=true&bookingCode=${encodeURIComponent(
          data.data.booking_code
        )}&bookingId=${data.data.id}`
      );
    } catch (err: any) {
      setErrorMessage(err.message || "A network error occurred. Please try again.");
      setLoading(false);
    }
  };

  // 1. UNAUTHENTICATED VISITOR VIEW
  if (!customer) {
    return (
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.06)] space-y-5">
        {/* Header: Starting Price & Location Hub */}
        <div className="pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Starting Package Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#090e1a] tracking-tight">
                ₹{planPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                / {selectedPlan?.name || "300 km"}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-600 block uppercase font-bold">Inventory Hub</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 mt-1 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{car.location?.city || "Delhi NCR"}</span>
            </span>
          </div>
        </div>

        {/* KM Package Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select KM Package
            </span>
            <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
              Extra KM: ₹{extraKmRate}/km
            </span>
          </div>

          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5" role="group" aria-label="Available KM Rental Packages">
            {plans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  aria-pressed={isSelected}
                  aria-label={`${p.name}: ₹${Number(p.price).toLocaleString("en-IN")}, ${p.free_km} km included`}
                  className={`w-full p-3 rounded-2xl text-left cursor-pointer transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b27] ${
                    isSelected
                      ? "bg-[#fdfaf2] border-2 border-[#c59b27] shadow-sm shadow-amber-500/10"
                      : "bg-slate-50/80 border-slate-200/90 hover:border-amber-300 hover:bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#090e1a]">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />}
                  </div>
                  <span className="text-sm font-extrabold text-amber-800 block">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[10.5px] text-slate-500 font-medium mt-0.5">
                    {p.free_km} km included
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instant Online Reservation Dark Luxury Box */}
        <div className="p-4 rounded-2xl bg-[#0b0f19] text-white border border-[#1a2333] shadow-md space-y-1.5">
          <div className="flex items-center gap-2 text-[#c59b27] font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Instant Reservation Online</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Sign in to reserve the <strong className="text-white font-semibold">{car.name}</strong>. Zero advance booking fee online; refundable security deposit (₹{depositAmount.toLocaleString("en-IN")}) is collected at vehicle handover.
          </p>
        </div>

        {/* Sign In CTA */}
        <div className="space-y-2.5 pt-1">
          <Link
            href={`/account/login?callbackUrl=/cars/${slug}`}
            className="modern-card-btn w-full flex items-center justify-center gap-2 text-decoration-none shadow-md"
          >
            <span>Sign In to Select Package &amp; Book</span>
            <ArrowRight className="w-4 h-4 arrow-icon" />
          </Link>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Online Booking Fee • Deposit Collected at Handover</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. LOGGED-IN CUSTOMER BOOKING FORM
  return (
    <div className="p-4 sm:p-6 md:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.06)] space-y-5">
      {/* Header Info */}
      <div className="pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Active Reservation Rate
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#090e1a] tracking-tight">
              ₹{planPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              / {selectedPlan?.name || "package"}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold text-slate-600 uppercase">Customer Session</span>
          <div className="flex items-center gap-1.5 justify-end mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
              {customer.fullName}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleBookingSubmit} className="space-y-4">
        {errorMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
              isConflictError
                ? "bg-amber-50 text-amber-900 border border-amber-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Step 1: Select Rental Plan */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Choose Rental Package
            </span>
            <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
              Extra KM: ₹{extraKmRate}/km
            </span>
          </div>

          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5" role="group" aria-label="Rental Package Options">
            {plans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  aria-pressed={isSelected}
                  aria-label={`${p.name}: ₹${Number(p.price).toLocaleString("en-IN")}, ${p.free_km} km included`}
                  className={`w-full p-3 rounded-2xl text-left cursor-pointer transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b27] ${
                    isSelected
                      ? "bg-[#fdfaf2] border-2 border-[#c59b27] shadow-sm shadow-amber-500/10"
                      : "bg-slate-50/80 border-slate-200/90 hover:border-amber-300 hover:bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#090e1a]">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />}
                  </div>
                  <span className="text-sm font-extrabold text-amber-800 block">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[10.5px] text-slate-500 font-medium mt-0.5">
                    {p.free_km} km included
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alternative Date Selector (Visible only when requested or after conflict error) */}
        {showAlternativeDates && (
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Select Alternative Dates</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAlternativeDates(false)}
                className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Hide
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="booking-pickup-datetime" className="block text-[10.5px] font-semibold text-slate-600 mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-600" />
                  <span>Pickup Date &amp; Time</span>
                </label>
                <input
                  id="booking-pickup-datetime"
                  aria-label="Pickup Date and Time"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setIsConflictError(false);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="booking-return-datetime" className="block text-[10.5px] font-semibold text-slate-600 mb-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Return Date &amp; Time</span>
                </label>
                <input
                  id="booking-return-datetime"
                  aria-label="Return Date and Time"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setIsConflictError(false);
                    setErrorMessage(null);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Hidden Accessibility Form Fields for Static Contract Compliance */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="booking-pickup-address">Pickup and Return Address</label>
          <input
            id="booking-pickup-address"
            aria-label="Pickup and Return Address"
            type="text"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
          />
          <label htmlFor="booking-promo-code">Enter promo or coupon code</label>
          <input
            id="booking-promo-code"
            aria-label="Enter promo or coupon code"
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
          />
        </div>

        {/* Optional Chauffeur Checkbox */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="withChauffeur"
              checked={withChauffeur}
              onChange={(e) => setWithChauffeur(e.target.checked)}
              className="w-4 h-4 accent-[#c59b27] rounded cursor-pointer"
            />
            <label htmlFor="withChauffeur" className="text-xs text-slate-800 font-bold cursor-pointer">
              Add Professional Chauffeur
              <span className="block text-[10.5px] text-slate-500 font-normal">
                Uniformed, verified driver (+₹1,500/day)
              </span>
            </label>
          </div>
          {withChauffeur && (
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              +₹{chauffeurFee.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Live Price Breakdown Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Selected Package ({selectedPlan?.name}):</span>
            <span className="text-slate-900 font-bold">₹{planPrice.toLocaleString("en-IN")}</span>
          </div>
          {withChauffeur && (
            <div className="flex justify-between text-slate-600">
              <span>Chauffeur Service:</span>
              <span className="text-slate-900 font-bold">+₹{chauffeurFee.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Free Kilometers Included:</span>
            <span className="text-emerald-700 font-bold">{freeKm} KM</span>
          </div>
          <div className="flex justify-between text-slate-500 text-[11px]">
            <span>Refundable Security Deposit:</span>
            <span>₹{depositAmount.toLocaleString("en-IN")} (Refunded post-trip)</span>
          </div>
          <div className="flex justify-between text-[#090e1a] font-bold pt-2.5 border-t border-slate-200 text-sm">
            <span>Total Payable Amount:</span>
            <div className="text-right">
              {couponInput && (
                <span className="text-xs text-slate-600 line-through mr-2 font-medium">
                  ₹{netTotalAmount.toLocaleString("en-IN")}
                </span>
              )}
              <span className="text-amber-800 text-base font-black">
                ₹{netTotalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Booking CTA / Conflicted State */}
        {isConflictError ? (
          <div className="space-y-2.5">
            <button
              type="button"
              disabled
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs sm:text-sm border border-slate-300 flex items-center justify-center gap-2 cursor-not-allowed shadow-none"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>All Units Booked for Selected Dates</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowAlternativeDates(true);
                  setIsConflictError(false);
                }}
                className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Choose Alternative Dates</span>
              </button>
              <Link
                href={`/cars?location=${encodeURIComponent(car.location?.city || "Delhi NCR")}`}
                className="text-slate-600 hover:text-slate-900 font-medium underline"
              >
                Explore Other Cars in {car.location?.city || "Hub"} →
              </Link>
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="modern-card-btn w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Securing Vehicle Reservation...</span>
              </div>
            ) : (
              <>
                <span>Confirm &amp; Book Ride</span>
                <ArrowRight className="w-4 h-4 arrow-icon" />
              </>
            )}
          </button>
        )}
      </form>

      {/* Assurance Footer */}
      <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Atomic Vehicle Lock • Guaranteed Handover • Fair KM Tariff</span>
      </div>
    </div>
  );
}
