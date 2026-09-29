import React from "react";
import { getCurrentCustomer } from "@/server/auth/customer";
import CustomerShell from "@/components/account/CustomerShell";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCurrentCustomer();
  const serializedCustomer = customer ? JSON.parse(JSON.stringify(customer)) : null;

  return (
    <CustomerShell customer={serializedCustomer}>
      {children}
    </CustomerShell>
  );
}
