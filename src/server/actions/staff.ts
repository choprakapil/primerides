"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "../db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "../auth/rbac";
import { hashPassword } from "../auth/passwords";

export async function createStaffAction(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasAdminPermission(admin, ADMIN_PERMISSIONS.ADMINS_MANAGE)) {
    redirect("/admin/staff?error=Forbidden:+You+lack+admins.manage+permission.");
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim()?.toLowerCase();
  const username = (formData.get("username") as string)?.trim()?.toLowerCase();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "staff";

  // Parse checked permissions
  const selectedPermissions: string[] = [];
  for (const permKey of Object.values(ADMIN_PERMISSIONS)) {
    if (formData.get(`perm_${permKey}`) === "on") {
      selectedPermissions.push(permKey);
    }
  }

  if (!name || !email || !username || !password) {
    redirect("/admin/staff?error=All+fields+are+required.");
  }

  let success = false;
  try {
    const existing = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username }, { email }],
        deleted_at: null,
      },
    });

    if (existing) {
      redirect("/admin/staff?error=An+account+with+this+username+or+email+already+exists.");
    }

    const hashedPassword = await hashPassword(password);
    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for") || undefined;
    const userAgent = headerList.get("user-agent") || undefined;

    await prisma.$transaction(async (tx) => {
      const created = await tx.adminUser.create({
        data: {
          name,
          email,
          username,
          password: hashedPassword,
          role,
          permissions: selectedPermissions,
          is_active: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "STAFF_ACCOUNT_CREATED",
          entity: "AdminUser",
          entity_id: created.id,
          after_state: {
            username,
            email,
            role,
            permissions: selectedPermissions,
            createdByAdmin: admin.username,
          },
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      });
    });

    revalidatePath("/admin/staff");
    success = true;
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) throw err;
    redirect(`/admin/staff?error=${encodeURIComponent(err.message || "Failed to create staff")}`);
  }

  if (success) {
    redirect("/admin/staff?success=Staff+account+created+successfully.");
  }
}
