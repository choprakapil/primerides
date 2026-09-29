import React from "react";
import { AdminLayoutProvider } from "@/components/admin/AdminLayoutContext";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutProvider>
      <AdminShell>{children}</AdminShell>
    </AdminLayoutProvider>
  );
}
