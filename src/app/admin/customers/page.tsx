import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import ForbiddenCard from "@/components/admin/ForbiddenCard";
import { PageContainer, PageHeader } from "@/components/admin/ui";
import CustomerDirectory, { CustomerRecord } from "@/components/admin/CustomerDirectory";

export const metadata = {
  title: "Customer Directory & Dossiers | PrimeRides Admin",
};

export default async function AdminCustomersPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const canView =
    admin.role === "superadmin" ||
    hasAdminPermission(admin, [
      ADMIN_PERMISSIONS.CUSTOMERS_VIEW,
      ADMIN_PERMISSIONS.BOOKINGS_VIEW,
      ADMIN_PERMISSIONS.BOOKINGS_MANAGE,
    ]);

  if (!canView) {
    return (
      <PageContainer>
        <ForbiddenCard
          permissionRequired="customers.view"
          moduleName="Customer Directory & Dossiers"
        />
      </PageContainer>
    );
  }

  const rawCustomers = await prisma.customerUser.findMany({
    where: { deleted_at: null },
    select: {
      id: true,
      phone: true,
      email: true,
      full_name: true,
      avatar_url: true,
      is_verified: true,
      created_at: true,
      updated_at: true,
      bookings: {
        select: {
          id: true,
          booking_code: true,
          status: true,
          start_date: true,
          end_date: true,
          total_amount: true,
          created_at: true,
          car: {
            select: {
              id: true,
              brand: true,
              name: true,
              primary_image: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      },
      documents: {
        select: {
          id: true,
          type: true,
          status: true,
          storage_key: true,
          mime_type: true,
          file_name: true,
          rejection_reason: true,
          verified_at: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  interface CustomerPageQueryResult {
    id: number;
    phone: string;
    email: string | null;
    full_name: string;
    avatar_url: string | null;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
    bookings: Array<{
      id: number;
      booking_code: string;
      status: string;
      start_date: Date;
      end_date: Date;
      total_amount: any;
      created_at: Date;
      car: { id: number; brand: string; name: string; primary_image: string | null } | null;
    }>;
    documents: Array<{
      id: number;
      type: string;
      status: string;
      storage_key: string;
      mime_type: string | null;
      file_name: string | null;
      rejection_reason: string | null;
      verified_at: Date | null;
      created_at: Date;
    }>;
  }

  // Calculate metrics
  let totalCustomers = rawCustomers.length;
  let verifiedKycCount = 0;
  let pendingKycCount = 0;
  let activeRentersCount = 0;

  const customers: CustomerRecord[] = (rawCustomers as unknown as CustomerPageQueryResult[]).map((c) => {
    const hasPendingDoc = c.documents.some((d) => d.status === "pending");
    const hasVerifiedLicense = c.documents.some(
      (d) => d.status === "verified" && d.type.startsWith("driving_license")
    );
    const isVerified = c.is_verified || hasVerifiedLicense;

    if (isVerified) verifiedKycCount++;
    if (hasPendingDoc) pendingKycCount++;

    const activeBookings = c.bookings.filter((b) => b.status === "active" || b.status === "confirmed");
    if (activeBookings.length > 0) activeRentersCount++;

    const totalSpend = c.bookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

    return {
      ...c,
      created_at: c.created_at.toISOString(),
      updated_at: c.updated_at.toISOString(),
      computedKycStatus: isVerified ? "verified" : hasPendingDoc ? "pending" : "unverified",
      totalSpend,
      totalBookings: c.bookings.length,
      activeBookingsCount: activeBookings.length,
      bookings: c.bookings.map((b) => ({
        ...b,
        total_amount: Number(b.total_amount || 0),
        start_date: b.start_date.toISOString(),
        end_date: b.end_date.toISOString(),
        created_at: b.created_at.toISOString(),
      })),
      documents: c.documents.map((d) => ({
        ...d,
        created_at: d.created_at.toISOString(),
        verified_at: d.verified_at ? d.verified_at.toISOString() : null,
      })),
    };
  });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Customer Management"
        title="Customer Directory & Dossiers"
        description="Inspect registered customer profiles, monitor trip telemetry, check identity credentials, and open direct communication channels."
      />

      <CustomerDirectory
        initialCustomers={customers}
        initialTelemetry={{
          totalCustomers,
          verifiedKycCount,
          pendingKycCount,
          activeRentersCount,
        }}
      />
    </PageContainer>
  );
}
