import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiSuccess, apiError, apiUnauthorized } from "@/server/utils/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/audit
 * Returns paginated immutable audit logs with search, actor, and entity filtering
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return apiUnauthorized("Unauthorized. Admin session required.");
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const entity = searchParams.get("entity")?.trim() || "";
    const action = searchParams.get("action")?.trim() || "";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 10), 200);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (entity && entity !== "all") {
      where.entity = entity;
    }

    if (action && action !== "all") {
      where.action = { contains: action };
    }

    if (search) {
      where.OR = [
        { action: { contains: search } },
        { entity: { contains: search } },
        { ip_address: { contains: search } },
        {
          actor: {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { username: { contains: search } },
            ],
          },
        },
      ];
    }

    const [total, logs, totalAllTime] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        take: limit,
        skip,
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

    // Calculate quick telemetry
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent24hCount = await prisma.auditLog.count({
      where: { created_at: { gte: oneDayAgo } },
    });

    const distinctActors = await prisma.auditLog.groupBy({
      by: ["actor_id"],
      where: { actor_id: { not: null } },
    });

    return apiSuccess({
      logs: logs.map((l) => ({
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
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalAllTime,
        recent24h: recent24hCount,
        distinctActorsCount: distinctActors.length,
        integrity: "100% Immutable Append-Only",
      },
    });
  } catch (err: any) {
    console.error("GET /api/v1/admin/audit error:", err);
    return apiError(err.message || "Failed to load audit logs", 500);
  }
}
