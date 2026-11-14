"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatIstDate } from "@/lib/dates";

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
  coupon_code?: string | null;
  discount_amount?: any;
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
  const searchParams = useSearchParams();

  const isJustConfirmed = searchParams?.get("confirmed") === "true";
  const confirmedCode = searchParams?.get("bookingCode");
  const targetBookingId = searchParams?.get("bookingId") ? Number(searchParams.get("bookingId")) : null;

  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed" | "cancelled">(
    "all"
  );
  const [expandedId, setExpandedId] = useState<number | null>(targetBookingId);

  // Cancellation state
  const [bookingsState, setBookingsState] = useState<BookingItem[]>(bookings);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelLoadingId, setCancelLoadingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Coupon state
  const [couponInputs, setCouponInputs] = useState<Record<number, string>>({});
  const [couponLoadingId, setCouponLoadingId] = useState<number | null>(null);
  const [couponErrors, setCouponErrors] = useState<Record<number, string>>({});
  const [couponSuccesses, setCouponSuccesses] = useState<Record<number, string>>({});

  useEffect(() => {
    if (targetBookingId) {
      setExpandedId(targetBookingId);
    }
  }, [targetBookingId]);

  async function handleApplyCoupon(bookingId: number) {
    const code = (couponInputs[bookingId] || "").trim();
    if (!code) return;
    setCouponLoadingId(bookingId);
    setCouponErrors((prev) => ({ ...prev, [bookingId]: "" }));
    setCouponSuccesses((prev) => ({ ...prev, [bookingId]: "" }));

    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: code }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setCouponErrors((prev) => ({ ...prev, [bookingId]: data.error || "Failed to apply coupon." }));
      } else {
        setCouponSuccesses((prev) => ({ ...prev, [bookingId]: data.message || "Coupon applied successfully!" }));
        setBookingsState((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  total_amount: data.data.total_amount,
                  coupon_code: data.data.coupon_code,
                  discount_amount: data.data.discount_amount,
                }
              : b
          )
        );
        router.refresh();
      }
    } catch {
      setCouponErrors((prev) => ({ ...prev, [bookingId]: "Network error. Please try again." }));
    } finally {
      setCouponLoadingId(null);
    }
  }

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
      case "expired":
        return <span className="badge bg-secondary-subtle text-secondary border">Reservation Expired</span>;
      default:
        return <span className="badge bg-warning-subtle text-warning">Pending Payment</span>;
    }
  };

  return (
    <div className="py-2">
      {/* Celebration Banner after successful booking reservation */}
      {isJustConfirmed && (
        <div className="alert alert-success d-flex align-items-center gap-3 p-3.5 rounded-3 border-success mb-4 shadow-sm animate-in fade-in duration-300">
          <div className="avatar avatar-md rounded-circle bg-success text-white d-flex align-items-center justify-content-center shrink-0" style={{ width: "40px", height: "40px" }}>
            <i className="fi fi-rr-check text-lg"></i>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <strong className="text-dark fs-6">
                Booking #{confirmedCode || ""} Reserved Successfully!
              </strong>
              <span className="badge bg-success text-white">Confirmed</span>
            </div>
            <p className="text-muted text-xs mb-0 mt-0.5">
              Your ride is secured in our fleet hub. Please review your trip schedule below, apply any promotional discount coupons, upload your Driving License for instant verification, and complete payment.
            </p>
          </div>
        </div>
      )}

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
                      <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Chauffeur Driven</span>
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
                            {formatIstDate(b.start_date)}
                          </span>
                        </div>
                        <i className="fi fi-rr-arrow-right text-muted"></i>
                        <div>
                          <small className="text-muted d-block text-uppercase" style={{ fontSize: "10px" }}>END DATE</small>
                          <span className="fw-semibold text-dark">
                            {formatIstDate(b.end_date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-3 text-md-end d-flex flex-wrap align-items-center justify-content-md-end gap-2">
                      {b.status === "pending" && (
                        <Link
                          href="/account/payments"
                          className="btn btn-primary btn-sm px-3 d-inline-flex align-items-center gap-1.5 fw-semibold shadow-sm"
                        >
                          <i className="fi fi-rr-credit-card"></i>
                          <span>Pay Now</span>
                        </Link>
                      )}

                      {b.status === "expired" && (
                        <Link
                          href="/cars"
                          className="btn btn-outline-warning btn-sm px-3 d-inline-flex align-items-center gap-1.5 text-dark"
                        >
                          <i className="fi fi-rr-refresh"></i>
                          <span>Rebook Car</span>
                        </Link>
                      )}

                      <Link
                        href={`/account/bookings/${b.id}/invoice`}
                        className="btn btn-outline-dark btn-sm px-2.5 d-inline-flex align-items-center gap-1"
                        title="View & Download Official GST Tax Invoice"
                      >
                        <i className="fi fi-rr-file-invoice"></i>
                        <span>Tax Invoice</span>
                      </Link>

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
                              <span className="fw-bold text-dark">Total Amount</span>
                              <span className="fw-bold text-primary fs-6">₹{Number(b.total_amount || 0).toLocaleString("en-IN")}</span>
                            </div>

                            {/* Promo Coupon Application for Pending Bookings */}
                            {b.status === "pending" && (
                              <div className="mt-3 pt-2.5 border-top">
                                <label className="text-muted d-block fw-bold mb-1" style={{ fontSize: "11px" }}>PROMO / COUPON CODE</label>
                                {b.coupon_code ? (
                                  <div className="d-flex align-items-center justify-content-between p-2 rounded bg-success-subtle text-success text-xs">
                                    <span>🏷️ Applied: <strong>{b.coupon_code}</strong></span>
                                    <span className="badge bg-success text-white">Active</span>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="input-group input-group-sm">
                                      <input
                                        type="text"
                                        placeholder="Enter code (e.g. PRIME10)"
                                        value={couponInputs[b.id] || ""}
                                        onChange={(e) =>
                                          setCouponInputs((prev) => ({
                                            ...prev,
                                            [b.id]: e.target.value.toUpperCase().replace(/\s+/g, ""),
                                          }))
                                        }
                                        className="form-control text-uppercase font-monospace fw-bold"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleApplyCoupon(b.id)}
                                        disabled={couponLoadingId === b.id || !couponInputs[b.id]?.trim()}
                                        className="btn btn-primary"
                                      >
                                        {couponLoadingId === b.id ? "Applying..." : "Apply"}
                                      </button>
                                    </div>
                                    {couponErrors[b.id] && (
                                      <small className="text-danger d-block mt-1" style={{ fontSize: "11px" }}>{couponErrors[b.id]}</small>
                                    )}
                                    {couponSuccesses[b.id] && (
                                      <small className="text-success d-block mt-1" style={{ fontSize: "11px" }}>{couponSuccesses[b.id]}</small>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Next Steps for Customer */}
                            <div className="mt-3 pt-2 border-top d-flex flex-column gap-2">
                              {b.status === "pending" && (
                                <Link
                                  href="/account/payments"
                                  className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 text-xs w-100 justify-content-center"
                                >
                                  <i className="fi fi-rr-credit-card"></i>
                                  <span>Proceed to Online Payment</span>
                                </Link>
                              )}
                              {!hasVerifiedDL && (
                                <Link
                                  href="/account/documents"
                                  className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1.5 text-xs w-100 justify-content-center text-dark"
                                >
                                  <i className="fi fi-rr-id-badge"></i>
                                  <span>Upload Driving License for Handover</span>
                                </Link>
                              )}
                              <a
                                href={`/api/v1/bookings/${b.id}/invoice`}
                                download={`Invoice-${(b.booking_code || b.booking_number || 'PR').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`}
                                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 text-xs w-100 justify-content-center"
                              >
                                <i className="fi fi-rr-download"></i>
                                <span>Download Official PDF Invoice</span>
                              </a>
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
