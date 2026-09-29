"use client";

import React from "react";
import Link from "next/link";
import DraggableDashboardGrid, { DashboardWidget } from "./ui/DraggableDashboardGrid";
import RevenueTrendAreaChart from "./charts/RevenueTrendAreaChart";
import FleetUtilizationDonutChart from "./charts/FleetUtilizationDonutChart";
import LocationPerformanceBarChart from "./charts/LocationPerformanceBarChart";
import LiveFleetTelemetryCard from "./charts/LiveFleetTelemetryCard";
import TrendArrowBadge from "./ui/TrendArrowBadge";
import { Car, CalendarCheck, ShieldCheck, Users, ArrowUpRight, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

interface AdminDashboardOverviewProps {
  stats: {
    totalCars: number;
    activeBookings: number;
    pendingKyc: number;
    totalCustomers: number;
  };
  recentBookings: any[];
}

export default function AdminDashboardOverview({ stats, recentBookings }: AdminDashboardOverviewProps) {
  // Define Moveable / Draggable Widgets
  const widgets: DashboardWidget[] = [
    {
      id: "revenue-trend",
      title: "Revenue & Trip Dynamic Trend",
      category: "Financials",
      colSpanClass: "col-12 col-xl-8",
      component: <RevenueTrendAreaChart />,
    },
    {
      id: "fleet-donut",
      title: "Fleet Category Utilization",
      category: "Operations",
      colSpanClass: "col-12 col-xl-4",
      component: <FleetUtilizationDonutChart />,
    },
    {
      id: "location-bars",
      title: "Hub Performance & Comparison",
      category: "Regional",
      colSpanClass: "col-12 col-xl-6",
      component: <LocationPerformanceBarChart />,
    },
    {
      id: "live-telemetry",
      title: "GPS Telemetry & Fleet Radar",
      category: "Safety",
      colSpanClass: "col-12 col-xl-6",
      component: <LiveFleetTelemetryCard />,
    },
  ];

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="badge rounded-pill bg-emerald-50 text-emerald-700 border border-emerald-200 d-inline-flex align-items-center gap-1 px-2.5 py-1 text-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Confirmed
          </span>
        );
      case "active":
        return (
          <span className="badge rounded-pill bg-sky-50 text-sky-700 border border-sky-200 d-inline-flex align-items-center gap-1 px-2.5 py-1 text-xs">
            <Clock className="w-3 h-3 text-sky-600" />
            Active Trip
          </span>
        );
      case "pending":
        return (
          <span className="badge rounded-pill bg-amber-50 text-amber-700 border border-amber-200 d-inline-flex align-items-center gap-1 px-2.5 py-1 text-xs">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Pending Handover
          </span>
        );
      case "cancelled":
        return (
          <span className="badge rounded-pill bg-rose-50 text-rose-700 border border-rose-200 d-inline-flex align-items-center gap-1 px-2.5 py-1 text-xs">
            <XCircle className="w-3 h-3 text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return <span className="badge rounded-pill bg-light border text-muted px-2.5 py-1 text-xs">{status}</span>;
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* 4 Pastel KPI Cards with Directional Growth Trend Badges */}
      <div className="row g-3">
        {/* Total Fleet */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-lavender">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-purple-100 text-purple-700 d-flex align-items-center justify-content-center">
                  <Car className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="+12.5%" period="fleet" pastelTheme="lavender" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Active Fleet
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.totalCars}</div>
              <div className="text-[11px] text-muted mt-1">
                Delhi NCR &amp; Lucknow luxury models
              </div>
            </div>
          </div>
        </div>

        {/* Active Reservations */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-mint">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-emerald-100 text-emerald-700 d-flex align-items-center justify-content-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="+28.4%" period="trips" pastelTheme="mint" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Active Bookings
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.activeBookings}</div>
              <div className="text-[11px] text-muted mt-1">
                Live trips &amp; confirmed schedules
              </div>
            </div>
          </div>
        </div>

        {/* KYC Verification Gate */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-peach">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-amber-100 text-amber-700 d-flex align-items-center justify-content-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Gate Active" period="DL" pastelTheme="peach" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Pending KYC Queue
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.pendingKyc}</div>
              <div className="text-[11px] text-muted mt-1">
                Driving licenses awaiting review
              </div>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-sky">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-sky-100 text-sky-700 d-flex align-items-center justify-content-center">
                  <Users className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="+18.2%" period="users" pastelTheme="sky" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Verified Members
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.totalCustomers}</div>
              <div className="text-[11px] text-muted mt-1">
                Registered VIP club patrons
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draggable and Moveable Graphs System */}
      <DraggableDashboardGrid
        widgets={widgets}
        storageKey="primerides_admin_overview_widgets_v1"
      />

      {/* Recent Reservations Table */}
      <div className="card border overflow-hidden shadow-2xs rounded-4">
        <div className="card-header py-3 px-4 bg-white border-bottom d-flex align-items-center justify-content-between">
          <div>
            <h5 className="card-title mb-0 fw-bold text-dark">Recent Trip Reservations</h5>
            <small className="text-muted">Live booking requests, chauffeur options, and customer status</small>
          </div>
          <Link href="/admin/bookings" className="btn btn-sm btn-white border shadow-2xs text-muted hover:text-dark rounded-pill px-3">
            View All ({recentBookings.length})
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Booking ID</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Customer</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Vehicle</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Hub</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Amount</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="py-3 px-4 font-monospace fw-semibold text-purple-700">
                        <Link href={`/admin/bookings?selected=${b.id}`} className="text-decoration-none text-purple-700">
                          #{b.booking_code || b.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="fw-bold text-dark">{(b.customer?.full_name || "Member") || "Member"}</div>
                        <small className="text-muted">{(b.customer?.phone || "—")}</small>
                      </td>
                      <td className="py-3 px-4">
                        <div className="fw-semibold text-dark">{b.car?.name || "Vehicle"}</div>
                        <small className="text-muted">{(b.car?.fuel_type || "Self-Drive") || "Self-Drive"}</small>
                      </td>
                      <td className="py-3 px-4 text-muted">
                        <span className="badge bg-light border text-muted rounded-pill">
                          {b.location?.name || "Delhi NCR"}
                        </span>
                      </td>
                      <td className="py-3 px-4 fw-bold text-dark">
                        ₹{Number(b.total_amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        {renderStatusBadge(b.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
