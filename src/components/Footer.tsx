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
      <div className="footer-upper">
        <div className="container">
          <div className="footer-upper-head">
            <Link href="/" className="footer-brand d-inline-flex align-items-center">
              <img src="/assets/img/PRLogo.png" alt="PrimeRides Luxury Self-Drive Rentals Logo" className="footer-logo" />
              <span>Prime<span>Rides</span></span>
            </Link>
            <a className="footer-support" href={`tel:${settings.phoneRaw || "+919045301702"}`}>
              <span className="footer-support-label">24/7 CUSTOMER SUPPORT</span>
              <span className="footer-support-number"><i className="fa-solid fa-phone" aria-hidden="true"></i>{settings.phone || "+91 90453 01702"}</span>
            </a>
          </div>
          <div className="footer-hubs-grid">
            {(footer.cityHubs && footer.cityHubs.length > 0 ? footer.cityHubs : [
              { name: `Delhi Hub: ${settings.addresses?.delhi || "IGI Airport Terminal 3, New Delhi"}` },
              { name: `Gurugram Hub: ${settings.addresses?.gurgaon || "DLF Cyber City, Gurugram"}` },
              { name: `Lucknow Hub: ${settings.addresses?.lucknow || "Chaudhary Charan Singh Airport, Lucknow"}` },
            ]).map((hub, idx) => (
              <div className="footer-hub" key={`${hub.name}-${idx}`}>
                <span className="footer-hub-label">{hub.tag || `BRANCH OFFICE ${idx + 1}`}</span>
                <span className="footer-hub-name"><i className="fa-solid fa-location-dot" aria-hidden="true"></i>{hub.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-lower">
        <div className="container">
          <div className="row g-4 footer-lower-grid">
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h4>FLEET CATEGORIES</h4>
                <ul className="footer-links list-unstyled">
                  <li><Link href="/cars?category=hatchback"><i className="fa-solid fa-arrow-right" aria-hidden="true"></i> Economy Hatchbacks</Link></li>
                  <li><Link href="/cars?category=compact-suv"><i className="fa-solid fa-arrow-right" aria-hidden="true"></i> Compact Urban SUVs</Link></li>
                  <li><Link href="/cars?category=adventure"><i className="fa-solid fa-arrow-right" aria-hidden="true"></i> Adventure 4x4 Thar</Link></li>
                  <li><Link href="/cars?category=suv"><i className="fa-solid fa-arrow-right" aria-hidden="true"></i> 7-Seater Innova / Fortuner</Link></li>
                  <li><Link href="/cars?category=luxury"><i className="fa-solid fa-arrow-right" aria-hidden="true"></i> Luxury Executive Fleet</Link></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h4>IMPORTANT LINKS</h4>
                <ul className="footer-links list-unstyled">
                  {(footer.quickLinks && footer.quickLinks.length > 0 ? footer.quickLinks : [
                    { label: "Home", href: "/" },
                    { label: "About Us", href: "/about" },
                    { label: "Our Fleet", href: "/cars" },
                    { label: "Travel Blogs", href: "/blogs" },
                    { label: "FAQs", href: "/faq" },
                    { label: "Contact Us", href: "/contact" },
                  ]).map((link, idx) => (
                    <li key={`${link.href}-${idx}`}><Link href={link.href}><i className="fa-solid fa-arrow-right" aria-hidden="true"></i> {link.label}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget footer-policy-widget">
                <h4>POLICIES</h4>
                <ul className="footer-links list-unstyled">
                  <li><Link href="/privacy"><i className="fa-solid fa-arrow-right" aria-hidden="true"></i> Privacy Policy</Link></li>
                  <li><Link href="/terms"><i className="fa-solid fa-arrow-right" aria-hidden="true"></i> Terms &amp; Conditions</Link></li>
                  <li><Link href="/terms#cancellation"><i className="fa-solid fa-arrow-right" aria-hidden="true"></i> Refund Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget footer-contact-widget">
                <h4>CONTACT DETAILS</h4>
                <div className="footer-contact-line"><i className="fa-solid fa-location-dot" aria-hidden="true"></i><span>Delhi NCR &amp; Lucknow, India</span></div>
                <a className="footer-contact-line" href={`tel:${settings.phoneRaw || "+919045301702"}`}><i className="fa-solid fa-phone" aria-hidden="true"></i><span>{settings.phone || "+91 90453 01702"}</span></a>
                <a className="footer-contact-line" href={`mailto:${settings.email || "info@primerides.in"}`}><i className="fa-solid fa-envelope" aria-hidden="true"></i><span>{settings.email || "info@primerides.in"}</span></a>
                <div className="footer-socials">
                  <a href="https://facebook.com/primerides" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                  <a href="https://instagram.com/primerides.in" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                  <a href={`https://api.whatsapp.com/send?phone=${settings.whatsappRaw || "919045301702"}`} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="WhatsApp"><i className="fa-brands fa-whatsapp"></i></a>
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-bar d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div>{footer.copyrightText || "© 2026 PrimeRides Self Drive Cars. All rights reserved."}</div>
            <div className="footer-legal-links mt-2 mt-md-0 d-flex gap-4">
              <span className="footer-design-credit">Designed by <strong>Book MY Digital</strong></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
