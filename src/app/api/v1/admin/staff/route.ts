import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { hashPassword } from "@/server/auth/passwords";
import { apiCreated, apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * GET /api/v1/admin/staff
 * Lists all staff accounts (Admins with admins.manage only)
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.ADMINS_MANAGE)) {
      return apiError("Forbidden: You lack admins.manage permission.", 403);
    }

    const staffList = await prisma.adminUser.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    return apiSuccess(staffList, "Staff accounts retrieved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch staff accounts", 500);
  }
}

/**
 * POST /api/v1/admin/staff
 * Creates a new staff AdminUser with chosen permissions & writes AuditLog.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.ADMINS_MANAGE)) {
      return apiError("Forbidden: You lack admins.manage permission.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const { name, email, username, password, permissions, role = "staff" } = body;

    if (!name?.trim() || !email?.trim() || !username?.trim() || !password) {
      return apiError("Name, email, username, and temporary password are required.", 400);
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate
    const existing = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
        deleted_at: null,
      },
    });

    if (existing) {
      return apiError(
        existing.username === cleanUsername
          ? "An administrator with this username already exists."
          : "An administrator with this email already exists.",
        409
      );
    }

    // Hash with Argon2id
    const hashedPassword = await hashPassword(password);
    const validPermissions = Array.isArray(permissions) ? permissions : [];

    const newStaff = await prisma.$transaction(async (tx) => {
      const created = await tx.adminUser.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          username: cleanUsername,
          password: hashedPassword,
          role: role === "superadmin" && admin.role === "superadmin" ? "superadmin" : "staff",
          permissions: validPermissions,
          is_active: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          permissions: true,
          created_at: true,
        },
      });

      // Write AuditLog
      const ipAddress = req.headers.get("x-forwarded-for") || undefined;
      const userAgent = req.headers.get("user-agent") || undefined;

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "STAFF_ACCOUNT_CREATED",
          entity: "AdminUser",
          entity_id: created.id,
          after_state: {
            username: created.username,
            email: created.email,
            role: created.role,
            permissions: validPermissions,
            createdByAdminId: admin.id,
          },
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      });

      return created;
    });

    return apiCreated(newStaff, "Staff account created successfully with assigned RBAC permissions.");
  } catch (err: any) {
    console.error("Create staff error:", err);
    return apiError(err.message || "Failed to create staff account", 500);
  }
}
