"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CalendarCheck,
  Car,
  ExternalLink,
  Eye,
  X,
  MessageSquare,
  FileText,
  CreditCard,
  Sparkles,
  ChevronRight,
  UserCheck,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  AdminButton,
  AdminBadge,
  AdminModal,
  AdminCard,
  AdminEmptyState,
  TableContainer,
} from "@/components/admin/ui";

export interface CustomerBooking {
  id: number;
  booking_code: string;
  status: string;
  start_date: string | Date;
  end_date: string | Date;
  total_amount: number | string;
  created_at: string | Date;
  car?: {
    id: number;
    brand: string;
    name: string;
    primary_image?: string | null;
  } | null;
}

export interface CustomerDocument {
  id: number;
  type: string;
  status: string;
  storage_key: string;
  mime_type?: string | null;
  file_name?: string | null;
  rejection_reason?: string | null;
  verified_at?: string | Date | null;
  created_at: string | Date;
}

export interface CustomerRecord {
  id: number;
  phone: string;
  email?: string | null;
  full_name: string;
  avatar_url?: string | null;
  is_verified: boolean;
  computedKycStatus: "verified" | "pending" | "unverified";
  totalSpend: number;
  totalBookings: number;
  activeBookingsCount: number;
  created_at: string | Date;
  updated_at: string | Date;
  bookings: CustomerBooking[];
  documents: CustomerDocument[];
}

interface CustomerDirectoryProps {
  initialCustomers: CustomerRecord[];
  initialTelemetry: {
    totalCustomers: number;
    verifiedKycCount: number;
    pendingKycCount: number;
    activeRentersCount: number;
  };
}

export default function CustomerDirectory({
  initialCustomers,
  initialTelemetry,
}: CustomerDirectoryProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "verified" | "pending" | "unverified">("all");
  const [inspectingCustomer, setInspectingCustomer] = useState<CustomerRecord | null>(null);
  const [activeDossierTab, setActiveDossierTab] = useState<"overview" | "bookings" | "documents">("overview");

  // Filtering
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesStatus =
        selectedStatus === "all" ? true : c.computedKycStatus === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.full_name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        `PR-CUST-${c.id}`.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [customers, searchQuery, selectedStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case "driving_license_front":
        return "Driving License (Front)";
      case "driving_license_back":
        return "Driving License (Back)";
      case "aadhaar":
        return "Aadhaar Card";
      case "passport":
        return "Passport";
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmed</span>;
      case "active":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Active Trip</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Completed</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">Cancelled</span>;
      case "pending":
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Telemetry Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Total Registered</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{initialTelemetry.totalCustomers}</p>
          <p className="text-[11px] text-slate-600 mt-1">Verified & onboarding accounts</p>
        </div>

        <div className="bg-white p-5 rounded-3 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Active Renters</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{initialTelemetry.activeRentersCount}</p>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Currently driving or confirmed</p>
        </div>

        <div className="bg-white p-5 rounded-3 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">KYC Verified</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{initialTelemetry.verifiedKycCount}</p>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">Clear for vehicle handover</p>
        </div>

        <div className="bg-white p-5 rounded-3 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{initialTelemetry.pendingKycCount}</p>
          <p className="text-[11px] text-sky-700 mt-1 font-medium">Awaiting moderation</p>
        </div>
      </div>

      {/* 2. Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-3 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email, ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-[#c59b27] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(
            [
              { key: "all", label: "All Customers" },
              { key: "verified", label: "KYC Verified" },
              { key: "pending", label: "In Review" },
              { key: "unverified", label: "Unverified" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedStatus(filter.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStatus === filter.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Customer Directory Roster */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3 border border-slate-200/90 p-8 shadow-sm">
          <AdminEmptyState
            title="No Customers Found"
            description={
              searchQuery
                ? `No customer profiles matching "${searchQuery}".`
                : "No customers match the selected filter."
            }
          />
        </div>
      ) : (
        <div className="card border mb-4 overflow-hidden"><div className="table-responsive"><table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Customer</th>
              <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Contact Info</th>
              <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>KYC Status</th>
              <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Reservations</th>
              <th className="py-3 px-4 text-uppercase text-muted text-end" style={{ fontSize: "11px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
              {filteredCustomers.map((cust) => {
                const initials = cust.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                const formattedDate = new Date(cust.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-sm rounded-circle bg-primary-subtle text-primary fw-bold me-2 d-flex align-items-center justify-content-center">
                          {initials || "PR"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                            {cust.full_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-600">
                            <span>ID: PR-CUST-{cust.id}</span>
                            <span>•</span>
                            <span>Joined {formattedDate}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-800 font-medium">{cust.phone}</span>
                          <a
                            href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Open WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${cust.phone}`}
                            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                            title="Call customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        {cust.email ? (
                          <a
                            href={`mailto:${cust.email}`}
                            className="text-[11px] text-slate-600 hover:text-slate-900 block truncate max-w-[200px]"
                          >
                            {cust.email}
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">No email provided</span>
                        )}
                      </div>
                    </td>

                    {/* KYC Status */}
                    <td className="py-3.5 px-4">
                      {cust.computedKycStatus === "verified" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </div>
                      ) : cust.computedKycStatus === "pending" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>In Review</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                          <span>Unverified</span>
                        </div>
                      )}
                    </td>

                    {/* Reservations & Spend */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {cust.totalBookings} booking{cust.totalBookings === 1 ? "" : "s"}
                          </span>
                          {cust.activeBookingsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              {cust.activeBookingsCount} Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">
                          {formatCurrency(cust.totalSpend)} total spend
                        </p>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setInspectingCustomer(cust);
                          setActiveDossierTab("overview");
                        }}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-[#c59b27] text-white font-semibold text-xs transition-all shadow-sm hover:shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Dossier</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
        </table></div></div>
      )}

      {/* 4. Customer Dossier Modal */}
      {inspectingCustomer && (
        <AdminModal
          isOpen={true}
          onClose={() => setInspectingCustomer(null)}
          title={`Customer Dossier — ${inspectingCustomer.full_name}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Dossier Header Banner */}
            <div className="p-5 rounded-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-bold text-lg flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                  {inspectingCustomer.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "PR"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{inspectingCustomer.full_name}</h2>
                    {inspectingCustomer.computedKycStatus === "verified" && (
                      <span title="KYC Verified">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Account ID: PR-CUST-{inspectingCustomer.id} • Registered{" "}
                    {new Date(inspectingCustomer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Direct Communication Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`https://wa.me/${inspectingCustomer.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${inspectingCustomer.phone}`}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveDossierTab("overview")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeDossierTab === "overview"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Profile & Overview
              </button>
              <button
                onClick={() => setActiveDossierTab("bookings")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeDossierTab === "bookings"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>Reservation History</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">
                  {inspectingCustomer.bookings.length}
                </span>
              </button>
              <button
                onClick={() => setActiveDossierTab("documents")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeDossierTab === "documents"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>KYC & Identity</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">
                  {inspectingCustomer.documents.length}
                </span>
              </button>
            </div>

            {/* TAB 1: Overview */}
            {activeDossierTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Contact Information
                    </p>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Mobile Phone:</span>
                        <span className="font-semibold text-slate-900 font-mono">
                          {inspectingCustomer.phone}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Email Address:</span>
                        <span className="font-semibold text-slate-900">
                          {inspectingCustomer.email || "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Member Since:</span>
                        <span className="font-semibold text-slate-900">
                          {new Date(inspectingCustomer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Rental & Financial Telemetry
                    </p>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Total Bookings:</span>
                        <span className="font-bold text-slate-900">
                          {inspectingCustomer.totalBookings}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Active / Upcoming Trips:</span>
                        <span className="font-bold text-amber-700">
                          {inspectingCustomer.activeBookingsCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Lifetime Spent:</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {formatCurrency(inspectingCustomer.totalSpend)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KYC Summary Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Vehicle Handover Verification</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {inspectingCustomer.computedKycStatus === "verified"
                          ? "Driving license verified. Handover permission granted."
                          : inspectingCustomer.computedKycStatus === "pending"
                          ? "Documents uploaded and awaiting admin approval."
                          : "Customer has not yet submitted required verification credentials."}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin/documents"
                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Open Moderation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: Reservation History */}
            {activeDossierTab === "bookings" && (
              <div className="space-y-3">
                {inspectingCustomer.bookings.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-3 border border-slate-200">
                    <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No Reservations Yet</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      This customer has not booked any vehicles on PrimeRides.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {inspectingCustomer.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-bold text-xs">
                            <Car className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-900">
                                {booking.car ? `${booking.car.brand} ${booking.car.name}` : "Vehicle"}
                              </span>
                              {getBookingStatusBadge(booking.status)}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Code: <span className="font-mono text-slate-700">{booking.booking_code}</span> •{" "}
                              {new Date(booking.start_date).toLocaleDateString()} to{" "}
                              {new Date(booking.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900 font-mono">
                            {formatCurrency(Number(booking.total_amount || 0))}
                          </p>
                          <Link
                            href="/admin/bookings"
                            className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-0.5 mt-0.5"
                          >
                            <span>Manage</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: KYC Documents */}
            {activeDossierTab === "documents" && (
              <div className="space-y-3">
                {inspectingCustomer.documents.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-3 border border-slate-200">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No Documents Uploaded</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      The customer has not submitted their Driving License or Aadhaar card yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {inspectingCustomer.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              {getDocTypeLabel(doc.type)}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Submitted {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              doc.status === "verified"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : doc.status === "rejected"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {doc.status.toUpperCase()}
                          </span>
                        </div>

                        {doc.rejection_reason && (
                          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px]">
                            <strong>Decline Reason:</strong> {doc.rejection_reason}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {doc.file_name || doc.storage_key}
                          </span>
                          <Link
                            href="/admin/documents"
                            className="text-[11px] text-amber-600 hover:underline font-semibold flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
              <AdminButton variant="secondary" onClick={() => setInspectingCustomer(null)}>
                Close Dossier
              </AdminButton>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
