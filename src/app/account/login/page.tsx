import React from "react";
import Link from "next/link";
import { customerLoginAction } from "@/server/actions/customer-auth";

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-wrapper min-vh-100 px-3 d-flex align-items-center justify-content-center bg-light w-100">
      <div className="card card-body p-4 p-sm-5 rounded-4 border shadow-sm w-100" style={{ maxWidth: "440px" }}>
        <div className="mb-4 text-center">
          <div
            className="avatar rounded-3 bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm"
            style={{ width: "48px", height: "48px" }}
          >
            PR
          </div>
          <h4 className="fw-bold text-dark mb-1">Customer Portal</h4>
          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            Sign in to manage your luxury self-drive reservations and KYC.
          </p>
        </div>

        {params.error && (
          <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
            <i className="fi fi-rr-exclamation"></i>
            <span>{params.error}</span>
          </div>
        )}

        <form action={customerLoginAction}>
          <input type="hidden" name="callbackUrl" value={params.callbackUrl || "/account"} />

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark text-sm">Mobile Number</label>
            <div className="position-relative">
              <i className="fi fi-rr-smartphone position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="tel"
                name="phone"
                required
                defaultValue="+91 99999 99999"
                className="form-control ps-5"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-dark text-sm">Password</label>
            <div className="position-relative">
              <i className="fi fi-rr-lock position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="password"
                name="password"
                required
                defaultValue="Customer@123"
                className="form-control ps-5"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="mb-4 d-flex align-items-center justify-content-between">
            <div className="form-check mb-0">
              <input type="checkbox" className="form-check-input" id="rememberMe" defaultChecked />
              <label className="form-check-label text-muted text-sm" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <a href="/" className="text-primary text-sm text-decoration-none fw-medium">
              Back to site
            </a>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2.5 fw-semibold shadow-sm">
            Sign In to Portal
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            Need a luxury car?{' '}
            <Link href="/cars" className="text-primary fw-semibold text-decoration-none">
              Browse Fleet
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
