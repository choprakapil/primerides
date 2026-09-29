import React from "react";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS, ALL_PERMISSIONS } from "@/server/auth/rbac";
import ForbiddenCard from "@/components/admin/ForbiddenCard";
import { PageContainer, PageHeader } from "@/components/admin/ui";
import StaffManager from "@/components/admin/StaffManager";

export const metadata = {
  title: "Staff & RBAC Administration | PrimeRides Admin",
};

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasAdminPermission(admin, ADMIN_PERMISSIONS.ADMINS_MANAGE)) {
    return (
      <PageContainer>
        <ForbiddenCard
          permissionRequired="admins.manage"
          moduleName="Staff & RBAC Administration"
        />
      </PageContainer>
    );
  }

  const params = await searchParams;

  const staffList = await prisma.adminUser.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: "desc" },
  });

  const sanitizedStaff = staffList.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    permissions: Array.isArray(u.permissions) ? (u.permissions as string[]) : [],
    created_at: u.created_at.toISOString(),
  }));

  const serializedPermissions = ALL_PERMISSIONS.map((p) => ({
    key: p.key,
    label: p.label,
    description: p.description,
  }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Security & Governance"
        title="Staff & RBAC Console"
        description="Provision scoped administrative accounts, manage domain permissions, and review security access controls."
      />

      <StaffManager
        staffList={sanitizedStaff}
        allPermissions={serializedPermissions}
        currentAdminEmail={admin.email}
        paramsError={params?.error}
        paramsSuccess={params?.success}
      />
    </PageContainer>
  );
}
