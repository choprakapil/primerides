"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminLayout } from "./AdminLayoutContext";
import {
  LayoutDashboard,
  Car,
  MapPin,
  CalendarCheck,
  Receipt,
  BadgePercent,
  Users,
  ShieldCheck,
  MessageSquare,
  Globe,
  Settings,
  History,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";

interface NavChild {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  domain: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  glowColor: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    domain: "dashboard",
    icon: LayoutDashboard,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    iconBorder: "border-purple-200/80",
    glowColor: "rgba(168, 85, 247, 0.35)",
  },
  {
    name: "Fleet Inventory",
    href: "/admin/cars",
    domain: "fleet",
    icon: Car,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    iconBorder: "border-emerald-200/80",
    glowColor: "rgba(16, 185, 129, 0.35)",
  },
  {
    name: "Rental Hubs",
    href: "/admin/locations",
    domain: "locations",
    icon: MapPin,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    iconBorder: "border-sky-200/80",
    glowColor: "rgba(14, 165, 233, 0.35)",
  },
  {
    name: "Reservations",
    href: "/admin/bookings",
    domain: "bookings",
    icon: CalendarCheck,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    iconBorder: "border-rose-200/80",
    glowColor: "rgba(244, 63, 94, 0.35)",
  },
  {
    name: "Accounts & Reports",
    href: "/admin/accounts",
    domain: "accounts",
    icon: Receipt,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    iconBorder: "border-amber-200/80",
    glowColor: "rgba(245, 158, 11, 0.35)",
  },
  {
    name: "Coupons & Offers",
    href: "/admin/coupons",
    domain: "coupons",
    icon: BadgePercent,
    iconBg: "bg-fuchsia-100",
    iconColor: "text-fuchsia-600",
    iconBorder: "border-fuchsia-200/80",
    glowColor: "rgba(217, 70, 239, 0.35)",
  },
  {
    name: "Customers",
    href: "/admin/customers",
    domain: "customers",
    icon: Users,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    iconBorder: "border-indigo-200/80",
    glowColor: "rgba(99, 102, 241, 0.35)",
  },
  {
    name: "KYC Documents",
    href: "/admin/documents",
    domain: "kyc",
    icon: ShieldCheck,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    iconBorder: "border-teal-200/80",
    glowColor: "rgba(20, 184, 166, 0.35)",
  },
  {
    name: "Leads & CRM",
    href: "/admin/leads",
    domain: "leads",
    icon: MessageSquare,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    iconBorder: "border-cyan-200/80",
    glowColor: "rgba(6, 182, 212, 0.35)",
  },
  {
    name: "CMS & Content",
    href: "/admin/cms/homepage",
    domain: "cms",
    icon: Globe,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    iconBorder: "border-pink-200/80",
    glowColor: "rgba(236, 72, 153, 0.35)",
    children: [
      { name: "Header & Navigation", href: "/admin/cms/header" },
      { name: "Homepage & Hero", href: "/admin/cms/homepage" },
      { name: "About PrimeRides", href: "/admin/cms/about" },
      { name: "Fleet Showcase", href: "/admin/cms/fleet" },
      { name: "Rental Hubs", href: "/admin/locations" },
      { name: "Travel Articles & Blogs", href: "/admin/cms/blogs" },
      { name: "FAQs & Knowledge", href: "/admin/cms/faqs" },
      { name: "Customer Reviews", href: "/admin/testimonials" },
      { name: "Terms & Policies", href: "/admin/cms/policies" },
      { name: "Contact & Concierge", href: "/admin/cms/contact" },
      { name: "Footer & Legal Strip", href: "/admin/cms/footer" },
    ],
  },
  {
    name: "Settings & Staff",
    href: "/admin/settings",
    domain: "settings",
    icon: Settings,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    iconBorder: "border-slate-200/80",
    glowColor: "rgba(100, 116, 139, 0.35)",
  },
  {
    name: "Audit Activity",
    href: "/admin/audit",
    domain: "audit",
    icon: History,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    iconBorder: "border-orange-200/80",
    glowColor: "rgba(249, 115, 22, 0.35)",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileDrawerOpen, toggleMobileDrawer } = useAdminLayout();
  const closeMobileDrawer = () => {
    if (isMobileDrawerOpen) toggleMobileDrawer();
  };
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(
    pathname.startsWith("/admin/cms") ? "cms" : null
  );

  const toggleSubmenu = (domain: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenSubmenu(openSubmenu === domain ? null : domain);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3 d-xl-none"
          onClick={closeMobileDrawer}
        />
      )}

      <aside
        className={`app-menubar ${isMobileDrawerOpen ? "open" : ""}`}
        id="appMenubar"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Top Brand */}
        <div className="app-navbar-brand d-flex align-items-center justify-content-between shrink-0">
          <Link
            href="/admin"
            className="navbar-brand-logo d-flex align-items-center gap-2.5 text-decoration-none"
            onClick={closeMobileDrawer}
          >
            <div
              className="avatar avatar-sm bg-primary text-white rounded-3 d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{ width: "34px", height: "34px", fontSize: "13px" }}
            >
              PR
            </div>
            <div className="d-flex flex-column">
              <span className="fw-bold fs-5 text-dark mb-0 lh-1">PrimeRides</span>
              <span className="text-muted text-[10px] fw-bold tracking-wider mt-0.5">
                OPERATIONS CRM
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Items */}
        <div
          className="app-navbar flex-grow-1"
          style={{
            overflowY: "auto",
            padding: "12px 14px",
            width: "100%",
          }}
        >
          <ul className="menubar list-unstyled mb-0">
            <li className="menu-heading">
              <span className="menu-label text-[11px] fw-bold text-muted text-uppercase tracking-wider">
                Operations Workspace
              </span>
            </li>

            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const hasChildren = !!item.children?.length;
              const isSubmenuOpen = openSubmenu === item.domain;
              const Icon = item.icon;

              return (
                <li
                  key={item.name}
                  className={`menu-item ${hasChildren ? "menu-arrow" : ""} ${isSubmenuOpen ? "open" : ""}`}
                >
                  {hasChildren ? (
                    <a
                      href="#"
                      className={`menu-link ${isActive ? "active" : ""} ${isSubmenuOpen ? "open" : ""}`}
                      onClick={(e) => toggleSubmenu(item.domain, e)}
                    >
                      <div className={`sidebar-icon-wrapper ${item.iconBg} ${item.iconColor} border ${item.iconBorder}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="menu-label font-semibold">{item.name}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ms-auto transition-transform duration-200 ${isSubmenuOpen ? "rotate-90" : ""}`} />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={`menu-link ${isActive ? "active" : ""}`}
                      onClick={closeMobileDrawer}
                    >
                      <div className={`sidebar-icon-wrapper ${item.iconBg} ${item.iconColor} border ${item.iconBorder}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="menu-label font-semibold">{item.name}</span>
                    </Link>
                  )}

                  {/* Submenu Dropdown */}
                  {hasChildren && isSubmenuOpen && (
                    <ul className="menu-inner list-unstyled mt-1 mb-1 ps-4">
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.name} className="menu-item">
                            <Link
                              href={child.href}
                              className={`menu-link ${childActive ? "active" : ""}`}
                              onClick={closeMobileDrawer}
                              style={{ padding: "6px 12px", fontSize: "12.5px" }}
                            >
                              <span className="menu-label">{child.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer User Profile & Sign Out */}
        <div className="app-footer border-top p-3 bg-light shrink-0">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <div
                className="avatar avatar-sm rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center shrink-0"
                style={{ width: "34px", height: "34px", fontSize: "12px" }}
              >
                SA
              </div>
              <div className="overflow-hidden">
                <div className="fw-bold text-dark text-truncate lh-sm" style={{ fontSize: "13px" }}>
                  Superadmin
                </div>
                <small className="text-muted d-block text-truncate" style={{ fontSize: "11px" }}>
                  admin@primerides.in
                </small>
              </div>
            </div>

            <form action="/admin/api/auth/logout" method="POST" className="m-0">
              <button
                type="submit"
                className="btn btn-sm btn-icon btn-action-gray rounded-circle border-0 d-flex align-items-center justify-content-center"
                title="Sign Out"
                aria-label="Sign Out"
                style={{ width: "32px", height: "32px" }}
              >
                <LogOut className="w-4 h-4 text-danger" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
