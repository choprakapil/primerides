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
  UserCheck,
  ShieldCheck,
  MessageSquare,
  Globe,
  Settings,
  History,
  ChevronRight,
  LogOut,
  ChevronLeft,
  ChevronDown,
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
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { name: "Dashboard",        href: "/admin",              domain: "dashboard", icon: LayoutDashboard, iconBg: "bg-purple-100",  iconColor: "text-purple-600" },
  { name: "Fleet Inventory",  href: "/admin/cars",         domain: "fleet",     icon: Car,             iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { name: "Rental Hubs",      href: "/admin/locations",    domain: "locations", icon: MapPin,          iconBg: "bg-sky-100",     iconColor: "text-sky-600" },
  { name: "Reservations",     href: "/admin/bookings",     domain: "bookings",  icon: CalendarCheck,   iconBg: "bg-rose-100",    iconColor: "text-rose-600" },
  { name: "Accounts & Reports", href: "/admin/accounts",   domain: "accounts",  icon: Receipt,         iconBg: "bg-amber-100",   iconColor: "text-amber-600" },
  { name: "Coupons & Offers", href: "/admin/coupons",      domain: "coupons",   icon: BadgePercent,    iconBg: "bg-fuchsia-100", iconColor: "text-fuchsia-600" },
  { name: "Customers",        href: "/admin/customers",    domain: "customers", icon: Users,           iconBg: "bg-indigo-100",  iconColor: "text-indigo-600" },
  { name: "KYC Documents",    href: "/admin/documents",    domain: "kyc",       icon: ShieldCheck,     iconBg: "bg-teal-100",    iconColor: "text-teal-600" },
  { name: "Leads & CRM",      href: "/admin/leads",        domain: "leads",     icon: MessageSquare,   iconBg: "bg-cyan-100",    iconColor: "text-cyan-600" },
  {
    name: "CMS & Content", href: "/admin/cms/homepage", domain: "cms", icon: Globe, iconBg: "bg-pink-100", iconColor: "text-pink-600",
    children: [
      { name: "Header & Navigation",    href: "/admin/cms/header" },
      { name: "Homepage & Hero",        href: "/admin/cms/homepage" },
      { name: "About PrimeRides",       href: "/admin/cms/about" },
      { name: "Fleet Showcase",         href: "/admin/cms/fleet" },
      { name: "Rental Hubs",            href: "/admin/locations" },
      { name: "Travel Articles & Blogs",href: "/admin/cms/blogs" },
      { name: "FAQs & Knowledge",       href: "/admin/cms/faqs" },
      { name: "Customer Reviews",       href: "/admin/testimonials" },
      { name: "Page SEO & Meta Tags",   href: "/admin/cms/seo" },
      { name: "Terms & Policies",       href: "/admin/cms/policies" },
      { name: "Contact & Concierge",    href: "/admin/cms/contact" },
      { name: "Footer & Legal Strip",   href: "/admin/cms/footer" },
    ],
  },
  { name: "Staff & RBAC",     href: "/admin/staff",        domain: "staff",    icon: UserCheck, iconBg: "bg-amber-100",  iconColor: "text-amber-700" },
  { name: "Site Settings",    href: "/admin/settings",     domain: "settings", icon: Settings,  iconBg: "bg-slate-100",  iconColor: "text-slate-600" },
  { name: "Audit Activity",   href: "/admin/audit",        domain: "audit",    icon: History,   iconBg: "bg-orange-100", iconColor: "text-orange-600" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, isMobileDrawerOpen, toggleMobileDrawer } = useAdminLayout();
  const closeMobileDrawer = () => { if (isMobileDrawerOpen) toggleMobileDrawer(); };

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(
    pathname.startsWith("/admin/cms") ? "cms" : null
  );

  const toggleSubmenu = (domain: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (isCollapsed) return; // don't open submenu when collapsed
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
        id="appMenubar"
        className={`admin-sidebar ${isMobileDrawerOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
      >
        {/* ── Brand / Logo ─────────────────────────────── */}
        <div className="sidebar-brand">
          <Link
            href="/admin"
            className="sidebar-brand-logo"
            onClick={closeMobileDrawer}
          >
            <div className="sidebar-pr-badge">PR</div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">PrimeRides</span>
              <span className="sidebar-brand-sub">OPERATIONS CRM</span>
            </div>
          </Link>

          {/* Collapse toggle — desktop only */}
          <button
            className="sidebar-collapse-btn d-none d-xl-flex"
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* ── Section Label ─────────────────────────────── */}
        {!isCollapsed && (
          <div className="sidebar-section-label">Operations Workspace</div>
        )}

        {/* ── Nav Items ─────────────────────────────────── */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const hasChildren = !!item.children?.length;
              const isSubmenuOpen = openSubmenu === item.domain;
              const Icon = item.icon;

              return (
                <li key={item.name} className={`sidebar-item ${isSubmenuOpen ? "open" : ""}`}>
                  {hasChildren ? (
                    <a
                      href="#"
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                      onClick={(e) => toggleSubmenu(item.domain, e)}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <span className={`sidebar-icon ${item.iconBg} ${item.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="sidebar-link-text">{item.name}</span>
                      <ChevronDown
                        className={`sidebar-chevron ${isSubmenuOpen ? "rotated" : ""}`}
                      />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                      onClick={closeMobileDrawer}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <span className={`sidebar-icon ${item.iconBg} ${item.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="sidebar-link-text">{item.name}</span>
                    </Link>
                  )}

                  {/* Submenu */}
                  {hasChildren && !isCollapsed && (
                    <ul className={`sidebar-submenu ${isSubmenuOpen ? "open" : ""}`}>
                      {item.children!.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <li key={child.name}>
                            <Link
                              href={child.href}
                              className={`sidebar-sublink ${childActive ? "active" : ""}`}
                              onClick={closeMobileDrawer}
                            >
                              <span className="sidebar-sublink-dot" />
                              {child.name}
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
        </nav>

        {/* ── Footer / Profile ──────────────────────────── */}
        <div className="sidebar-footer">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">SA</div>
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">Superadmin</span>
              <span className="sidebar-profile-email">admin@primerides.in</span>
            </div>
          </div>
          <form action="/admin/api/auth/logout" method="POST" className="m-0 flex-shrink-0">
            <button
              type="submit"
              className="sidebar-logout-btn"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
