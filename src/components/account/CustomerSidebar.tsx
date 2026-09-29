"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerLogoutAction } from "@/server/actions/customer-auth";
import {
  Compass,
  Car,
  ShieldCheck,
  Receipt,
  UserCheck,
  LogOut,
} from "lucide-react";

interface CustomerSidebarProps {
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string | null;
  } | null;
  isOpen?: boolean;
  onClose?: () => void;
}

const customerNav = [
  {
    name: "Overview",
    href: "/account",
    icon: Compass,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    iconBorder: "border-purple-200/80",
  },
  {
    name: "My Bookings",
    href: "/account/bookings",
    icon: Car,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    iconBorder: "border-emerald-200/80",
  },
  {
    name: "KYC Documents",
    href: "/account/documents",
    icon: ShieldCheck,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    iconBorder: "border-teal-200/80",
  },
  {
    name: "Payments & Ledger",
    href: "/account/payments",
    icon: Receipt,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    iconBorder: "border-amber-200/80",
  },
  {
    name: "Profile & Security",
    href: "/account/profile",
    icon: UserCheck,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    iconBorder: "border-sky-200/80",
  },
];

export default function CustomerSidebar({
  customer,
  isOpen = false,
  onClose,
}: CustomerSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3 d-xl-none"
          onClick={onClose}
        />
      )}

      <aside
        className={`app-menubar ${isOpen ? "open" : ""}`}
        id="appMenubar"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Brand */}
        <div className="app-navbar-brand d-flex align-items-center justify-content-between shrink-0">
          <Link
            href="/account"
            className="navbar-brand-logo d-flex align-items-center gap-2.5 text-decoration-none"
            onClick={onClose}
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
                CUSTOMER PORTAL
              </span>
            </div>
          </Link>
        </div>

        {/* Menu Items */}
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
                Account Menu
              </span>
            </li>

            {customerNav.map((item) => {
              const isActive =
                item.href === "/account"
                  ? pathname === "/account"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.name} className="menu-item">
                  <Link
                    href={item.href}
                    className={`menu-link ${isActive ? "active" : ""}`}
                    onClick={onClose}
                  >
                    <div className={`sidebar-icon-wrapper ${item.iconBg} ${item.iconColor} border ${item.iconBorder}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="menu-label font-semibold">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="app-footer border-top p-3 bg-light shrink-0">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 overflow-hidden">
              <div
                className="avatar avatar-sm rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center shrink-0"
                style={{ width: "34px", height: "34px", fontSize: "12px" }}
              >
                {customer?.fullName ? customer.fullName.substring(0, 2).toUpperCase() : "CU"}
              </div>
              <div className="overflow-hidden">
                <div className="fw-bold text-dark text-truncate lh-sm" style={{ fontSize: "13px" }}>
                  {customer?.fullName || "Member"}
                </div>
                <small className="text-muted d-block text-truncate" style={{ fontSize: "11px" }}>
                  {customer?.phone || "Signed In"}
                </small>
              </div>
            </div>

            <form action={customerLogoutAction} className="m-0">
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
