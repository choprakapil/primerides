import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/server/auth/customer";
import { getCustomerPayments, getCustomerPortalStats, getCustomerUnpaidBookings } from "@/server/booking";
import PaymentsLedgerClient from "@/components/account/PaymentsLedgerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function CustomerPaymentsPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/login?callbackUrl=/account/payments");
  }

  const [rawPayments, stats, rawUnpaidBookings] = await Promise.all([
    getCustomerPayments(customer.id),
    getCustomerPortalStats(customer.id),
    getCustomerUnpaidBookings(customer.id),
  ]);

  const payments = JSON.parse(JSON.stringify(rawPayments));
  const unpaidBookings = JSON.parse(JSON.stringify(rawUnpaidBookings));

  const totalCaptured = payments
    .filter((p: any) => p.status === "captured")
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  const totalAuthorized = payments
    .filter((p: any) => p.status === "authorized")
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  const pendingUnpaidTotal = unpaidBookings
    .reduce((sum: number, b: any) => sum + (Number(b.total_amount || 0) - Number(b.totalPaid || 0)), 0);

  return (
    <div className="py-2">
      {/* Page Header */}
      <div className="app-page-head d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill mb-2 fw-semibold" style={{ fontSize: "11px" }}>
            BILLING &amp; ACCOUNTS
          </span>
          <h4 className="fw-bold text-dark mb-1">
            Payments &amp; Ledger
          </h4>
          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            View completed transactions, security deposit authorizations, and Razorpay receipts.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link href="/cars" className="btn btn-primary btn-sm px-3 d-flex align-items-center gap-1.5">
            <i className="fi fi-rr-plus"></i>
            <span>New Booking</span>
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border h-100">
            <div className="card-header pb-0 border-0 bg-transparent pt-3 px-4 d-flex align-items-center justify-content-between">
              <div className="avatar rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style={{ width: "44px", height: "44px" }}>
                <i className="fi fi-rr-check-circle" style={{ fontSize: "20px" }}></i>
              </div>
              <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1.5">Settled</span>
            </div>
            <div className="card-body pt-3 px-4 pb-4">
              <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Total Captured</p>
              <h2 className="mb-0 fw-bold text-dark">₹{totalCaptured.toLocaleString("en-IN")}</h2>
              <small className="text-muted d-block mt-1">Settled rental charges &amp; fees</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border h-100">
            <div className="card-header pb-0 border-0 bg-transparent pt-3 px-4 d-flex align-items-center justify-content-between">
              <div className="avatar rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: "44px", height: "44px" }}>
                <i className="fi fi-rr-lock" style={{ fontSize: "20px" }}></i>
              </div>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1.5">Hold</span>
            </div>
            <div className="card-body pt-3 px-4 pb-4">
              <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Security Deposits</p>
              <h2 className="mb-0 fw-bold text-dark">₹{totalAuthorized.toLocaleString("en-IN")}</h2>
              <small className="text-muted d-block mt-1">Authorized holds (refunded post-trip)</small>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border h-100">
            <div className="card-header pb-0 border-0 bg-transparent pt-3 px-4 d-flex align-items-center justify-content-between">
              <div className="avatar rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center" style={{ width: "44px", height: "44px" }}>
                <i className="fi fi-rr-clock" style={{ fontSize: "20px" }}></i>
              </div>
              <span className="badge bg-warning-subtle text-warning rounded-pill px-2.5 py-1.5">Pending</span>
            </div>
            <div className="card-body pt-3 px-4 pb-4">
              <p className="text-muted mb-1 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Pending Payments</p>
              <h2 className="mb-0 fw-bold text-dark">₹{pendingUnpaidTotal.toLocaleString("en-IN")}</h2>
              <small className="text-muted d-block mt-1">{unpaidBookings.length} bookings awaiting settlement</small>
            </div>
          </div>
        </div>
      </div>

      <PaymentsLedgerClient
        initialPayments={payments}
        initialUnpaidBookings={unpaidBookings}
        customerEmail={customer.email || undefined}
        customerPhone={customer.phone}
        customerName={customer.fullName}
      />
    </div>
  );
}
