"use client";

import React from "react";
import { MotionIcon } from "motion-icons-react";
import Link from "next/link";
import { useModal } from "@/context/ModalContext";

export default function AboutSection() {
  const { openBookingModal } = useModal();

  const PILLARS = [
    {
      iconName: "ShieldCheck",
      anim: "pulse" as const,
      title: "Zero Security Deposit Options",
      desc: "Instant digital KYC & hassle-free deposit refund within 24 hours of vehicle return.",
    },
    {
      iconName: "Plane",
      anim: "bounce" as const,
      title: "Instant Airport Handover",
      desc: "Direct curbside delivery at Delhi IGI Terminal 1, 2 & 3. Walk out to your keys ready.",
    },
    {
      iconName: "Infinity",
      anim: "spin" as const,
      title: "Unlimited KMs & Freedom",
      desc: "Drive to Himachal, Uttarakhand, or Rajasthan with zero stressful per-KM penalties.",
    },
    {
      iconName: "Wrench",
      anim: "nudge" as const,
      title: "50-Point Inspected Fleet",
      desc: "100% company-owned cars, meticulously sanitized & mechanically tested before every trip.",
    },
  ];

  const STATS = [
    { value: "50+", label: "Premium Cars" },
    { value: "10K+", label: "Happy Journeys" },
    { value: "4.9 ★", label: "Google Reviews" },
    { value: "24/7", label: "Roadside Assist" },
  ];

  return (
    <section className="why-primerides-section position-relative overflow-hidden" id="aboutSection">
      {/* Background Subtle Gradient Blobs */}
      <div className="why-bg-glow position-absolute top-50 start-0 translate-middle-y"></div>

      <div className="container position-relative" style={{ zIndex: 5 }}>
        <div className="row align-items-center g-5">
          {/* Left Column: Creative 3D Layered Image Showcase */}
          <div className="col-lg-6 col-md-12">
            <div className="why-visual-wrapper position-relative">
              {/* Main Visual Image Card */}
              <div className="why-main-img-card position-relative overflow-hidden">
                <img
                  src="/assets/img/cars/1.jpg"
                  alt="Toyota Fortuner 4x4 Luxury"
                  className="w-100 h-100 object-fit-cover why-hero-img"
                />
                <div className="why-img-overlay position-absolute top-0 start-0 w-100 h-100"></div>
                <div className="position-absolute bottom-0 start-0 m-4 text-white" style={{ zIndex: 3 }}>
                  <span className="badge bg-gold text-dark fw-bold mb-2 px-3 py-1.5 rounded-pill">
                    ★ FLAGSHIP ADVENTURE 4X4
                  </span>
                  <h4 className="fw-bold mb-0 text-white" style={{ fontSize: "20px" }}>
                    Toyota Fortuner &amp; Thar 4x4
                  </h4>
                  <small className="text-white-50">Equipped with 4-Wheel Drive &amp; FASTag</small>
                </div>
              </div>

              {/* Floating Stat Card 1 (Top Right) */}
              <div className="why-floating-card-top position-absolute d-flex align-items-center gap-3">
                <div className="why-float-icon-wrap">
                  <MotionIcon name="Sparkles" animation="pop" trigger="always" size={20} color="#ffffff" />
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>
                    10,000+ Journeys
                  </div>
                  <small className="text-muted" style={{ fontSize: "11.5px" }}>
                    #1 Self-Drive in NCR
                  </small>
                </div>
              </div>

              {/* Floating Airport Concierge Card 2 (Bottom Right) */}
              <div className="why-floating-card-bottom position-absolute d-flex align-items-center gap-3">
                <div className="why-airport-icon-wrap">
                  <i className="fa-solid fa-plane-arrival text-gold" style={{ fontSize: "18px" }}></i>
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                    IGI Airport T1, T2, T3
                  </div>
                  <small className="text-success fw-bold" style={{ fontSize: "11px" }}>
                    ⚡ 15-Min Terminal Handover
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content & 4 Feature Pillars Grid */}
          <div className="col-lg-6 col-md-12">
            <div className="why-content-wrap">
              {/* Badge */}
              <div className="why-badge d-inline-flex align-items-center gap-2 mb-3">
                <MotionIcon name="Sparkles" animation="pulse" trigger="hover" size={13} color="#c59b27" />
                <span className="fw-bold">DELHI NCR SELF-DRIVE PIONEER</span>
              </div>

              {/* Heading */}
              <h2 className="why-section-title mb-3">
                Why Drivers Prefer <span>Primerides</span>
              </h2>

              {/* Description */}
              <p className="why-section-desc mb-4">
                Primerides is built for true driving enthusiasts. We eliminate broker commissions and hidden charges to deliver immaculate, company-owned vehicles with transparent tariffs.
              </p>

              {/* 4 Feature Pillars Grid */}
              <div className="row g-3 mb-4">
                {PILLARS.map((pillar, idx) => (
                  <div key={idx} className="col-sm-6 col-12">
                    <div className="why-pillar-card p-3 h-100 d-flex flex-column">
                      <div className="d-flex align-items-center gap-2.5 mb-2">
                        <div className="why-pillar-icon">
                          <MotionIcon name={pillar.iconName} animation={pillar.anim} trigger="hover" size={18} color="#c59b27" />
                        </div>
                        <h5 className="why-pillar-title mb-0">{pillar.title}</h5>
                      </div>
                      <p className="why-pillar-desc mb-0">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Counter Stats Strip */}
              <div className="why-stats-strip p-3 rounded-4 mb-4 d-flex justify-content-around text-center">
                {STATS.map((s, idx) => (
                  <div key={idx} className="why-stat-box">
                    <div className="why-stat-val">{s.value}</div>
                    <div className="why-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <Link href="/cars" className="btn-prime">
                  <span>Explore Our Fleet</span>
                  <i className="fa-solid fa-arrow-right ms-2"></i>
                </Link>
                <a href="tel:+919045301702" className="btn-prime-outline d-inline-flex align-items-center gap-2">
                  <MotionIcon name="PhoneCall" animation="shake" trigger="hover" size={14} color="#111827" />
                  <span>+91 90453 01702</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
