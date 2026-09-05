"use client";

import React, { useState } from "react";
import { FLEET_CARS } from "@/data/fleet";
import { useModal } from "@/context/ModalContext";

interface CarsCategoryProps {
  initialFilter?: string;
}

export default function CarsCategory({ initialFilter = "all" }: CarsCategoryProps) {
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [selectedKmMap, setSelectedKmMap] = useState<Record<string, string>>({});
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

  const kmOptions = ["250 KM", "375 KM", "525 KM"];

  const handleKmSelect = (carId: string, km: string) => {
    setSelectedKmMap((prev) => ({ ...prev, [carId]: km }));
  };

  return (
    <section className="section-padding section-white" id="categoriesSection">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-block mb-4 text-center">
          <span className="section-subtitle-tag">
            <i className="fa-solid fa-layer-group"></i> Cars Category
          </span>
          <h2 className="section-title-large">
            Explore Our <span>Cars Categories</span>
          </h2>
          <p>
            Choose your preferred category to view available self-drive vehicles with transparent pricing and zero hidden fees.
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

        {/* 4-Column Grid of Beautiful Clean Cards */}
        <div className="row g-4" id="categoriesCardGrid">
          {filteredCars.map((car) => {
            const selectedKm = selectedKmMap[car.id] || "250 KM";
            return (
              <div key={car.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
                <div className="modern-car-card h-100 d-flex flex-column">
                  {/* Car Image Preview */}
                  <div className="modern-car-img-box position-relative">
                    <img
                      src={car.img}
                      alt={car.name}
                      className="modern-car-img"
                    />
                    {car.badge && (
                      <span className="modern-car-badge position-absolute top-0 start-0 m-2">
                        {car.badge}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="modern-car-body d-flex flex-column flex-grow-1">
                    {/* Car Name */}
                    <h3 className="modern-car-name mb-2" title={car.name}>
                      {car.name}
                    </h3>

                    {/* Specs Row: Transmission, Fuel, Seats */}
                    <div className="modern-car-specs d-flex align-items-center gap-3 mb-3">
                      <span className="spec-item d-flex align-items-center gap-1">
                        <i className="fa-solid fa-gear text-muted"></i>
                        <span>{car.transmission.split(" ")[0]}</span>
                      </span>
                      <span className="spec-item d-flex align-items-center gap-1">
                        <i className="fa-solid fa-gas-pump text-muted"></i>
                        <span>{car.fuel.split(" ")[0]}</span>
                      </span>
                      <span className="spec-item d-flex align-items-center gap-1">
                        <i className="fa-solid fa-user-group text-muted"></i>
                        <span>{car.seats.split(" ")[0]} Seats</span>
                      </span>
                    </div>

                    {/* Price Line */}
                    <div className="modern-car-price mb-2">
                      <span className="price-val">{car.price}</span>
                      <span className="price-unit"> / day</span>
                    </div>

                    {/* KM Package Selector */}
                    <div className="modern-km-packages d-flex align-items-center gap-2 mb-3">
                      {kmOptions.map((km) => (
                        <button
                          key={km}
                          type="button"
                          className={`km-pill-btn ${selectedKm === km ? "active" : ""}`}
                          onClick={() => handleKmSelect(car.id, km)}
                        >
                          {km}
                        </button>
                      ))}
                    </div>

                    {/* View Details / Book Button */}
                    <div className="mt-auto pt-2">
                      <button
                        type="button"
                        onClick={() => openBookingModal(car.name, car.priceRaw, car.img)}
                        className="modern-card-btn w-100 d-flex align-items-center justify-content-center gap-2"
                      >
                        <span>View Details</span>
                        <i className="fa-solid fa-arrow-right arrow-icon"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
