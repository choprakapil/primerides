"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/data/siteConfig";

export default function Footer() {
  const [settings, setSettings] = useState<{
    phone: string;
    phoneRaw: string;
    whatsapp: string;
    whatsappRaw: string;
    email: string;
    addresses?: { delhi?: string; gurgaon?: string; lucknow?: string; noida?: string };
  }>({
    phone: SITE_CONFIG.phone,
    phoneRaw: SITE_CONFIG.phoneRaw,
    whatsapp: SITE_CONFIG.whatsapp,
    whatsappRaw: SITE_CONFIG.whatsappRaw,
    email: SITE_CONFIG.email,
    addresses: SITE_CONFIG.addresses,
  });

  const [footer, setFooter] = useState<{
    aboutText?: string;
    copyrightText?: string;
    quickLinks?: { label: string; href: string }[];
    cityHubs?: { name: string; tag?: string }[];
  }>({
    aboutText: "Primerides is Delhi NCR's premier self-drive car rental company. We offer clean, company-owned hatchbacks, sedans, 7-seater MPVs, and 4x4 SUVs with doorstep delivery, unlimited kilometers, and 24/7 roadside assistance.",
    copyrightText: "© 2026 Primerides Self Drive Cars. All rights reserved.",
    quickLinks: [
      { label: "About Us", href: "/about" },
      { label: "Our Fleet", href: "/cars" },
      { label: "Blogs & Guides", href: "/blogs" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/faq" },
    ],
    cityHubs: [
      { name: "Delhi Hub: Aerocity / IGI Airport Terminal 3, New Delhi" },
      { name: "Gurugram Hub: DLF Cyber City, Sector 24, Gurugram" },
      { name: "Lucknow Hub: Chaudhary Charan Singh International Airport, Lucknow" },
    ],
  });

  useEffect(() => {
    fetch("/api/v1/cms/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success) {
          if (json.data?.site) {
            setSettings((prev) => ({
              ...prev,
              ...json.data.site,
            }));
          }
          if (json.data?.footer) {
            setFooter((prev) => ({
              ...prev,
              ...json.data.footer,
            }));
          }
        }
      })
      .catch((err) => console.error("Error loading footer settings:", err));
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="row g-4 mb-5">
          <div className="col-lg-4 col-md-6">
            <div className="footer-widget pe-lg-4">
              <Link href="/" className="d-inline-block mb-4">
                <img
                  src="/assets/img/PRLogo.png"
                  alt="Primerides"
                  style={{ maxHeight: "48px", filter: "brightness(0) invert(1)" }}
                />
              </Link>
              <p style={{ color: "#94a3b8", marginBottom: "25px", lineHeight: 1.7 }}>
                {footer.aboutText || "Primerides is Delhi NCR's premier self-drive car rental company. We offer clean, company-owned hatchbacks, sedans, 7-seater MPVs, and 4x4 SUVs with doorstep delivery, unlimited kilometers, and 24/7 roadside assistance."}
              </p>
              <div className="d-flex gap-3">
                <a
                  href="https://facebook.com/primerides"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Facebook"
                >
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a
                  href="https://instagram.com/primerides.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Instagram"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a
                  href={`https://api.whatsapp.com/send?phone=${settings.whatsappRaw || "919045301702"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-6">
            <div className="footer-widget">
              <h4>Quick Links</h4>
              <ul className="footer-links list-unstyled">
                {(footer.quickLinks && footer.quickLinks.length > 0 ? footer.quickLinks : [
                  { label: "About Us", href: "/about" },
                  { label: "Our Fleet", href: "/cars" },
                  { label: "Blogs & Guides", href: "/blogs" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "FAQs", href: "/faq" },
                ]).map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.href}>
                      <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i> {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 col-6">
            <div className="footer-widget">
              <h4>Fleet Categories</h4>
              <ul className="footer-links list-unstyled">
                <li>
                  <Link href="/cars?filter=hatchback">
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i> Economy Hatchbacks
                  </Link>
                </li>
                <li>
                  <Link href="/cars?filter=compact-suv">
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i> Compact Urban SUVs
                  </Link>
                </li>
                <li>
                  <Link href="/cars?filter=adventure">
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i> Adventure 4x4 Thar
                  </Link>
                </li>
                <li>
                  <Link href="/cars?filter=suv">
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i> 7-Seater Innova / Fortuner
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="footer-widget">
              <h4>NCR Operating Hubs</h4>
              <div className="d-flex flex-column gap-3 mt-3" style={{ fontSize: "14px", color: "#cbd5e1" }}>
                {footer.cityHubs && footer.cityHubs.length > 0 ? (
                  footer.cityHubs.map((hub, idx) => (
                    <div key={idx} className="d-flex align-items-center justify-content-between">
                      <div>
                        <i className="fa-solid fa-location-dot me-2" style={{ color: "var(--primary-color)" }}></i>{" "}
                        {hub.name}
                      </div>
                      {hub.tag && (
                        <span className="badge bg-secondary bg-opacity-25 text-light text-uppercase px-2 py-1" style={{ fontSize: "10px" }}>
                          {hub.tag}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div>
                      <i className="fa-solid fa-location-dot me-2" style={{ color: "var(--primary-color)" }}></i>{" "}
                      <strong>Delhi Hub:</strong> {settings.addresses?.delhi || "Aerocity / IGI Airport Terminal 3, New Delhi"}
                    </div>
                    <div>
                      <i className="fa-solid fa-location-dot me-2" style={{ color: "var(--primary-color)" }}></i>{" "}
                      <strong>Gurugram Hub:</strong> {settings.addresses?.gurgaon || "DLF Cyber City, Sector 24, Gurugram"}
                    </div>
                    <div>
                      <i className="fa-solid fa-location-dot me-2" style={{ color: "var(--primary-color)" }}></i>{" "}
                      <strong>Lucknow Hub:</strong> {settings.addresses?.lucknow || "Chaudhary Charan Singh International Airport, Lucknow"}
                    </div>
                  </>
                )}
                <div>
                  <i className="fa-solid fa-envelope me-2" style={{ color: "var(--primary-color)" }}></i>{" "}
                  <a href={`mailto:${settings.email || "info@primerides.in"}`} className="text-decoration-none" style={{ color: "#cbd5e1" }}>
                    {settings.email || "info@primerides.in"}
                  </a>
                </div>
                <div>
                  <i className="fa-solid fa-phone me-2" style={{ color: "var(--primary-color)" }}></i>{" "}
                  <a href={`tel:${settings.phoneRaw || "+919045301702"}`} className="text-decoration-none" style={{ color: "#cbd5e1" }}>
                    {settings.phone || "+91 90453 01702"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom-bar d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div>{footer.copyrightText || "© 2026 Primerides Self Drive Cars. All rights reserved."}</div>
          <div className="mt-2 mt-md-0 d-flex gap-4">
            <Link href="/privacy" style={{ color: "#94a3b8" }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: "#94a3b8" }}>
              Terms &amp; Conditions
            </Link>
            <Link href="/terms#cancellation" style={{ color: "#94a3b8" }}>
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
