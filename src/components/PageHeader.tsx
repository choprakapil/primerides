"use client";

import React from "react";
import Link from "next/link";
import { MotionIcon } from "motion-icons-react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  breadcrumb: string;
  bgImage?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  bgImage = "/assets/img/slider/6.jpg",
}: PageHeaderProps) {
  return (
    <section
      className="inner-header"
      style={{
        backgroundImage: `url('${bgImage}')`,
        position: "relative",
        padding: "190px 0 110px",
        backgroundSize: "cover",
        backgroundPosition: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(9, 14, 26, 0.94) 0%, rgba(15, 23, 42, 0.85) 100%)",
        }}
      />
      <div className="container position-relative" style={{ zIndex: 3 }}>
        <span
          className="section-subtitle-tag"
          style={{
            background: "rgba(198, 159, 70, 0.18)",
            borderColor: "rgba(198, 159, 70, 0.45)",
            color: "#f7d58b",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <MotionIcon name="Sparkles" animation="pulse" trigger="always" size={13} color="#f7d58b" /> {subtitle}
        </span>
        <h1 className="section-title-large text-white mb-2" style={{ fontSize: "48px" }}>
          {title}
        </h1>
        <div className="d-flex justify-content-center align-items-center gap-2" style={{ fontSize: "14px", color: "#cbd5e1" }}>
          <Link href="/" className="text-white fw-bold text-decoration-none">
            Home
          </Link>{" "}
          <span>/</span> <span style={{ color: "var(--primary-color)", fontWeight: 600 }}>{breadcrumb}</span>
        </div>
      </div>
    </section>
  );
}
