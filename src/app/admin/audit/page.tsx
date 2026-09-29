import React from "react";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import ForbiddenCard from "@/components/admin/ForbiddenCard";
import AuditManager from "@/components/admin/AuditManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit Activity & System Logs | PrimeRides Admin",
};

export default async function AdminAuditPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return (
      <ForbiddenCard
        permissionRequired="admin session"
        moduleName="System Audit Activity & Logs"
      />
    );
  }

  // Fetch initial 100 audit logs
  const [logs, totalAllTime] = await Promise.all([
    prisma.auditLog.findMany({
      take: 100,
      orderBy: { created_at: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.auditLog.count(),
  ]);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent24h = await prisma.auditLog.count({
    where: { created_at: { gte: oneDayAgo } },
  });

  const distinctActors = await prisma.auditLog.groupBy({
    by: ["actor_id"],
    where: { actor_id: { not: null } },
  });

  const sanitizedLogs = logs.map((l) => ({
    id: l.id,
    actorId: l.actor_id,
    actorName: l.actor?.name || "System Automated Worker",
    actorEmail: l.actor?.email || "system@primerides.in",
    actorRole: l.actor?.role || l.actor_type,
    actorType: l.actor_type,
    action: l.action,
    entity: l.entity,
    entityId: l.entity_id,
    beforeState: l.before_state,
    afterState: l.after_state,
    ipAddress: l.ip_address || "Internal Loopback",
    userAgent: l.user_agent,
    createdAt: l.created_at.toISOString(),
  }));

  const stats = {
    totalAllTime,
    recent24h,
    distinctActorsCount: distinctActors.length,
    integrity: "100% Immutable Append-Only",
  };

  return <AuditManager initialLogs={sanitizedLogs} initialStats={stats} />;
}
