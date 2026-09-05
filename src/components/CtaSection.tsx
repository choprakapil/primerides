"use client";

import React from "react";
import { MotionIcon } from "motion-icons-react";
import Link from "next/link";
import { useModal } from "@/context/ModalContext";

export default function CtaSection() {
  const { openBookingModal } = useModal();

  return (
    <section className="cta-fullwidth-section position-relative overflow-hidden">
      {/* Ambient Gold & Dark Gradient Blobs */}
      <div className="cta-glow-blob position-absolute top-0 start-0"></div>
      <div className="cta-glow-blob-gold position-absolute bottom-0 end-0"></div>

      <div className="container position-relative" style={{ zIndex: 5 }}>
        <div className="row align-items-center g-5 position-relative" style={{ zIndex: 3 }}>
          {/* Left Content Area */}
          <div className="col-lg-7 col-md-12">
            <div className="cta-content-inner pe-xl-4">
              {/* Pill Tag */}
              <div className="cta-pill-badge d-inline-flex align-items-center gap-2 mb-3">
                <MotionIcon name="Sparkles" animation="spin" trigger="hover" size={13} color="#f7d58b" />
                <span className="fw-bold">FAST 5-MIN DIGITAL KYC • INSTANT CONFIRMATION</span>
              </div>

              {/* Main Heading */}
              <h2 className="cta-heading mb-3 text-white">
                Ready to Experience the <span>Ultimate Road Trip?</span>
              </h2>

              {/* Subtitle */}
              <p className="cta-subtext mb-4 text-white-50">
                Choose from our verified fleet of Toyota Fortuner 4x4, Thar, Innova Crysta, or luxury sedans. Unlimited kilometers, doorstep delivery, and 24/7 roadside assistance across India.
              </p>

              {/* Quick Trust Highlights */}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <div className="cta-perk-item text-white">
                  <i className="fa-solid fa-shield-halved text-gold me-1.5"></i>
                  <span>Zero Hidden Tariffs</span>
                </div>
                <div className="cta-perk-item text-white">
                  <i className="fa-solid fa-plane-arrival text-gold me-1.5"></i>
                  <span>15-Min Airport Handover</span>
                </div>
                <div className="cta-perk-item text-white">
                  <i className="fa-solid fa-bolt text-gold me-1.5"></i>
                  <span>Instant FASTag Enabled</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <button
                  type="button"
                  onClick={() => openBookingModal("Toyota Fortuner 4x4", "5999", "/assets/img/cars/1.jpg")}
                  className="btn-prime cta-btn-glow"
                  style={{ padding: "14px 32px", fontSize: "15px", border: "none", cursor: "pointer" }}
                >
                  <span>Book Your Car Now</span>
                  <i className="fa-solid fa-arrow-right ms-2"></i>
                </button>

                <a
                  href="https://wa.me/919045301702?text=Hi%20PrimeRides,%20I%20want%20to%20inquire%20about%20booking%20a%20self-drive%20car"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cta-whatsapp d-inline-flex align-items-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp text-success fs-5"></i>
                  <span>WhatsApp Concierge</span>
                </a>

                <a
                  href="tel:+919045301702"
                  className="btn-cta-phone d-inline-flex align-items-center gap-2 text-white"
                >
                  <MotionIcon name="PhoneCall" animation="shake" trigger="hover" size={14} color="#c59b27" />
                  <span>+91 90453 01702</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Foreground Vehicle Visual */}
          <div className="col-lg-5 col-md-12 text-center text-lg-end position-relative">
            <div className="cta-car-visual-box">
              <img
                src="/assets/img/car.png"
                alt="PrimeRides Self Drive Vehicle"
                className="img-fluid cta-car-img"
              />
              <div className="cta-floating-guarantee d-inline-flex align-items-center gap-2">
                <span className="cta-badge-check">✓</span>
                <div className="text-start">
                  <div className="fw-bold text-white" style={{ fontSize: "12px" }}>
                    100% Sanitized &amp; Inspected
                  </div>
                  <div className="text-white-50" style={{ fontSize: "10.5px" }}>
                    Top Rated Self-Drive in NCR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
