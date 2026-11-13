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
  Tag,
  X,
  Check,
  Zap,
  CreditCard,
  Lock,
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

  // Promo Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalTotal: number;
  } | null>(null);

  // Price calculations
  const planPrice = Number(selectedPlan?.price || car.pricePerDay || 3999);
  const depositAmount = Number(selectedPlan?.security_deposit ?? (car.securityDeposit || 5000));
  const extraKmRate = Number(selectedPlan?.extra_km_rate || 7);
  const freeKm = Number(selectedPlan?.free_km || 300);

  const chauffeurFee = withChauffeur ? 1500 : 0;
  const grossAmount = planPrice + chauffeurFee;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const netTotalAmount = Math.max(0, grossAmount - discountAmount);

  // Validate coupon handler
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
          code: couponInput.trim().toUpperCase(),
          totalAmount: grossAmount,
          carId: car.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCouponError(data.error || "Invalid promo coupon code");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.data.coupon.code,
          discountAmount: data.data.discount_amount,
          finalTotal: data.data.final_amount,
        });
        setCouponSuccess(`Coupon ${data.data.coupon.code} applied! Saved ₹${data.data.discount_amount}`);
      }
    } catch (err: any) {
      setCouponError(err.message || "Failed to validate coupon");
      setAppliedCoupon(null);
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

  // Submit Reservation
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsConflictError(false);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setErrorMessage("Return date & time must be strictly after pickup date & time.");
      return;
    }

    setLoading(true);

    try {
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

      setConfirmedBooking(data.data);
      setLoading(false);
    } catch (err: any) {
      setErrorMessage(err.message || "A network error occurred. Please try again.");
      setLoading(false);
    }
  };

  // 1. SUCCESS CONFIRMATION VIEW
  if (confirmedBooking) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-300 shadow-[0_15px_45px_rgba(0,0,0,0.06)] space-y-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            Reservation Confirmed
          </span>
          <h3 className="text-xl font-extrabold text-[#090e1a] mt-3">{car.name}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Booking Code:{" "}
            <strong className="text-amber-800 font-mono text-sm font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
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

        <div className="space-y-2.5 pt-1">
          <Link
            href="/account"
            className="modern-card-btn w-full flex items-center justify-center gap-2 text-decoration-none shadow-md"
          >
            <span>View Trip in Customer Account</span>
            <ArrowRight className="w-4 h-4 arrow-icon" />
          </Link>
          <Link
            href="/account/payments"
            className="block w-full py-2 text-xs font-semibold text-slate-600 hover:text-amber-700 transition-colors"
          >
            Proceed to Payment / Upload Driving License →
          </Link>
        </div>
      </div>
    );
  }

  // 2. UNAUTHENTICATED VISITOR VIEW (LUXURY LIGHT THEME)
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
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#090e1a] to-[#141b2d] text-white border border-slate-800 shadow-md space-y-1.5">
          <div className="flex items-center gap-2 text-[#f7d58b] font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Instant Reservation Online</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            Sign in to reserve the <strong className="text-white font-semibold">{car.name}</strong> with real-time date locking. Zero advance booking fee online; refundable security deposit (₹{depositAmount.toLocaleString("en-IN")}) is collected at vehicle handover.
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

  // 3. LOGGED-IN CUSTOMER BOOKING FORM
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
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
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

        {/* Step 2: Pickup and Return Dates */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            2. Trip Schedule
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="booking-pickup-datetime" className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Pickup Date &amp; Time</span>
              </label>
              <input
                id="booking-pickup-datetime"
                aria-label="Pickup Date and Time"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label htmlFor="booking-return-datetime" className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Return Date &amp; Time</span>
              </label>
              <input
                id="booking-return-datetime"
                aria-label="Return Date and Time"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Pickup & Return Address */}
        <div>
          <label htmlFor="booking-pickup-address" className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Pickup &amp; Return Address</span>
          </label>
          <input
            id="booking-pickup-address"
            aria-label="Pickup and Return Address"
            type="text"
            value={pickupLocation}
            onChange={(e) => {
              setPickupLocation(e.target.value);
              setDropLocation(e.target.value);
            }}
            placeholder="e.g. Hub Pickup or Doorstep Address (Delhi NCR / Lucknow)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
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

        {/* Promo / Coupon Code Input */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Promo / Coupon Code</span>
            </span>
            {appliedCoupon && (
              <span className="text-[10px] text-emerald-700 font-bold">
                ✓ Coupon Applied
              </span>
            )}
          </div>

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
              <label htmlFor="booking-promo-code" className="sr-only">
                Enter promo or coupon code
              </label>
              <input
                id="booking-promo-code"
                aria-label="Enter promo or coupon code"
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
                {couponLoading ? "Checking..." : "Apply"}
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
                <span className="text-xs text-slate-600 line-through mr-2 font-medium">
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
      </form>

      {/* Assurance Footer */}
      <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Atomic Vehicle Lock • Guaranteed Handover • Fair KM Tariff</span>
      </div>
    </div>
  );
}
