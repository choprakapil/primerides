"use client";

import React from "react";
import { MotionIcon } from "motion-icons-react";
import { useModal } from "@/context/ModalContext";

export default function CtaSection() {
  const { openBookingModal } = useModal();

  return (
    <section className="easy-cta-section position-relative overflow-hidden">
      <div className="container position-relative" style={{ zIndex: 5 }}>
        <div className="row align-items-center g-4">
          {/* Left: Heading, Clean Subtitle & 2 Buttons */}
          <div className="col-lg-7 col-md-12">
            <div className="easy-cta-content">
              {/* Top Short Heading Pill */}
              <div
                className="offers-pill-badge d-inline-flex align-items-center gap-2 mb-3"
                style={{
                  background: "rgba(197, 155, 39, 0.15)",
                  border: "1px solid rgba(197, 155, 39, 0.4)",
                  color: "#f7d58b",
                }}
              >
                <MotionIcon name="Zap" animation="pulse" trigger="always" size={13} color="#c59b27" />
                <span className="fw-bold">⚡ INSTANT 5-MIN DIGITAL BOOKING</span>
              </div>

              {/* Main Section Heading */}
              <h2 className="easy-cta-title mb-3 text-white">
                Ready to Experience the <span>Ultimate Road Trip?</span>
              </h2>

              {/* Subtitle */}
              <p className="easy-cta-subtext mb-4 text-white-50">
                Book Fortuner 4x4, Thar, Innova Crysta, or luxury sedans with zero security deposit, unlimited kilometers, and doorstep delivery across Delhi NCR.
              </p>

              {/* 2 Clear Action Buttons */}
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <button
                  type="button"
                  onClick={() => openBookingModal("Toyota Fortuner 4x4", "5999", "/assets/img/cars/1.jpg")}
                  className="btn-prime"
                  style={{ padding: "13px 28px", fontSize: "14.5px", border: "none", cursor: "pointer" }}
                >
                  <span>Book Your Car Now</span>
                  <i className="fa-solid fa-arrow-right ms-2"></i>
                </button>

                <a
                  href="https://wa.me/919045301702?text=Hi%20PrimeRides,%20I%20want%20to%20inquire%20about%20booking%20a%20self-drive%20car"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta-whatsapp d-inline-flex align-items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "30px",
                    padding: "13px 26px",
                    fontSize: "14.5px",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 16px rgba(37, 211, 102, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <i className="fa-brands fa-whatsapp fs-5" style={{ color: "#ffffff" }}></i>
                  <span style={{ color: "#ffffff" }}>WhatsApp Us</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Clean Car Visual */}
          <div className="col-lg-5 col-md-12 text-center text-lg-end">
            <img
              src="/assets/img/car.png"
              alt="PrimeRides Self Drive Vehicle"
              className="img-fluid easy-cta-car"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
