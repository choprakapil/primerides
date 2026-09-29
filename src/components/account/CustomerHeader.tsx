"use client";

import React from "react";
import Link from "next/link";

interface CustomerHeaderProps {
  customer?: {
    fullName?: string;
    phone?: string;
    isVerified?: boolean;
  } | null;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function CustomerHeader({
  customer,
  onToggleSidebar,
  isSidebarOpen = false,
}: CustomerHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button
          className={`app-toggler ${isSidebarOpen ? "active" : ""}`}
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="app-header-start d-none d-md-flex align-items-center gap-3">
          <div className="d-flex flex-column">
            <h6 className="mb-0 fw-bold text-dark">
              Welcome back, {customer?.fullName || "Valued Member"}
            </h6>
            <small className="text-muted" style={{ fontSize: "12px" }}>
              Self-Drive Luxury Portal • Delhi NCR & Lucknow
            </small>
          </div>

          {customer?.isVerified ? (
            <div className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5">
              <i className="fi fi-rr-check-circle"></i>
              <span className="fw-semibold" style={{ fontSize: "11px" }}>DL VERIFIED</span>
            </div>
          ) : (
            <Link
              href="/account/documents"
              className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1.5 text-decoration-none"
            >
              <i className="fi fi-rr-exclamation"></i>
              <span className="fw-semibold" style={{ fontSize: "11px" }}>KYC ACTION NEEDED</span>
            </Link>
          )}
        </div>

        <div className="app-header-end d-flex align-items-center gap-3">
          <Link
            href="/cars"
            className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3"
          >
            <i className="fi fi-rr-plus"></i>
            <span className="fw-medium">Book New Car</span>
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-light btn-sm border d-flex align-items-center gap-2 text-dark px-3 shadow-sm"
          >
            <i className="fi fi-rr-arrow-up-right-from-square"></i>
            <span className="d-none d-sm-inline fw-medium">Main Site</span>
          </a>

          <div className="vr my-2"></div>

          <div className="d-flex align-items-center gap-2">
            <div className="text-end d-none d-lg-block">
              <div className="fw-bold text-dark lh-sm" style={{ fontSize: "13px" }}>
                {customer?.fullName || "Member"}
              </div>
              <small className="text-muted" style={{ fontSize: "11px" }}>
                {customer?.phone || "Portal User"}
              </small>
            </div>
            <div
              className="avatar avatar-sm rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{ width: "36px", height: "36px", fontSize: "13px" }}
            >
              {customer?.fullName ? customer.fullName.substring(0, 2).toUpperCase() : "CU"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
