"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import TrendArrowBadge from "./ui/TrendArrowBadge";
import RevenueTrendAreaChart from "./charts/RevenueTrendAreaChart";
import {
  Receipt,
  CreditCard,
  Banknote,
  QrCode,
  Search,
  Filter,
  Download,
  Printer,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Eye,
  Copy,
  Check,
  Plus,
  FileSpreadsheet,
  TrendingUp,
  Wallet,
  Percent,
  MapPin,
  User,
  Car,
  Gauge,
  Sparkles,
  ExternalLink,
  ChevronDown,
  X,
  Building2,
  BadgeAlert,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminModal,
  AdminEmptyState,
} from "@/components/admin/ui";

export interface PaymentRecord {
  id: number;
  booking_id: number;
  transaction_ref: string;
  gateway: string;
  amount: number | string;
  currency: string;
  status: string;
  payment_method?: string | null;
  metadata?: any;
  created_at: string;
  booking?: {
    id: number;
    booking_code: string;
    full_name: string;
    phone: string;
    email?: string | null;
    car_name?: string | null;
    car?: {
      id: number;
      name: string;
      brand: string;
      image_url?: string | null;
    } | null;
    location?: {
      id: number;
      name: string;
      city: string;
    } | null;
    rental_plan?: {
      id: number;
      name: string;
      free_km?: number | null;
    } | null;
    coupon_code?: string | null;
    discount_amount?: any;
    base_amount?: any;
    price_snapshot?: {
      plan_name?: string | null;
      free_km?: number | null;
      extra_km_rate?: any;
      security_deposit?: any;
      tax_amount?: any;
    } | null;
    customer?: {
      id: number;
      full_name: string;
      phone: string;
      email?: string | null;
    } | null;
    trip?: {
      start_odometer?: number | null;
      start_fuel_level?: string | null;
      inspection_notes?: string | null;
    } | null;
  } | null;
}

export interface BookingSummaryItem {
  id: number;
  booking_code: string;
  full_name: string;
  phone: string;
  base_amount?: any;
  discount_amount?: any;
  coupon_code?: string | null;
  total_amount: number | string;
  status: string;
  created_at: string;
  payments?: Array<{
    id: number;
    amount: any;
    status: string;
    payment_method?: string | null;
  }>;
}

interface AccountsManagerProps {
  initialPayments: PaymentRecord[];
  initialBookings: BookingSummaryItem[];
  currentAdmin: {
    username: string;
    role: string;
  };
}

export default function AccountsManager({
  initialPayments,
  initialBookings,
  currentAdmin,
}: AccountsManagerProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [hubFilter, setHubFilter] = useState<string>("all");
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  // Modals
  const [inspectingPayment, setInspectingPayment] = useState<PaymentRecord | null>(null);

  // Calculate Key Financial Metrics
  const metrics = useMemo(() => {
    let captured = 0;
    let online = 0;
    let upi = 0;
    let curbsidePos = 0;
    let authorized = 0;
    let refunded = 0;

    payments.forEach((p) => {
      const amt = Number(p.amount || 0);
      const isSettled = p.status === "captured" || p.status === "successful";

      if (isSettled) {
        captured += amt;

        if (p.gateway === "razorpay" || p.payment_method === "card_online") {
          online += amt;
        } else if (p.gateway === "upi" || p.payment_method === "upi" || p.payment_method === "upi_pos") {
          upi += amt;
        } else if (
          p.gateway === "cash" ||
          p.gateway === "admin_pos" ||
          p.payment_method === "cash" ||
          p.payment_method === "card_pos"
        ) {
          curbsidePos += amt;
        }
      }

      if (p.status === "authorized") {
        authorized += amt;
      }
      if (p.status === "refunded") {
        refunded += amt;
      }
    });

    const uncollectedBalance = initialBookings
      .filter((b) => b.status === "pending" || b.status === "confirmed")
      .reduce((sum, b) => {
        const total = Number(b.total_amount || 0);
        const paid = (b.payments || [])
          .filter((p) => p.status === "captured" || p.status === "successful")
          .reduce((s, p) => s + Number(p.amount || 0), 0);
        return sum + Math.max(0, total - paid);
      }, 0);

    return {
      captured,
      online,
      upi,
      curbsidePos,
      authorized,
      refunded,
      uncollectedBalance,
      totalCount: payments.length,
    };
  }, [payments, initialBookings]);

  const modeDistribution = useMemo(() => {
    const total = metrics.captured || 1;
    return {
      onlinePct: Math.round((metrics.online / total) * 100),
      upiPct: Math.round((metrics.upi / total) * 100),
      curbsidePct: Math.round((metrics.curbsidePos / total) * 100),
    };
  }, [metrics]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== "all") {
        if (statusFilter === "captured" && p.status !== "captured" && p.status !== "successful") {
          return false;
        }
        if (statusFilter === "authorized" && p.status !== "authorized") return false;
        if (statusFilter === "refunded" && p.status !== "refunded") return false;
      }

      if (methodFilter !== "all") {
        if (methodFilter === "online" && p.gateway !== "razorpay" && p.payment_method !== "card_online") {
          return false;
        }
        if (methodFilter === "upi" && p.gateway !== "upi" && p.payment_method !== "upi") {
          return false;
        }
        if (
          methodFilter === "curbside" &&
          p.gateway !== "cash" &&
          p.gateway !== "admin_pos" &&
          p.payment_method !== "cash" &&
          p.payment_method !== "card_pos"
        ) {
          return false;
        }
      }

      if (hubFilter !== "all") {
        const city = (p.booking?.location?.city || "").toLowerCase();
        if (!city.includes(hubFilter.toLowerCase())) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ref = (p.transaction_ref || "").toLowerCase();
        const code = (p.booking?.booking_code || "").toLowerCase();
        const customer = (p.booking?.full_name || p.booking?.customer?.full_name || "").toLowerCase();
        const phone = (p.booking?.phone || p.booking?.customer?.phone || "").toLowerCase();
        const car = (p.booking?.car_name || p.booking?.car?.name || "").toLowerCase();

        return (
          ref.includes(q) ||
          code.includes(q) ||
          customer.includes(q) ||
          phone.includes(q) ||
          car.includes(q)
        );
      }

      return true;
    });
  }, [payments, statusFilter, methodFilter, hubFilter, searchQuery]);

  const copyToClipboard = (text: string, refKey: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedRef(refKey);
    setTimeout(() => setCopiedRef(null), 1800);
  };

  const exportToCSV = () => {
    const headers = [
      "Transaction Reference",
      "Date",
      "Booking Code",
      "Customer Name",
      "Customer Phone",
      "Vehicle",
      "City Hub",
      "Payment Mode",
      "Gateway",
      "Status",
      "Amount (INR)",
    ];

    const rows = filteredPayments.map((p) => [
      `"${p.transaction_ref}"`,
      `"${new Date(p.created_at).toLocaleString("en-IN")}"`,
      `"${p.booking?.booking_code || ""}"`,
      `"${p.booking?.full_name || ""}"`,
      `"${p.booking?.phone || ""}"`,
      `"${p.booking?.car_name || p.booking?.car?.name || ""}"`,
      `"${p.booking?.location?.city || ""}"`,
      `"${p.payment_method || "online"}"`,
      `"${p.gateway}"`,
      `"${p.status}"`,
      Number(p.amount || 0),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `primerides_financial_ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMethodBadge = (method?: string | null, gateway?: string) => {
    const m = (method || "").toLowerCase();
    const g = (gateway || "").toLowerCase();

    if (m === "cash" || g === "cash") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill d-inline-flex align-items-center gap-1">
          <Banknote className="w-3 h-3" />
          <span>Cash in Hand</span>
        </span>
      );
    }
    if (m === "card_pos" || g === "admin_pos") {
      return (
        <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill d-inline-flex align-items-center gap-1">
          <CreditCard className="w-3 h-3" />
          <span>POS Terminal</span>
        </span>
      );
    }
    if (m === "upi" || m === "upi_pos" || g === "upi") {
      return (
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill d-inline-flex align-items-center gap-1">
          <QrCode className="w-3 h-3" />
          <span>UPI QR</span>
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill d-inline-flex align-items-center gap-1">
        <CreditCard className="w-3 h-3" />
        <span>Razorpay</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "captured":
      case "successful":
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill d-inline-flex align-items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Settled / Captured</span>
          </span>
        );
      case "authorized":
        return (
          <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill d-inline-flex align-items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Authorized Hold</span>
          </span>
        );
      case "refunded":
        return (
          <span className="badge bg-secondary-subtle text-secondary border rounded-pill d-inline-flex align-items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            <span>Refunded</span>
          </span>
        );
      default:
        return (
          <span className="badge bg-light text-muted border rounded-pill d-inline-flex align-items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <PageContainer>
      {/* Top Header & Executive Action Bar */}
      <PageHeader
        eyebrow="Financial Management"
        title="Accounts & Financial Reports"
        description="Real-time transaction reconciliation, collection breakdowns by payment mode, and audit reports."
        actions={
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-white btn-sm border shadow-sm d-inline-flex align-items-center gap-1.5"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5"
              onClick={exportToCSV}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* 1. FINANCIAL KPI METRICS ROW */}
      <div className="row g-3 mb-4">
        {/* Total Settled Collections */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-mint">
            <div className="card-header pb-0 border-0 bg-transparent pt-3 px-4 d-flex align-items-center justify-content-between">
              <div className="avatar rounded-circle d-flex align-items-center justify-content-center bg-emerald-100 text-emerald-700" style={{ width: "42px", height: "42px" }}>
                <Wallet className="w-4 h-4" />
              </div>
              <TrendArrowBadge value="+24.6%" period="collections" pastelTheme="mint" />
            </div>
            <div className="card-body pt-3 px-4 pb-3">
              <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                Total Collections
              </p>
              <h3 className="mb-1 fw-bold text-dark">
                ₹{metrics.captured.toLocaleString("en-IN")}
              </h3>
              <small className="text-muted d-block" style={{ fontSize: "12px" }}>
                From {payments.filter((p) => p.status === "captured" || p.status === "successful").length} completed settlements
              </small>
            </div>
          </div>
        </div>

        {/* Online Gateway (Razorpay) */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-lavender">
            <div className="card-header pb-0 border-0 bg-transparent pt-3 px-4 d-flex align-items-center justify-content-between">
              <div className="avatar rounded-circle d-flex align-items-center justify-content-center bg-purple-100 text-purple-700" style={{ width: "42px", height: "42px" }}>
                <CreditCard className="w-4 h-4" />
              </div>
              <TrendArrowBadge value={`${modeDistribution.onlinePct}% share`} period="Razorpay" pastelTheme="lavender" />
            </div>
            <div className="card-body pt-3 px-4 pb-3">
              <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                Online (Razorpay)
              </p>
              <h3 className="mb-1 fw-bold text-dark">
                ₹{metrics.online.toLocaleString("en-IN")}
              </h3>
              <small className="text-muted d-block" style={{ fontSize: "12px" }}>
                Secured via instant 3D Gateway
              </small>
            </div>
          </div>
        </div>

        {/* Handover POS & Cash */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-sky">
            <div className="card-header pb-0 border-0 bg-transparent pt-3 px-4 d-flex align-items-center justify-content-between">
              <div className="avatar rounded-circle d-flex align-items-center justify-content-center bg-sky-100 text-sky-700" style={{ width: "42px", height: "42px" }}>
                <Banknote className="w-4 h-4" />
              </div>
              <TrendArrowBadge value={`${modeDistribution.curbsidePct}% share`} period="curbside" pastelTheme="sky" />
            </div>
            <div className="card-body pt-3 px-4 pb-3">
              <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                Curbside POS & Cash
              </p>
              <h3 className="mb-1 fw-bold text-dark">
                ₹{metrics.curbsidePos.toLocaleString("en-IN")}
              </h3>
              <small className="text-muted d-block" style={{ fontSize: "12px" }}>
                Collected at vehicle delivery
              </small>
            </div>
          </div>
        </div>

        {/* Outstanding Booking Balance */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-peach">
            <div className="card-header pb-0 border-0 bg-transparent pt-3 px-4 d-flex align-items-center justify-content-between">
              <div className="avatar rounded-circle d-flex align-items-center justify-content-center bg-amber-100 text-amber-700" style={{ width: "42px", height: "42px" }}>
                <Clock className="w-4 h-4" />
              </div>
              <TrendArrowBadge value="Pending" period="handover" pastelTheme="peach" />
            </div>
            <div className="card-body pt-3 px-4 pb-3">
              <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                Outstanding Balance
              </p>
              <h3 className="mb-1 fw-bold text-dark">
                ₹{metrics.uncollectedBalance.toLocaleString("en-IN")}
              </h3>
              <small className="text-muted d-block" style={{ fontSize: "12px" }}>
                Pending collection at handover
              </small>
            </div>
          </div>
        </div>
      </div>

            {/* Interactive Revenue Dynamic Graph */}
      <div className="mb-4">
        <RevenueTrendAreaChart />
      </div>

      {/* 2. PAYMENT MODE DISTRIBUTION BAR */}
      <div className="card border mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <Percent className="w-4 h-4 text-primary" />
              <h6 className="card-title mb-0 fw-bold">Payment Mode Revenue Composition</h6>
            </div>
            <small className="text-muted">
              Total Settled: <strong className="text-dark">₹{metrics.captured.toLocaleString("en-IN")}</strong>
            </small>
          </div>

          <div className="progress progress-sm mb-3 rounded-pill overflow-hidden" style={{ height: "10px" }}>
            <div
              className="progress-bar bg-warning"
              style={{ width: `${modeDistribution.onlinePct || 0}%` }}
              title={`Online: ${modeDistribution.onlinePct}%`}
            />
            <div
              className="progress-bar bg-info"
              style={{ width: `${modeDistribution.curbsidePct || 0}%` }}
              title={`Curbside POS: ${modeDistribution.curbsidePct}%`}
            />
            <div
              className="progress-bar bg-primary"
              style={{ width: `${modeDistribution.upiPct || 0}%` }}
              title={`UPI QR: ${modeDistribution.upiPct}%`}
            />
          </div>

          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-1" style={{ fontSize: "12px" }}>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning rounded-circle p-1" style={{ width: "8px", height: "8px" }}></span>
              <span className="text-muted">Online 3D Gateway:</span>
              <strong className="text-dark">₹{metrics.online.toLocaleString("en-IN")} ({modeDistribution.onlinePct}%)</strong>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-info rounded-circle p-1" style={{ width: "8px", height: "8px" }}></span>
              <span className="text-muted">Curbside POS & Cash:</span>
              <strong className="text-dark">₹{metrics.curbsidePos.toLocaleString("en-IN")} ({modeDistribution.curbsidePct}%)</strong>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary rounded-circle p-1" style={{ width: "8px", height: "8px" }}></span>
              <span className="text-muted">UPI QR Transfer:</span>
              <strong className="text-dark">₹{metrics.upi.toLocaleString("en-IN")} ({modeDistribution.upiPct}%)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TRANSACTION LEDGER CONTROLS (TABS, FILTERS & SEARCH) */}
      <div className="card border mb-4">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            {/* Authentic Nexlink Nav Pills */}
            <ul className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0" role="tablist">
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill ${statusFilter === "all" ? "active" : ""}`}
                  onClick={() => setStatusFilter("all")}
                >
                  All ({payments.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill ${statusFilter === "captured" ? "active" : ""}`}
                  onClick={() => setStatusFilter("captured")}
                >
                  Settled / Captured
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill ${statusFilter === "authorized" ? "active" : ""}`}
                  onClick={() => setStatusFilter("authorized")}
                >
                  Authorized Holds
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill ${statusFilter === "refunded" ? "active" : ""}`}
                  onClick={() => setStatusFilter("refunded")}
                >
                  Refunded
                </button>
              </li>
            </ul>

            {/* Filter Dropdowns & Search */}
            <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="form-select form-select-sm w-auto"
              >
                <option value="all">All Modes</option>
                <option value="online">Online Gateway</option>
                <option value="curbside">Curbside POS & Cash</option>
                <option value="upi">UPI QR Code</option>
              </select>

              <select
                value={hubFilter}
                onChange={(e) => setHubFilter(e.target.value)}
                className="form-select form-select-sm w-auto"
              >
                <option value="all">All Locations</option>
                <option value="delhi">Delhi NCR</option>
                <option value="lucknow">Lucknow</option>
              </select>

              <div className="position-relative" style={{ minWidth: "220px" }}>
                <input
                  type="text"
                  placeholder="Search Txn ID, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control form-control-sm ps-5"
                />
                <Search className="w-4 h-4 text-muted position-absolute top-50 start-0 translate-middle-y ms-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FINANCIAL LEDGER TABLE */}
      <div className="card border mb-4 overflow-hidden">
        <div className="card-header d-flex align-items-center justify-content-between py-3 px-4 border-bottom bg-transparent">
          <h6 className="card-title mb-0 fw-bold text-dark">
            Transaction Ledger ({filteredPayments.length})
          </h6>
          <small className="text-muted">
            Click any row to inspect invoice & receipt breakdown
          </small>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="card-body p-5 text-center">
            <Receipt className="w-10 h-10 text-muted mb-2 mx-auto" />
            <h6 className="fw-bold text-dark">No Transactions Found</h6>
            <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
              No payments match your selected search query or filters.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Txn Reference</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Date & Time</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Customer</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Booking / Vehicle</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Payment Mode</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Status</th>
                  <th className="py-3 px-4 text-uppercase text-muted text-end" style={{ fontSize: "11px" }}>Amount</th>
                  <th className="py-3 px-4 text-uppercase text-muted text-end" style={{ fontSize: "11px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const isCopied = copiedRef === `TXN-${p.id}`;
                  return (
                    <tr
                      key={p.id}
                      className="cursor-pointer"
                      onClick={() => setInspectingPayment(p)}
                    >
                      {/* Txn Reference */}
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-1.5">
                          <code className="text-dark fw-bold bg-light px-2 py-0.5 rounded border" style={{ fontSize: "11.5px" }}>
                            {p.transaction_ref}
                          </code>
                          <button
                            type="button"
                            className="btn btn-sm btn-link p-0 text-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(p.transaction_ref, `TXN-${p.id}`);
                            }}
                            title="Copy Transaction Ref"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <small className="text-muted d-block mt-0.5" style={{ fontSize: "11px" }}>
                          GW: {p.gateway}
                        </small>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4">
                        <div className="fw-semibold text-dark" style={{ fontSize: "13px" }}>
                          {new Date(p.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <small className="text-muted" style={{ fontSize: "11px" }}>
                          {new Date(p.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                          {p.booking?.full_name || p.booking?.customer?.full_name || "Guest Customer"}
                        </div>
                        <small className="text-muted" style={{ fontSize: "11.5px" }}>
                          {p.booking?.phone || p.booking?.customer?.phone || "No phone"}
                        </small>
                      </td>

                      {/* Booking / Vehicle */}
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-1.5">
                          <code className="text-primary fw-bold" style={{ fontSize: "12px" }}>
                            {p.booking?.booking_code || `BK-#${p.booking_id}`}
                          </code>
                          {p.booking?.location?.city && (
                            <span className="badge bg-light text-muted border rounded-pill" style={{ fontSize: "10px" }}>
                              {p.booking.location.city}
                            </span>
                          )}
                        </div>
                        <small className="text-muted d-block mt-0.5" style={{ fontSize: "11.5px" }}>
                          {p.booking?.car_name || p.booking?.car?.name || "Vehicle"}
                        </small>
                      </td>

                      {/* Payment Mode */}
                      <td className="py-3 px-4">
                        {getMethodBadge(p.payment_method, p.gateway)}
                      </td>

                      {/* Settlement Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(p.status)}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-end">
                        <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>
                          ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                        </div>
                        <small className="text-muted text-uppercase" style={{ fontSize: "10.5px" }}>
                          {p.currency || "INR"}
                        </small>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-white border shadow-sm d-inline-flex align-items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectingPayment(p);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. INVOICE & RECEIPT MODAL */}
      <AdminModal
        isOpen={Boolean(inspectingPayment)}
        onClose={() => setInspectingPayment(null)}
        title="Transaction Invoice & Reconciliation"
        subtitle={inspectingPayment ? `Reference: ${inspectingPayment.transaction_ref}` : ""}
        size="lg"
        footer={
          <div className="d-flex align-items-center justify-content-between w-100">
            <button
              type="button"
              className="btn btn-light border btn-sm"
              onClick={() => setInspectingPayment(null)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Receipt</span>
            </button>
          </div>
        }
      >
        {inspectingPayment && (
          <div>
            {/* Header banner */}
            <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mb-3 border">
              <div>
                <small className="text-muted text-uppercase fw-semibold d-block" style={{ fontSize: "11px" }}>
                  Settlement Status
                </small>
                <div className="mt-1">
                  {getStatusBadge(inspectingPayment.status)}
                </div>
              </div>
              <div className="text-end">
                <small className="text-muted text-uppercase fw-semibold d-block" style={{ fontSize: "11px" }}>
                  Collected Amount
                </small>
                <h4 className="fw-bold text-dark mb-0">
                  ₹{Number(inspectingPayment.amount || 0).toLocaleString("en-IN")}
                </h4>
              </div>
            </div>

            {/* Two-column summary */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <div className="p-3 border rounded-3 h-100">
                  <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "13px" }}>
                    Customer Details
                  </h6>
                  <div className="d-flex flex-column gap-1" style={{ fontSize: "12.5px" }}>
                    <div>
                      <span className="text-muted">Name: </span>
                      <strong className="text-dark">
                        {inspectingPayment.booking?.full_name || inspectingPayment.booking?.customer?.full_name || "N/A"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted">Phone: </span>
                      <span className="text-dark font-mono">
                        {inspectingPayment.booking?.phone || inspectingPayment.booking?.customer?.phone || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">Email: </span>
                      <span className="text-dark">
                        {inspectingPayment.booking?.email || inspectingPayment.booking?.customer?.email || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="p-3 border rounded-3 h-100">
                  <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "13px" }}>
                    Booking & Vehicle
                  </h6>
                  <div className="d-flex flex-column gap-1" style={{ fontSize: "12.5px" }}>
                    <div>
                      <span className="text-muted">Booking Code: </span>
                      <code className="text-primary fw-bold">
                        {inspectingPayment.booking?.booking_code || `BK-#${inspectingPayment.booking_id}`}
                      </code>
                    </div>
                    <div>
                      <span className="text-muted">Vehicle: </span>
                      <strong className="text-dark">
                        {inspectingPayment.booking?.car_name || inspectingPayment.booking?.car?.name || "N/A"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted">Location Hub: </span>
                      <span className="text-dark">
                        {inspectingPayment.booking?.location?.name || inspectingPayment.booking?.location?.city || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Snapshot & Ledger breakdown */}
            <div className="card border mb-0">
              <div className="card-header py-2.5 px-3 bg-light border-bottom">
                <h6 className="mb-0 fw-bold" style={{ fontSize: "12.5px" }}>
                  Rental Package & Ledger Breakdown
                </h6>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle mb-0" style={{ fontSize: "12.5px" }}>
                  <tbody>
                    <tr>
                      <td className="text-muted ps-3" style={{ width: "40%" }}>KM Package Tier</td>
                      <td className="fw-semibold ps-3">
                        {inspectingPayment.booking?.price_snapshot?.plan_name ||
                          inspectingPayment.booking?.rental_plan?.name ||
                          "Standard Rental"}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-3">Included Kilometers</td>
                      <td className="fw-semibold ps-3">
                        {inspectingPayment.booking?.price_snapshot?.free_km ||
                          inspectingPayment.booking?.rental_plan?.free_km ||
                          300}{" "}
                        KM
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-3">Extra KM Overage Rate</td>
                      <td className="fw-semibold ps-3">
                        ₹{Number(inspectingPayment.booking?.price_snapshot?.extra_km_rate || 7)} / km
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-3">Security Deposit (Refundable)</td>
                      <td className="fw-semibold ps-3">
                        ₹{Number(inspectingPayment.booking?.price_snapshot?.security_deposit || 5000).toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-3">Payment Gateway / Processor</td>
                      <td className="fw-semibold ps-3 text-capitalize">
                        {inspectingPayment.gateway} ({inspectingPayment.payment_method || "standard"})
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </PageContainer>
  );
}
