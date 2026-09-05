"use client";

import React from "react";
import { MotionIcon } from "motion-icons-react";
import { useModal } from "@/context/ModalContext";
import { LOCATIONS_DATA } from "@/data";
export default function ChooseLocation() {
  const LOCATIONS = [
    {
      id: "delhi",
      city: "Delhi NCR",
      subtitle: "Capital Region & Hub",
      desc: "IGI Airport T1/T2/T3, Aerocity, Gurugram Cyber Hub, Noida & 24/7 doorstep delivery across Delhi NCR.",
      img: "/assets/img/locations/delhi.jpg",
      carsCount: "50+ Cars Available",
      highlight: "Airport Hub",
      badgeIcon: "fa-plane-arrival",
    },
    {
      id: "lucknow",
      city: "Lucknow",
      subtitle: "City of Nawabs & UP Hub",
      desc: "Chaudhary Charan Singh Airport, Gomti Nagar, Hazratganj, and premium outstation self-drive rentals.",
      img: "/assets/img/locations/lucknow.jpg",
      carsCount: "30+ Cars Available",
      highlight: "Doorstep Drop",
      badgeIcon: "fa-map-pin",
    },
  ];

  const handleCityClick = (cityId: string) => {
    const categoriesSection = document.getElementById("categoriesSection");
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="choose-location-section position-relative overflow-hidden">
      {/* Decorative Dashed Road Journey SVG with Moving Car */}
      <div className="location-decor-path d-none d-xl-block position-absolute end-0 top-50 translate-middle-y">
        <svg width="220" height="260" viewBox="0 0 220 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 20C120 40 200 120 180 240"
            stroke="#c59b27"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            strokeOpacity="0.45"
          />
        </svg>
        <div className="decor-mini-car">
          <div className="mini-car-icon">
            <i className="fa-solid fa-car-side" style={{ color: "#c59b27", fontSize: "20px" }}></i>
          </div>
        </div>
      </div>

      <div className="container position-relative" style={{ zIndex: 5 }}>
        {/* Section Heading */}
        <div className="text-center mb-5">
          <div className="location-pill-badge d-inline-flex align-items-center gap-2 mb-2">
            <MotionIcon name="MapPin" animation="bounce" trigger="hover" size={13} color="#c59b27" />
            <span className="fw-bold">EXPLORE BY DESTINATION</span>
          </div>
          <h2 className="choose-location-title mb-2">
            Choose Your <span>Location</span>
          </h2>
          <p className="choose-location-subtext mb-0">
            Pick a city and start your self-drive journey with PrimeRides.
          </p>
        </div>

        {/* 2 Big Beautiful Location Cards */}
        <div className="row g-4 justify-content-center">
          {LOCATIONS.map((loc) => (
            <div key={loc.id} className="col-lg-6 col-md-12">
              <div className="location-city-card h-100 d-flex flex-column flex-sm-row align-items-center">
                {/* Landmark Image */}
                <div className="location-card-img-wrap position-relative flex-shrink-0">
                  <img
                    src={loc.img}
                    alt={loc.city}
                    className="location-card-img"
                  />
                  <div className="location-card-tag position-absolute top-0 start-0 m-2">
                    <i className={`fa-solid ${loc.badgeIcon} me-1`}></i>
                    <span>{loc.highlight}</span>
                  </div>
                </div>

                {/* City Details */}
                <div className="location-card-body d-flex flex-column justify-content-between p-4 flex-grow-1 w-100">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h3 className="location-city-name mb-0">{loc.city}</h3>
                      <span className="location-fleet-count">
                        <i className="fa-solid fa-car me-1 text-gold"></i> {loc.carsCount}
                      </span>
                    </div>
                    <p className="location-city-desc mb-3">
                      {loc.desc}
                    </p>
                  </div>

                  {/* Explore Cars Button - styled exactly like the header call button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => handleCityClick(loc.id)}
                      className="btn-prime d-inline-flex align-items-center gap-2"
                      style={{ padding: "8px 24px", fontSize: "13px", borderRadius: "30px", border: "none", cursor: "pointer" }}
                    >
                      <span>Explore Cars</span>
                      <i className="fa-solid fa-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
