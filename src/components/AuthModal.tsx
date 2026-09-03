"use client";

import React, { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
}

export default function AuthModal({ isOpen, initialMode = "login", onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ background: "rgba(0,0,0,0.7)", zIndex: 1060 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div
          className="modal-content modal-content-lux"
          style={{ borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(197, 155, 39, 0.3)" }}
        >
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
              borderBottom: "1px solid rgba(197, 155, 39, 0.2)",
              padding: "22px 28px",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <img src="/assets/img/PRLogo.png" alt="Primerides" style={{ height: "36px" }} />
              <div>
                <h5 className="modal-title text-white mb-0">Welcome to Primerides</h5>
                <small style={{ color: "var(--primary-color)" }}>Delhi NCR Self-Drive Portal</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-4 p-md-4" style={{ background: "#ffffff" }}>
            <ul className="nav nav-pills nav-fill mb-4 p-1 rounded-pill" style={{ background: "#f1f5f9" }}>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link rounded-pill fw-bold ${mode === "login" ? "active" : ""}`}
                  onClick={() => setMode("login")}
                  style={{
                    cursor: "pointer",
                    background: mode === "login" ? "var(--primary-color)" : "transparent",
                    color: mode === "login" ? "#ffffff" : "#475569",
                  }}
                >
                  Login
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link rounded-pill fw-bold ${mode === "register" ? "active" : ""}`}
                  onClick={() => setMode("register")}
                  style={{
                    cursor: "pointer",
                    background: mode === "register" ? "var(--primary-color)" : "transparent",
                    color: mode === "register" ? "#ffffff" : "#475569",
                  }}
                >
                  Register
                </button>
              </li>
            </ul>

            {/* Login Form */}
            {mode === "login" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Login successful! Redirecting to your Primerides booking dashboard.");
                  onClose();
                }}
              >
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Mobile Number / Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border">
                      <i className="fa-solid fa-mobile-screen-button text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+91 98765 43210 or name@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Password / OTP</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border">
                      <i className="fa-solid fa-lock text-muted"></i>
                    </span>
                    <input type="password" className="form-control" placeholder="••••••••" required />
                  </div>
                </div>
                <button type="submit" className="btn-prime w-100 py-3 mb-3" style={{ border: "none", cursor: "pointer" }}>
                  <i className="fa-solid fa-arrow-right-to-bracket"></i> Login to Account
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="small text-muted"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    Don't have an account? <strong style={{ color: "var(--primary-color)" }}>Register Now</strong>
                  </button>
                </div>
              </form>
            )}

            {/* Register Form */}
            {mode === "register" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Registration successful! Verification link sent to your mobile.");
                  onClose();
                }}
              >
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Full Name (As on Driving License)</label>
                  <input type="text" className="form-control" placeholder="e.g. Vikram Malhotra" required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Mobile Number (For WhatsApp Updates)</label>
                  <input type="tel" className="form-control" placeholder="+91 98765 43210" required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Email Address</label>
                  <input type="email" className="form-control" placeholder="name@domain.com" required />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">City / Region in Delhi NCR</label>
                  <select className="form-select">
                    <option>Delhi (New Delhi / Central)</option>
                    <option>Gurugram (Gurgaon)</option>
                    <option>Noida / Greater Noida</option>
                    <option>Ghaziabad / Faridabad</option>
                  </select>
                </div>
                <button type="submit" className="btn-prime w-100 py-3 mb-3" style={{ border: "none", cursor: "pointer" }}>
                  <i className="fa-solid fa-user-plus"></i> Create Primerides Account
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="small text-muted"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    Already registered? <strong style={{ color: "var(--primary-color)" }}>Login Here</strong>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
