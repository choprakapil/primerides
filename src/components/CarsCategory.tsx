"use client";

import React, { useState } from "react";
import { FLEET_CARS } from "@/data/fleet";
import { useModal } from "@/context/ModalContext";

interface CarsCategoryProps {
  initialFilter?: string;
}

export default function CarsCategory({ initialFilter = "all" }: CarsCategoryProps) {
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const { openBookingModal } = useModal();

  const filteredCars =
    activeFilter === "all"
      ? FLEET_CARS
      : FLEET_CARS.filter((c) => c.category === activeFilter);

  const categories = [
    { id: "all", label: "All Categories", icon: "fa-solid fa-border-all" },
    { id: "suv", label: "7-Seater SUVs", icon: "fa-solid fa-users" },
    { id: "adventure", label: "Adventure 4x4", icon: "fa-solid fa-mountain" },
    { id: "compact-suv", label: "Compact SUVs", icon: "fa-solid fa-car-side" },
    { id: "hatchback", label: "Hatchbacks", icon: "fa-solid fa-gas-pump" },
    { id: "luxury", label: "Luxury & Sedans", icon: "fa-solid fa-crown" },
  ];

  return (
    <section className="section-padding section-white" id="categoriesSection">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-block">
          <span className="section-subtitle-tag">
            <i className="fa-solid fa-layer-group"></i> Cars Category
          </span>
          <h2 className="section-title-large">
            Explore Our <span>Cars Categories</span>
          </h2>
          <p>
            Choose your preferred category to view available self-drive vehicles with unlimited kilometers and zero hidden fees.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="category-filter-bar mb-5 d-flex flex-wrap justify-content-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-filter-btn ${activeFilter === cat.id ? "active" : ""}`}
              onClick={() => setActiveFilter(cat.id)}
            >
              <i className={`${cat.icon} me-1`}></i> {cat.label}
            </button>
          ))}
        </div>

        {/* Dynamic Cars Grid for Selected Category */}
        <div className="row g-4" id="categoriesCardGrid">
          {filteredCars.map((car) => (
            <div key={car.id} className="col-lg-4 col-md-6">
              <div
                className="rounded-4 overflow-hidden h-100 d-flex flex-column"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--border-color)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
              >
                {/* Car Image with Badges */}
                <div className="position-relative overflow-hidden" style={{ height: "230px", background: "#f8fafc" }}>
                  <img
                    src={car.img}
                    alt={car.name}
                    className="w-100 h-100"
                    style={{
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                  />
                  {car.badge && (
                    <span
                      className="position-absolute top-0 start-0 m-3 badge px-3 py-2 rounded-pill text-white fw-bold"
                      style={{ background: "var(--primary-gradient)", fontSize: "11px", letterSpacing: "0.5px" }}
                    >
                      {car.badge}
                    </span>
                  )}
                  <span
                    className="position-absolute bottom-0 end-0 m-3 badge px-3 py-2 rounded-3 text-white fw-bold"
                    style={{ background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)", fontSize: "13px" }}
                  >
                    <span style={{ color: "var(--primary-color)", fontSize: "15px", fontWeight: 800 }}>{car.price}</span> / day
                  </span>
                </div>

                {/* Car Details & Single Button */}
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="text-muted text-uppercase fw-bold" style={{ fontSize: "11px", letterSpacing: "1px", color: "var(--primary-color)" }}>
                      {car.brand} • {car.categoryLabel}
                    </small>
                  </div>
                  
                  <h4 className="fw-bold mb-3" style={{ fontSize: "19px", color: "var(--text-heading)" }}>
                    {car.name}
                  </h4>

                  {/* Minimalist Spec Chips */}
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    <span
                      className="badge bg-light text-dark border px-2.5 py-1.5 rounded-2 d-flex align-items-center gap-1.5"
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      <i className="fa-solid fa-chair" style={{ color: "var(--primary-color)" }}></i> {car.seats}
                    </span>
                    <span
                      className="badge bg-light text-dark border px-2.5 py-1.5 rounded-2 d-flex align-items-center gap-1.5"
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      <i className="fa-solid fa-gears" style={{ color: "var(--primary-color)" }}></i> {car.transmission}
                    </span>
                    <span
                      className="badge bg-light text-dark border px-2.5 py-1.5 rounded-2 d-flex align-items-center gap-1.5"
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      <i className="fa-solid fa-gas-pump" style={{ color: "var(--primary-color)" }}></i> {car.fuel}
                    </span>
                  </div>

                  {/* Single Action Button */}
                  <div className="mt-auto">
                    <button
                      type="button"
                      onClick={() => openBookingModal(car.name, car.priceRaw, car.img)}
                      className="btn-prime w-100 justify-content-center"
                      style={{ padding: "13px", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}
                    >
                      <span>Book Now</span>
                      <i className="fa-solid fa-arrow-right ms-2"></i>
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
