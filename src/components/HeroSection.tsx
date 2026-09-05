"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useModal } from "@/context/ModalContext";
import { MotionIcon } from "motion-icons-react";

export default function HeroSection() {
  const [pickupLoc, setPickupLoc] = useState("Delhi - IGI Airport Terminal 3 (Arrivals Gate)");
  const [dropoffLoc, setDropoffLoc] = useState("Delhi - IGI Airport Terminal 3");
  const [pickupDate, setPickupDate] = useState("2026-09-06");
  const { openBookingModal } = useModal();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const categoriesSection = document.getElementById("categoriesSection");
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="turbo-hero-wrapper position-relative overflow-hidden">
      {/* Background Banner Image with Road Highway Sketch */}
      <div
        className="turbo-hero-bg position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundImage: `url("/assets/img/banner_1.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center right",
          backgroundRepeat: "no-repeat",
          zIndex: 1,
        }}
      >
        {/* Soft Left Light Tint Gradient for crisp typography readability */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background:
              "linear-gradient(90deg, rgba(246, 248, 250, 0.97) 0%, rgba(246, 248, 250, 0.88) 48%, rgba(246, 248, 250, 0.25) 82%, rgba(246, 248, 250, 0) 100%)",
          }}
        />
      </div>

      <div className="container position-relative" style={{ zIndex: 10, paddingTop: "140px", paddingBottom: "70px" }}>
        <div className="row align-items-center g-4">
          {/* Left Column: Heading, Subtitle & Turbo Horizontal Search Card */}
          <div className="col-xl-7 col-lg-7 col-md-12">
            <div className="turbo-hero-content pe-xl-3">
              {/* Pill / Tagline */}
              <div className="turbo-hero-badge d-inline-flex align-items-center gap-2 mb-3">
                <span className="turbo-badge-dot"></span>
                <span className="fw-bold">LUXURY &amp; SELF-DRIVE FLEET DELHI NCR</span>
              </div>

              {/* Main Heading */}
              <h1 className="turbo-hero-title mb-3">
                Make Your Ride Easy &amp; <br />
                <span>Fast with PrimeRides</span>
              </h1>

              {/* Subtitle */}
              <p className="turbo-hero-subtext mb-4">
                More than 50+ luxury sedans, 4x4 SUVs, and premium self-drive cars near your location across Delhi NCR for the ultimate driving experience.
              </p>

              {/* Turbo Luxury Horizontal Search Bar Card */}
              <div className="turbo-search-card mb-4">
                <form onSubmit={handleSearch}>
                  <div className="row g-3 align-items-end">
                    {/* Where You From (Pickup) */}
                    <div className="col-md-4 col-12">
                      <div className="turbo-input-group">
                        <label className="turbo-input-label">
                          <MotionIcon name="MapPin" animation="pulse" trigger="hover" size={13} color="#c59b27" />
                          <span>Where you from</span>
                        </label>
                        <select
                          className="turbo-select"
                          value={pickupLoc}
                          onChange={(e) => setPickupLoc(e.target.value)}
                        >
                          <option value="Delhi - IGI Airport Terminal 3 (Arrivals Gate)">
                            Delhi - IGI Airport T3
                          </option>
                          <option value="Delhi - IGI Airport Terminal 1 & 2">Delhi - IGI Airport T1 &amp; T2</option>
                          <option value="Gurugram - Cyber City & Golf Course Rd">Gurugram - Cyber City</option>
                          <option value="Delhi - Connaught Place & Central Hub">Delhi - Connaught Place</option>
                          <option value="Delhi - Aerocity Hub">Delhi - Aerocity Hub</option>
                          <option value="Noida - Sector 18 & Metro Hub">Noida - Sector 18</option>
                          <option value="Doorstep Handover (Home / Hotel)">Doorstep Delivery</option>
                        </select>
                      </div>
                    </div>

                    {/* Where You Go (Drop-off) */}
                    <div className="col-md-3 col-12">
                      <div className="turbo-input-group">
                        <label className="turbo-input-label">
                          <MotionIcon name="Navigation" animation="nudge" trigger="hover" size={13} color="#c59b27" />
                          <span>Where you go</span>
                        </label>
                        <select
                          className="turbo-select"
                          value={dropoffLoc}
                          onChange={(e) => setDropoffLoc(e.target.value)}
                        >
                          <option value="Delhi - IGI Airport Terminal 3">Delhi - IGI Airport T3</option>
                          <option value="Delhi - IGI Airport T1 & T2">Delhi - IGI Airport T1 &amp; T2</option>
                          <option value="Gurugram - Cyber City">Gurugram - Cyber City</option>
                          <option value="Noida - Sector 18">Noida - Sector 18</option>
                          <option value="Outstation Trip (Himachal / Uttarakhand)">Outstation / Hills</option>
                          <option value="Same as Pickup Location">Same as Pickup</option>
                        </select>
                      </div>
                    </div>

                    {/* Choose Dates */}
                    <div className="col-md-3 col-12">
                      <div className="turbo-input-group">
                        <label className="turbo-input-label">
                          <MotionIcon name="Calendar" animation="pulse" trigger="hover" size={13} color="#c59b27" />
                          <span>Choose Dates</span>
                        </label>
                        <input
                          type="date"
                          className="turbo-input"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Search Button */}
                    <div className="col-md-2 col-12">
                      <button type="submit" className="turbo-search-btn w-100">
                        <span>Search</span>
                        <i className="fa-solid fa-arrow-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Quick Value Highlights */}
              <div className="turbo-features-pills d-flex flex-wrap align-items-center gap-3">
                <div className="turbo-pill-item">
                  <i className="fa-solid fa-shield-halved text-gold me-2"></i>
                  <span>Zero Security Deposit</span>
                </div>
                <div className="turbo-pill-item">
                  <i className="fa-solid fa-plane-arrival text-gold me-2"></i>
                  <span>Instant Airport Delivery</span>
                </div>
                <div className="turbo-pill-item">
                  <i className="fa-solid fa-infinity text-gold me-2"></i>
                  <span>Unlimited KMs Fleet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Floating Car on Road Sketch */}
          <div className="col-xl-5 col-lg-5 col-md-12 text-center text-lg-end position-relative">
            <div className="turbo-car-showcase position-relative">
              {/* Floating Featured Badge */}
              <div className="turbo-floating-tag">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge-star">★</span>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "13px", color: "#111827" }}>
                      Toyota Fortuner 4x4
                    </div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      Starts ₹5,999/day • Automatic
                    </div>
                  </div>
                </div>
              </div>

              {/* Foreground Car Image */}
              <div className="turbo-car-img-box">
                <img
                  src="/assets/img/car.png"
                  alt="PrimeRides Luxury Car"
                  className="img-fluid turbo-car-img"
                  style={{
                    filter: "drop-shadow(0 20px 25px rgba(0, 0, 0, 0.22))",
                    maxWidth: "100%",
                    height: "auto",
                    transform: "scale(1.05)",
                    transition: "transform 0.4s ease",
                  }}
                />
              </div>

              {/* Action Buttons Below Car for Mobile / Direct Booking */}
              <div className="d-flex justify-content-center justify-content-lg-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => openBookingModal("Toyota Fortuner 4x4", "5999", "/assets/img/cars/1.jpg")}
                  className="btn-prime"
                  style={{ padding: "8px 20px", fontSize: "13px", borderRadius: "25px", border: "none" }}
                >
                  <i className="fa-solid fa-bolt me-1"></i> Quick Book 4x4
                </button>
                <Link
                  href="/cars"
                  className="btn-prime-outline"
                  style={{
                    padding: "8px 18px",
                    fontSize: "13px",
                    borderRadius: "25px",
                    borderColor: "rgba(17, 24, 39, 0.2)",
                    color: "#111827",
                    background: "#ffffff",
                  }}
                >
                  Explore All <i className="fa-solid fa-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
