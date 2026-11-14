"use client";

import TrendArrowBadge from "./ui/TrendArrowBadge";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { calculateBookingTariff } from "@/lib/pricing";
import {
  CalendarCheck,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Key,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  X,
  MessageSquare,
  Car,
  Edit3,
  Copy,
  Check,
  Eye,
  CreditCard,
  Banknote,
  Gauge,
  Fuel,
  AlertCircle,
  RotateCcw,
  Plus,
  User,
  MapPin,
  CheckCircle,
  FileText,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminButton,
  AdminCard,
  AdminModal,
  AdminBadge,
  AdminTextarea,
  AdminEmptyState,
} from "@/components/admin/ui";
import { formatIstDate } from "@/lib/dates";

const QUICK_CANCEL_REASONS = [
  "Customer requested cancellation via phone",
  "Emergency / travel schedule change",
  "Customer no-show at pickup hub",
  "Payment unfulfilled / card decline",
  "Driving license invalid / KYC declined",
];

const QUICK_REFUND_REASONS = [
  "Customer requested cancellation & refund",
  "Vehicle unavailable / breakdown replacement",
  "Goodwill customer satisfaction refund",
  "Excess security deposit return",
  "Mutual agreement / schedule conflict",
];

const QUICK_STATUS_NOTES = [
  "Customer arrived at hub",
  "Keys & documents handed over",
  "Security deposit received",
  "Vehicle returned in pristine condition",
  "Rental extended by customer request",
];

const STATUS_CARDS = [
  {
    key: "pending",
    label: "Pending",
    desc: "Awaiting confirmation or deposit",
    icon: Clock,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    desc: "Approved & ready for handover",
    icon: CheckCircle2,
  },
  {
    key: "active",
    label: "Active (On Trip)",
    desc: "Vehicle released on road",
    icon: Car,
  },
  {
    key: "completed",
    label: "Completed",
    desc: "Returned & trip finished",
    icon: Check,
  },
  {
    key: "cancelled",
    label: "Cancelled",
    desc: "Dates re-released to fleet",
    icon: XCircle,
  },
];

export interface BookingRow {
  id: number;
  booking_code: string;
  customer_id?: number | null;
  full_name: string;
  phone: string;
  email?: string | null;
  car_name?: string | null;
  car?: { name: string; brand: string } | null;
  location?: { city: string; name: string } | null;
  start_date: string;
  end_date: string;
  with_chauffeur: boolean;
  base_amount?: number | string | null;
  discount_amount?: number | string | null;
  coupon_code?: string | null;
  total_amount?: number | string | null;
  totalPaid?: number;
  totalRefunded?: number;
  refundableBalance?: number;
  isPaid?: boolean;
  payments?: Array<{
    id: number;
    amount: number;
    gateway: string;
    status: string;
    payment_method?: string | null;
    transaction_ref?: string | null;
    created_at: string;
  }>;
  trip?: {
    start_odometer?: number | null;
    end_odometer?: number | null;
    start_fuel_level?: string | null;
    end_fuel_level?: string | null;
    inspection_notes?: string | null;
  } | null;
  status: string;
  admin_notes?: string | null;
  price_snapshot?: {
    plan_name?: string | null;
    free_km?: number | null;
    security_deposit?: number | string | null;
  } | null;
  hasVerifiedDL?: boolean;
}

export interface LeadRow {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  subject?: string | null;
  message: string;
  source: string;
  status: string;
  created_at: string;
}

export interface AvailableCarPlan {
  id: number;
  name: string;
  plan_type: string;
  price: number;
  free_km?: number | null;
  extra_km_rate?: number | null;
  security_deposit?: number | null;
  duration_days?: number | null;
}

export interface AvailableCar {
  id: number;
  name: string;
  brand: string;
  fuel_type: string;
  transmission: string;
  price_per_day: number;
  location_id?: number | null;
  fleet_count?: number;
  rental_plans: AvailableCarPlan[];
}

export interface AvailableLocation {
  id: number;
  name: string;
  city: string;
}

interface BookingsManagerProps {
  initialBookings: BookingRow[];
  initialLeads: LeadRow[];
  availableCars?: AvailableCar[];
  availableLocations?: AvailableLocation[];
}

export default function BookingsManager({
  initialBookings,
  initialLeads,
  availableCars = [],
  availableLocations = [],
}: BookingsManagerProps) {
  const [activeTab, setActiveTab] = useState<"bookings" | "leads">("bookings");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [bookings, setBookings] = useState<BookingRow[]>(initialBookings);
  const [leads, setLeads] = useState<LeadRow[]>(initialLeads);

  const [isSearching, setIsSearching] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const isInitialMount = useRef(true);

  // Debounced server-side search & filtering
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);

        const res = await fetch(`/api/v1/admin/bookings?${params.toString()}`);
        const json = await res.json();
        if (json.success && json.data?.bookings) {
          setBookings(json.data.bookings);
        }
      } catch (err) {
        console.error("Failed to query bookings:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, dateFrom, dateTo]);

  const refreshBookings = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/v1/admin/bookings?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data?.bookings) {
        setBookings(json.data.bookings);
      }
    } catch (err) {
      console.error("Failed to refresh bookings:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Cancellation Modal
  const [cancellingBooking, setCancellingBooking] = useState<BookingRow | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Edit Status Modal
  const [editingStatusBooking, setEditingStatusBooking] = useState<BookingRow | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>("");
  const [statusUpdateNote, setStatusUpdateNote] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Handover Blocked Modal / Alert
  const [handoverBlockedMessage, setHandoverBlockedMessage] = useState<string | null>(null);

  // Dedicated Vehicle Handover & Clearance Modal
  const [handoverBooking, setHandoverBooking] = useState<BookingRow | null>(null);
  const [handoverOdometer, setHandoverOdometer] = useState("");
  const [handoverFuel, setHandoverFuel] = useState("100% (Full)");
  const [handoverInspection, setHandoverInspection] = useState("Vehicle exterior & interior inspected. Pristine condition, keys handed over.");
  const [handoverPaymentAmount, setHandoverPaymentAmount] = useState("");
  const [handoverPaymentMethod, setHandoverPaymentMethod] = useState("cash");
  const [handoverPaymentRef, setHandoverPaymentRef] = useState("");
  const [handoverError, setHandoverError] = useState<string | null>(null);

  // Dedicated Gateway Refund Modal State
  const [refundingBooking, setRefundingBooking] = useState<BookingRow | null>(null);
  const [refundAmountInput, setRefundAmountInput] = useState<string>("");
  const [refundReasonInput, setRefundReasonInput] = useState<string>("");
  const [refundCancelBooking, setRefundCancelBooking] = useState<boolean>(true);
  const [refundPenaltyInput, setRefundPenaltyInput] = useState<string>("0");
  const [refundIsSubmitting, setRefundIsSubmitting] = useState<boolean>(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const openRefundModal = (b: BookingRow) => {
    setRefundingBooking(b);
    const balance = b.refundableBalance !== undefined ? b.refundableBalance : (b.totalPaid || 0);
    setRefundAmountInput(String(balance));
    setRefundReasonInput("");
    setRefundCancelBooking(b.status !== "cancelled");
    setRefundPenaltyInput("0");
    setRefundError(null);
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingBooking) return;
    setRefundError(null);

    const amt = parseFloat(refundAmountInput);
    if (isNaN(amt) || amt <= 0) {
      setRefundError("Please enter a valid positive refund amount.");
      return;
    }

    const maxBal = refundingBooking.refundableBalance !== undefined
      ? refundingBooking.refundableBalance
      : (refundingBooking.totalPaid || 0);

    if (amt > maxBal) {
      setRefundError(`Refund amount cannot exceed available balance of ₹${maxBal.toLocaleString("en-IN")}.`);
      return;
    }

    setRefundIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/bookings/${refundingBooking.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundAmount: amt,
          reason: refundReasonInput || "Admin initiated refund",
          cancelBooking: refundCancelBooking,
          penaltyAmount: parseFloat(refundPenaltyInput) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process gateway refund.");
      }

      alert(data.message || `Successfully refunded ₹${amt.toLocaleString("en-IN")}`);
      setRefundingBooking(null);
      await refreshBookings();
    } catch (err: any) {
      setRefundError(err.message || "Failed to process gateway refund.");
    } finally {
      setRefundIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Walk-In / Office Counter Booking State & Handlers
  // ---------------------------------------------------------------------------
  const [carsList, setCarsList] = useState<AvailableCar[]>(availableCars || []);
  const [locationsList, setLocationsList] = useState<AvailableLocation[]>(availableLocations || []);

  useEffect(() => {
    if (availableCars && availableCars.length > 0) setCarsList(availableCars);
  }, [availableCars]);

  useEffect(() => {
    if (availableLocations && availableLocations.length > 0) setLocationsList(availableLocations);
  }, [availableLocations]);

  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
  const [walkinFullName, setWalkinFullName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinEmail, setWalkinEmail] = useState("");
  const [walkinCarId, setWalkinCarId] = useState<number | "">("");
  const [walkinPlanId, setWalkinPlanId] = useState<number | "">("");
  const [walkinLocationId, setWalkinLocationId] = useState<number | "">("");
  const [walkinStartDate, setWalkinStartDate] = useState("");
  const [walkinEndDate, setWalkinEndDate] = useState("");
  const [walkinPickupLocation, setWalkinPickupLocation] = useState("");
  const [walkinDropLocation, setWalkinDropLocation] = useState("");
  const [walkinWithChauffeur, setWalkinWithChauffeur] = useState(false);
  const [walkinCouponCode, setWalkinCouponCode] = useState("");
  const [walkinStatus, setWalkinStatus] = useState<"confirmed" | "pending">("confirmed");
  const [walkinNotes, setWalkinNotes] = useState("");
  const [walkinDlNumber, setWalkinDlNumber] = useState("");
  const [walkinVerifyDlInPerson, setWalkinVerifyDlInPerson] = useState(true);
  const [walkinCollectPaymentNow, setWalkinCollectPaymentNow] = useState(true);
  const [walkinPaymentAmount, setWalkinPaymentAmount] = useState("");
  const [walkinPaymentMethod, setWalkinPaymentMethod] = useState("cash");
  const [walkinPaymentRef, setWalkinPaymentRef] = useState("");
  const [walkinIsSubmitting, setWalkinIsSubmitting] = useState(false);
  const [walkinError, setWalkinError] = useState<string | null>(null);

  // Success modal for quick transition to vehicle handover
  const [createdWalkinBooking, setCreatedWalkinBooking] = useState<BookingRow | null>(null);

  // Filter cars stationed at selected location
  const locationFilteredCars = useMemo(() => {
    if (!walkinLocationId) return carsList;
    return carsList.filter((c) => !c.location_id || c.location_id === Number(walkinLocationId));
  }, [carsList, walkinLocationId]);

  // Real-time multi-unit inventory availability check for selected dates across online & offline bookings
  const carAvailabilityMap = useMemo(() => {
    const map: Record<number, { available: number; total: number; isSoldOut: boolean }> = {};
    const s = walkinStartDate ? new Date(walkinStartDate).getTime() : null;
    const e = walkinEndDate ? new Date(walkinEndDate).getTime() : null;
    const hasValidDates = s && e && !isNaN(s) && !isNaN(e) && e > s;

    carsList.forEach((car) => {
      const total = car.fleet_count || 1;
      if (!hasValidDates) {
        map[car.id] = { available: total, total, isSoldOut: false };
        return;
      }

      // Count overlapping bookings for this vehicle across online and offline bookings
      const overlapping = bookings.filter((b) => {
        if (b.status === "cancelled" || b.status === "expired") return false;
        const matchesCar = b.car_name === car.name || (b.car && b.car.name === car.name);
        if (!matchesCar) return false;

        const bStart = new Date(b.start_date).getTime();
        const bEnd = new Date(b.end_date).getTime();
        return bStart < e && bEnd > s;
      }).length;

      const available = Math.max(0, total - overlapping);
      map[car.id] = {
        available,
        total,
        isSoldOut: available === 0,
      };
    });

    return map;
  }, [carsList, bookings, walkinStartDate, walkinEndDate]);

  const selectedCar = useMemo(() => {
    if (walkinCarId) {
      const found = locationFilteredCars.find((c) => c.id === Number(walkinCarId));
      if (found) return found;
    }
    return locationFilteredCars[0] || null;
  }, [locationFilteredCars, walkinCarId]);

  const selectedPlan = useMemo(() => {
    if (!selectedCar) return null;
    return selectedCar.rental_plans.find((p) => p.id === Number(walkinPlanId)) || selectedCar.rental_plans[0] || null;
  }, [selectedCar, walkinPlanId]);

  const calculatedEstimate = useMemo(() => {
    if (!selectedCar || !walkinStartDate || !walkinEndDate) return null;
    const planPrice = selectedPlan ? Number(selectedPlan.price) : Number(selectedCar.price_per_day);
    const deposit = Number(selectedPlan?.security_deposit || 5000);

    const tariff = calculateBookingTariff({
      startDate: walkinStartDate,
      endDate: walkinEndDate,
      planPrice,
      securityDeposit: deposit,
      withChauffeur: walkinWithChauffeur,
    });

    return {
      diffDays: tariff.diffDays,
      diffHours: tariff.diffHours,
      baseRental: tariff.planPrice,
      chauffeurCost: tariff.chauffeurFee,
      subtotal: tariff.taxableAmount,
      gst: tariff.gstAmount,
      deposit: tariff.securityDeposit,
      grandTotal: tariff.grandTotal,
    };
  }, [selectedCar, selectedPlan, walkinStartDate, walkinEndDate, walkinWithChauffeur]);

  const openWalkinModal = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    const startStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const endStr = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    const defaultLoc = locationsList[0];
    const defaultLocId = defaultLoc ? defaultLoc.id : "";
    const filtered = defaultLocId ? carsList.filter((c) => !c.location_id || c.location_id === defaultLocId) : carsList;
    const firstCar = filtered[0] || carsList[0];
    const defaultCarId = firstCar ? firstCar.id : "";
    const defaultPlanId = firstCar?.rental_plans?.[0]?.id || "";

    setWalkinFullName("");
    setWalkinPhone("");
    setWalkinEmail("");
    setWalkinLocationId(defaultLocId);
    setWalkinStartDate(startStr);
    setWalkinEndDate(endStr);
    setWalkinPickupLocation(defaultLoc?.name || "PrimeRides Office Hub");
    setWalkinDropLocation(defaultLoc?.name || "PrimeRides Office Hub");
    setWalkinCarId(defaultCarId);
    setWalkinPlanId(defaultPlanId);
    setWalkinWithChauffeur(false);
    setWalkinCouponCode("");
    setWalkinStatus("confirmed");
    setWalkinNotes("");
    setWalkinDlNumber("");
    setWalkinVerifyDlInPerson(true);
    setWalkinCollectPaymentNow(true);

    const initialPlan = firstCar?.rental_plans?.[0];
    const estimatedDeposit = initialPlan?.security_deposit || 5000;
    const estimatedBase = initialPlan?.price || firstCar?.price_per_day || 0;
    const estTotal = Math.round(Number(estimatedBase) * 1.18 + Number(estimatedDeposit));

    setWalkinPaymentAmount(estTotal > 0 ? String(estTotal) : "");
    setWalkinPaymentMethod("cash");
    setWalkinPaymentRef(`WALKIN_CASH_${Date.now().toString().slice(-6)}`);
    setWalkinError(null);
    setIsWalkinModalOpen(true);
  };

  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalkinError(null);

    if (!walkinFullName.trim() || !walkinPhone.trim()) {
      setWalkinError("Customer name and phone number are required.");
      return;
    }

    if (!walkinCarId) {
      setWalkinError("Please select a vehicle.");
      return;
    }

    if (!walkinStartDate || !walkinEndDate) {
      setWalkinError("Pickup and drop-off dates are required.");
      return;
    }

    if (new Date(walkinStartDate) >= new Date(walkinEndDate)) {
      setWalkinError("Drop-off date/time must be strictly after pickup date/time.");
      return;
    }

    if (walkinCollectPaymentNow && (!walkinPaymentAmount || Number(walkinPaymentAmount) <= 0)) {
      setWalkinError("Please enter the collected payment amount or uncheck payment collection.");
      return;
    }

    setWalkinIsSubmitting(true);
    try {
      const selectedLoc = locationsList.find((l) => l.id === Number(walkinLocationId));
      const pickupLoc = walkinPickupLocation.trim() || selectedLoc?.name || "PrimeRides Office Hub";
      const dropLoc = walkinDropLocation.trim() || selectedLoc?.name || "PrimeRides Office Hub";

      const payload = {
        fullName: walkinFullName.trim(),
        phone: walkinPhone.trim(),
        email: walkinEmail.trim() || undefined,
        carId: Number(walkinCarId),
        rentalPlanId: walkinPlanId ? Number(walkinPlanId) : undefined,
        locationId: walkinLocationId ? Number(walkinLocationId) : undefined,
        startDate: new Date(walkinStartDate).toISOString(),
        endDate: new Date(walkinEndDate).toISOString(),
        pickupLocation: pickupLoc,
        dropLocation: dropLoc,
        withChauffeur: walkinWithChauffeur,
        couponCode: walkinCouponCode.trim() || undefined,
        status: walkinStatus,
        notes: walkinNotes.trim() || undefined,
        drivingLicenseNumber: walkinDlNumber.trim() || undefined,
        verifyDlInPerson: walkinVerifyDlInPerson,
        initialPayment:
          walkinCollectPaymentNow && Number(walkinPaymentAmount) > 0
            ? {
                amount: Number(walkinPaymentAmount),
                method: walkinPaymentMethod,
                reference: walkinPaymentRef.trim() || `WALKIN_${Date.now()}`,
              }
            : undefined,
      };

      const res = await fetch("/api/v1/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create walk-in booking.");
      }

      setIsWalkinModalOpen(false);
      await refreshBookings();

      const newBooking = json.data;
      const totalAmt = Number(newBooking.total_amount || 0);
      const paidAmt = (newBooking.payments || [])
        .filter((p: any) => p.status === "captured" || p.status === "successful")
        .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

      const bookingRow: BookingRow = {
        id: newBooking.id,
        booking_code: newBooking.booking_code,
        customer_id: newBooking.customer_id,
        full_name: newBooking.full_name,
        phone: newBooking.phone,
        email: newBooking.email,
        car_name: newBooking.car_name,
        car: newBooking.car ? { name: newBooking.car.name, brand: newBooking.car.brand } : null,
        location: newBooking.location ? { name: newBooking.location.name, city: newBooking.location.city } : null,
        start_date: typeof newBooking.start_date === "string" ? newBooking.start_date : new Date(newBooking.start_date).toISOString(),
        end_date: typeof newBooking.end_date === "string" ? newBooking.end_date : new Date(newBooking.end_date).toISOString(),
        with_chauffeur: newBooking.with_chauffeur,
        base_amount: Number(newBooking.base_amount || 0),
        coupon_code: newBooking.coupon_code || null,
        discount_amount: Number(newBooking.discount_amount || 0),
        total_amount: totalAmt,
        totalPaid: paidAmt,
        isPaid: paidAmt >= totalAmt && totalAmt > 0,
        payments: (newBooking.payments || []).map((p: any) => ({
          id: p.id,
          amount: Number(p.amount || 0),
          gateway: p.gateway,
          status: p.status,
          payment_method: p.payment_method,
          transaction_ref: p.transaction_ref,
          created_at: typeof p.created_at === "string" ? p.created_at : new Date(p.created_at).toISOString(),
        })),
        status: newBooking.status,
        admin_notes: newBooking.admin_notes,
        price_snapshot: newBooking.price_snapshot
          ? {
              plan_name: newBooking.price_snapshot.plan_name,
              free_km: newBooking.price_snapshot.free_km,
              security_deposit: Number(newBooking.price_snapshot.security_deposit || 5000),
            }
          : null,
        hasVerifiedDL: !!newBooking.hasVerifiedDL || walkinVerifyDlInPerson,
      };

      setCreatedWalkinBooking(bookingRow);
    } catch (err: any) {
      setWalkinError(err.message || "Failed to create walk-in booking.");
    } finally {
      setWalkinIsSubmitting(false);
    }
  };

  // Lead Inspection Modal
  const [inspectingLead, setInspectingLead] = useState<LeadRow | null>(null);

  // Status Counts for Pill Badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: bookings.length,
      pending: 0,
      confirmed: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    };
    bookings.forEach((b) => {
      if (counts[b.status] !== undefined) {
        counts[b.status]++;
      }
    });
    return counts;
  }, [bookings]);

  const copyBookingCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleStatusChange = async (bookingId: number, newStatus: string, notes?: string) => {
    setActionLoadingId(bookingId);
    setHandoverBlockedMessage(null);

    try {
      const res = await fetch(`/api/v1/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.error?.includes("license") || res.status === 400) {
          setHandoverBlockedMessage(
            json.error || "Handover Blocked: Customer Driving License is not verified! Please review documents first."
          );
        } else {
          alert(json.error || "Failed to update booking status.");
        }
        setActionLoadingId(null);
        return;
      }

      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );

      if (cancellingBooking?.id === bookingId) {
        setCancellingBooking(null);
        setCancelReason("");
      }
    } catch (err: any) {
      alert(err.message || "Network error occurred.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverBooking) return;
    setHandoverError(null);

    // 1. Strict Driving License Verification Gate
    if (!handoverBooking.hasVerifiedDL) {
      setHandoverError(
        "Handover Blocked: Customer Driving License is not verified! Please review and verify documents in the KYC Queue before handing over vehicle keys."
      );
      return;
    }

    // 2. Strict Meter & Inspection Gate
    const odo = parseInt(handoverOdometer, 10);
    if (isNaN(odo) || odo <= 0) {
      setHandoverError("Handover Blocked: A valid starting odometer reading (km) is required.");
      return;
    }

    if (!handoverFuel || !handoverFuel.trim()) {
      setHandoverError("Handover Blocked: Starting fuel level is required.");
      return;
    }

    // 3. Strict Payment Gate (if not already settled)
    const isPaid = handoverBooking.isPaid;
    if (!isPaid) {
      if (!handoverPaymentAmount || Number(handoverPaymentAmount) <= 0) {
        setHandoverError(
          "Handover Blocked: Rental payment has not been collected! Please record collected amount."
        );
        return;
      }
      if (!handoverPaymentRef || !handoverPaymentRef.trim()) {
        setHandoverError(
          "Handover Blocked: Payment transaction reference, cash receipt ID, or POS terminal slip number is required."
        );
        return;
      }
    }

    setActionLoadingId(handoverBooking.id);

    try {
      const res = await fetch(`/api/v1/admin/bookings/${handoverBooking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          notes: handoverInspection,
          startOdometer: odo,
          startFuelLevel: handoverFuel.trim(),
          inspectionNotes: handoverInspection,
          paymentAmount: !isPaid ? Number(handoverPaymentAmount) : undefined,
          paymentMethod: !isPaid ? handoverPaymentMethod : undefined,
          paymentRef: !isPaid ? handoverPaymentRef.trim() : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setHandoverError(json.error || "Failed to execute vehicle handover.");
        setActionLoadingId(null);
        return;
      }

      // Update state locally
      setBookings((prev) =>
        prev.map((b) =>
          b.id === handoverBooking.id
            ? {
                ...b,
                status: "active",
                isPaid: true,
                totalPaid: isPaid ? b.totalPaid : Number(handoverPaymentAmount),
                trip: {
                  start_odometer: odo,
                  start_fuel_level: handoverFuel.trim(),
                  inspection_notes: handoverInspection,
                },
              }
            : b
        )
      );

      setHandoverBooking(null);
    } catch (err: any) {
      setHandoverError(err.message || "Network error occurred.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLeadStatusChange = async (leadId: number, newStatus: string) => {
    try {
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err: any) {
      alert(err.message || "Failed to update lead status.");
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.booking_code.toLowerCase().includes(q) ||
      b.full_name.toLowerCase().includes(q) ||
      b.phone.includes(q) ||
      (b.email && b.email.toLowerCase().includes(q)) ||
      (b.car_name && b.car_name.toLowerCase().includes(q))
    );
  });

  return (
    <PageContainer>
      {/* Canonical Page Header */}
      <PageHeader
        eyebrow="Bookings"
        title="Reservations"
        description="Manage live trip reservations, handover verification gates, and customer inquiries."
        icon={<CalendarCheck className="w-5 h-5" />}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <ul className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0">
              <li className="nav-item">
                <button
                  type="button"
                  onClick={() => setActiveTab("bookings")}
                  className={`nav-link ${activeTab === "bookings" ? "active" : ""}`}
                >
                  <Car className="w-3.5 h-3.5 me-1.5" />
                  <span>Reservations ({bookings.length})</span>
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  onClick={() => setActiveTab("leads")}
                  className={`nav-link ${activeTab === "leads" ? "active" : ""}`}
                >
                  <MessageSquare className="w-3.5 h-3.5 me-1.5" />
                  <span>Contact Leads ({leads.length})</span>
                </button>
              </li>
            </ul>

            <AdminButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={openWalkinModal}
              className="!h-9 !px-3.5 !text-xs font-semibold shadow-sm"
            >
              + Walk-In / Office Booking
            </AdminButton>
          </div>
        }
      />

      {/* Handover Blocked Alert Modal */}
      {handoverBlockedMessage && (
        <div className="p-4 rounded-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-red-700 text-sm">
                Vehicle Handover Blocked by Security Gate
              </strong>
              <p className="mt-0.5 text-slate-700">{handoverBlockedMessage}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Go to <strong className="text-[#c59b27]">KYC Documents</strong> in the sidebar to review and approve the customer's driving license before authorizing vehicle release.
              </p>
            </div>
          </div>
          <button
            onClick={() => setHandoverBlockedMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: BOOKINGS TAB */}
      {activeTab === "bookings" && (
        <div className="d-flex flex-column gap-4">
          {/* 4 Luxury Pastel KPI Cards */}
          <div className="row g-3">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border pastel-card pastel-card-lavender">
                <div className="card-body p-3.5">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="avatar avatar-md rounded-circle bg-purple-100 text-purple-700 d-flex align-items-center justify-content-center">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <TrendArrowBadge value="+18.5%" period="traffic" pastelTheme="lavender" />
                  </div>
                  <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                    Total Bookings
                  </div>
                  <div className="h3 mb-0 fw-bold text-dark mt-0.5">{bookings.length}</div>
                  <div className="text-[11px] text-muted mt-1">Active &amp; historical rentals</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border pastel-card pastel-card-sky">
                <div className="card-body p-3.5">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="avatar avatar-md rounded-circle bg-sky-100 text-sky-700 d-flex align-items-center justify-content-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="d-flex align-items-center gap-1.5">
                      <span className="telemetry-radar-dot" />
                      <TrendArrowBadge value="On Road" period="live" pastelTheme="sky" />
                    </div>
                  </div>
                  <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                    Active On-Road Trips
                  </div>
                  <div className="h3 mb-0 fw-bold text-dark mt-0.5">
                    {bookings.filter((b) => b.status === "active").length}
                  </div>
                  <div className="text-[11px] text-muted mt-1">Vehicles currently on rent</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border pastel-card pastel-card-mint">
                <div className="card-body p-3.5">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="avatar avatar-md rounded-circle bg-emerald-100 text-emerald-700 d-flex align-items-center justify-content-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <TrendArrowBadge value="Gate Open" period="DL" pastelTheme="mint" />
                  </div>
                  <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                    Handover Ready
                  </div>
                  <div className="h3 mb-0 fw-bold text-dark mt-0.5">
                    {bookings.filter((b) => b.hasVerifiedDL).length}
                  </div>
                  <div className="text-[11px] text-muted mt-1">Verified Driving License</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card h-100 border pastel-card pastel-card-peach">
                <div className="card-body p-3.5">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="avatar avatar-md rounded-circle bg-amber-100 text-amber-700 d-flex align-items-center justify-content-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <TrendArrowBadge value="Action Req" period="KYC" pastelTheme="peach" />
                  </div>
                  <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                    Pending Handover
                  </div>
                  <div className="h3 mb-0 fw-bold text-dark mt-0.5">
                    {bookings.filter((b) => !b.hasVerifiedDL && (b.status === "confirmed" || b.status === "pending")).length}
                  </div>
                  <div className="text-[11px] text-muted mt-1">DL required before key release</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar Card */}
          <div className="card border shadow-2xs rounded-4">
            <div className="card-body p-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Status Pills */}
            <ul className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0" role="tablist">
              {([
                { key: "all", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "confirmed", label: "Confirmed" },
                { key: "active", label: "Active" },
                { key: "completed", label: "Completed" },
                { key: "cancelled", label: "Cancelled" },
              ] as const).map((tab) => {
                const count = statusCounts[tab.key] ?? 0;
                const isSelected = statusFilter === tab.key;
                return (
                  <li className="nav-item" key={tab.key}>
                    <button
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`nav-link rounded-pill ${isSelected ? "active" : ""}`}
                    >
                      <span>{tab.label}</span>
                      <span className="badge badge-sm bg-primary-subtle text-primary ms-1.5">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Search Box, Date Filters & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-search-bookings"
                  name="admin-search-bookings"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search code, customer, car..."
                  aria-label="Search bookings by code, customer, or car"
                  className="form-control form-control-sm ps-5"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {isSearching && (
                    <RefreshCw className="w-3.5 h-3.5 text-[#c59b27] animate-spin" />
                  )}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Date Filters */}
              <div className="d-flex align-items-center gap-1.5 bg-white border rounded-pill px-3 py-1 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dates</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  title="Pickup Date From"
                  className="text-xs text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
                />
                <span className="text-slate-300 text-xs">—</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  title="Pickup Date To"
                  className="text-xs text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
                />
                {(dateFrom || dateTo) && (
                  <button
                    type="button"
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="text-slate-400 hover:text-red-500 p-0.5 ml-0.5 cursor-pointer"
                    title="Clear date filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={refreshBookings}
                disabled={isSearching}
                className="btn btn-sm btn-white border shadow-sm d-inline-flex align-items-center gap-1.5"
                title="Refresh reservations from server"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? "animate-spin text-[#c59b27]" : "text-slate-500"}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {(searchQuery || dateFrom || dateTo || statusFilter !== "all") && (
            <div className="text-xs text-slate-500 font-medium px-1 flex items-center justify-between pt-1">
              <span>
                Showing <strong>{filteredBookings.length}</strong> of <strong>{bookings.length}</strong> reservations
                {searchQuery && <> matching &ldquo;<strong>{searchQuery}</strong>&rdquo;</>}
                {statusFilter !== "all" && <> with status <strong>{statusFilter}</strong></>}
                {(dateFrom || dateTo) && <> for selected dates</>}
              </span>
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); setDateFrom(""); setDateTo(""); }}
                className="text-[#c59b27] hover:underline font-bold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          </div>
          </div>

          {/* Bookings Table Container */}
          <div className="card border mb-4 overflow-hidden shadow-2xs rounded-4">
            <div className="card-header py-3 px-4 bg-white border-bottom d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title mb-0 fw-bold text-dark">Live Reservations Ledger</h5>
                <small className="text-muted">Showing {filteredBookings.length} bookings matching active criteria</small>
              </div>
              <span className="badge bg-purple-50 text-purple-700 border border-purple-200/80 rounded-pill px-3 py-1 font-bold text-xs">
                {filteredBookings.length} Matches
              </span>
            </div>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs space-y-2">
                <Clock className="w-9 h-9 mx-auto text-slate-400 mb-2" />
                <p className="text-[#1c274c] font-bold text-sm">No reservations matching criteria</p>
                <p className="text-slate-500">Bookings submitted on Web or Mobile will stream here.</p>
              </div>
            ) : (
              <>
                {/* Tablet Portrait & Mobile Responsive Card Fallback (< 1200px / xl) */}
                <div className="block xl:hidden space-y-3.5">
                  {filteredBookings.map((b) => {
                    const isProcessing = actionLoadingId === b.id;
                    const rentalDays = Math.max(
                      1,
                      Math.round(
                        (new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    );
                    const canRefund = (b.refundableBalance !== undefined ? b.refundableBalance > 0 : (b.totalPaid && b.totalPaid > 0));

                    return (
                      <div
                        key={b.id}
                        className="bg-white rounded-2xl border border-[#e8edf2] p-4 shadow-xs hover:shadow-md hover:border-[#c59b27]/40 transition-all space-y-3"
                      >
                        {/* Header: Code + Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[#c59b27] font-extrabold text-xs tracking-wide select-all">
                              {b.booking_code}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyBookingCode(b.booking_code)}
                              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="Copy booking code"
                            >
                              {copiedCode === b.booking_code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Payment Status Pill */}
                            {b.isPaid ? (
                              <span className="px-2 py-0.5 text-[9.5px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                                PAID
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[9.5px] font-extrabold bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                                UNPAID
                              </span>
                            )}

                            {/* Booking Status Badge */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStatusBooking(b);
                                setSelectedNewStatus(b.status);
                                setStatusUpdateNote(b.admin_notes || "");
                              }}
                              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase border rounded-md cursor-pointer transition-all hover:scale-105 ${
                                b.status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : b.status === "active"
                                    ? "bg-sky-50 text-sky-700 border-sky-200"
                                    : b.status === "completed"
                                      ? "bg-slate-100 text-slate-700 border-[#e8edf2]"
                                      : b.status === "cancelled"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                              title="Click to edit status"
                            >
                              {b.status}
                            </button>
                          </div>
                        </div>

                        {/* Customer & Vehicle Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Customer */}
                          <div>
                            <p className="font-bold text-[#1c274c] text-xs">{b.full_name}</p>
                            <a
                              href={`tel:${b.phone}`}
                              className="text-[11px] text-slate-600 hover:text-[#c59b27] flex items-center gap-1.5 mt-1 font-mono transition-colors"
                            >
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{b.phone}</span>
                            </a>
                            {b.email && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-mono text-slate-600 truncate">{b.email}</span>
                              </p>
                            )}
                          </div>

                          {/* Vehicle & Hub */}
                          <div>
                            <p className="font-bold text-[#1c274c] text-xs">
                              {b.car?.brand ? `${b.car.brand} ` : ""}{b.car_name || b.car?.name || "Luxury Vehicle"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#fdfaf2] text-[#c59b27] border border-[#c59b27]/30 rounded-full">
                                <Car className="w-2.5 h-2.5 shrink-0" />
                                <span>{b.location?.city || "Delhi NCR"} Hub</span>
                              </span>
                              {b.with_chauffeur ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                                  Chauffeur
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-semibold bg-slate-50 text-slate-600 border border-[#e8edf2] rounded-full">
                                  Self-Drive
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Rental Window & KYC */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Rental Window</span>
                            <div className="flex items-center gap-1 text-[#1c274c] font-bold text-xs mt-0.5">
                              <span>{formatIstDate(b.start_date)}</span>
                              <span className="text-slate-400">→</span>
                              <span>{formatIstDate(b.end_date)}</span>
                            </div>
                            <span className="text-slate-500 font-medium text-[10.5px]">
                              {rentalDays} Day Rental
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">KYC Verification</span>
                            <div className="mt-0.5">
                              {b.hasVerifiedDL ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 rounded-md">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Verified DL (Ready)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1 rounded-md">
                                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                                  Unverified (DL Required)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tariff & KM Plan */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Tariff</span>
                            <span className="text-[#1c274c] font-black text-sm block tracking-tight">
                              ₹{Number(b.total_amount || 0).toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {b.price_snapshot?.plan_name || "KM Package"}
                              {b.price_snapshot?.free_km ? ` • ${b.price_snapshot.free_km} km` : ""}
                            </span>
                          </div>

                          {b.coupon_code && Number(b.discount_amount || 0) > 0 && (
                            <span className="inline-flex items-center gap-1 text-emerald-800 text-[10px] font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              🏷️ {b.coupon_code} (-₹{Number(b.discount_amount).toLocaleString("en-IN")})
                            </span>
                          )}
                        </div>

                        {/* Actions Strip */}
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                          {b.status === "pending" && (
                            <AdminButton
                              variant="primary"
                              size="sm"
                              className="!h-7 !px-2.5 !text-[11px] justify-center shadow-sm"
                              isLoading={isProcessing}
                              onClick={() => handleStatusChange(b.id, "confirmed")}
                            >
                              Confirm
                            </AdminButton>
                          )}

                          {b.status === "confirmed" && (
                            <AdminButton
                              variant="success"
                              size="sm"
                              className="!h-7 !px-2.5 !text-[11px] justify-center shadow-sm"
                              icon={<Key className="w-3 h-3" />}
                              isLoading={isProcessing}
                              onClick={() => {
                                setHandoverBooking(b);
                                setHandoverOdometer("");
                                setHandoverFuel("100% (Full)");
                                setHandoverInspection("Vehicle exterior & interior inspected. Pristine condition, keys handed over.");
                                const total = Number(b.total_amount || 0);
                                const bal = total - Number(b.totalPaid || 0);
                                setHandoverPaymentAmount(bal > 0 ? String(bal) : "");
                                setHandoverPaymentMethod("cash");
                                setHandoverPaymentRef(bal > 0 ? `POS_RECEIPT_${Date.now().toString().slice(-6)}` : "");
                                setHandoverError(null);
                              }}
                              title="Authorizes vehicle release"
                            >
                              Handover
                            </AdminButton>
                          )}

                          {b.status === "active" && (
                            <AdminButton
                              variant="secondary"
                              size="sm"
                              className="!h-7 !px-2.5 !text-[11px] justify-center shadow-sm whitespace-nowrap"
                              isLoading={isProcessing}
                              onClick={() => handleStatusChange(b.id, "completed")}
                            >
                              Complete Trip
                            </AdminButton>
                          )}

                          <AdminButton
                            variant="secondary"
                            size="sm"
                            className="!h-7 !px-2.5 !text-[11px] justify-center shadow-sm"
                            icon={<Edit3 className="w-3 h-3 text-[#c59b27]" />}
                            onClick={() => {
                              setEditingStatusBooking(b);
                              setSelectedNewStatus(b.status);
                              setStatusUpdateNote(b.admin_notes || "");
                            }}
                            title="Change status or add internal admin notes"
                          >
                            Status
                          </AdminButton>

                          <a
                            href={`/api/v1/bookings/${b.id}/invoice`}
                            download={`Invoice-${b.booking_code.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`}
                            className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] justify-center rounded-lg font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors shrink-0"
                            title="Download official GST Tax Invoice (PDF)"
                          >
                            <FileText className="w-3 h-3 text-purple-600 shrink-0" />
                            <span>Invoice</span>
                          </a>

                          {canRefund && (
                            <AdminButton
                              variant="secondary"
                              size="sm"
                              className="!h-7 !px-2.5 !text-[11px] justify-center shadow-sm !text-amber-800 hover:!text-amber-900 !border-amber-300 hover:!bg-amber-50"
                              icon={<RotateCcw className="w-3 h-3 text-amber-700" />}
                              onClick={() => openRefundModal(b)}
                              title={`Issue gateway refund (Available: ₹${(b.refundableBalance ?? b.totalPaid ?? 0).toLocaleString("en-IN")})`}
                            >
                              Refund
                            </AdminButton>
                          )}

                          {b.status !== "completed" && b.status !== "cancelled" && (
                            <AdminButton
                              variant="danger"
                              size="sm"
                              className="!h-7 !px-2.5 !text-[11px] justify-center shadow-sm"
                              isLoading={isProcessing}
                              onClick={() => setCancellingBooking(b)}
                              title="Cancel booking"
                            >
                              Cancel
                            </AdminButton>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Full Table View (>= 1200px / xl) */}
                <div className="hidden xl:block overflow-x-auto min-w-0">
                  <table className="table table-hover align-middle mb-0">
                  <thead className="table-light"><tr>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[160px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Booking Code</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[210px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Customer</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[180px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Vehicle &amp; Hub</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[170px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Rental Window</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[160px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">KM Plan &amp; Total</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[135px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">KYC Status</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[115px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Status</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[130px] text-right text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => {
                      const isProcessing = actionLoadingId === b.id;

                      return (
                        <tr
                          key={b.id}
                          className="align-middle"
                        >
                          {/* Booking Code */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[#c59b27] font-extrabold text-xs tracking-wide select-all">
                                {b.booking_code}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyBookingCode(b.booking_code)}
                                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                title="Copy booking code"
                              >
                                {copiedCode === b.booking_code ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#1c274c] text-xs leading-tight">{b.full_name}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{b.phone}</span>
                            </p>
                            {b.email && (
                              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-mono text-[11px] text-slate-600">{b.email}</span>
                              </p>
                            )}
                          </td>

                          {/* Vehicle & Hub */}
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#1c274c] text-xs leading-tight">
                              {b.car?.brand ? `${b.car.brand} ` : ""}{b.car_name || b.car?.name || "Luxury Vehicle"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#fdfaf2] text-[#c59b27] border border-[#c59b27]/30 rounded-full"
                                
                              >
                                <Car className="w-2.5 h-2.5 shrink-0" />
                                <span>{b.location?.city || "Delhi NCR"} Hub</span>
                              </span>
                              {b.with_chauffeur ? (
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-full"
                                  
                                >
                                  Chauffeur
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-semibold bg-slate-50 text-slate-600 border border-[#e8edf2] rounded-full"
                                  
                                >
                                  Self-Drive
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Rental Window */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap min-w-[170px] text-[11px] bg-white border-y border-[#e8edf2] group-hover:border-[#c59b27]/40 group-hover:bg-[#fdfaf2]/40 transition-all">
                            <div className="flex items-center gap-1 text-[#1c274c] font-bold">
                              <span>{formatIstDate(b.start_date)}</span>
                              <span className="text-slate-400">→</span>
                              <span>{formatIstDate(b.end_date)}</span>
                            </div>
                            <span className="block text-slate-500 font-medium text-[10.5px] mt-0.5">
                              {Math.max(
                                1,
                                Math.round(
                                  (new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              )}{" "}
                              Day Rental
                            </span>
                          </td>

                          {/* KM Plan & Total + Payment Status */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#1c274c] font-black text-sm block tracking-tight">
                                ₹{Number(b.total_amount || 0).toLocaleString("en-IN")}
                              </span>
                              {b.isPaid ? (
                                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                                  PAID
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                                  UNPAID
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                              <span className="font-semibold text-slate-700">
                                {b.price_snapshot?.plan_name || "KM Package"}
                              </span>
                              {b.price_snapshot?.free_km ? (
                                <span className="text-slate-500 text-[9.5px]">
                                  {b.price_snapshot.free_km} km included
                                </span>
                              ) : null}
                              {b.coupon_code && Number(b.discount_amount || 0) > 0 ? (
                                <span className="inline-flex items-center gap-1 text-emerald-800 text-[9.5px] font-bold bg-emerald-50/90 border border-emerald-200/80 px-1.5 py-0.5 rounded mt-0.5 w-fit">
                                  🏷️ {b.coupon_code} (-₹{Number(b.discount_amount).toLocaleString("en-IN")})
                                </span>
                              ) : null}
                              {b.totalPaid && b.totalPaid > 0 && !b.isPaid ? (
                                <span className="text-emerald-700 text-[9.5px] font-semibold">
                                  Paid: ₹{b.totalPaid.toLocaleString("en-IN")}
                                </span>
                              ) : null}
                            </div>
                          </td>

                          {/* KYC Status Badge */}
                          <td className="py-3 px-4">
                            {b.hasVerifiedDL ? (
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 shadow-sm w-fit"
                                  
                                >
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Verified DL
                                </span>
                                <span className="text-[9.5px] text-emerald-700/80 font-medium pl-1">
                                  Ready for Handover
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span
                                  className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1 shadow-sm w-fit"
                                  
                                >
                                  <ShieldAlert className="w-3 h-3 text-amber-600" />
                                  Unverified
                                </span>
                                <span className="text-[9.5px] text-amber-700/80 font-medium pl-1">
                                  DL Required
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Current Status (Clickable to Edit) */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStatusBooking(b);
                                  setSelectedNewStatus(b.status);
                                  setStatusUpdateNote(b.admin_notes || "");
                                }}
                                className={`px-3 py-1 text-[10.5px] font-bold uppercase border cursor-pointer transition-all hover:scale-105 shadow-sm w-fit ${
                                  b.status === "confirmed"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : b.status === "active"
                                      ? "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                                      : b.status === "completed"
                                        ? "bg-slate-100 text-slate-700 border-[#e8edf2] hover:bg-slate-200"
                                        : b.status === "cancelled"
                                          ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                          : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                }`}
                                
                                title="Click to edit status directly"
                              >
                                {b.status}
                              </button>
                              <span className="text-[9.5px] text-slate-400 pl-1 font-medium">
                                Click to edit
                              </span>
                            </div>
                          </td>

                          {/* Action Controls — Vertically Stacked */}
                          <td className="py-4 px-4 align-middle text-right whitespace-nowrap min-w-[130px] bg-white border-y border-r border-[#e8edf2] rounded-r-2xl group-hover:border-[#c59b27]/40 group-hover:bg-[#fdfaf2]/40 transition-all">
                            <div className="flex flex-col items-end justify-center gap-1.5 w-full">
                              {/* Quick Transition Buttons */}
                              {b.status === "pending" && (
                                <AdminButton
                                  variant="primary"
                                  size="sm"
                                  className="w-[108px] !h-7 !px-2.5 !text-[11px] justify-center shadow-sm"
                                  isLoading={isProcessing}
                                  onClick={() => handleStatusChange(b.id, "confirmed")}
                                >
                                  Confirm
                                </AdminButton>
                              )}

                              {b.status === "confirmed" && (
                                <AdminButton
                                  variant="success"
                                  size="sm"
                                  className="w-[108px] !h-7 !px-2.5 !text-[11px] justify-center shadow-sm"
                                  icon={<Key className="w-3 h-3" />}
                                  isLoading={isProcessing}
                                  onClick={() => {
                                    setHandoverBooking(b);
                                    setHandoverOdometer("");
                                    setHandoverFuel("100% (Full)");
                                    setHandoverInspection("Vehicle exterior & interior inspected. Pristine condition, keys handed over.");
                                    const total = Number(b.total_amount || 0);
                                    const bal = total - Number(b.totalPaid || 0);
                                    setHandoverPaymentAmount(bal > 0 ? String(bal) : "");
                                    setHandoverPaymentMethod("cash");
                                    setHandoverPaymentRef(bal > 0 ? `POS_RECEIPT_${Date.now().toString().slice(-6)}` : "");
                                    setHandoverError(null);
                                  }}
                                  title="Authorizes vehicle release. Requires verified driving license and recorded payment."
                                >
                                  Handover
                                </AdminButton>
                              )}

                              {b.status === "active" && (
                                <AdminButton
                                  variant="secondary"
                                  size="sm"
                                  className="w-[108px] !h-7 !px-2.5 !text-[11px] justify-center shadow-sm whitespace-nowrap"
                                  isLoading={isProcessing}
                                  onClick={() => handleStatusChange(b.id, "completed")}
                                >
                                  Complete Trip
                                </AdminButton>
                              )}

                              {/* Direct Edit Status Action */}
                              <AdminButton
                                variant="secondary"
                                size="sm"
                                className="w-[108px] !h-7 !px-2.5 !text-[11px] justify-center shadow-sm"
                                icon={<Edit3 className="w-3 h-3 text-[#c59b27]" />}
                                onClick={() => {
                                  setEditingStatusBooking(b);
                                  setSelectedNewStatus(b.status);
                                  setStatusUpdateNote(b.admin_notes || "");
                                }}
                                title="Change status or add internal admin notes"
                              >
                                Status
                              </AdminButton>

                              {/* Statutory GST Tax Invoice Action */}
                              <a
                                href={`/api/v1/bookings/${b.id}/invoice`}
                                download={`Invoice-${b.booking_code.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`}
                                className="inline-flex items-center gap-1.5 w-[108px] h-7 px-2.5 text-[11px] justify-center rounded-lg font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors shrink-0"
                                title="Download official GST Tax Invoice (PDF)"
                              >
                                <FileText className="w-3 h-3 text-purple-600 shrink-0" />
                                <span>Invoice</span>
                              </a>

                              {/* Gateway Refund Action (for bookings with captured payments) */}
                              {((b.refundableBalance !== undefined ? b.refundableBalance > 0 : (b.totalPaid && b.totalPaid > 0))) && (
                                <AdminButton
                                  variant="secondary"
                                  size="sm"
                                  className="w-[108px] !h-7 !px-2.5 !text-[11px] justify-center shadow-sm !text-amber-800 hover:!text-amber-900 !border-amber-300 hover:!bg-amber-50"
                                  icon={<RotateCcw className="w-3 h-3 text-amber-700" />}
                                  onClick={() => openRefundModal(b)}
                                  title={`Issue gateway refund (Available: ₹${(b.refundableBalance ?? b.totalPaid ?? 0).toLocaleString("en-IN")})`}
                                >
                                  Refund
                                </AdminButton>
                              )}

                              {/* Cancel Button */}
                              {b.status !== "completed" && b.status !== "cancelled" && (
                                <AdminButton
                                  variant="danger"
                                  size="sm"
                                  className="w-[108px] !h-7 !px-2.5 !text-[11px] justify-center shadow-sm"
                                  isLoading={isProcessing}
                                  onClick={() => setCancellingBooking(b)}
                                  title="Cancel booking"
                                >
                                  Cancel
                                </AdminButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CONTACT LEADS TAB */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          <div
            className="rounded-3 bg-[#f8fafc]/80 border border-[#e8edf2] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.07),0_0_0_1px_rgba(197,155,39,0.25)] transition-all duration-300 overflow-hidden p-2.5 sm:p-3.5"
            style={{ borderRadius: "20px" }}
          >
            {leads.length === 0 ? (
              <AdminEmptyState
                icon={<MessageSquare className="w-10 h-10 text-[#c59b27]" />}
                title="No Customer Inquiries Recorded"
                description="Inquiries submitted via the Contact page will appear here for staff review and follow-up."
              />
            ) : (
              <>
                {/* Tablet Portrait & Mobile Responsive Card Fallback (< 1200px / xl) */}
                <div className="block xl:hidden space-y-3">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-2xl border border-[#e8edf2] p-4 shadow-xs hover:shadow-md hover:border-[#c59b27]/40 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                        <span className="text-slate-500 text-[11px] font-medium">
                          {new Date(lead.created_at).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md border shadow-xs ${
                            lead.status === "contacted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="font-bold text-[#1c274c] text-xs">{lead.name}</p>
                          <a
                            href={`tel:${lead.phone}`}
                            className="text-[11px] text-[#c59b27] hover:underline font-mono mt-0.5 block"
                          >
                            {lead.phone}
                          </a>
                          {lead.email && <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{lead.email}</p>}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Subject</span>
                          <p className="font-semibold text-[#1c274c] text-xs mt-0.5">{lead.subject || "Car Rental"}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Message</span>
                        <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {lead.message}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5 flex-wrap">
                        <AdminButton
                          variant="secondary"
                          size="sm"
                          className="!h-7 !px-2.5 !text-[11px] shadow-sm"
                          icon={<Eye className="w-3 h-3 text-[#c59b27]" />}
                          onClick={() => setInspectingLead(lead)}
                          title="Inspect full inquiry message"
                        >
                          Inspect
                        </AdminButton>
                        <AdminButton
                          href={`https://api.whatsapp.com/send?phone=${lead.phone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(`Hello ${lead.name}, thank you for contacting PrimeRides!`)}`}
                          variant="success"
                          size="sm"
                          className="!h-7 !px-2.5 !text-[11px] shadow-sm"
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </AdminButton>
                        {lead.status === "new" && (
                          <AdminButton
                            variant="secondary"
                            size="sm"
                            className="!h-7 !px-2.5 !text-[11px] shadow-sm"
                            onClick={() => handleLeadStatusChange(lead.id, "contacted")}
                          >
                            Done
                          </AdminButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Full Table View (>= 1200px / xl) */}
                <div className="hidden xl:block overflow-x-auto min-w-0">
                  <table className="w-full min-w-[760px] text-left text-xs border-separate border-spacing-x-0 border-spacing-y-2.5 sm:border-spacing-y-3">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[140px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Date</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[200px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Customer</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[180px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Requested Vehicle &amp; Hub</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[240px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Message</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[110px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Status</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[140px] text-right text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="align-middle"
                      >
                        <td className="py-4 px-4 align-middle whitespace-nowrap min-w-[140px] text-slate-500 text-[11px] font-medium bg-white border-y border-l border-[#e8edf2] rounded-l-2xl group-hover:border-[#c59b27]/40 group-hover:bg-[#fdfaf2]/40 transition-all">
                          {new Date(lead.created_at).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#1c274c] text-xs">{lead.name}</p>
                          <p className="text-[11px] text-[#c59b27] font-mono mt-0.5">{lead.phone}</p>
                          {lead.email && <p className="text-[10px] text-slate-500 font-mono mt-0.5">{lead.email}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-[#1c274c]">{lead.subject || "Car Rental"}</p>
                        </td>
                        <td className="py-4 px-4 align-middle min-w-[240px] text-slate-600 bg-white border-y border-[#e8edf2] group-hover:border-[#c59b27]/40 group-hover:bg-[#fdfaf2]/40 transition-all">
                          <p className="line-clamp-2">{lead.message}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase border shadow-sm ${lead.status === "contacted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 align-middle text-right whitespace-nowrap min-w-[140px] bg-white border-y border-r border-[#e8edf2] rounded-r-2xl group-hover:border-[#c59b27]/40 group-hover:bg-[#fdfaf2]/40 transition-all">
                          <div className="flex items-center justify-end gap-1.5 w-full">
                            <AdminButton
                              variant="secondary"
                              size="sm"
                              className="!h-7 !px-2 !text-[11px] shadow-sm"
                              icon={<Eye className="w-3 h-3 text-[#c59b27]" />}
                              onClick={() => setInspectingLead(lead)}
                              title="Inspect full inquiry message"
                            >
                              Inspect
                            </AdminButton>
                            <AdminButton
                              href={`https://api.whatsapp.com/send?phone=${lead.phone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(`Hello ${lead.name}, thank you for contacting PrimeRides!`)}`}
                              variant="success"
                              size="sm"
                              className="!h-7 !px-2 !text-[11px] shadow-sm"
                              target="_blank"
                              rel="noreferrer"
                            >
                              WhatsApp
                            </AdminButton>
                            {lead.status === "new" && (
                              <AdminButton
                                variant="secondary"
                                size="sm"
                                className="!h-7 !px-2 !text-[11px] shadow-sm"
                                onClick={() => handleLeadStatusChange(lead.id, "contacted")}
                              >
                                Done
                              </AdminButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
            )}
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      <AdminModal
        isOpen={Boolean(cancellingBooking)}
        onClose={() => setCancellingBooking(null)}
        title="Cancel Reservation"
        subtitle={
          cancellingBooking
            ? `Booking ref: ${cancellingBooking.booking_code} • Customer: ${cancellingBooking.full_name}`
            : undefined
        }
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Cancelling this reservation will immediately re-release the vehicle dates back to public fleet inventory.
          </p>

          {cancellingBooking && ((cancellingBooking.refundableBalance !== undefined ? cancellingBooking.refundableBalance > 0 : (cancellingBooking.totalPaid && cancellingBooking.totalPaid > 0))) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Captured Payment Detected (₹{(cancellingBooking.refundableBalance ?? cancellingBooking.totalPaid ?? 0).toLocaleString("en-IN")} available)</span>
              </div>
              <p className="text-amber-800 text-[11px]">
                This customer has already paid. Instead of a dry status change, you can issue an immediate Razorpay gateway refund and cancel in one step.
              </p>
              <button
                type="button"
                onClick={() => {
                  const target = cancellingBooking;
                  setCancellingBooking(null);
                  openRefundModal(target);
                }}
                className="w-full py-1.5 px-3 bg-[#c59b27] hover:bg-[#b0871e] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Switch to Gateway Refund Flow
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Common Cancellation Reasons (Click to Auto-fill)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_CANCEL_REASONS.map((reason) => {
                const isSelected = cancelReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setCancelReason(reason)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-50 text-red-700 border-red-300 font-semibold shadow-sm"
                        : "bg-slate-50 text-slate-600 border-[#e8edf2] hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (cancellingBooking) {
                handleStatusChange(cancellingBooking.id, "cancelled", cancelReason);
              }
            }}
            className="space-y-4 pt-1"
          >
            <AdminTextarea
              label="Cancellation Reason (Required)"
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation / emergency."
              helperText="This reason will be recorded in the audit trail and customer notification."
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <AdminButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCancellingBooking(null)}
              >
                Back
              </AdminButton>
              <AdminButton
                type="submit"
                variant="danger"
                size="sm"
                isLoading={cancellingBooking ? actionLoadingId === cancellingBooking.id : false}
              >
                Confirm Cancellation
              </AdminButton>
            </div>
          </form>
        </div>
      </AdminModal>

      {/* Dedicated Gateway Refund Modal */}
      <AdminModal
        isOpen={Boolean(refundingBooking)}
        onClose={() => setRefundingBooking(null)}
        title="Issue Gateway Refund"
        subtitle={
          refundingBooking
            ? `Booking: ${refundingBooking.booking_code} • ${refundingBooking.full_name}`
            : undefined
        }
        size="md"
      >
        {refundingBooking && (
          <form onSubmit={handleProcessRefund} className="space-y-4">
            {refundError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{refundError}</span>
              </div>
            )}

            {/* Financial Breakdown Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Vehicle:</span>
                <span className="font-bold text-slate-900">{refundingBooking.car_name || "Luxury Fleet"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Captured Payments:</span>
                <span className="font-bold text-slate-900">₹{(refundingBooking.totalPaid || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Already Refunded:</span>
                <span className="font-semibold text-rose-600">
                  -₹{(refundingBooking.totalRefunded || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-emerald-900 font-extrabold text-sm">
                <span>Available Refundable Balance:</span>
                <span className="text-emerald-700">
                  ₹{(refundingBooking.refundableBalance ?? refundingBooking.totalPaid ?? 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Preset Reason Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Common Refund Reasons (Click to auto-fill)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REFUND_REASONS.map((reason) => {
                  const isSelected = refundReasonInput === reason;
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setRefundReasonInput(reason)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-50 text-amber-900 border-amber-300 font-semibold shadow-sm"
                          : "bg-slate-50 text-slate-600 border-[#e8edf2] hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {reason}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Refund Amount Input with MAX helper */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Refund Amount (₹) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const bal = refundingBooking.refundableBalance ?? refundingBooking.totalPaid ?? 0;
                    setRefundAmountInput(String(bal));
                  }}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                >
                  Set Maximum (₹{(refundingBooking.refundableBalance ?? refundingBooking.totalPaid ?? 0).toLocaleString("en-IN")})
                </button>
              </div>
              <input
                type="number"
                step="any"
                min="1"
                max={refundingBooking.refundableBalance ?? refundingBooking.totalPaid ?? 0}
                required
                value={refundAmountInput}
                onChange={(e) => setRefundAmountInput(e.target.value)}
                placeholder="Enter amount to refund"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Reason Textarea */}
            <AdminTextarea
              label="Refund Note / Internal Justification *"
              rows={2}
              required
              value={refundReasonInput}
              onChange={(e) => setRefundReasonInput(e.target.value)}
              placeholder="e.g. Cancelled at customer request; processed via Razorpay."
              helperText="Recorded in the customer payment ledger and audit log."
            />

            {/* Cancel Booking Checkbox */}
            {refundingBooking.status !== "cancelled" && (
              <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={refundCancelBooking}
                  onChange={(e) => setRefundCancelBooking(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Also transition booking status to <strong>Cancelled</strong> and release fleet dates</span>
              </label>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <AdminButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRefundingBooking(null)}
              >
                Back
              </AdminButton>
              <AdminButton
                type="submit"
                variant="primary"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                isLoading={refundIsSubmitting}
                className="!bg-[#c59b27] hover:!bg-[#b0871e]"
              >
                Execute Gateway Refund
              </AdminButton>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Edit Status Modal */}
      <AdminModal
        isOpen={Boolean(editingStatusBooking)}
        onClose={() => setEditingStatusBooking(null)}
        title={editingStatusBooking ? `Update Status: ${editingStatusBooking.booking_code}` : "Update Status"}
        subtitle={
          editingStatusBooking
            ? `Customer: ${editingStatusBooking.full_name} • ${editingStatusBooking.phone}`
            : undefined
        }
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <AdminButton
              variant="secondary"
              size="sm"
              onClick={() => setEditingStatusBooking(null)}
              disabled={Boolean(actionLoadingId)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              isLoading={Boolean(actionLoadingId)}
              onClick={async () => {
                if (!editingStatusBooking || !selectedNewStatus) return;
                await handleStatusChange(editingStatusBooking.id, selectedNewStatus, statusUpdateNote);
                setEditingStatusBooking(null);
              }}
            >
              Save Status Change
            </AdminButton>
          </div>
        }
      >
        {editingStatusBooking && (
          <div className="space-y-4">
            {/* Meta summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-[#e8edf2]/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
                <span className="font-bold text-[#1c274c] truncate block">{editingStatusBooking.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle</span>
                <span className="font-bold text-[#1c274c] truncate block">{editingStatusBooking.car_name || editingStatusBooking.car?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Status</span>
                <span className="font-bold uppercase text-[#c59b27] block">{editingStatusBooking.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Driving License</span>
                <span className={`font-bold flex items-center gap-1 ${editingStatusBooking.hasVerifiedDL ? "text-emerald-600" : "text-amber-600"}`}>
                  {editingStatusBooking.hasVerifiedDL ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      Unverified
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Interactive Visual Status Cards */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Destination Status *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {STATUS_CARDS.map((card) => {
                  const isSelected = selectedNewStatus === card.key;
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.key}
                      type="button"
                      onClick={() => setSelectedNewStatus(card.key)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#fdfaf2] border-[#c59b27] shadow-xs ring-2 ring-[#c59b27]/25"
                          : "bg-white border-[#e8edf2] hover:border-slate-300 hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-[#c59b27]" : "text-slate-400"}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#c59b27]" />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? "text-[#b0871d]" : "text-[#1c274c]"}`}>
                          {card.label}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                          {card.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedNewStatus === "active" && !editingStatusBooking.hasVerifiedDL && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Handover Compliance Warning:</strong> Moving status to <em>Active</em> will trigger the Handover KYC Gate. The customer must have a verified Driving License before vehicle keys are handed over.
                  </span>
                </div>
              )}
            </div>

            {/* Quick Status Note Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Quick Internal Note Chips (Click to Apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_STATUS_NOTES.map((note) => {
                  const isSelected = statusUpdateNote === note;
                  return (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setStatusUpdateNote(note)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#fdfaf2] text-[#b0871d] border-[#c59b27]/60 font-semibold shadow-sm"
                          : "bg-slate-50 text-slate-600 border-[#e8edf2] hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {note}
                    </button>
                  );
                })}
              </div>
            </div>

            <AdminTextarea
              label="Admin Audit Note / Reason (Optional)"
              rows={2}
              value={statusUpdateNote}
              onChange={(e) => setStatusUpdateNote(e.target.value)}
              placeholder="Record reason or operational note for this status adjustment..."
              helperText="Saved in tbl_audit_logs for compliance and audit trail."
            />
          </div>
        )}
      </AdminModal>

      {/* Inspect Lead Modal */}
      <AdminModal
        isOpen={Boolean(inspectingLead)}
        onClose={() => setInspectingLead(null)}
        title="Customer Inquiry Details"
        subtitle={inspectingLead ? `From: ${inspectingLead.name} • ${new Date(inspectingLead.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}` : undefined}
        size="md"
        footer={
          inspectingLead ? (
            <div className="flex items-center justify-between w-full">
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                inspectingLead.status === "contacted"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                Status: {inspectingLead.status}
              </span>
              <div className="flex items-center gap-2">
                <AdminButton
                  href={`https://api.whatsapp.com/send?phone=${inspectingLead.phone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(`Hello ${inspectingLead.name}, regarding your PrimeRides inquiry...`)}`}
                  variant="success"
                  size="sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </AdminButton>
                <AdminButton
                  href={`tel:${inspectingLead.phone}`}
                  variant="secondary"
                  size="sm"
                >
                  Call Phone
                </AdminButton>
                {inspectingLead.status === "new" && (
                  <AdminButton
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      await handleLeadStatusChange(inspectingLead.id, "contacted");
                      setInspectingLead(null);
                    }}
                  >
                    Mark Contacted
                  </AdminButton>
                )}
              </div>
            </div>
          ) : undefined
        }
      >
        {inspectingLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-[#e8edf2]/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Name</span>
                <span className="font-bold text-[#1c274c] block">{inspectingLead.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                <span className="font-mono font-bold text-[#c59b27] block">{inspectingLead.phone}</span>
              </div>
              {inspectingLead.email && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                  <span className="font-mono text-slate-700 block">{inspectingLead.email}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Subject / Vehicle</span>
                <span className="font-semibold text-slate-800 block">{inspectingLead.subject || "Car Rental"}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Inquiry Message
              </label>
              <div className="p-3.5 rounded-xl bg-white border border-[#e8edf2] text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {inspectingLead.message}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Dedicated Vehicle Handover & Clearance Modal */}
      <AdminModal
        isOpen={Boolean(handoverBooking)}
        onClose={() => setHandoverBooking(null)}
        title={handoverBooking ? `Vehicle Handover Clearance: ${handoverBooking.booking_code}` : "Vehicle Handover"}
        subtitle={
          handoverBooking
            ? `Customer: ${handoverBooking.full_name} (${handoverBooking.phone}) • Vehicle: ${
                handoverBooking.car_name || handoverBooking.car?.name
              }`
            : undefined
        }
        size="lg"
        footer={
          handoverBooking ? (
            <div className="flex items-center justify-between w-full">
              <div className="text-[11px] text-slate-500">
                {!handoverBooking.hasVerifiedDL ? (
                  <span className="text-red-600 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> KYC DL Verification Required
                  </span>
                ) : !handoverBooking.isPaid ? (
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Payment collection entry required
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Key Release
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setHandoverBooking(null)}
                  disabled={Boolean(actionLoadingId)}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  variant="success"
                  size="sm"
                  icon={<Key className="w-3.5 h-3.5" />}
                  isLoading={Boolean(actionLoadingId)}
                  disabled={!handoverBooking.hasVerifiedDL}
                  onClick={handleHandoverSubmit}
                >
                  Authorize Handover &amp; Release
                </AdminButton>
              </div>
            </div>
          ) : undefined
        }
      >
        {handoverBooking && (
          <form onSubmit={handleHandoverSubmit} className="space-y-5">
            {/* Error Notification */}
            {handoverError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{handoverError}</span>
              </div>
            )}

            {/* 1. KYC Compliance Gate */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Customer Identity &amp; Driving License Gate
              </label>
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                  handoverBooking.hasVerifiedDL
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                {handoverBooking.hasVerifiedDL ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Driving License Verified &amp; Active</strong>
                      <p className="text-[11px] text-emerald-800/90 mt-0.5">
                        Customer identity and driving permit are verified in the KYC queue. Handover is legally compliant.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">CRITICAL: Driving License Not Verified</strong>
                      <p className="text-[11px] text-red-800/90 mt-0.5">
                        Customer has not submitted or verified their driving license. Antigravity Handover Policy strictly forbids handing over keys until documents are approved.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 2. Payment Verification & Curbside Collection Gate */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Payment Settlement Gate
              </label>

              {handoverBooking.isPaid ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">
                      Payment Settled: ₹{Number(handoverBooking.total_amount || 0).toLocaleString("en-IN")} Captured
                    </strong>
                    <p className="text-[11px] text-emerald-800/90 mt-0.5">
                      Customer already completed rental payment online. No curbside collection required.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Banknote className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-amber-900">
                        Payment Collection Required at Handover
                      </strong>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Remaining balance:{" "}
                        <span className="font-bold">
                          ₹
                          {(
                            Number(handoverBooking.total_amount || 0) -
                            Number(handoverBooking.totalPaid || 0)
                          ).toLocaleString("en-IN")}
                        </span>
                        . You must record the collected amount and receipt ID before release.
                      </p>
                      {handoverBooking.coupon_code && Number(handoverBooking.discount_amount || 0) > 0 && (
                        <p className="text-[10.5px] font-semibold text-emerald-800 mt-1">
                          🏷️ Promo Coupon Applied: <strong>{handoverBooking.coupon_code}</strong> (-₹{Number(handoverBooking.discount_amount).toLocaleString("en-IN")} deducted from total)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                        Amount Collected (₹) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={handoverPaymentAmount}
                        onChange={(e) => setHandoverPaymentAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                        required={!handoverBooking.isPaid}
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                        Payment Mode *
                      </label>
                      <select
                        value={handoverPaymentMethod}
                        onChange={(e) => setHandoverPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                      >
                        <option value="cash">Cash in Hand</option>
                        <option value="card_pos">Wireless Card POS Machine</option>
                        <option value="upi_pos">Curbside UPI QR Code</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                        Slip / Receipt / RRN Ref *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. POS_98412 or CASH_REC_01"
                        value={handoverPaymentRef}
                        onChange={(e) => setHandoverPaymentRef(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500"
                        required={!handoverBooking.isPaid}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Vehicle Departure Telemetry & Inspection Gate */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                3. Vehicle Departure Telemetry &amp; Meter Gate
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-slate-500" />
                    <span>Starting Odometer Reading (KM) *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 18450"
                    value={handoverOdometer}
                    onChange={(e) => setHandoverOdometer(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#e8edf2] rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Recorded in tbl_trips for excess KM billing upon vehicle return.
                  </span>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-slate-500" />
                    <span>Starting Fuel Level *</span>
                  </label>
                  <select
                    value={handoverFuel}
                    onChange={(e) => setHandoverFuel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#e8edf2] rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                    required
                  >
                    <option value="100% (Full Tank)">100% (Full Tank)</option>
                    <option value="85%">85%</option>
                    <option value="75%">75% (3/4 Tank)</option>
                    <option value="50%">50% (Half Tank)</option>
                    <option value="25%">25% (1/4 Tank)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Fuel level will be matched upon trip completion.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 uppercase mb-1">
                  Handover Remarks / Exterior Inspection Notes
                </label>
                <textarea
                  rows={2}
                  value={handoverInspection}
                  onChange={(e) => setHandoverInspection(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e8edf2] rounded-lg text-xs focus:outline-none focus:border-amber-500"
                  placeholder="Record condition, Fastag balance, spare tire check..."
                />
              </div>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Walk-In / Office Booking Modal */}
      <AdminModal
        isOpen={isWalkinModalOpen}
        onClose={() => setIsWalkinModalOpen(false)}
        title="Create Walk-In / Office Booking"
        subtitle="Book a vehicle directly from the office desk for in-person or telephone walk-in customers."
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-slate-500 font-medium">
              * Required fields. Row-locks car in fleet to prevent double-booking.
            </span>
            <div className="flex items-center gap-2">
              <AdminButton
                variant="outline"
                type="button"
                onClick={() => setIsWalkinModalOpen(false)}
                disabled={walkinIsSubmitting}
              >
                Cancel
              </AdminButton>
              <AdminButton
                variant="primary"
                type="submit"
                form="walkin-booking-form"
                isLoading={walkinIsSubmitting}
                icon={<Car className="w-4 h-4" />}
              >
                Create Office Reservation
              </AdminButton>
            </div>
          </div>
        }
      >
        <form id="walkin-booking-form" onSubmit={handleWalkinSubmit} className="space-y-4">
          {walkinError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{walkinError}</span>
            </div>
          )}

          {/* SECTION 1: Location & Trip Schedule First */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#c59b27]" />
                <span>1. Select Location Hub &amp; Schedule (First Step)</span>
              </div>
              {walkinLocationId && calculatedEstimate && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#c59b27]/10 text-[#c59b27] text-[11px] font-semibold">
                  {locationsList.find((l) => l.id === Number(walkinLocationId))?.name || "Hub Selected"} • {calculatedEstimate.diffDays} Day{calculatedEstimate.diffDays > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Pickup Location / Hub *
                </label>
                <select
                  value={walkinLocationId}
                  onChange={(e) => {
                    const locId = Number(e.target.value);
                    setWalkinLocationId(locId);
                    const loc = locationsList.find((l) => l.id === locId);
                    if (loc) {
                      setWalkinPickupLocation(loc.name);
                      setWalkinDropLocation(loc.name);
                    }
                    const matchingCars = carsList.filter((c) => !c.location_id || c.location_id === locId);
                    if (matchingCars.length > 0) {
                      const firstAvail = matchingCars.find((c) => {
                        const stat = carAvailabilityMap[c.id];
                        return !stat || !stat.isSoldOut;
                      }) || matchingCars[0];
                      setWalkinCarId(firstAvail.id);
                      setWalkinPlanId(firstAvail.rental_plans?.[0]?.id || "");
                    } else {
                      setWalkinCarId("");
                      setWalkinPlanId("");
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#c59b27]"
                  required
                >
                  <option value="" disabled>-- Select Pickup Hub --</option>
                  {locationsList.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Pickup Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  value={walkinStartDate}
                  onChange={(e) => setWalkinStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#c59b27]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Return Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  value={walkinEndDate}
                  onChange={(e) => setWalkinEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-[#c59b27]"
                  required
                />
              </div>
            </div>

            <p className="text-[10.5px] text-slate-500">
              💡 Selecting the location hub first automatically filters vehicles stationed at that hub and recalculates live multi-unit availability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Fleet Vehicle & Customer Identification */}
            <div className="space-y-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
              {/* 2. Vehicle & Package Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                    <Car className="w-4 h-4 text-[#c59b27]" />
                    <span>2. Available Fleet Vehicle &amp; Package</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {locationFilteredCars.length} car{locationFilteredCars.length !== 1 ? "s" : ""} at this hub
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Select Vehicle (Filtered by Location) *
                  </label>
                  <select
                    value={walkinCarId}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setWalkinCarId(id);
                      const c = locationFilteredCars.find((car) => car.id === id);
                      if (c && c.rental_plans.length > 0) {
                        setWalkinPlanId(c.rental_plans[0].id);
                      } else {
                        setWalkinPlanId("");
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#c59b27]"
                    required
                  >
                    <option value="" disabled>-- Choose Available Fleet Vehicle --</option>
                    {locationFilteredCars.map((car) => {
                      const stat = carAvailabilityMap[car.id];
                      const avail = stat ? stat.available : (car.fleet_count || 1);
                      const total = stat ? stat.total : (car.fleet_count || 1);
                      const isSoldOut = stat ? stat.isSoldOut : false;
                      return (
                        <option key={car.id} value={car.id} disabled={isSoldOut}>
                          {car.name} ({car.brand}) — ₹{car.price_per_day.toLocaleString("en-IN")}/day [{avail} of {total} available]{isSoldOut ? " — SOLD OUT" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedCar && carAvailabilityMap[selectedCar.id]?.isSoldOut && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>All {selectedCar.fleet_count || 1} units of this vehicle are already reserved for these dates. Please choose another car.</span>
                  </div>
                )}

                {selectedCar && selectedCar.rental_plans.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Rental Plan / Package *
                    </label>
                    <select
                      value={walkinPlanId}
                      onChange={(e) => setWalkinPlanId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#c59b27]"
                      required
                    >
                      {selectedCar.rental_plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ₹{p.price.toLocaleString("en-IN")} ({p.free_km ? `${p.free_km} free km` : "Standard km"} • Dep: ₹{p.security_deposit || 5000})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={walkinWithChauffeur}
                      onChange={(e) => setWalkinWithChauffeur(e.target.checked)}
                      className="w-4 h-4 text-[#c59b27] rounded focus:ring-[#c59b27]"
                    />
                    <span>Add Professional Chauffeur (+₹1,000/day)</span>
                  </label>
                </div>
              </div>

              {/* 3. Customer Identity & In-Person Verification */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4 text-[#c59b27]" />
                  <span>3. Customer &amp; Identity Verification</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram Sharma"
                    value={walkinFullName}
                    onChange={(e) => setWalkinFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#c59b27]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#c59b27]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. customer@example.com"
                      value={walkinEmail}
                      onChange={(e) => setWalkinEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#c59b27]"
                    />
                  </div>
                </div>

                {/* In-Person DL Gate */}
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 uppercase">
                        Physical Driving License Verification
                      </label>
                      <p className="text-[10.5px] text-amber-800">
                        Verify original physical DL before handing over vehicle keys.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="DL Number (e.g. DL-0420220019283)"
                      value={walkinDlNumber}
                      onChange={(e) => setWalkinDlNumber(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-amber-300 rounded text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-amber-950 font-medium pt-0.5">
                    <input
                      type="checkbox"
                      checked={walkinVerifyDlInPerson}
                      onChange={(e) => setWalkinVerifyDlInPerson(e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span>Physical original license inspected and verified in office</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Desk Payment & Clearance Gate */}
            <div className="space-y-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Banknote className="w-4 h-4 text-[#c59b27]" />
                  <span>4. Counter Payment &amp; Clearance Gate</span>
                </div>

                {/* Live Financial Breakdown Card */}
                {calculatedEstimate && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-500 text-[11px] pb-1 border-b border-slate-100">
                      <span>Duration</span>
                      <strong className="text-slate-800 font-mono">
                        {calculatedEstimate.diffDays} Day{calculatedEstimate.diffDays > 1 ? "s" : ""} ({calculatedEstimate.diffHours} hrs)
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 text-[11px]">
                      <span>Rental Subtotal</span>
                      <span className="font-mono">₹{calculatedEstimate.baseRental.toLocaleString("en-IN")}</span>
                    </div>
                    {calculatedEstimate.chauffeurCost > 0 && (
                      <div className="flex justify-between items-center text-slate-600 text-[11px]">
                        <span>Chauffeur</span>
                        <span className="font-mono">₹{calculatedEstimate.chauffeurCost.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-slate-600 text-[11px]">
                      <span>GST (18% SAC 996601)</span>
                      <span className="font-mono">₹{calculatedEstimate.gst.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 text-[11px]">
                      <span>Refundable Deposit</span>
                      <span className="font-mono">₹{calculatedEstimate.deposit.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 font-bold text-xs text-slate-900">
                      <span>Estimated Grand Total</span>
                      <span className="font-mono text-[#c59b27] text-sm">
                        ₹{calculatedEstimate.grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {walkinCollectPaymentNow && (
                      <button
                        type="button"
                        onClick={() => setWalkinPaymentAmount(String(calculatedEstimate.grandTotal))}
                        className="w-full text-center text-[10.5px] text-[#c59b27] font-semibold hover:underline mt-1 pt-0.5"
                      >
                        Auto-fill Desk Payment with ₹{calculatedEstimate.grandTotal.toLocaleString("en-IN")}
                      </button>
                    )}
                  </div>
                )}

                {/* Desk Payment Gate */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-950">
                      <input
                        type="checkbox"
                        checked={walkinCollectPaymentNow}
                        onChange={(e) => setWalkinCollectPaymentNow(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Collect Initial Payment at Desk Now</span>
                    </label>
                  </div>

                  {walkinCollectPaymentNow && (
                    <div className="space-y-2 pt-1 border-t border-emerald-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-0.5">
                            Amount Collected (₹) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder="e.g. 5000"
                            value={walkinPaymentAmount}
                            onChange={(e) => setWalkinPaymentAmount(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs font-mono font-bold focus:outline-none focus:border-emerald-500"
                            required={walkinCollectPaymentNow}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-0.5">
                            Payment Mode *
                          </label>
                          <select
                            value={walkinPaymentMethod}
                            onChange={(e) => setWalkinPaymentMethod(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs font-medium focus:outline-none focus:border-emerald-500"
                          >
                            <option value="cash">Cash in Hand</option>
                            <option value="card_pos">Wireless Card POS Terminal</option>
                            <option value="upi_pos">Desk UPI QR Code</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 uppercase mb-0.5">
                          Slip / Receipt / Reference No
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. CASH_DESK_8291 or POS_RRN_102"
                          value={walkinPaymentRef}
                          onChange={(e) => setWalkinPaymentRef(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Coupon Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FLAT500"
                      value={walkinCouponCode}
                      onChange={(e) => setWalkinCouponCode(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono uppercase focus:outline-none focus:border-[#c59b27]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Initial Status
                    </label>
                    <select
                      value={walkinStatus}
                      onChange={(e) => setWalkinStatus(e.target.value as "confirmed" | "pending")}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-[#c59b27]"
                    >
                      <option value="confirmed">Confirmed (Ready for Key Handover)</option>
                      <option value="pending">Pending (Awaiting Confirmation)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Staff / Office Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Walk-in customer visiting Connaught Place office"
                    value={walkinNotes}
                    onChange={(e) => setWalkinNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Walk-In Success & Instant Handover Choice Modal */}
      <AdminModal
        isOpen={!!createdWalkinBooking}
        onClose={() => setCreatedWalkinBooking(null)}
        title="Walk-In Booking Confirmed"
        subtitle="The vehicle has been reserved in the fleet and customer profile created."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <AdminButton
              variant="outline"
              type="button"
              onClick={() => setCreatedWalkinBooking(null)}
            >
              Back to Reservations
            </AdminButton>
            <AdminButton
              variant="success"
              type="button"
              icon={<Key className="w-4 h-4" />}
              onClick={() => {
                const b = createdWalkinBooking;
                setCreatedWalkinBooking(null);
                if (b) {
                  setHandoverBooking(b);
                  setHandoverOdometer("");
                  setHandoverFuel("100% (Full)");
                  setHandoverInspection("Desk handover verified. In-person DL inspected. Pristine condition.");
                  const total = Number(b.total_amount || 0);
                  const bal = total - Number(b.totalPaid || 0);
                  setHandoverPaymentAmount(bal > 0 ? String(bal) : "");
                  setHandoverPaymentMethod("cash");
                  setHandoverPaymentRef(bal > 0 ? `POS_${Date.now().toString().slice(-6)}` : "");
                  setHandoverError(null);
                }
              }}
            >
              Proceed to Key Handover
            </AdminButton>
          </div>
        }
      >
        {createdWalkinBooking && (
          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold text-emerald-900 block">
                  Reservation {createdWalkinBooking.booking_code} Created
                </strong>
                <p className="mt-1 text-emerald-800">
                  Customer <strong>{createdWalkinBooking.full_name}</strong> ({createdWalkinBooking.phone}) has been booked for <strong>{createdWalkinBooking.car_name || "Vehicle"}</strong>.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-100/80 font-mono font-bold text-emerald-900">
                    Total: ₹{Number(createdWalkinBooking.total_amount || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100/80 font-mono font-bold text-emerald-900">
                    Paid: ₹{Number(createdWalkinBooking.totalPaid || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 font-semibold text-emerald-900">
                    DL Verified: {createdWalkinBooking.hasVerifiedDL ? "Yes (In-Person)" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              If the customer is ready to receive vehicle keys right now at the office counter, click <strong>"Proceed to Key Handover"</strong> to record starting odometer, starting fuel level, and release the car.
            </p>
          </div>
        )}
      </AdminModal>
    </PageContainer>
  );
}

