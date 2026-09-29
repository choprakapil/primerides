"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerLogoutAction } from "@/server/actions/customer-auth";
import {
  LayoutDashboard,
  Car,
  ShieldCheck,
  CreditCard,
  UserCog,
  LogOut,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface CustomerPortalHeaderProps {
  customer: {
    id: number;
    fullName: string;
    phone: string;
    email?: string | null;
    isVerified?: boolean;
    createdAt?: Date | string;
  };
  activeTab: "overview" | "bookings" | "documents" | "payments" | "profile";
  stats?: {
    totalTrips?: number;
    activeBookings?: number;
    hasVerifiedDL?: boolean;
  };
}

export default function CustomerPortalHeader({
  customer,
  activeTab,
  stats = {},
}: CustomerPortalHeaderProps) {
  const NAV_TABS = [
    {
      id: "overview",
      label: "Overview",
      href: "/account",
      icon: LayoutDashboard,
    },
    {
      id: "bookings",
      label: "My Bookings",
      href: "/account/bookings",
      icon: Car,
      badge: stats.activeBookings && stats.activeBookings > 0 ? `${stats.activeBookings} Active` : undefined,
    },
    {
      id: "documents",
      label: "KYC & Documents",
      href: "/account/documents",
      icon: ShieldCheck,
      badge: stats.hasVerifiedDL ? "Verified" : "Action Needed",
      badgeType: stats.hasVerifiedDL ? "success" : "warning",
    },
    {
      id: "payments",
      label: "Payments & Ledger",
      href: "/account/payments",
      icon: CreditCard,
    },
    {
      id: "profile",
      label: "Profile & Security",
      href: "/account/profile",
      icon: UserCog,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e8edf2]">
        <div className="flex items-center gap-2 text-xs">
          <Link href="/" className="text-[#7e8b9b] hover:text-[#5955D1] font-medium transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#94a3b8]" />
          <Link href="/account" className="text-[#7e8b9b] hover:text-[#5955D1] font-medium transition-colors">
            Customer Portal
          </Link>
          <ChevronRight className="w-3 h-3 text-[#94a3b8]" />
          <span className="text-[#5955D1] font-bold uppercase tracking-wider text-[11px]">
            {NAV_TABS.find((t) => t.id === activeTab)?.label || "Overview"}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/cars"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold shadow-xs transition-all cursor-pointer bg-[#5955D1] hover:bg-[#4743BA]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Browse Fleet</span>
          </Link>

          <form action={customerLogoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#feebeb] hover:text-[#f83636] text-[#495057] text-xs font-semibold border border-[#e8edf2] shadow-sm transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* Unified Customer Dossier Banner (Nexlink Architecture) */}
      <div
        className="bg-white rounded-3 p-5 md:p-6 border border-[#e8edf2] shadow-[0_4px_12px_rgba(2,2,76,0.02)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: User Identity */}
          <div className="flex items-center space-x-4">
            <div
              className="w-14 h-14 rounded-3 flex items-center justify-center font-bold text-lg shrink-0 bg-[#eeedfc] border border-[#d2d0f7] text-[#5955D1]"
            >
              <User className="w-7 h-7 text-[#5955D1]" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-[#1c274c] tracking-tight">
                  {customer.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f5f0] text-[#009966] border border-[#009966]/20 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#009966]" />
                  Verified Customer
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#7e8b9b] mt-1.5">
                <span className="flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#5955D1]" /> {customer.phone}
                </span>
                {customer.email && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 text-[#5955D1]" /> {customer.email}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Key Metrics Strip */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e8edf2] text-center min-w-[95px] flex-1 sm:flex-none">
              <span className="text-xl font-bold text-[#5955D1] block leading-tight">
                {stats.totalTrips ?? 0}
              </span>
              <span className="text-[10px] text-[#7e8b9b] block uppercase font-semibold tracking-wider mt-0.5">
                Total Trips
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e8edf2] text-center min-w-[95px] flex-1 sm:flex-none">
              <span className="text-xl font-bold text-[#1c274c] block leading-tight">
                {stats.activeBookings ?? 0}
              </span>
              <span className="text-[10px] text-[#7e8b9b] block uppercase font-semibold tracking-wider mt-0.5">
                Active Rides
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e8edf2] text-center min-w-[120px] flex-1 sm:flex-none">
              {stats.hasVerifiedDL ? (
                <div className="flex items-center justify-center gap-1 text-[#009966] font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Handover Ready</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 text-[#f5a70d] font-semibold text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>KYC Pending</span>
                </div>
              )}
              <span className="text-[10px] text-[#7e8b9b] block uppercase font-semibold tracking-wider mt-0.5">
                DL Verification
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tab Bar */}
      <div className="bg-white rounded-xl p-1.5 border border-[#e8edf2] shadow-sm">
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex-1 justify-center sm:justify-start ${
                  isActive
                    ? "bg-[#5955D1] text-white shadow-xs"
                    : "text-[#495057] hover:text-[#1c274c] hover:bg-[#f8fafc]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#7e8b9b]"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase ml-0.5 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.badgeType === "success"
                        ? "bg-[#e6f5f0] text-[#009966] border border-[#009966]/20"
                        : "bg-[#fef6e7] text-[#f5a70d] border border-[#f5a70d]/20"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
