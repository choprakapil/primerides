"use client";

import React from "react";
import { MotionIcon } from "motion-icons-react";

export interface TrustItemType {
  icon?: string;
  iconName?: string;
  animation?: "pulse" | "spin" | "bounce" | string;
  title: string;
  desc: string;
}

const DEFAULT_TRUST_ITEMS: TrustItemType[] = [
  {
    iconName: "Gauge",
    animation: "pulse",
    title: "Unlimited Kilometers",
    desc: "No per-km limits or hidden penalties",
  },
  {
    iconName: "MapPin",
    animation: "pulse",
    title: "Doorstep Delivery",
    desc: "To any home, office, or airport terminal in NCR",
  },
  {
    iconName: "ShieldCheck",
    animation: "pulse",
    title: "Zero Hidden Fees",
    desc: "100% transparent pricing & minimal security deposit",
  },
  {
    iconName: "Headphones",
    animation: "pulse",
    title: "24/7 Roadside Assistance",
    desc: "Round-the-clock emergency support across India",
  },
];

interface TrustBarProps {
  items?: TrustItemType[];
}

export default function TrustBar({ items }: TrustBarProps = {}) {
  const displayItems = items && items.length > 0 ? items : DEFAULT_TRUST_ITEMS;

  return (
    <div
      className="trustbar-section section-alt"
      style={{
        marginTop: "0",
        paddingTop: "32px",
        paddingBottom: "32px",
        borderTop: "none",
        borderBottom: "1px solid rgba(198, 159, 70, 0.15)",
        backgroundColor: "var(--section-alt-bg, #f4f6fa)",
      }}
    >
      <div className="container">
        <div className="row g-4">
          {displayItems.map((item, idx) => (
            <div key={idx} className="col-lg-3 col-md-6">
              <div
                className="trust-item d-flex align-items-center gap-3 p-3 rounded-4 h-100"
                style={{
                  background: "#ffffff",
                  border: "1px solid rgba(198, 159, 70, 0.18)",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.03)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
              >
                <div
                  className="trust-icon-box flex-shrink-0 d-flex align-items-center justify-content-center rounded-3"
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(198, 159, 70, 0.1)",
                    border: "1px solid rgba(198, 159, 70, 0.25)",
                  }}
                >
                  <MotionIcon
                    name={(item.iconName || (item as any).icon || "ShieldCheck") as any}
                    animation={(item.animation || "pulse") as any}
                    trigger="always"
                    size={22}
                    color="#c59b27"
                  />
                </div>
                <div>
                  <h4
                    className="trust-title mb-1"
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--text-heading, #0f172a)",
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    className="trust-desc mb-0"
                    style={{
                      fontSize: "12.5px",
                      color: "var(--text-muted, #64748b)",
                      lineHeight: "1.4",
                    }}
                  >
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
