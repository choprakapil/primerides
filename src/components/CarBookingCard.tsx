"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  ArrowRight,
  Sparkles,
  MapPin,
  ExternalLink,
  Gauge,
  Tag,
  X,
  Percent,
  Check,
  Zap,
} from "lucide-react";

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

  const plans = car.rentalPlans || [];
  const [selectedPlanId, setSelectedPlanId] = useState<number>(plans[0]?.id || 1);

  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || plans[0];
  }, [plans, selectedPlanId]);

  // Tomorrow 10:00 AM default
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  }, []);

  // 1 Day Later (or duration_days for monthly)
  const defaultEnd = useMemo(() => {
    const d = new Date();
    const addDays = selectedPlan?.duration_days || 1;
    d.setDate(d.getDate() + 1 + addDays);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  }, [selectedPlan]);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [withChauffeur, setWithChauffeur] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(car.location?.name || "Self-Pickup from Hub");
  const [dropLocation, setDropLocation] = useState(car.location?.name || "Self-Pickup from Hub");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConflictError, setIsConflictError] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
    description?: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Price Calculation based on KM / Monthly Plan
  const planPrice = Number(selectedPlan?.price || car.pricePerDay || 2500);
  const depositAmount = Number(selectedPlan?.security_deposit || 5000);
  const extraKmRate = Number(selectedPlan?.extra_km_rate || 7);
  const freeKm = selectedPlan?.free_km || 300;

  const chauffeurFee = withChauffeur ? 1500 * (selectedPlan?.duration_days || 1) : 0;
  const grossAmount = planPrice + chauffeurFee;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const netTotalAmount = Math.max(0, grossAmount - discountAmount);

  // Validate and Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch("/api/v1/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          amount: grossAmount,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon({
          code: data.data.code,
          discountAmount: data.data.discountAmount,
          discountType: data.data.discountType,
          discountValue: data.data.discountValue,
          description: data.data.description,
        });
        setCouponSuccess(data.message || `Coupon ${data.data.code} applied!`);
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || "Invalid coupon code");
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(err.message || "Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
    setCouponSuccess(null);
  };

  // Handle Form Submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsConflictError(false);

    if (!customer) {
      router.push(`/account/login?callbackUrl=/cars/${slug}`);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setErrorMessage("Return date and time must be after pickup date and time.");
      return;
    }

    setLoading(true);

    try {
      const idempotencyKey = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({
          carId: car.id,
          rentalPlanId: selectedPlan?.id,
          locationId: car.location?.id,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          pickupLocation,
          dropLocation,
          withChauffeur,
          couponCode: appliedCoupon?.code,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 409 || data.error?.includes("already reserved")) {
          setIsConflictError(true);
          setErrorMessage(
            data.error || "This vehicle is already reserved for the selected dates. Please choose alternative dates or explore another car."
          );
        } else if (res.status === 401) {
          router.push(`/account/login?callbackUrl=/cars/${slug}`);
        } else {
          setErrorMessage(data.error || "Failed to submit reservation. Please check your dates and try again.");
        }
        setLoading(false);
        return;
      }

      // Success
      setConfirmedBooking(data.data);
      setLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || "A network error occurred. Please try again.");
      setLoading(false);
    }
  };

  // 1. SUCCESS CONFIRMATION VIEW (LUXURY LIGHT THEME)
  if (confirmedBooking) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-200 shadow-[0_15px_45px_rgba(0,0,0,0.06)] space-y-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            Reservation Confirmed
          </span>
          <h3 className="text-xl font-bold text-[#090e1a] mt-3">{car.name}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Booking Code:{" "}
            <strong className="text-amber-700 font-mono text-sm font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {confirmedBooking.booking_code}
            </strong>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
          <div className="flex justify-between text-slate-600">
            <span>Pick-up Hub:</span>
            <strong className="text-slate-900">{car.location?.name || "Delhi NCR"}</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Rental Package:</span>
            <strong className="text-amber-800 font-semibold">{selectedPlan?.name}</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Included Free KMs:</span>
            <strong className="text-emerald-700 font-bold">{freeKm} KM</strong>
          </div>
          {confirmedBooking.coupon_code && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Promo Code Applied:</span>
              <span>🏷️ {confirmedBooking.coupon_code} (-₹{Number(confirmedBooking.discount_amount || 0).toLocaleString("en-IN")})</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Refundable Security Deposit:</span>
            <strong className="text-slate-900">₹{depositAmount.toLocaleString("en-IN")}</strong>
          </div>
          <div className="flex justify-between text-slate-900 font-bold pt-2.5 border-t border-slate-200">
            <span className="text-sm">Total Payable:</span>
            <strong className="text-base text-amber-700">
              ₹{Number(confirmedBooking.total_amount).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/account"
            className="w-full py-3.5 px-5 rounded-2xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, #d8a834 0%, #c59b27 100%)",
              boxShadow: "0 6px 20px rgba(197, 155, 39, 0.35)",
            }}
          >
            <span>View Trip in Customer Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/account/payments"
            className="block w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-amber-700 transition-colors"
          >
            Proceed to Payment / Upload Driving License →
          </Link>
        </div>
      </div>
    );
  }

  // 2. UNLOGGED VISITOR VIEW (LUXURY LIGHT THEME)
  if (!customer) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.06)] space-y-6">
        {/* Header Badge & Starting Price */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Package Starting Rate
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#090e1a]">
                ₹{planPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ {selectedPlan?.name || "300 km"}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Inventory Hub</span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5 justify-end">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{car.location?.city || "Delhi NCR"}</span>
            </span>
          </div>
        </div>

        {/* KM Plan Options Picker */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Available KM Rental Packages</span>
            <span className="text-[10px] text-amber-700 font-semibold">Extra KM: ₹{extraKmRate}/km</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {plans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#fdfaf2] border-2 border-[#c59b27] shadow-sm shadow-amber-500/10"
                      : "bg-slate-50 border-slate-200/80 hover:border-amber-300 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#090e1a]">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <span className="text-sm font-extrabold text-amber-700 block">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium mt-0.5">
                    {p.free_km} km included
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Notice Box */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-1.5 text-amber-950">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Customer Reservation Login</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Sign in or create your account to reserve the <strong className="text-slate-900">{car.name}</strong> with instant date locking, ₹{depositAmount.toLocaleString("en-IN")} refundable deposit, and doorstep delivery options.
          </p>
        </div>

        {/* Sign In CTA */}
        <div className="space-y-3 pt-2">
          <Link
            href={`/account/login?callbackUrl=/cars/${slug}`}
            className="w-full py-3.5 px-5 rounded-2xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, #d8a834 0%, #c59b27 100%)",
              boxShadow: "0 6px 20px rgba(197, 155, 39, 0.35)",
            }}
          >
            <span>Sign In to Select Package &amp; Book</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Booking Deposit Required to Reserve Online</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. LOGGED-IN CUSTOMER BOOKING FORM (LUXURY LIGHT THEME)
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_45px_rgba(0,0,0,0.06)] space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Stationed Inventory Hub
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-[#090e1a]">
              {car.location?.name || "Delhi NCR Hub"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Session</span>
          <div className="flex items-center gap-1.5 justify-end mt-0.5">
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
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Select Rental Plan */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>1. Choose Rental Package</span>
            <span className="text-[10px] text-amber-700 font-semibold">Extra KM: ₹{extraKmRate}/km</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {plans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#fdfaf2] border-2 border-[#c59b27] shadow-sm shadow-amber-500/10"
                      : "bg-slate-50 border-slate-200/80 hover:border-amber-300 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#090e1a]">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <span className="text-sm font-extrabold text-amber-700 block">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium mt-0.5">
                    {p.free_km} km included
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Pickup Date &amp; Time</span>
            </label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Return Date &amp; Time</span>
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Pickup & Return Address */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Pickup &amp; Return Address</span>
          </label>
          <input
            type="text"
            value={pickupLocation}
            onChange={(e) => {
              setPickupLocation(e.target.value);
              setDropLocation(e.target.value);
            }}
            placeholder="e.g. Hub Pickup or Doorstep Address (Delhi NCR / Lucknow)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
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
              <span className="block text-[10px] text-slate-500 font-normal">
                Uniformed, verified driver (+₹1,500/day)
              </span>
            </label>
          </div>
          {withChauffeur && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              +₹{chauffeurFee.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Promo / Coupon Code Input */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Promo / Coupon Code</span>
            </span>
            {appliedCoupon && (
              <span className="text-[10px] text-emerald-700 font-bold">
                ✓ Coupon Applied
              </span>
            )}
          </label>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-lg text-xs">
                  {appliedCoupon.code}
                </span>
                <span className="text-emerald-800 font-bold text-xs">
                  -₹{appliedCoupon.discountAmount.toLocaleString("en-IN")} OFF
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-emerald-100"
                title="Remove coupon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                placeholder="Enter promo code (e.g. PRIME10)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponInput.trim()}
                className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200/80 text-amber-900 border border-amber-300 text-xs font-bold disabled:opacity-50 transition-colors cursor-pointer"
              >
                {couponLoading ? "Verifying..." : "Apply"}
              </button>
            </div>
          )}

          {couponError && (
            <p className="text-[11px] text-rose-600 font-semibold pl-1">{couponError}</p>
          )}
          {couponSuccess && !appliedCoupon && (
            <p className="text-[11px] text-emerald-700 font-semibold pl-1">{couponSuccess}</p>
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
          {appliedCoupon && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Promo Discount ({appliedCoupon.code}):</span>
              </span>
              <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
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
              {appliedCoupon && (
                <span className="text-xs text-slate-400 line-through mr-2 font-normal">
                  ₹{grossAmount.toLocaleString("en-IN")}
                </span>
              )}
              <span className="text-amber-800 text-base font-black">
                ₹{netTotalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Submit Booking CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-5 rounded-2xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #d8a834 0%, #c59b27 100%)",
            boxShadow: "0 6px 20px rgba(197, 155, 39, 0.35)",
          }}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Securing Vehicle Reservation...</span>
            </div>
          ) : (
            <>
              <span>Confirm &amp; Book Ride</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Assurance Footer */}
      <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Atomic Vehicle Lock • Guaranteed Handover • Fair KM Tariff</span>
      </div>
    </div>
  );
}
