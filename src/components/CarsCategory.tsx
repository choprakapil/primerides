"use client";

import React, { useState } from "react";
import { CATEGORIES_DATA } from "@/data/fleet";
import { useModal } from "@/context/ModalContext";

interface CarsCategoryProps {
  initialFilter?: string;
  showAllInitially?: boolean;
}

export default function CarsCategory({ initialFilter = "all" }: CarsCategoryProps) {
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const { openBookingModal } = useModal();

  const filteredCategories =
    activeFilter === "all"
      ? CATEGORIES_DATA
      : CATEGORIES_DATA.filter((c) => c.filter === activeFilter);

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
            Browse our specialized vehicle categories tailored for family vacations, mountain expeditions, business
            transit, and daily Delhi NCR commuting.
          </p>
        </div>

        {/* Category Filter Tabs: Default Selected = All Categories */}
        <div className="category-filter-bar mb-5">
          <button
            type="button"
            className={`category-filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            <i className="fa-solid fa-border-all"></i> All Categories
          </button>
          <button
            type="button"
            className={`category-filter-btn ${activeFilter === "suv" ? "active" : ""}`}
            onClick={() => setActiveFilter("suv")}
          >
            <i className="fa-solid fa-users"></i> 7-Seater SUVs
          </button>
          <button
            type="button"
            className={`category-filter-btn ${activeFilter === "adventure" ? "active" : ""}`}
            onClick={() => setActiveFilter("adventure")}
          >
            <i className="fa-solid fa-mountain"></i> Adventure 4x4
          </button>
          <button
            type="button"
            className={`category-filter-btn ${activeFilter === "compact-suv" ? "active" : ""}`}
            onClick={() => setActiveFilter("compact-suv")}
          >
            <i className="fa-solid fa-car-side"></i> Compact SUVs
          </button>
          <button
            type="button"
            className={`category-filter-btn ${activeFilter === "hatchback" ? "active" : ""}`}
            onClick={() => setActiveFilter("hatchback")}
          >
            <i className="fa-solid fa-gas-pump"></i> Hatchbacks
          </button>
          <button
            type="button"
            className={`category-filter-btn ${activeFilter === "luxury" ? "active" : ""}`}
            onClick={() => setActiveFilter("luxury")}
          >
            <i className="fa-solid fa-crown"></i> Luxury & Sedans
          </button>
        </div>

        {/* Categories Card Grid */}
        <div className="row g-4" id="categoriesCardGrid">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="col-lg-4 col-md-6 category-card-item fleet-grid-item">
              <div className="category-card-prime">
                <div className="cat-thumb-box">
                  <img src={cat.img} alt={cat.title} />
                  <div className="cat-badge-top">
                    <i className={cat.badgeIcon}></i> {cat.badgeText}
                  </div>
                  <div className="cat-price-pill">{cat.price}</div>
                </div>
                <div className="cat-content">
                  <h3 className="cat-title">{cat.title}</h3>
                  <p className="cat-desc">{cat.desc}</p>

                  <div className="models-included-box">
                    <small>
                      <i className="fa-solid fa-car me-1"></i> Popular Models in this Category:
                    </small>
                    <span>{cat.popularModels}</span>
                  </div>

                  <div className="cat-spec-grid">
                    {cat.specs.map((spec, sidx) => (
                      <div key={sidx} className="cat-spec-chip">
                        <i className={spec.icon}></i> {spec.text}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <button
                      type="button"
                      onClick={() => openBookingModal(cat.carName, cat.carPrice, cat.img)}
                      className="btn-prime w-100 justify-content-center"
                      style={{ padding: "12px", border: "none", cursor: "pointer" }}
                    >
                      {cat.btnText} <i className="fa-solid fa-arrow-right"></i>
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
