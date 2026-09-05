"use client";

import React, { useState } from "react";
import { MotionIcon } from "motion-icons-react";

const CARS_PRICING = [
  { name: "Hyundai Creta SX(O)", rate: 2999 },
  { name: "Toyota Innova Crysta", rate: 4200 },
  { name: "Mahindra Thar 4x4", rate: 3499 },
  { name: "Toyota Fortuner 4x4", rate: 5999 },
  { name: "Maruti Suzuki Swift", rate: 1499 },
  { name: "Honda City 5th Gen", rate: 2499 },
  { name: "Mahindra Scorpio-N", rate: 3799 },
];

export default function RentalCalculator() {
  const [selectedRate, setSelectedRate] = useState<number>(2999);
  const [days, setDays] = useState<number>(3);
  const [zeroDep, setZeroDep] = useState<boolean>(false);

  // Discount rule: 7+ days = 10%, 14+ days = 20%
  let discountPct = 0;
  if (days >= 14) {
    discountPct = 20;
  } else if (days >= 7) {
    discountPct = 10;
  }

  const subtotal = selectedRate * days;
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const insuranceTotal = zeroDep ? 499 * days : 0;
  const estimatedTotal = subtotal - discountAmount + insuranceTotal;

  const currentCar = CARS_PRICING.find((c) => c.rate === selectedRate) || CARS_PRICING[0];

  const handleWhatsAppLock = () => {
    const waText = encodeURIComponent(
      `Hello Primerides! I configured a rental quote on your website for ${currentCar.name} for ${days} days (${
        zeroDep ? "With Zero-Dep" : "Standard Insurance"
      }). Estimated Total: ₹${estimatedTotal.toLocaleString("en-IN")}. I would like to lock this rate.`
    );
    window.open(`https://api.whatsapp.com/send?phone=919045301702&text=${waText}`, "_blank");
  };

  return (
    <section className="section-padding section-white" id="priceEstimator">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-block">
          <span className="section-subtitle-tag">
            <MotionIcon name="Calculator" animation="nudge" trigger="always" size={13} color="#c59b27" /> Transparent Fare Calculator
          </span>
          <h2 className="section-title-large">
            Instant Rental <span>Price Estimator</span>
          </h2>
          <p>Calculate your exact quote instantly with transparent daily tariffs, multi-day discounts, and zero unexpected charges.</p>
        </div>

        <div className="estimator-card-3d">
          <div className="row g-4 align-items-center">
            {/* Left Controls */}
            <div className="col-lg-7">
              <h4 className="fw-bold mb-4" style={{ color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
                <MotionIcon name="Sliders" animation="wiggle" trigger="always" size={18} color="#c59b27" /> Configure Your Rental
              </h4>

              {/* 1. Vehicle Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small">
                  <i className="fa-solid fa-car me-1"></i> SELECT PREFERRED VEHICLE
                </label>
                <select
                  className="form-select select-3d"
                  value={selectedRate}
                  onChange={(e) => setSelectedRate(Number(e.target.value))}
                >
                  {CARS_PRICING.map((c, idx) => (
                    <option key={idx} value={c.rate}>
                      {c.name} (₹{c.rate.toLocaleString("en-IN")}/day)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Duration Slider */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-bold text-muted small mb-0">
                    <i className="fa-regular fa-clock me-1"></i> RENTAL DURATION
                  </label>
                  <span className="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill fs-6" style={{ background: "var(--primary-color) !important", color: "#fff !important" }}>
                    {days} {days === 1 ? "Day" : "Days"}
                  </span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  style={{ accentColor: "var(--primary-color)" }}
                />
                <div className="d-flex justify-content-between text-muted small mt-1">
                  <span>1 Day</span>
                  <span>7 Days <strong className="text-success">(10% Off)</strong></span>
                  <span>14 Days <strong className="text-success">(20% Off)</strong></span>
                  <span>30 Days</span>
                </div>
              </div>

              {/* 3. Insurance Coverage */}
              <div className="mb-3">
                <label className="form-label fw-bold text-muted small mb-2">
                  <MotionIcon name="ShieldCheck" animation="pulse" trigger="always" size={13} color="#c59b27" /> PROTECTION COVERAGE
                </label>
                <div className="d-flex flex-column gap-2">
                  <label
                    className="p-3 rounded-4 border d-flex align-items-center justify-content-between"
                    style={{
                      cursor: "pointer",
                      borderColor: !zeroDep ? "var(--primary-color)" : "#e2e8f0",
                      background: !zeroDep ? "rgba(197, 155, 39, 0.05)" : "#fff",
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="coverageOption"
                        checked={!zeroDep}
                        onChange={() => setZeroDep(false)}
                      />
                      <div>
                        <strong className="d-block text-dark">Standard Comprehensive Cover</strong>
                        <small className="text-muted">Included free with active third-party & accidental insurance</small>
                      </div>
                    </div>
                    <span className="badge bg-light text-dark border">FREE</span>
                  </label>

                  <label
                    className="p-3 rounded-4 border d-flex align-items-center justify-content-between"
                    style={{
                      cursor: "pointer",
                      borderColor: zeroDep ? "var(--primary-color)" : "#e2e8f0",
                      background: zeroDep ? "rgba(197, 155, 39, 0.05)" : "#fff",
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input
                        type="radio"
                        name="coverageOption"
                        checked={zeroDep}
                        onChange={() => setZeroDep(true)}
                      />
                      <div>
                        <strong className="d-block text-dark">Zero-Dep Shield (+₹499/day)</strong>
                        <small className="text-muted">Zero customer liability waiver & priority roadside vehicle replacement</small>
                      </div>
                    </div>
                    <span className="badge bg-warning text-dark">+₹499/day</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="col-lg-5">
              <div
                className="p-4 rounded-4"
                style={{
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  border: "1.5px solid var(--border-color)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0 text-dark">Estimate Summary</h5>
                  {discountPct > 0 && (
                    <span className="badge bg-success text-white fw-bold px-2 py-1">
                      {discountPct}% Discount Applied
                    </span>
                  )}
                </div>

                <div className="d-flex justify-content-between py-2 border-bottom text-muted">
                  <span>Base Daily Tariff:</span>
                  <strong className="text-dark">₹{selectedRate.toLocaleString("en-IN")} / day</strong>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom text-muted">
                  <span>Subtotal:</span>
                  <span className="text-dark">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between py-2 border-bottom text-success fw-bold">
                    <span>Duration Discount:</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between py-2 border-bottom text-muted">
                  <span>Zero-Dep Protection:</span>
                  <span className="text-dark">₹{insuranceTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom text-muted">
                  <span>Doorstep Delivery:</span>
                  <span className="text-success fw-bold">FREE (Delhi NCR)</span>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4 pt-2">
                  <div>
                    <span className="text-muted small d-block">Estimated Total:</span>
                    <h2 className="fw-bold mb-0" style={{ color: "var(--primary-color)" }}>
                      ₹{estimatedTotal.toLocaleString("en-IN")}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppLock}
                  className="btn btn-success w-100 py-3 mt-4 fw-bold rounded-pill shadow-sm"
                  style={{ fontSize: "16px", border: "none", cursor: "pointer" }}
                >
                  <i className="fa-brands fa-whatsapp me-1"></i> Lock Rate on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
