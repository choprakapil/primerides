"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModal } from "@/context/ModalContext";
import { MotionIcon } from "motion-icons-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const isHome = pathname === "/";

  const [navLinks, setNavLinks] = useState([
    { label: "HOME", href: "/" },
    { label: "ABOUT US", href: "/about" },
    { label: "OUR FLEET", href: "/cars" },
    { label: "BLOGS", href: "/blogs" },
    { label: "CONTACT", href: "/contact" },
  ]);

  const [customer, setCustomer] = useState<{
    id: number;
    fullName: string;
    phone: string;
    email?: string | null;
    isVerified?: boolean;
  } | null>(null);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navDrawerRef = useRef<HTMLElement>(null);
  const navToggleRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile navigation drawer on click outside
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleDrawerClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        navDrawerRef.current &&
        !navDrawerRef.current.contains(target) &&
        navToggleRef.current &&
        !navToggleRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDrawerClickOutside);
    document.addEventListener("touchstart", handleDrawerClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleDrawerClickOutside);
      document.removeEventListener("touchstart", handleDrawerClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setIsUserDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setCustomer(null);
    setIsUserDropdownOpen(false);
    window.location.href = "/";
  };

  const checkAuth = () => {
    fetch("/api/v1/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.customer) {
          setCustomer(json.data.customer);
        } else {
          setCustomer(null);
        }
      })
      .catch(() => setCustomer(null));
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("focus", checkAuth);
    return () => window.removeEventListener("focus", checkAuth);
  }, [pathname]);

  const [headerButtons, setHeaderButtons] = useState({
    authButton: { enabled: true, label: "Register / Login" },
    phoneButton: { enabled: true, label: "+91 90453 01702", phoneNumber: "+919045301702" },
    whatsappButton: { enabled: false, label: "WhatsApp Concierge", number: "+919045301702" },
  });

  const [logoData, setLogoData] = useState({
    url: "/assets/img/PRLogo.png",
    height: 44,
  });

  useEffect(() => {
    fetch("/api/v1/cms/header")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          const cfg = json.data;
          if (Array.isArray(cfg.menuItems) && cfg.menuItems.length > 0) {
            setNavLinks(
              cfg.menuItems
                .filter((m: any) => m.isVisible)
                .map((m: any) => ({ label: m.label, href: m.href }))
            );
          }
          if (cfg.buttons) {
            setHeaderButtons({
              authButton: {
                enabled: cfg.buttons.authButton?.enabled ?? true,
                label: cfg.buttons.authButton?.label || "Register / Login",
              },
              phoneButton: {
                enabled: cfg.buttons.phoneButton?.enabled ?? true,
                label: cfg.buttons.phoneButton?.label || "+91 90453 01702",
                phoneNumber: cfg.buttons.phoneButton?.phoneNumber || "+919045301702",
              },
              whatsappButton: {
                enabled: cfg.buttons.whatsappButton?.enabled ?? false,
                label: cfg.buttons.whatsappButton?.label || "WhatsApp Concierge",
                number: cfg.buttons.whatsappButton?.number || "+919045301702",
              },
            });
          }
          if (cfg.logoUrl) {
            setLogoData({
              url: cfg.logoUrl,
              height: cfg.logoHeight || 44,
            });
          }
        }
      })
      .catch((err) => console.log("Using default navbar header items"));
  }, []);

  return (
    <>
    <nav className={`navbar navbar-expand-lg ${isScrolled || !isHome ? "nav-scroll" : "nav-light-top"}`}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand" href="/" onClick={() => setIsMobileMenuOpen(false)}>
          <img
            src={logoData.url}
            alt="PrimeRides Luxury Car Rental Logo"
            style={{
              height: `${logoData.height}px`,
            }}
          />
          <span className="navbar-brand-name">Prime Rides</span>
        </Link>

        <div className="navbar-actions d-flex align-items-center gap-3">
            {customer ? (
              <div className="position-relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  className="btn d-flex align-items-center gap-2 fw-bold"
                  style={{
                    background: isUserDropdownOpen ? "rgba(198, 159, 70, 0.22)" : "rgba(198, 159, 70, 0.12)",
                    border: "1.5px solid rgba(198, 159, 70, 0.6)",
                    color: "var(--text-heading)",
                    padding: "8px 18px",
                    borderRadius: "30px",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                  }}
                  aria-expanded={isUserDropdownOpen}
                  aria-haspopup="true"
                >
                  <MotionIcon name="UserCheck" animation="pulse" trigger="always" size={15} color="#c59b27" />
                  <span>{customer.fullName ? customer.fullName.split(" ")[0] : "Account"}</span>
                  <i
                    className="fa-solid fa-chevron-down ms-1"
                    style={{
                      fontSize: "10px",
                      color: "#c59b27",
                      transition: "transform 0.25s ease",
                      transform: isUserDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {isUserDropdownOpen && (
                  <div
                    className="position-absolute shadow-lg"
                    style={{
                      right: 0,
                      top: "calc(100% + 12px)",
                      width: "300px",
                      maxWidth: "calc(100vw - 32px)",
                      background: "#ffffff",
                      borderRadius: "22px",
                      border: "1px solid rgba(226, 232, 240, 0.95)",
                      boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(197, 155, 39, 0.15)",
                      padding: "10px",
                      zIndex: 1100,
                    }}
                  >
                    {/* Customer Header Dossier */}
                    <div
                      style={{
                        padding: "12px 14px",
                        background: "linear-gradient(135deg, #fdfaf2 0%, #fefcf7 100%)",
                        borderRadius: "16px",
                        border: "1px solid rgba(197, 155, 39, 0.25)",
                        marginBottom: "8px",
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, rgba(197, 155, 39, 0.2) 0%, rgba(197, 155, 39, 0.08) 100%)",
                            border: "1px solid rgba(197, 155, 39, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#c59b27",
                            flexShrink: 0,
                          }}
                        >
                          <i className="fa-solid fa-user" style={{ fontSize: "16px" }}></i>
                        </div>
                        <div style={{ overflow: "hidden", textAlign: "left" }}>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: "14px",
                              color: "#090e1a",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {customer.fullName || "Kapil Chopra"}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#64748b",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {customer.phone || customer.email}
                          </div>
                          <div className="mt-1">
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "20px",
                                background: "#f0fdf4",
                                color: "#16a34a",
                                border: "1px solid #bbf7d0",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <i className="fa-solid fa-shield-check" style={{ fontSize: "9px" }}></i>
                              Verified Customer
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Menu Items */}
                    <div className="d-flex flex-column gap-1">
                      <Link
                        href="/account"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none"
                        style={{
                          color: "#090e1a",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#c59b27",
                            flexShrink: 0,
                          }}
                        >
                          <i className="fa-solid fa-gauge-high" style={{ fontSize: "13px" }}></i>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1.2 }}>
                            Account Overview
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Dashboard, live trips &amp; fast stats
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/account/bookings"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none"
                        style={{
                          color: "#090e1a",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#c59b27",
                            flexShrink: 0,
                          }}
                        >
                          <i className="fa-solid fa-car-side" style={{ fontSize: "13px" }}></i>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1.2 }}>
                            My Reservations
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Trip vouchers, timeline &amp; KM packages
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/account/payments"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none"
                        style={{
                          color: "#090e1a",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#c59b27",
                            flexShrink: 0,
                          }}
                        >
                          <i className="fa-solid fa-credit-card" style={{ fontSize: "13px" }}></i>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1.2 }}>
                            Payments &amp; Ledger
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Invoices, transactions &amp; security deposits
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/account/documents"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none"
                        style={{
                          color: "#090e1a",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#c59b27",
                            flexShrink: 0,
                          }}
                        >
                          <i className="fa-solid fa-shield-halved" style={{ fontSize: "13px" }}></i>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1.2 }}>
                            KYC &amp; Documents
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Driving license &amp; handover compliance
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/account/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none"
                        style={{
                          color: "#090e1a",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#c59b27",
                            flexShrink: 0,
                          }}
                        >
                          <i className="fa-solid fa-user-gear" style={{ fontSize: "13px" }}></i>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1.2 }}>
                            Profile &amp; Security
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Contact info &amp; Argon2id credentials
                          </div>
                        </div>
                      </Link>

                      <Link
                        href="/cars"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none"
                        style={{
                          color: "#090e1a",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#c59b27",
                            flexShrink: 0,
                          }}
                        >
                          <i className="fa-solid fa-gem" style={{ fontSize: "13px" }}></i>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1.2 }}>
                            Browse Luxury Fleet
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>
                            Explore 50+ self-drive cars &amp; 4x4 SUVs
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div style={{ margin: "6px 0", borderTop: "1px solid #f1f5f9" }} />

                    {/* Sign Out Action Button */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn w-100 d-flex align-items-center gap-3 p-2 rounded-3 text-start"
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        color: "#dc2626",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          background: "#fee2e2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#dc2626",
                          flexShrink: 0,
                        }}
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: "13px" }}></i>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1.2 }}>
                          Log Out
                        </div>
                        <div style={{ fontSize: "11px", color: "#ef4444" }}>
                          Safely end session &amp; return to home
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : headerButtons.authButton.enabled ? (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal("login");
                }}
                className="btn d-flex align-items-center gap-2 "
                style={{
            
                  color: "#fff",
                  padding: "8px 18px",
                  borderRadius: "30px",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <MotionIcon name="User" animation="pulse" trigger="always" size={15} color="#fff" />
                <span>{headerButtons.authButton.label}</span>
              </button>
            ) : null}

            {headerButtons.whatsappButton.enabled && (
              <a
                href={`https://wa.me/${headerButtons.whatsappButton.number.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn d-flex align-items-center gap-2 fw-bold"
                style={{
                  background: "#25D366",
                  border: "1.5px solid #25D366",
                  color: "#ffffff",
                  padding: "8px 18px",
                  borderRadius: "30px",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <MotionIcon name="MessageCircle" animation="pulse" trigger="always" size={14} color="#ffffff" />
                <span>{headerButtons.whatsappButton.label}</span>
              </a>
            )}

          {headerButtons.phoneButton.enabled && (
              <a
                href={`https://wa.me/${headerButtons.phoneButton.phoneNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-prime navbar-whatsapp-btn d-none d-md-inline-flex align-items-center gap-2"
                style={{ padding: "8px 20px", fontSize: "13px", borderRadius: "30px" }}
              >
                <i className="fa-brands fa-whatsapp navbar-whatsapp-icon" aria-hidden="true" />
                <span>WhatsApp</span>
            </a>
          )}
          <a
            href={`https://wa.me/${(headerButtons.whatsappButton.enabled ? headerButtons.whatsappButton.number : headerButtons.phoneButton.phoneNumber).replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-header-whatsapp"
            aria-label="Chat with PrimeRides on WhatsApp"
          >
            <i className="fa-brands fa-whatsapp" aria-hidden="true" />
          </a>
          <button
            ref={navToggleRef}
            className={`nav-menu-toggle ${isMobileMenuOpen ? "is-open" : ""}`}
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-controls="navbarDrawer"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        className={`nav-drawer-backdrop ${isMobileMenuOpen ? "is-open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        ref={navDrawerRef}
        className={`nav-drawer ${isMobileMenuOpen ? "is-open" : ""}`}
        id="navbarDrawer"
        aria-label="Main navigation"
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
      >
        <div className="nav-drawer-header">
          <div className="nav-drawer-heading">
            <span className="nav-drawer-eyebrow">PRIMERIDES</span>
            <span className="nav-drawer-title">Explore</span>
          </div>
          <button type="button" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close navigation menu">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <ul className="nav-drawer-links">
          {navLinks.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const iconByPath: Record<string, string> = {
              "/": "fa-house",
              "/about": "fa-circle-info",
              "/cars": "fa-car-side",
              "/blogs": "fa-newspaper",
              "/contact": "fa-headset",
            };
            const descriptionByPath: Record<string, string> = {
              "/": "Discover the PrimeRides experience",
              "/about": "Our story and the way we work",
              "/cars": "Find a car for your next journey",
              "/blogs": "Guides, updates and travel ideas",
              "/contact": "Talk to our concierge team",
            };
            return (
              <li key={`${item.href}-${index}`}>
                <Link
                  className={`nav-drawer-link ${isActive ? "active" : ""}`}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  tabIndex={isMobileMenuOpen ? 0 : -1}
                >
                  <span className="nav-drawer-icon">
                    <i className={`fa-solid ${iconByPath[item.href] || "fa-compass"}`} aria-hidden="true" />
                  </span>
                  <span className="nav-drawer-copy">
                    <span className="nav-drawer-item-title">{item.label}</span>
                    <span className="nav-drawer-description">
                      {descriptionByPath[item.href] || "Explore more from PrimeRides"}
                    </span>
                  </span>
                  <i className="fa-solid fa-chevron-right nav-drawer-chevron" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </nav>
    <div className="mobile-bottom-bar" role="navigation" aria-label="Quick navigation">
      <Link href="/" className={`mobile-bottom-item ${pathname === "/" ? "active" : ""}`} aria-current={pathname === "/" ? "page" : undefined}>
        <i className="fa-solid fa-house" aria-hidden="true" />
        <span>Home</span>
      </Link>
      <Link href="/cars" className={`mobile-bottom-item ${pathname.startsWith("/cars") ? "active" : ""}`} aria-current={pathname.startsWith("/cars") ? "page" : undefined}>
        <i className="fa-solid fa-car-side" aria-hidden="true" />
        <span>Fleet</span>
      </Link>
      <a href={`tel:${headerButtons.phoneButton.phoneNumber}`} className="mobile-bottom-item mobile-bottom-call">
        <span className="mobile-bottom-call-icon"><i className="fa-solid fa-phone" aria-hidden="true" /></span>
        <span>Call</span>
      </a>
      <Link href="/blogs" className={`mobile-bottom-item ${pathname.startsWith("/blogs") ? "active" : ""}`} aria-current={pathname.startsWith("/blogs") ? "page" : undefined}>
        <i className="fa-solid fa-newspaper" aria-hidden="true" />
        <span>Blogs</span>
      </Link>
      <Link href="/account" className={`mobile-bottom-item ${pathname.startsWith("/account") ? "active" : ""}`} aria-current={pathname.startsWith("/account") ? "page" : undefined}>
        <i className="fa-regular fa-user" aria-hidden="true" />
        <span>Account</span>
      </Link>
    </div>
    </>
  );
}
