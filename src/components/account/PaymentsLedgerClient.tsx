"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface PaymentRecord {
  id: number;
  booking_id: number;
  amount: any;
  currency: string;
  gateway: string;
  transaction_ref?: string | null;
  gateway_payment_id?: string | null;
  gateway_order_id?: string | null;
  payment_method?: string | null;
  status: string;
  created_at: string | Date;
  booking?: {
    id: number;
    booking_code?: string;
    booking_number?: string;
    car_name?: string | null;
    start_date: string | Date;
    end_date: string | Date;
    car?: {
      name?: string;
      model?: string | null;
    } | null;
    rental_plan?: {
      name: string;
    } | null;
  } | null;
}

export interface UnpaidBookingRecord {
  id: number;
  booking_code?: string;
  booking_number?: string;
  car_name?: string | null;
  total_amount?: any;
  totalPaid?: any;
  status?: string;
  start_date: string | Date;
  end_date: string | Date;
  isPaid?: boolean;
  notes?: string;
  car?: {
    name?: string;
    model?: string | null;
  } | null;
  location?: { name: string } | null;
  rental_plan?: {
    name: string;
    free_km?: number;
  } | null;
  price_snapshot?: {
    plan_name?: string;
    security_deposit?: any;
  } | null;
}

interface PaymentsLedgerClientProps {
  initialPayments: PaymentRecord[];
  initialUnpaidBookings: UnpaidBookingRecord[];
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
}

export default function PaymentsLedgerClient({
  initialPayments,
  initialUnpaidBookings,
  customerEmail = "customer@primerides.in",
  customerPhone = "+91 99999 99999",
  customerName = "PrimeRides Member",
}: PaymentsLedgerClientProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [unpaidList, setUnpaidList] = useState<UnpaidBookingRecord[]>(initialUnpaidBookings);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Checkout Modal State
  const [selectedBooking, setSelectedBooking] = useState<UnpaidBookingRecord | null>(null);
  const [paymentMode, setPaymentMode] = useState<"card_online" | "upi" | "handover_cod">("card_online");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [upiUtr, setUpiUtr] = useState("");

  const pendingBookings = unpaidList.filter((b) => !b.isPaid && b.status !== "cancelled");

  const filteredPayments = payments.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const ref = (p.transaction_ref || p.gateway_payment_id || ("TXN-" + p.id)).toLowerCase();
      const code = (p.booking?.booking_code || p.booking?.booking_number || "").toLowerCase();
      const car = (p.booking?.car_name || p.booking?.car?.model || p.booking?.car?.name || "").toLowerCase();
      return ref.includes(q) || code.includes(q) || car.includes(q);
    }
    return true;
  });

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOpenCheckout = (b: UnpaidBookingRecord) => {
    setSelectedBooking(b);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPaymentMode("card_online");
    setUpiUtr("");
  };

  const handleProcessPayment = async () => {
    if (!selectedBooking) return;
    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const balanceAmount = Number(selectedBooking.total_amount || 0) - Number(selectedBooking.totalPaid || 0);

    if (paymentMode === "card_online") {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg("Could not load Razorpay gateway. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      try {
        const orderRes = await fetch("/api/v1/payments/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: selectedBooking.id,
            amount: balanceAmount,
            currency: "INR",
          }),
        });
        const orderJson = await orderRes.json();
        if (!orderRes.ok || !orderJson.success) {
          throw new Error(orderJson.error || "Failed to create Razorpay payment order.");
        }

        const { orderId, amount, currency, keyId } = orderJson.data;

        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "PrimeRides Luxury Rentals",
          description: "Reservation Balance Payment - #" + (selectedBooking.booking_number || selectedBooking.booking_code || selectedBooking.id),
          order_id: orderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: { color: "#5955D1" },
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/v1/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bookingId: selectedBooking.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  amount: balanceAmount,
                }),
              });
              const verifyJson = await verifyRes.json();
              if (!verifyRes.ok || !verifyJson.success) {
                throw new Error(verifyJson.error || "Payment signature verification failed.");
              }

              setSuccessMsg("Payment verified successfully! Receipt has been issued.");
              const newPayment: PaymentRecord = {
                id: Date.now(),
                booking_id: selectedBooking.id,
                amount: balanceAmount,
                currency: "INR",
                gateway: "razorpay",
                transaction_ref: response.razorpay_payment_id,
                payment_method: "card_online",
                status: "captured",
                created_at: new Date().toISOString(),
                booking: {
                  id: selectedBooking.id,
                  booking_code: selectedBooking.booking_code || selectedBooking.booking_number,
                  car_name: selectedBooking.car_name || selectedBooking.car?.model,
                  start_date: selectedBooking.start_date,
                  end_date: selectedBooking.end_date,
                },
              };

              setPayments((prev) => [newPayment, ...prev]);
              setUnpaidList((prev) => prev.filter((b) => b.id !== selectedBooking.id));
              setTimeout(() => setSelectedBooking(null), 2000);
            } catch (err: any) {
              setErrorMsg(err.message || "Payment verification error.");
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to start Razorpay checkout.");
        setIsProcessing(false);
        return;
      }
    }

    // COD or UPI fallback
    try {
      const res = await fetch("/api/v1/customer/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          paymentMethod: paymentMode,
          transactionRef: paymentMode === "upi" ? upiUtr.trim() : undefined,
          amount: balanceAmount,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Payment processing failed.");
      }
      setSuccessMsg(json.message || "Payment recorded successfully!");
      setUnpaidList((prev) => prev.filter((b) => b.id !== selectedBooking.id));
      setTimeout(() => setSelectedBooking(null), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Payment error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-2">
      {/* 1. Pending Bookings Cards */}
      {pendingBookings.length > 0 && (
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <span className="spinner-grow spinner-grow-sm text-warning" style={{ width: "8px", height: "8px" }}></span>
              <h6 className="fw-bold text-dark mb-0">Reservations Awaiting Settlement</h6>
            </div>
            <span className="badge bg-warning-subtle text-warning">{pendingBookings.length} Pending</span>
          </div>

          <div className="row g-3">
            {pendingBookings.map((b) => {
              const code = b.booking_number || b.booking_code || ("PR-" + b.id);
              const balance = Number(b.total_amount || 0) - Number(b.totalPaid || 0);

              return (
                <div key={b.id} className="col-12 col-md-6">
                  <div className="card border-warning shadow-sm h-100">
                    <div className="card-body p-4 d-flex flex-column justify-content-between gap-3">
                      <div className="d-flex align-items-start justify-content-between">
                        <div>
                          <span className="badge bg-warning-subtle text-warning font-monospace mb-1.5">#{code}</span>
                          <h5 className="fw-bold text-dark mb-0">{b.car?.model || b.car_name || "Luxury Vehicle"}</h5>
                          <small className="text-muted">{b.rental_plan?.name || "KM Plan"} • {b.location?.name || "Delhi NCR"}</small>
                        </div>
                        <div className="text-end">
                          <span className="text-muted d-block" style={{ fontSize: "11px" }}>DUE BALANCE</span>
                          <span className="fs-5 fw-bold text-dark">₹{balance.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                        <span className="text-muted" style={{ fontSize: "12px" }}>Instant 100% Secure Checkout</span>
                        <button
                          type="button"
                          onClick={() => handleOpenCheckout(b)}
                          className="btn btn-primary btn-sm px-3.5 d-flex align-items-center gap-1.5"
                        >
                          <i className="fi fi-rr-credit-card"></i>
                          <span>Pay Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Filter Tabs & Search */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <ul className="nav nav-pills gap-2 bg-light p-1.5 rounded-3 border">
          <li className="nav-item">
            <button
              onClick={() => setFilter("all")}
              className={`nav-link ${filter === "all" ? "active" : ""}`}
              style={{ fontSize: "13px" }}
            >
              All ({payments.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setFilter("captured")}
              className={`nav-link ${filter === "captured" ? "active" : ""}`}
              style={{ fontSize: "13px" }}
            >
              Captured ({payments.filter((p) => p.status === "captured").length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setFilter("authorized")}
              className={`nav-link ${filter === "authorized" ? "active" : ""}`}
              style={{ fontSize: "13px" }}
            >
              Authorized ({payments.filter((p) => p.status === "authorized").length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setFilter("refunded")}
              className={`nav-link ${filter === "refunded" ? "active" : ""}`}
              style={{ fontSize: "13px" }}
            >
              Refunded ({payments.filter((p) => p.status === "refunded").length})
            </button>
          </li>
        </ul>

        <div className="position-relative" style={{ width: "260px" }}>
          <i className="fi fi-rr-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          <input
            type="text"
            placeholder="Search by Txn ID, booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control form-control-sm ps-5 bg-white border"
          />
        </div>
      </div>

      {/* 3. Payments History Table */}
      <div className="card border mb-4 shadow-sm">
        <div className="card-header py-3 px-4 bg-transparent border-bottom d-flex align-items-center justify-content-between">
          <div>
            <h5 className="card-title mb-0 fw-bold text-dark">Transaction History &amp; Receipts</h5>
            <small className="text-muted">Detailed itemized ledger of payments and security deposits</small>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Txn Reference</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Booking Code</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Vehicle</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Date &amp; Time</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Method</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Amount</th>
                  <th className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <div className="mb-2">
                        <i className="fi fi-rr-receipt text-muted" style={{ fontSize: "28px" }}></i>
                      </div>
                      <p className="mb-0">No transaction records found matching your filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const ref = p.transaction_ref || p.gateway_payment_id || ("TXN-" + p.id);
                    const code = p.booking?.booking_code || p.booking?.booking_number || ("PR-" + p.booking_id);

                    return (
                      <tr key={p.id}>
                        <td className="py-3 px-4 font-monospace fw-semibold text-primary">
                          {ref}
                        </td>
                        <td className="py-3 px-4 font-monospace fw-medium text-dark">
                          #{code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="fw-semibold text-dark">{p.booking?.car_name || p.booking?.car?.model || "Vehicle Rental"}</div>
                        </td>
                        <td className="py-3 px-4 text-muted">
                          {new Date(p.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4 text-uppercase text-muted" style={{ fontSize: "11.5px" }}>
                          {p.gateway} • {p.payment_method || "Online"}
                        </td>
                        <td className="py-3 px-4 fw-bold text-dark">
                          ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge ${
                              p.status === "captured"
                                ? "bg-success-subtle text-success"
                                : p.status === "authorized"
                                ? "bg-primary-subtle text-primary"
                                : p.status === "refunded"
                                ? "bg-purple-subtle text-purple"
                                : "bg-danger-subtle text-danger"
                            }`}
                          >
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Checkout Modal (Bootstrap 5 Modal Layout) */}
      {selectedBooking && (
        <>
          <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header py-3 px-4 border-bottom">
                  <h5 className="modal-title fw-bold text-dark">Complete Booking Payment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setSelectedBooking(null)}
                    disabled={isProcessing}
                  />
                </div>

                <div className="modal-body p-4">
                  <div className="p-3 rounded-3 bg-light border mb-3 d-flex align-items-center justify-content-between">
                    <div>
                      <small className="text-muted d-block">VEHICLE &amp; TRIP</small>
                      <span className="fw-bold text-dark">{selectedBooking.car?.model || selectedBooking.car_name || "Self-Drive Luxury Car"}</span>
                    </div>
                    <div className="text-end">
                      <small className="text-muted d-block">AMOUNT TO PAY</small>
                      <span className="fs-5 fw-bold text-primary">
                        ₹{(Number(selectedBooking.total_amount || 0) - Number(selectedBooking.totalPaid || 0)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {errorMsg && <div className="alert alert-danger py-2 px-3 mb-3 text-sm">{errorMsg}</div>}
                  {successMsg && <div className="alert alert-success py-2 px-3 mb-3 text-sm">{successMsg}</div>}

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark text-sm">Select Payment Gateway / Method</label>
                    <div className="d-flex flex-column gap-2">
                      <label className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${paymentMode === "card_online" ? "border-primary bg-primary-subtle" : "bg-white"}`}>
                        <div className="d-flex align-items-center gap-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMode === "card_online"}
                            onChange={() => setPaymentMode("card_online")}
                            className="form-check-input mt-0"
                          />
                          <div>
                            <span className="fw-bold text-dark d-block">Razorpay (Cards, UPI, Netbanking)</span>
                            <small className="text-muted">Instant automated booking confirmation</small>
                          </div>
                        </div>
                        <i className="fi fi-rr-credit-card text-primary fs-5"></i>
                      </label>

                      <label className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer ${paymentMode === "handover_cod" ? "border-primary bg-primary-subtle" : "bg-white"}`}>
                        <div className="d-flex align-items-center gap-2.5">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMode === "handover_cod"}
                            onChange={() => setPaymentMode("handover_cod")}
                            className="form-check-input mt-0"
                          />
                          <div>
                            <span className="fw-bold text-dark d-block">Pay at Curbside Handover</span>
                            <small className="text-muted">Pay via Card / POS during car delivery</small>
                          </div>
                        </div>
                        <i className="fi fi-rr-shield-check text-success fs-5"></i>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer py-3 px-4 border-top">
                  <button
                    type="button"
                    className="btn btn-light border px-3"
                    onClick={() => setSelectedBooking(null)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Proceed to Pay"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}
    </div>
  );
}
