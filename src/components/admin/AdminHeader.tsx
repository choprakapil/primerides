"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminLayout } from "./AdminLayoutContext";
import {
  Search,
  ExternalLink,
  Bell,
  X,
} from "lucide-react";

/* ── Search route map ─────────────────────────────── */
const searchRoutes = [
  { label: "Dashboard",           href: "/admin",              keywords: ["dashboard", "home", "overview"] },
  { label: "Fleet Inventory",     href: "/admin/cars",         keywords: ["car", "fleet", "vehicle", "inventory"] },
  { label: "Rental Hubs",         href: "/admin/locations",    keywords: ["location", "hub", "branch", "city"] },
  { label: "Reservations",        href: "/admin/bookings",     keywords: ["booking", "reservation", "trip"] },
  { label: "Accounts & Reports",  href: "/admin/accounts",     keywords: ["account", "report", "revenue", "finance"] },
  { label: "Coupons & Offers",    href: "/admin/coupons",      keywords: ["coupon", "offer", "discount", "promo"] },
  { label: "Customers",           href: "/admin/customers",    keywords: ["customer", "member", "user"] },
  { label: "KYC Documents",       href: "/admin/documents",    keywords: ["kyc", "document", "identity", "license"] },
  { label: "Leads & CRM",         href: "/admin/leads",        keywords: ["lead", "crm", "contact", "enquiry"] },
  { label: "CMS & Content",       href: "/admin/cms/homepage", keywords: ["cms", "content", "page", "blog", "seo"] },
  { label: "Staff & RBAC",        href: "/admin/staff",        keywords: ["staff", "rbac", "role", "permission"] },
  { label: "Site Settings",       href: "/admin/settings",     keywords: ["setting", "config", "smtp", "payment"] },
  { label: "Audit Activity",      href: "/admin/audit",        keywords: ["audit", "log", "activity", "history"] },
];

export default function AdminHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter results
  const filteredResults = searchQuery.trim().length > 0
    ? searchRoutes.filter((r) => {
        const q = searchQuery.toLowerCase();
        return r.label.toLowerCase().includes(q) ||
          r.keywords.some((k) => k.includes(q));
      })
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchNav = (href: string) => {
    setSearchQuery("");
    setIsSearchFocused(false);
    router.push(href);
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* ── Left: Search ──────────────────────────── */}
        <div className="topbar-start">
          <div className="topbar-search" ref={searchRef}>
            <Search className="topbar-search-icon" />
            <input
              id="admin-global-search"
              name="admin-global-search"
              type="text"
              autoComplete="off"
              className="topbar-search-input"
              placeholder="Search pages, fleet, bookings..."
              aria-label="Search operations, reservations, and fleet"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            {searchQuery && (
              <button
                type="button"
                className="topbar-search-clear"
                onClick={() => { setSearchQuery(""); }}
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Dropdown */}
            {isSearchFocused && filteredResults.length > 0 && (
              <div className="topbar-search-dropdown">
                {filteredResults.map((r) => (
                  <button
                    key={r.href}
                    type="button"
                    className="topbar-search-result"
                    onClick={() => handleSearchNav(r.href)}
                  >
                    <Search className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            )}
            {isSearchFocused && searchQuery.trim().length > 0 && filteredResults.length === 0 && (
              <div className="topbar-search-dropdown">
                <div className="topbar-search-empty">No results for &ldquo;{searchQuery}&rdquo;</div>
              </div>
            )}
          </div>

          {/* Fleet Live badge */}
          <div className="topbar-live-badge">
            <span className="topbar-live-dot" />
            <span>FLEET LIVE · NCR &amp; LUCKNOW</span>
          </div>
        </div>

        {/* ── Right: Actions ────────────────────────── */}
        <div className="topbar-end">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="topbar-btn"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="d-none d-sm-inline">Live Website</span>
          </a>

          <div className="topbar-divider" />

          <div className="topbar-profile">
            <div className="topbar-profile-text">
              <span className="topbar-profile-name">Master Operations</span>
              <span className="topbar-profile-role">Superadmin</span>
            </div>
            <div className="topbar-avatar">OP</div>
          </div>
        </div>
      </div>
    </header>
  );
}
