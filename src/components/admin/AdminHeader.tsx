"use client";

import React from "react";
import Link from "next/link";
import { useAdminLayout } from "./AdminLayoutContext";

export default function AdminHeader() {
  const { toggleCollapse, isCollapsed } = useAdminLayout();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button
          className={`app-toggler ${isCollapsed ? "active" : ""}`}
          type="button"
          onClick={toggleCollapse}
          aria-label="Toggle navigation sidebar"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="app-header-start d-none d-md-flex align-items-center gap-3">
          <div className="position-relative" style={{ width: "280px" }}>
            <i className="fi fi-rr-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="form-control form-control-fill ps-5"
              placeholder="Search operations, reservations..."
            />
          </div>

          <div className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-none d-lg-inline-flex align-items-center gap-2">
            <span className="spinner-grow spinner-grow-sm text-success" style={{ width: "7px", height: "7px" }} role="status"></span>
            <span className="fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
              FLEET LIVE • NCR & LUCKNOW
            </span>
          </div>
        </div>

        <div className="app-header-end d-flex align-items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-light btn-sm border d-flex align-items-center gap-2 text-dark px-3 shadow-sm"
          >
            <i className="fi fi-rr-arrow-up-right-from-square"></i>
            <span className="d-none d-sm-inline fw-medium">Live Website</span>
          </a>

          <div className="vr my-2"></div>

          <div className="d-flex align-items-center gap-2">
            <div className="text-end d-none d-lg-block">
              <div className="fw-bold text-dark lh-sm" style={{ fontSize: "13px" }}>Master Operations</div>
              <small className="text-muted" style={{ fontSize: "11px" }}>Superadmin</small>
            </div>
            <div
              className="avatar avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{ width: "36px", height: "36px", fontSize: "13px" }}
            >
              OP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
