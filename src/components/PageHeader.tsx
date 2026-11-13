"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { MotionIcon } from "motion-icons-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb: string;
  parentHref?: string;
  parentLabel?: string;
  bgImage?: string;
  badge1?: string;
  badge2?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  parentHref,
  parentLabel,
  bgImage,
  badge1,
  badge2,
}: PageHeaderProps) {
  const hasBgImage = Boolean(bgImage && bgImage.trim() !== "");

  // If an image is explicitly uploaded and enabled, render the full hero image banner
  if (hasBgImage) {
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
          {subtitle && (
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
          )}
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

  // When image is removed (Default Minimal Luxury Breadcrumb - exactly matching /cars/[slug])
  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 font-sans pt-28 sm:pt-32 pb-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          {/* Breadcrumb Path */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link
              href="/"
              className="hover:text-amber-700 transition-colors flex items-center gap-1"
            >
              <span>Home</span>
            </Link>
            <span className="text-slate-400">/</span>
            {parentHref && parentLabel && (
              <>
                <Link href={parentHref} className="hover:text-amber-700 transition-colors">
                  <span>{parentLabel}</span>
                </Link>
                <span className="text-slate-400">/</span>
              </>
            )}
            <span className="text-slate-800 font-semibold">{breadcrumb || title}</span>
          </nav>

          {/* Luxury Status Pills matching /cars/[slug] */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{badge1 || subtitle || "Stationed: Delhi NCR & Lucknow"}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{badge2 || "Available for Booking"}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
