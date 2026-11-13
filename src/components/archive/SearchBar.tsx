"use client";

import React, { useState } from "react";
import { MotionIcon } from "motion-icons-react";

export default function SearchBar() {
  const [location, setLocation] = useState("Delhi - IGI Airport Terminal 3 (Arrivals Gate)");
  const [pickupDate, setPickupDate] = useState("2026-09-03");
  const [returnDate, setReturnDate] = useState("2026-09-06");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const categoriesSection = document.getElementById("categoriesSection");
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="container position-relative" style={{ zIndex: 25 }}>
      <div className="booking-search-card-3d">
        <form onSubmit={handleSearch}>
          <div className="row g-3 align-items-end">
            <div className="col-lg-5 col-md-6">
              <div className="booking-input-group">
                <label className="booking-input-label">
                  <MotionIcon name="MapPin" animation="pulse" trigger="always" size={13} color="#c59b27" /> From
                </label>
                <select
                  className="custom-lux-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="Delhi - IGI Airport Terminal 3 (Arrivals Gate)">
                    Delhi - IGI Airport Terminal 3 (Arrivals Gate)
                  </option>
                  <option value="Delhi - IGI Airport Terminal 1 & 2">Delhi - IGI Airport Terminal 1 & 2</option>
                  <option value="Gurugram - Cyber City & Golf Course Rd">
                    Gurugram - Cyber City & Golf Course Rd
                  </option>
                  <option value="Delhi - Connaught Place & Central Hub">
                    Delhi - Connaught Place & Central Hub
                  </option>
                  <option value="Delhi - Dwarka & Aerocity Hub">Delhi - Dwarka & Aerocity Hub</option>
                  <option value="Noida - Sector 18 & Metro Hub">Noida - Sector 18 & Metro Hub</option>
                  <option value="Ghaziabad - Indirapuram / Vaishali">Ghaziabad - Indirapuram / Vaishali</option>
                  <option value="Faridabad Hub">Faridabad Hub</option>
                  <option value="Doorstep Handover (Home / Office / Hotel)">
                    Doorstep Handover (Home / Office / Hotel)
                  </option>
                </select>
              </div>
            </div>
            <div className="col-lg-2 col-md-3">
              <div className="booking-input-group">
                <label className="booking-input-label">
                  <MotionIcon name="Calendar" animation="nudge" trigger="always" size={13} color="#c59b27" /> Pick-up Date
                </label>
                <input
                  type="date"
                  className="custom-lux-input"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>
            </div>
            <div className="col-lg-2 col-md-3">
              <div className="booking-input-group">
                <label className="booking-input-label">
                  <MotionIcon name="CalendarCheck" animation="nudge" trigger="always" size={13} color="#c59b27" /> Return Date
                </label>
                <input
                  type="date"
                  className="custom-lux-input"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>
            <div className="col-lg-3 col-md-12">
              <button type="submit" className="btn-search-3d w-100">
                <MotionIcon name="Sparkles" animation="spin" trigger="always" size={16} color="#ffffff" /> Check Fleet
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
