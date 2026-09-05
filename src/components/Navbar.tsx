"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModal } from "@/context/ModalContext";
import { MotionIcon } from "motion-icons-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { openAuthModal } = useModal();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";

  const navLinks = [
    { label: "HOME", href: "/" },
    { label: "ABOUT US", href: "/about" },
    { label: "OUR FLEET", href: "/cars" },
    { label: "BLOGS", href: "/blogs" },
    { label: "CONTACT", href: "/contact" },
  ];

  return (
    <nav className={`navbar navbar-expand-lg ${isScrolled || !isHome ? "nav-scroll" : "nav-light-top"}`}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand" href="/">
          <img
            src="/assets/img/PRLogo.png"
            alt="Primerides"
            style={{
              height: "44px",
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
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <li key={item.href} className="nav-item">
                  <Link
                    className={`nav-link ${isActive ? "active" : ""}`}
                    href={item.href}
                    style={{
                      color: isActive ? "var(--primary-color)" : "var(--text-heading)",
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="btn d-flex align-items-center gap-2 fw-bold"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                border: "1.5px solid rgba(198, 159, 70, 0.4)",
                color: "var(--text-heading)",
                padding: "8px 18px",
                borderRadius: "30px",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <MotionIcon name="User" animation="pop" trigger="always" size={15} color="#c59b27" />
              <span>Register / Login</span>
            </button>

            <a
              href="tel:+919045301702"
              className="btn-prime d-none d-md-inline-flex align-items-center gap-2"
              style={{ padding: "8px 20px", fontSize: "13px", borderRadius: "30px" }}
            >
              <MotionIcon name="PhoneCall" animation="shake" trigger="always" size={14} color="#ffffff" />
              <span>+91 90453 01702</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
