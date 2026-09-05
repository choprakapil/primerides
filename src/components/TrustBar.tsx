"use client";

import React from "react";
import { MotionIcon } from "motion-icons-react";

const TRUST_ITEMS = [
  {
    iconName: "Gauge",
    animation: "pulse" as const,
    title: "Unlimited Kilometers",
    desc: "No per-km limits or hidden penalties",
  },
  {
    iconName: "MapPin",
    animation: "bounce" as const,
    title: "Doorstep Delivery",
    desc: "To any home, office, or airport terminal in NCR",
  },
  {
    iconName: "ShieldCheck",
    animation: "wiggle" as const,
    title: "Zero Hidden Fees",
    desc: "100% transparent pricing & minimal security deposit",
  },
  {
    iconName: "Headphones",
    animation: "heartbeat" as const,
    title: "24/7 Roadside Assistance",
    desc: "Round-the-clock emergency support across India",
  },
];

export default function TrustBar() {
  return (
    <div
      className="trustbar-section section-alt"
      style={{
        padding: "55px 0",
        borderTop: "none",
        borderBottom: "1px solid #e2e8f0",
        backgroundColor: "#f8fafc",
      }}
    >
      <div className="container">
        <div className="row g-4">
          {TRUST_ITEMS.map((item, idx) => (
            <div key={idx} className="col-lg-3 col-md-6">
              <div
                className="trust-item d-flex align-items-center gap-3 p-3 rounded-4"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "rgba(197, 155, 39, 0.12)",
                    color: "var(--primary-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MotionIcon
                    name={item.iconName}
                    animation={item.animation}
                    trigger="always"
                    size={24}
                    color="#c59b27"
                  />
                </div>
                <div>
                  <h6 className="mb-1 fw-bold" style={{ color: "var(--text-heading)", fontSize: "15px" }}>
                    {item.title}
                  </h6>
                  <p className="mb-0 text-muted" style={{ fontSize: "13px", lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
