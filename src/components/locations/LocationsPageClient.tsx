"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LOCATIONS_DATA } from "@/data/locations";
import { SITE_CONFIG } from "@/data/siteConfig";
import PageHeader from "@/components/PageHeader";

export interface DbLocationItem {
  id: number;
  name: string;
  city: string;
  address?: string | null;
  slug: string;
}

interface LocationsPageClientProps {
  dbLocations?: DbLocationItem[];
}

export default function LocationsPageClient({ dbLocations }: LocationsPageClientProps) {
  const [settings, setSettings] = useState({
    phone: SITE_CONFIG.phone,
    whatsappRaw: SITE_CONFIG.whatsappRaw,
    addresses: SITE_CONFIG.addresses,
  });

  useEffect(() => {
    fetch("/api/v1/cms/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json.data?.site) {
          setSettings((prev) => ({
            ...prev,
            ...json.data.site,
          }));
        }
      })
      .catch((err) => console.error("Error loading settings in locations:", err));
  }, []);

  return (
    <>
      {/* Standardized Luxury PageHeader */}
      <PageHeader
        title="Delhi NCR & Lucknow Mobility Networks"
        subtitle="Strategic Rental Hubs"
        breadcrumb="Locations"
        bgImage="/assets/img/slider/1.jpg"
      />

      {/* Quick Action Sub-Strip */}
      <section style={{ background: "#0b1120", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "20px 0" }}>
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2 text-white-50 fs-14">
              <i className="fa-solid fa-clock text-warning"></i>
              <span>24/7 Doorstep Delivery &amp; Curbside Airport Handover across Delhi NCR &amp; Lucknow</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Link href="/cars" className="btn-prime py-2 px-3 fs-13 rounded-3 text-decoration-none">
                Browse Live Fleet &rarr;
              </Link>
              <a
                href={`https://api.whatsapp.com/send?phone=${settings.whatsappRaw || "919045301702"}&text=Hi%20PrimeRides,%20I%20need%20a%20car%20rental%20delivery%20inquiry`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light py-2 px-3 fs-13 rounded-3 d-inline-flex align-items-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-success"></i> WhatsApp Concierge
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section style={{ padding: "80px 0", background: "#f8fafc" }}>
        <div className="container">
          <div className="row g-4">
            {LOCATIONS_DATA.map((loc) => (
              <div key={loc.id} className="col-lg-6">
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.06)",
                    border: "1px solid #e2e8f0",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", height: "240px", background: "#1e293b" }}>
                    <img
                      src={loc.image}
                      alt={`${loc.name} Hub Location`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 70%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          background: "var(--primary-color, #c59b27)",
                          color: "#fff",
                          padding: "6px 14px",
                          borderRadius: "30px",
                          fontSize: "12px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {loc.badge}
                      </span>
                      <span
                        style={{
                          background: "rgba(0,0,0,0.6)",
                          backdropFilter: "blur(8px)",
                          color: "#fff",
                          padding: "6px 14px",
                          borderRadius: "30px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {loc.deliveryTime}
                      </span>
                    </div>

                    <div style={{ position: "absolute", bottom: "20px", left: "24px", right: "24px" }}>
                      <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", margin: 0 }}>
                        {loc.name}
                      </h3>
                      <p style={{ color: "#cbd5e1", fontSize: "14px", margin: "4px 0 0" }}>
                        <i className="fa-solid fa-location-dot text-warning me-1"></i> {loc.landmark}
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: "30px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.6, marginBottom: "20px" }}>
                      {loc.subtext}
                    </p>

                    <div className="mb-4">
                      <h5 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#0f172a", marginBottom: "12px" }}>
                        Key Delivery Hubs
                      </h5>
                      <div className="d-flex flex-wrap gap-2">
                        {loc.hubs.map((hub: string, zIdx: number) => (
                          <span
                            key={zIdx}
                            style={{
                              background: "#f1f5f9",
                              color: "#334155",
                              padding: "6px 14px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: 500,
                            }}
                          >
                            ✓ {hub}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#0f172a", marginBottom: "12px" }}>
                        Top Recommended Fleet
                      </h5>
                      <div className="d-flex flex-wrap gap-2">
                        {loc.popularCars.map((car, cIdx) => (
                          <span
                            key={cIdx}
                            style={{
                              background: "#fef3c7",
                              color: "#92400e",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            <i className="fa-solid fa-car me-1" style={{ fontSize: "11px" }}></i>
                            {car}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-top d-flex gap-3">
                      <Link
                        href={`/cars?city=${loc.id}`}
                        className="btn-prime flex-fill text-center"
                        style={{
                          padding: "12px",
                          borderRadius: "10px",
                          fontWeight: 700,
                          fontSize: "14px",
                          textDecoration: "none",
                        }}
                      >
                        Reserve in {loc.name} &rarr;
                      </Link>
                      <a
                        href={`tel:${settings.phone || "+919045301702"}`}
                        className="btn btn-outline-dark"
                        style={{
                          borderRadius: "10px",
                          padding: "12px 18px",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <i className="fa-solid fa-phone"></i> Hub Desk
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Operational FAQ Strip */}
          <div
            style={{
              marginTop: "60px",
              background: "#fff",
              borderRadius: "20px",
              padding: "40px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
            }}
          >
            <div className="row g-4 align-items-center">
              <div className="col-lg-5">
                <span className="badge bg-primary-subtle text-primary text-uppercase px-3 py-2 fw-bold mb-3">
                  Airport &amp; Intercity Assistance
                </span>
                <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
                  Curbside Handover at IGI T1/T2/T3 &amp; CCS Lucknow
                </h3>
                <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.7, marginTop: "16px" }}>
                  Fly in and drive out within 15 minutes. Our executive meets you right outside the arrivals gate with sanitized keys, pre-inspected condition video, and digital handover signature.
                </p>
                <div className="mt-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                      ✓
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                      Zero Airport Surcharge or Hidden Terminal Parking Fees
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                      ✓
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                      Valid All-India Permits &amp; FASTag Auto-Toll Enabled
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                      ✓
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                      24x7 Roadside Assistance &amp; Instant Replacement Guarantee
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                      <h5 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Can I drive between Delhi &amp; Lucknow?</h5>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "8px 0 0", lineHeight: 1.6 }}>
                        Yes! All PrimeRides vehicles are authorized commercial white-plate/yellow-number self-drive rentals with state toll taxes paid and full expressway clearance.
                      </p>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                      <h5 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>How is security deposit refunded?</h5>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "8px 0 0", lineHeight: 1.6 }}>
                        Zero-hassle instant automated refunds! Your ₹3,000 security deposit is credited back to your original payment method upon vehicle return inspection.
                      </p>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                      <h5 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>What documents are required?</h5>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "8px 0 0", lineHeight: 1.6 }}>
                        Original Driving License (valid for Light Motor Vehicle) and government identity proof (Aadhaar or Passport). Verification is instant via our portal.
                      </p>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                      <h5 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>Is fuel included in rental?</h5>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "8px 0 0", lineHeight: 1.6 }}>
                        Rentals are provided on a like-to-like fuel policy. Return the vehicle with the same fuel level as dispatched to avoid refuel service charges.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
