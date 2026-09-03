import React from "react";
import Link from "next/link";

export default function Footer() {
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
                Primerides is Delhi NCR's premier self-drive car rental company. We offer clean, company-owned hatchbacks,
                sedans, 7-seater MPVs, and 4x4 SUVs with doorstep delivery, unlimited kilometers, and 24/7 roadside
                assistance.
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
                  href="https://api.whatsapp.com/send?phone=919045301702"
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
                <li>
                  <Link href="/about">
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i> About Us
                  </Link>
                </li>
                <li>
                  <Link href="/cars">
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i> Our Fleet
                  </Link>
                </li>
                <li>
                  <Link href="/blogs">
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i> Blogs & Guides
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i> Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq">
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px" }}></i> FAQs
                  </Link>
                </li>
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
                <div>
                  <i className="fa-solid fa-location-dot me-2" style={{ color: "var(--primary-color)" }}></i>{" "}
                  <strong>Delhi Hub:</strong> Aerocity / IGI Airport Terminal 3, New Delhi
                </div>
                <div>
                  <i className="fa-solid fa-location-dot me-2" style={{ color: "var(--primary-color)" }}></i>{" "}
                  <strong>Gurugram Hub:</strong> DLF Cyber City, Sector 24, Gurugram
                </div>
                <div>
                  <i className="fa-solid fa-location-dot me-2" style={{ color: "var(--primary-color)" }}></i>{" "}
                  <strong>Noida Hub:</strong> Sector 18 Commercial Complex, Noida
                </div>
                <div>
                  <i className="fa-solid fa-envelope me-2" style={{ color: "var(--primary-color)" }}></i>{" "}
                  info@primerides.in
                </div>
                <div>
                  <i className="fa-solid fa-phone me-2" style={{ color: "var(--primary-color)" }}></i> +91 90453 01702
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom-bar d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div>&copy; 2026 Primerides Self Drive Cars. All rights reserved.</div>
          <div className="mt-2 mt-md-0 d-flex gap-4">
            <a href="#" style={{ color: "#94a3b8" }}>
              Privacy Policy
            </a>
            <a href="#" style={{ color: "#94a3b8" }}>
              Terms & Conditions
            </a>
            <a href="#" style={{ color: "#94a3b8" }}>
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
