"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModal } from "@/context/ModalContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { openAuthModal } = useModal();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <nav className={`navbar navbar-expand-lg ${isScrolled || !isHome ? "nav-scroll" : ""}`}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand" href="/">
          <img
            src="/assets/img/PRLogo.png"
            alt="Primerides"
            style={{
              height: "44px",
              filter: (!isScrolled && isHome) ? "none" : "none",
            }}
          />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${pathname === "/" ? "active" : ""}`} href="/">
                HOME
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${pathname === "/about" ? "active" : ""}`} href="/about">
                ABOUT US
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${pathname === "/cars" ? "active" : ""}`} href="/cars">
                OUR FLEET
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${pathname === "/blogs" ? "active" : ""}`} href="/blogs">
                BLOGS
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${pathname === "/contact" ? "active" : ""}`} href="/contact">
                CONTACT
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="btn d-flex align-items-center gap-2 fw-bold"
              style={{
                background: "transparent",
                border: "1.5px solid rgba(198, 159, 70, 0.4)",
                color: (isScrolled || !isHome) ? "var(--text-heading)" : "#ffffff",
                padding: "8px 18px",
                borderRadius: "30px",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <i className="fa-regular fa-user" style={{ color: "var(--primary-color)" }}></i>
              <span>Register / Login</span>
            </button>

            <a
              href="tel:+919045301702"
              className="btn-prime d-none d-md-inline-flex"
              style={{ padding: "8px 20px", fontSize: "13px", borderRadius: "30px" }}
            >
              <i className="fa-solid fa-phone"></i> +91 90453 01702
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
