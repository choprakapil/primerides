"use client";

import React, { useState } from "react";
import { MotionIcon } from "motion-icons-react";
import { useModal } from "@/context/ModalContext";

export default function HeroSection() {
  const { openBookingModal } = useModal();
  const [pickupLoc, setPickupLoc] = useState("Delhi - IGI Airport Terminal 3 (Arrivals Gate)");
  const [dropoffLoc, setDropoffLoc] = useState("Delhi - IGI Airport Terminal 3");
  const [pickupDate, setPickupDate] = useState("2026-09-06");

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
          backgroundImage: "url('/assets/img/banner_1.png')",
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

      <div className="container position-relative" style={{ zIndex: 10, paddingTop: "140px", paddingBottom: "55px" }}>
        {/* Top Hero Row: Headline on Left, Car Image on Right */}
        <div className="row align-items-center g-4 mb-4 mb-lg-5">
          {/* Left Column: Heading, Subtitle & Value Pills */}
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

          {/* Right Column: Prominent Luxury Car Image */}
          <div className="col-xl-5 col-lg-5 col-md-12 text-center text-lg-end">
            <div className="turbo-car-showcase position-relative">
              <div className="turbo-car-img-box" style={{ marginLeft: "0", width: "100%", maxWidth: "600px" }}>
                <img
                  src="/assets/img/car.png"
                  alt="PrimeRides Luxury Car"
                  className="img-fluid turbo-car-img"
                  style={{ transform: "scale(1.05)" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Hero Search Bar: Centered Across Bottom */}
        <div className="row justify-content-center">
          <div className="col-12 col-xl-11">
            <div className="turbo-search-card">
              <form onSubmit={handleSearch}>
                <div className="row g-3 align-items-end">
                  {/* Where You From (Pickup) */}
                  <div className="col-lg-3 col-md-6 col-12">
                    <div className="turbo-input-group">
                      <label className="turbo-input-label">
                        <MotionIcon name="MapPin" animation="pulse" trigger="always" size={13} color="#c59b27" />
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
                  <div className="col-lg-3 col-md-6 col-12">
                    <div className="turbo-input-group">
                      <label className="turbo-input-label">
                        <MotionIcon name="Navigation" animation="nudge" trigger="always" size={13} color="#c59b27" />
                        <span>Where you go</span>
                      </label>
                      <select
                        className="turbo-select"
                        value={dropoffLoc}
                        onChange={(e) => setDropoffLoc(e.target.value)}
                      >
                        <option value="Delhi - IGI Airport Terminal 3">Delhi - IGI Airport T3</option>
                        <option value="Delhi - IGI Airport T1 & 2">Delhi - IGI Airport T1 &amp; T2</option>
                        <option value="Gurugram - Cyber City">Gurugram - Cyber City</option>
                        <option value="Noida - Sector 18">Noida - Sector 18</option>
                        <option value="Outstation Trip (Himachal / Uttarakhand)">Outstation / Hills</option>
                        <option value="Same as Pickup Location">Same as Pickup</option>
                      </select>
                    </div>
                  </div>

                  {/* Choose Dates */}
                  <div className="col-lg-4 col-md-6 col-12">
                    <div className="turbo-input-group">
                      <label className="turbo-input-label">
                        <MotionIcon name="Calendar" animation="pulse" trigger="always" size={13} color="#c59b27" />
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
                  <div className="col-lg-2 col-md-6 col-12">
                    <button type="submit" className="turbo-search-btn w-100">
                      <span>Search</span>
                      <i className="fa-solid fa-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
