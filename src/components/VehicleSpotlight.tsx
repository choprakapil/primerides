"use client";

import React, { useState } from "react";
import { SPOTLIGHT_CARS } from "@/data/fleet";
import { useModal } from "@/context/ModalContext";
import Link from "next/link";

export default function VehicleSpotlight() {
  const [selectedId, setSelectedId] = useState("fortuner");
  const car = SPOTLIGHT_CARS.find((c) => c.id === selectedId) || SPOTLIGHT_CARS[0];
  const { openBookingModal } = useModal();

  return (
    <section className="section-padding section-alt" id="spotlightSection">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-block">
          <span className="section-subtitle-tag">
            <i className="fa-solid fa-bolt"></i> Premier Road Performers
          </span>
          <h2 className="section-title-large">
            High-Demand <span>Vehicle Highlights</span>
          </h2>
          <p>Explore real performance specs and capabilities of Delhi NCR's most sought-after self-drive vehicles.</p>
        </div>

        {/* Tab Switcher */}
        <div className="d-flex justify-content-center gap-2 mb-5 flex-wrap">
          {SPOTLIGHT_CARS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`spotlight-nav-btn ${selectedId === c.id ? "active" : ""}`}
              onClick={() => setSelectedId(c.id)}
            >
              <i className="fa-solid fa-shield"></i> {c.name}
            </button>
          ))}
        </div>

        {/* Spotlight Card */}
        <div className="glass-card p-4 p-md-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="rounded-4 overflow-hidden shadow border">
                <img
                  src={car.img}
                  alt={car.name}
                  className="img-fluid w-100"
                  style={{ height: "380px", objectFit: "cover", transition: "opacity 0.3s ease, transform 0.3s ease" }}
                />
              </div>
            </div>
            <div className="col-lg-6">
              <span
                className="badge bg-primary text-white px-3 py-2 rounded-pill mb-2"
                style={{ background: "var(--primary-gradient) !important" }}
              >
                {car.price}
              </span>
              <h2 className="mb-1">{car.name}</h2>
              <p className="text-muted mb-4">{car.engine}</p>

              {car.specs.map((spec, sidx) => (
                <div key={sidx} className="mb-3">
                  <div className="d-flex justify-content-between small fw-bold">
                    <span>{spec.label}</span>
                    <span style={{ color: "var(--primary-color)" }}>{spec.value}</span>
                  </div>
                  <div className="spec-meter">
                    <div className="spec-meter-fill" style={{ width: `${spec.pct}%` }}></div>
                  </div>
                </div>
              ))}

              <div className="d-flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => openBookingModal(car.name, car.priceRaw, car.img)}
                  className="btn-prime"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  Reserve This Vehicle <i className="fa-solid fa-arrow-right"></i>
                </button>
                <Link href="/cars" className="btn-prime-outline">
                  View Categories <i className="fa-solid fa-layer-group"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
