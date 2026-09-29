"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import CustomerHeader from "./CustomerHeader";
import CustomerSidebar from "./CustomerSidebar";

interface CustomerShellProps {
  children: React.ReactNode;
  customer?: {
    id: number;
    fullName: string;
    phone: string;
    email?: string | null;
    isVerified?: boolean;
  } | null;
}

export default function CustomerShell({ children, customer }: CustomerShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLoginPage = pathname === "/account/login";

  if (isLoginPage) {
    return (
      <div className="auth-wrapper min-vh-100 px-2 d-flex align-items-center justify-content-center bg-light">
        {children}
      </div>
    );
  }

  return (
    <div className="page-layout">
      <CustomerHeader
        customer={customer}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <CustomerSidebar
        customer={customer}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="app-wrapper">
        <div className="container-fluid">
          {children}
        </div>
      </main>
    </div>
  );
}
