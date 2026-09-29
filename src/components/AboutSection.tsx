"use client";

import React from "react";
import { MotionIcon } from "motion-icons-react";
import Link from "next/link";

export default function AboutSection() {
  const BENEFITS = [
    {
      icon: "ShieldCheck",
      title: "Zero Security Deposit",
      desc: "Fast digital KYC with instant 24-hr refund.",
    },
    {
      icon: "Plane",
      title: "15-Min Airport Delivery",
      desc: "Direct handover at IGI T1, T2 & T3 arrivals.",
    },
    {
      icon: "Infinity",
      title: "Unlimited Kilometers",
      desc: "Drive to Himachal & Rajasthan with no per-KM limits.",
    },
    {
      icon: "Wrench",
      title: "100% Inspected Fleet",
      desc: "50-point mechanical check before every booking.",
    },
  ];

  return (
    <section className="easy-about-section position-relative overflow-hidden" id="aboutSection">
      <div className="container position-relative" style={{ zIndex: 5 }}>
        <div className="row align-items-center g-5">
          {/* Left: Clean Framed Vehicle Image */}
          <div className="col-lg-6 col-md-12">
            <div className="easy-about-img-wrap position-relative">
              <img
                src="/assets/img/cars/1.jpg"
                alt="PrimeRides Self Drive Fleet"
                className="easy-about-img"
              />
              <div className="easy-about-badge d-inline-flex align-items-center gap-2 position-absolute bottom-0 start-0 m-3">
                <span className="star-gold">★</span>
                <span className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                  4.9/5 Rating • 10,000+ Happy Explorers
                </span>
              </div>
            </div>
          </div>

          {/* Right: Clean & Easy-to-Read Content */}
          <div className="col-lg-6 col-md-12">
            <div className="easy-about-content">
              <span className="section-subtitle-tag mb-2">
                <MotionIcon name="Sparkles" animation="pulse" trigger="always" size={13} color="#c59b27" />
                The PrimeRides Advantage
              </span>
              <h2 className="easy-about-title mb-3">
                Why Drivers Prefer <span>Primerides</span>
              </h2>
              <p className="easy-about-desc mb-4">
                We believe in simple, transparent self-drive car rentals. No broker middlemen, no hidden costs — just immaculate company-owned cars ready for the open road.
              </p>

              {/* 4 Simple Clean Benefit Rows */}
              <div className="row g-3 mb-4">
                {BENEFITS.map((item, idx) => (
                  <div key={idx} className="col-sm-6 col-12">
                    <div className="easy-benefit-item d-flex align-items-start gap-3">
                      <div className="easy-benefit-icon flex-shrink-0">
                        <MotionIcon name={item.icon} animation="pop" trigger="always" size={20} color="#c59b27" />
                      </div>
                      <div>
                        <h4 className="easy-benefit-title mb-1">{item.title}</h4>
                        <p className="easy-benefit-desc mb-0">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Single Clear CTA Button */}
              <div>
                <Link href="/cars" className="btn-prime">
                  <span>Explore Our Fleet</span>
                  <i className="fa-solid fa-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
