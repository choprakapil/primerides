"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BookingItem {
  id: number;
  booking_number?: string;
  booking_code?: string;
  status: string;
  start_date: string | Date;
  end_date: string | Date;
  pickup_location?: string | null;
  drop_location?: string | null;
  total_amount?: any;
  car_name?: string | null;
  with_chauffeur?: boolean;
  car?: {
    id: number;
    name?: string;
    brand?: string | null;
    model?: string | null;
    category?: string | null;
    image_url?: string | null;
    images?: any;
    fuel_type?: string | null;
    transmission?: string | null;
  } | null;
  location?: {
    name?: string;
  } | null;
  rental_plan?: {
    id: number;
    name: string;
    free_km?: number | null;
    extra_km_rate?: any;
  } | null;
  price_snapshot?: {
    base_rate?: any;
    security_deposit?: any;
    extra_km_rate?: any;
    tax_amount?: any;
    final_total?: any;
  } | null;
}

interface BookingsListClientProps {
  bookings: BookingItem[];
  hasVerifiedDL: boolean;
}

export default function BookingsListClient({
  bookings,
  hasVerifiedDL,
}: BookingsListClientProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed" | "cancelled">(
    "all"
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Cancellation state
  const [bookingsState, setBookingsState] = useState<BookingItem[]>(bookings);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelLoadingId, setCancelLoadingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  async function handleCancelBooking(bookingId: number) {
    setCancelLoadingId(bookingId);
    setCancelError(null);
    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() || undefined }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelError(data.error || "Failed to cancel reservation.");
        return;
      }
      setBookingsState((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
      setCancellingId(null);
      setCancelReason("");
      router.refresh();
    } catch {
      setCancelError("Network error. Please try again.");
    } finally {
      setCancelLoadingId(null);
    }
  }

  const filteredBookings = bookingsState.filter((b) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return ["pending", "confirmed", "active"].includes(b.status);
    if (activeFilter === "completed") return b.status === "completed";
    if (activeFilter === "cancelled") return b.status === "cancelled";
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <span className="badge bg-success-subtle text-success">Confirmed</span>;
      case "active":
        return <span className="badge bg-info-subtle text-info">Active On-Road</span>;
      case "completed":
        return <span className="badge bg-light text-secondary border">Completed</span>;
      case "cancelled":
        return <span className="badge bg-danger-subtle text-danger">Cancelled</span>;
      default:
        return <span className="badge bg-warning-subtle text-warning">Pending Payment</span>;
    }
  };

  return (
    <div className="py-2">
      {/* Filter Tabs using authentic Nexlink nav-pills */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <ul className="nav nav-pills gap-2 bg-light p-1.5 rounded-3 border">
          <li className="nav-item">
            <button
              onClick={() => setActiveFilter("all")}
              className={`nav-link ${activeFilter === "all" ? "active" : ""}`}
              style={{ fontSize: "13px" }}
            >
              All Bookings ({bookingsState.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveFilter("active")}
              className={`nav-link ${activeFilter === "active" ? "active" : ""}`}
              style={{ fontSize: "13px" }}
            >
              Active & Upcoming ({bookingsState.filter((b) => ["pending", "confirmed", "active"].includes(b.status)).length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveFilter("completed")}
              className={`nav-link ${activeFilter === "completed" ? "active" : ""}`}
              style={{ fontSize: "13px" }}
            >
              Completed ({bookingsState.filter((b) => b.status === "completed").length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveFilter("cancelled")}
              className={`nav-link ${activeFilter === "cancelled" ? "active" : ""}`}
              style={{ fontSize: "13px" }}
            >
              Cancelled ({bookingsState.filter((b) => b.status === "cancelled").length})
            </button>
          </li>
        </ul>

        <Link href="/cars" className="btn btn-primary btn-sm px-3">
          <i className="fi fi-rr-plus me-1"></i>
          <span>New Reservation</span>
        </Link>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card border text-center py-5 px-4 mb-4">
          <div className="avatar avatar-xl rounded-circle bg-light text-muted mx-auto mb-3 d-flex align-items-center justify-content-center">
            <i className="fi fi-rr-calendar-check" style={{ fontSize: "32px" }}></i>
          </div>
          <h5 className="fw-bold text-dark mb-1">No Reservations Found</h5>
          <p className="text-muted text-sm mx-auto mb-3" style={{ maxWidth: "400px" }}>
            {activeFilter === "all"
              ? "You haven't reserved any vehicles yet. Explore our curated luxury fleet and book with 15-minute curbside airport delivery."
              : `You don't have any ${activeFilter} reservations at this time.`}
          </p>
          <div>
            <Link href="/cars" className="btn btn-primary px-4">
              Browse Fleet
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredBookings.map((b) => {
            const isExpanded = expandedId === b.id;
            const code = b.booking_number || b.booking_code || ("PR-" + b.id);

            return (
              <div key={b.id} className="card border mb-2 shadow-sm">
                <div className="card-header py-3 px-4 bg-transparent border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="font-monospace fw-bold text-primary">
                      #{code}
                    </span>
                    {getStatusBadge(b.status)}
                    {b.with_chauffeur && (
                      <span className="badge bg-purple-subtle text-purple">Chauffeur Driven</span>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark fs-5">
                      ₹{Number(b.total_amount || 0).toLocaleString("en-IN")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                      className="btn btn-light btn-sm border ms-2"
                    >
                      {isExpanded ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                <div className="card-body p-4">
                  <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-4">
                      <h5 className="fw-bold text-dark mb-1">
                        {b.car?.model || b.car_name || "Self-Drive Vehicle"}
                      </h5>
                      <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                        {b.car?.fuel_type || "Petrol/Diesel"} • {b.car?.transmission || "Automatic"} • {b.location?.name || "Delhi NCR Hub"}
                      </p>
                    </div>

                    <div className="col-12 col-md-5">
                      <div className="d-flex align-items-center gap-3">
                        <div>
                          <small className="text-muted d-block text-uppercase" style={{ fontSize: "10px" }}>START DATE</small>
                          <span className="fw-semibold text-dark">
                            {new Date(b.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <i className="fi fi-rr-arrow-right text-muted"></i>
                        <div>
                          <small className="text-muted d-block text-uppercase" style={{ fontSize: "10px" }}>END DATE</small>
                          <span className="fw-semibold text-dark">
                            {new Date(b.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-3 text-md-end">
                      {["pending", "confirmed"].includes(b.status) && (
                        <button
                          type="button"
                          onClick={() => setCancellingId(b.id)}
                          className="btn btn-outline-danger btn-sm px-3"
                        >
                          Cancel Trip
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-top">
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <h6 className="fw-bold text-dark mb-2">Trip Pickup & Drop Details</h6>
                          <div className="p-3 rounded-3 bg-light border">
                            <div className="mb-2">
                              <small className="text-muted d-block">PICKUP POINT</small>
                              <span className="text-dark fw-medium">{b.pickup_location || "IGI Airport T3 Curbside / Hub"}</span>
                            </div>
                            <div>
                              <small className="text-muted d-block">DROP-OFF POINT</small>
                              <span className="text-dark fw-medium">{b.drop_location || "Same as Pickup Location"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="col-12 col-md-6">
                          <h6 className="fw-bold text-dark mb-2">Rental Plan & Price Snapshot</h6>
                          <div className="p-3 rounded-3 bg-light border">
                            <div className="d-flex justify-content-between mb-1.5">
                              <span className="text-muted">Base Rental Plan</span>
                              <span className="text-dark fw-medium">{b.rental_plan?.name || "Standard KM Package"}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1.5">
                              <span className="text-muted">Free Kilometers</span>
                              <span className="text-dark fw-medium">{b.rental_plan?.free_km || 300} KM</span>
                            </div>
                            <div className="d-flex justify-content-between pt-2 border-top">
                              <span className="fw-bold text-dark">Total Paid</span>
                              <span className="fw-bold text-primary fs-6">₹{Number(b.total_amount || 0).toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancel Dialog Inline */}
                  {cancellingId === b.id && (
                    <div className="mt-3 p-3 rounded-3 bg-danger-subtle border border-danger-subtle">
                      <h6 className="fw-bold text-danger mb-1">Confirm Cancellation</h6>
                      <p className="text-muted text-sm mb-2">
                        Are you sure you want to cancel this booking? Security deposits will be refunded per policy.
                      </p>
                      {cancelError && <div className="alert alert-danger py-1.5 px-3 text-sm mb-2">{cancelError}</div>}
                      <input
                        type="text"
                        placeholder="Optional cancellation reason..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="form-control form-control-sm mb-2"
                      />
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(b.id)}
                          disabled={cancelLoadingId === b.id}
                          className="btn btn-danger btn-sm"
                        >
                          {cancelLoadingId === b.id ? "Cancelling..." : "Confirm Cancel"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancellingId(null)}
                          className="btn btn-light btn-sm border"
                        >
                          Keep Reservation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
