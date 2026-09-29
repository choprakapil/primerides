"use client";

import React from "react";
import Link from "next/link";
import DraggableDashboardGrid, { DashboardWidget } from "../admin/ui/DraggableDashboardGrid";
import CustomerTripStatsChart from "./charts/CustomerTripStatsChart";
import CustomerVipTierCard from "./charts/CustomerVipTierCard";
import TrendArrowBadge from "../admin/ui/TrendArrowBadge";
import { CalendarCheck, Car, ShieldCheck, CreditCard, ArrowRight, CheckCircle2, Clock, AlertCircle, XCircle, Navigation } from "lucide-react";

interface CustomerDashboardOverviewProps {
  customer: any;
  activeBooking: any;
  recentBookings: any[];
  stats: {
    totalBookings: number;
    activeTrips: number;
    totalSpent: number;
    hasVerifiedDL: boolean;
  };
}

export default function CustomerDashboardOverview({
  customer,
  activeBooking,
  recentBookings,
  stats,
}: CustomerDashboardOverviewProps) {
  // Moveable Customer Widgets
  const widgets: DashboardWidget[] = [
    {
      id: "customer-trip-stats",
      title: "Travel Mileage & Trip Activity",
      category: "Analytics",
      colSpanClass: "col-12 col-xl-7",
      component: <CustomerTripStatsChart />,
    },
    {
      id: "customer-vip-tier",
      title: "VIP Concierge & Loyalty Tier",
      category: "Membership",
      colSpanClass: "col-12 col-xl-5",
      component: <CustomerVipTierCard />,
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
      {/* 4 Directional Pastel KPI Cards */}
      <div className="row g-3">
        {/* Total Bookings */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-lavender">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-purple-100 text-purple-700 d-flex align-items-center justify-content-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="+3 Bookings" period="history" pastelTheme="lavender" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Total Reservations
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.totalBookings}</div>
              <div className="text-[11px] text-muted mt-1">
                Lifetime journeys completed
              </div>
            </div>
          </div>
        </div>

        {/* Active Trips */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-sky">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-sky-100 text-sky-700 d-flex align-items-center justify-content-center">
                  <Car className="w-5 h-5" />
                </div>
                <TrendArrowBadge value={stats.activeTrips > 0 ? "On Road" : "Ready"} period="status" pastelTheme="sky" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Live Trips
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.activeTrips}</div>
              <div className="text-[11px] text-muted mt-1">
                Current active vehicle rentals
              </div>
            </div>
          </div>
        </div>

        {/* KYC Driving License Status */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-mint">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-emerald-100 text-emerald-700 d-flex align-items-center justify-content-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <TrendArrowBadge
                  value={stats.hasVerifiedDL ? "Verified" : "Pending"}
                  period="DL Gate"
                  pastelTheme={stats.hasVerifiedDL ? "mint" : "peach"}
                />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Handover Status
              </div>
              <div className="h4 mb-0 fw-bold text-dark mt-0.5">
                {stats.hasVerifiedDL ? "Handover Ready" : "DL Verification Required"}
              </div>
              <div className="text-[11px] text-muted mt-1">
                {stats.hasVerifiedDL ? "Fast-track key release" : "Upload driving license to release key"}
              </div>
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-peach">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-amber-100 text-amber-700 d-flex align-items-center justify-content-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="₹0 Due" period="settled" pastelTheme="peach" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Total Spend Value
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">
                ₹{(stats.totalSpent / 1000).toFixed(1)}k
              </div>
              <div className="text-[11px] text-muted mt-1">
                Rental fee + refundable security deposit
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Trip Banner if any */}
      {activeBooking && (
        <div className="card border pastel-card pastel-card-sky shadow-sm">
          <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <span className="telemetry-radar-dot" />
              <h6 className="mb-0 fw-bold text-dark">Live Rental Trip #{activeBooking.booking_code}</h6>
            </div>
            <span className="badge bg-sky-50 text-sky-700 border border-sky-200 fw-bold px-3 py-1 rounded-pill">
              {activeBooking.status.toUpperCase()}
            </span>
          </div>
          <div className="card-body p-4">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-4">
                <h5 className="fw-bold text-dark mb-1">{activeBooking.car?.name}</h5>
                <p className="text-muted mb-0 text-xs">
                  {activeBooking.car?.transmission} • {activeBooking.car?.fuel_type} • {activeBooking.location?.name}
                </p>
              </div>
              <div className="col-12 col-md-5">
                <div className="d-flex align-items-center gap-3">
                  <div>
                    <small className="text-muted d-block text-[10px] font-bold text-uppercase">START</small>
                    <span className="fw-semibold text-dark text-sm">
                      {new Date(activeBooking.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted" />
                  <div>
                    <small className="text-muted d-block text-[10px] font-bold text-uppercase">RETURN</small>
                    <span className="fw-semibold text-dark text-sm">
                      {new Date(activeBooking.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-3 text-md-end">
                <Link
                  href={`/account/bookings?selected=${activeBooking.id}`}
                  className="btn btn-primary btn-sm px-3 rounded-pill"
                >
                  Trip Details &amp; Digital Pass
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draggable Moveable Widgets Grid for Customer */}
      <DraggableDashboardGrid
        widgets={widgets}
        storageKey="primerides_customer_dashboard_widgets_v1"
      />

      {/* Recent Rentals Table */}
      <div className="card border overflow-hidden shadow-2xs rounded-4">
        <div className="card-header py-3 px-4 bg-white border-bottom d-flex align-items-center justify-content-between">
          <div>
            <h5 className="card-title mb-0 fw-bold text-dark">Recent Reservations</h5>
            <small className="text-muted">Your past luxury bookings, invoices, and rental history</small>
          </div>
          <Link href="/account/bookings" className="btn btn-sm btn-white border shadow-2xs text-muted hover:text-dark rounded-pill px-3">
            View All ({recentBookings.length})
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Reservation</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Vehicle</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Dates</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>City Hub</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Amount</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Status</th>
                  <th className="py-3 px-4 text-uppercase text-muted text-end" style={{ fontSize: "11px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <div className="mb-2">
                        <Car className="w-8 h-8 text-muted mx-auto" />
                      </div>
                      <p className="mb-2">You have not made any luxury bookings yet.</p>
                      <Link href="/cars" className="btn btn-primary btn-sm rounded-pill px-3">
                        Browse Luxury Fleet
                      </Link>
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="py-3 px-4 font-monospace fw-semibold text-purple-700">
                        #{b.booking_code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="fw-bold text-dark">{b.car?.name}</div>
                        <small className="text-muted">{b.car?.fuel_type} • {b.car?.transmission}</small>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-dark fw-medium text-xs">
                          {new Date(b.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                        <small className="text-muted">
                          to {new Date(b.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </small>
                      </td>
                      <td className="py-3 px-4 text-muted">
                        <span className="badge bg-light border text-muted rounded-pill">
                          {b.location?.name || "Delhi NCR"}
                        </span>
                      </td>
                      <td className="py-3 px-4 fw-bold text-dark">
                        ₹{Number(b.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        {renderStatusBadge(b.status)}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <Link
                          href={`/account/bookings?selected=${b.id}`}
                          className="btn btn-sm btn-white border shadow-2xs rounded-pill px-2.5 text-xs text-muted hover:text-dark"
                        >
                          View Pass
                        </Link>
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
