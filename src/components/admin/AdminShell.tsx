"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import SlideToast from "./SlideToast";
import { useAdminLayout } from "./AdminLayoutContext";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useAdminLayout();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="auth-wrapper min-vh-100 px-2 d-flex align-items-center justify-content-center bg-light">
        {children}
      </div>
    );
  }

  return (
    <div className="page-layout" data-app-sidebar={isCollapsed ? "mini" : "full"}>
      <SlideToast />
      <AdminHeader />
      <Sidebar />
      <main className="app-wrapper">
        <div className="container-fluid">
          {children}
        </div>
      </main>
    </div>
  );
}
