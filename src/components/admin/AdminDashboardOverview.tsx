"use client";

import React from "react";
import Link from "next/link";
import DraggableDashboardGrid, { DashboardWidget } from "./ui/DraggableDashboardGrid";
import RevenueTrendAreaChart from "./charts/RevenueTrendAreaChart";
import FleetUtilizationDonutChart from "./charts/FleetUtilizationDonutChart";
import LocationPerformanceBarChart from "./charts/LocationPerformanceBarChart";
import LiveFleetTelemetryCard from "./charts/LiveFleetTelemetryCard";
import TrendArrowBadge from "./ui/TrendArrowBadge";
import {
  Car,
  CalendarCheck,
  ShieldCheck,
  Users,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface AdminDashboardOverviewProps {
  stats: {
    totalCars: number;
    activeBookings: number;
    pendingKyc: number;
    totalCustomers: number;
  };
  recentBookings: any[];
}

const kpiCards = [
  {
    key: "totalCars",
    label: "Active Fleet",
    sub: "Delhi NCR & Lucknow luxury models",
    trendValue: "+12.5%",
    trendPeriod: "fleet",
    trendTheme: "lavender" as const,
    Icon: Car,
    iconBg: "kpi-icon-purple",
    accentClass: "kpi-card-purple",
  },
  {
    key: "activeBookings",
    label: "Active Bookings",
    sub: "Live trips & confirmed schedules",
    trendValue: "+28.4%",
    trendPeriod: "trips",
    trendTheme: "mint" as const,
    Icon: CalendarCheck,
    iconBg: "kpi-icon-emerald",
    accentClass: "kpi-card-emerald",
  },
  {
    key: "pendingKyc",
    label: "Pending KYC Queue",
    sub: "Driving licenses awaiting review",
    trendValue: "Gate Active",
    trendPeriod: "DL",
    trendTheme: "peach" as const,
    Icon: ShieldCheck,
    iconBg: "kpi-icon-amber",
    accentClass: "kpi-card-amber",
  },
  {
    key: "totalCustomers",
    label: "Verified Members",
    sub: "Registered VIP club patrons",
    trendValue: "+18.2%",
    trendPeriod: "users",
    trendTheme: "sky" as const,
    Icon: Users,
    iconBg: "kpi-icon-sky",
    accentClass: "kpi-card-sky",
  },
];

const statusConfig: Record<string, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
  confirmed: { label: "Confirmed",       cls: "status-confirmed", Icon: CheckCircle2 },
  active:    { label: "Active Trip",     cls: "status-active",    Icon: Clock },
  pending:   { label: "Pending Handover",cls: "status-pending",   Icon: AlertCircle },
  cancelled: { label: "Cancelled",       cls: "status-cancelled", Icon: XCircle },
};

export default function AdminDashboardOverview({ stats, recentBookings }: AdminDashboardOverviewProps) {
  const widgets: DashboardWidget[] = [
    { id: "revenue-trend",  title: "Revenue & Trip Dynamic Trend",  category: "Financials", colSpanClass: "col-12 col-xl-8", component: <RevenueTrendAreaChart /> },
    { id: "fleet-donut",    title: "Fleet Category Utilization",    category: "Operations", colSpanClass: "col-12 col-xl-4", component: <FleetUtilizationDonutChart /> },
    { id: "location-bars",  title: "Hub Performance & Comparison",  category: "Regional",   colSpanClass: "col-12 col-xl-6", component: <LocationPerformanceBarChart /> },
    { id: "live-telemetry", title: "GPS Telemetry & Fleet Radar",   category: "Safety",     colSpanClass: "col-12 col-xl-6", component: <LiveFleetTelemetryCard /> },
  ];

  const renderStatus = (status: string) => {
    const cfg = statusConfig[status];
    if (!cfg) return <span className="dash-status dash-status-default">{status}</span>;
    const { label, cls, Icon } = cfg;
    return (
      <span className={`dash-status ${cls}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  return (
    <div className="dash-overview">
      {/* ── KPI Cards ──────────────────────────────────── */}
      <div className="dash-kpi-grid">
        {kpiCards.map(({ key, label, sub, trendValue, trendPeriod, trendTheme, Icon, iconBg, accentClass }) => (
          <div key={key} className={`dash-kpi-card ${accentClass}`}>
            <div className="dash-kpi-top">
              <div className={`dash-kpi-icon ${iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <TrendArrowBadge value={trendValue} period={trendPeriod} pastelTheme={trendTheme} />
            </div>
            <div className="dash-kpi-label">{label}</div>
            <div className="dash-kpi-value">{stats[key as keyof typeof stats]}</div>
            <div className="dash-kpi-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Chart Widgets Grid ─────────────────────────── */}
      <DraggableDashboardGrid
        widgets={widgets}
        storageKey="primerides_admin_overview_widgets_v1"
      />

      {/* ── Recent Reservations Table ──────────────────── */}
      <div className="dash-table-card">
        {/* Table Header */}
        <div className="dash-table-header">
          <div>
            <h2 className="dash-table-title">Recent Trip Reservations</h2>
            <p className="dash-table-sub">Live booking requests, chauffeur options &amp; customer status</p>
          </div>
          <Link href="/admin/bookings" className="dash-table-view-all">
            View All
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table */}
        <div className="dash-table-body">
          <table className="dash-table">
            <thead>
              <tr>
                {["Booking ID", "Customer", "Vehicle", "Hub", "Amount", "Status"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dash-table-empty">
                    No reservations found.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link href={`/admin/bookings?selected=${b.id}`} className="dash-booking-id">
                        #{b.booking_code || b.id}
                      </Link>
                    </td>
                    <td>
                      <div className="dash-cell-primary">{b.customer?.full_name || "Member"}</div>
                      <div className="dash-cell-secondary">{b.customer?.phone || "—"}</div>
                    </td>
                    <td>
                      <div className="dash-cell-primary">{b.car?.name || "Vehicle"}</div>
                      <div className="dash-cell-secondary">{b.car?.fuel_type || "Self-Drive"}</div>
                    </td>
                    <td>
                      <span className="dash-hub-badge">{b.location?.name || "Delhi NCR"}</span>
                    </td>
                    <td>
                      <span className="dash-amount">₹{Number(b.total_amount || 0).toLocaleString("en-IN")}</span>
                    </td>
                    <td>{renderStatus(b.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
