"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ModalProvider } from "@/context/ModalContext";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/account");

  if (isDashboard) {
    return (
      <>
        {/* Nexlink CRM Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />

        {/* Nexlink CRM Authoritative Stylesheets & Icon Packs */}
        <link rel="stylesheet" href="/nexlink/libs/flaticon/css/all/all.css" />
        <link rel="stylesheet" href="/nexlink/libs/lucide/lucide.css" />
        <link rel="stylesheet" href="/nexlink/libs/fontawesome/css/all.min.css" />
        <link rel="stylesheet" href="/nexlink/css/styles.css" />

        {children}
      </>
    );
  }

  return (
    <ModalProvider>
      {/* Public Website Luxury Stylesheet Isolation */}
      <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/css/plugins.css" />
      <link rel="stylesheet" href="/assets/css/style.css" />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </ModalProvider>
  );
}
