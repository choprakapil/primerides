"use client";

import React from "react";
import { MotionIcon } from "motion-icons-react";

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
    {
      icon: "MapPin",
      title: "Convenient Pickup",
      desc: "Choose a pickup point that works for your journey.",
    },
    {
      icon: "Calendar",
      title: "Flexible Trip Dates",
      desc: "Plan your rental around your travel schedule.",
    },
    {
      icon: "CreditCard",
      title: "Clear Rental Details",
      desc: "Review your booking and rental terms upfront.",
    },
    {
      icon: "Headphones",
      title: "Booking Assistance",
      desc: "Get help with questions about your reservation.",
    },
  ];

  return (
    <section className="easy-about-section position-relative overflow-hidden" id="aboutSection">
      <div className="container position-relative">
        <div className="easy-about-heading d-flex flex-column flex-lg-row align-items-lg-end justify-content-between">
          <div className="easy-about-intro">
            <span className="section-subtitle-tag mb-2">
              <MotionIcon name="Sparkles" size={13} color="#c59b27" />
              The PrimeRides Advantage
            </span>
            <h2 className="easy-about-title mb-2">
              Why Drivers Prefer <span>PrimeRides</span>
            </h2>
            <p className="easy-about-desc mb-0">
              Straightforward rentals, dependable cars, and support for every trip.
            </p>
          </div>

          <div className="easy-about-actions">
            <div className="easy-about-rating">
              <img src="/assets/img/cars/1.jpg" alt="PrimeRides Luxury Fleet Vehicles" />
              <div>
                <strong><span className="star-gold">★</span> 4.9 / 5</strong>
                <span>10,000+ happy explorers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="easy-benefits-grid">
          {BENEFITS.map((item) => (
            <div key={item.title} className="easy-benefit-item">
              <div className="easy-benefit-icon">
                <MotionIcon name={item.icon} size={18} color="#c59b27" />
              </div>
              <div className="easy-benefit-copy">
                <h3 className="easy-benefit-title">{item.title}</h3>
                <p className="easy-benefit-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
