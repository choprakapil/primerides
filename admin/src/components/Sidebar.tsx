"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  FileText,
  HelpCircle,
  Search,
  Users,
  Settings,
  Sparkles,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useAdminLayout } from "./AdminLayoutContext";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Fleet & Cars", href: "/admin/cars", icon: Car },
  { name: "Bookings & Leads", href: "/admin/bookings", icon: CalendarCheck },
  { name: "Blogs & Articles", href: "/admin/blogs", icon: FileText },
  { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { name: "SEO & Meta Tags", href: "/admin/seo", icon: Search },
  { name: "App Customers", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useAdminLayout();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-[#0d0d0d] border-r border-white/10 flex flex-col justify-between ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-black font-bold" />
            </div>
            {sidebarOpen && (
              <div>
                <span className="text-base font-bold tracking-wider text-white uppercase block">
                  PRIME<span className="text-amber-400">RIDES</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
                  Admin Portal
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 font-semibold"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-black" : "text-neutral-400 group-hover:text-amber-400"}`} />
                  {sidebarOpen && <span>{item.name}</span>}
                </div>
                {sidebarOpen && isActive && (
                  <ChevronRight className="w-4 h-4 text-black" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout & Footer */}
      <div className="p-4 border-t border-white/10">
        <form action="/admin/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
