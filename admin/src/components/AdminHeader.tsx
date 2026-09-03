"use client";

import React from "react";
import { Menu, Bell, User, ExternalLink } from "lucide-react";
import { useAdminLayout } from "./AdminLayoutContext";
import Link from "next/link";

export default function AdminHeader() {
  const { toggleSidebar } = useAdminLayout();

  return (
    <header className="h-16 bg-[#0d0d0d]/80 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center space-x-2 text-xs text-neutral-400">
          <span>PrimeRides Management System</span>
          <span>•</span>
          <span className="text-emerald-400">System Online</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>View Live Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-4 ring-[#0d0d0d]"></span>
        </button>

        <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-amber-400 font-semibold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-white">Administrator</p>
            <p className="text-[10px] text-neutral-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
