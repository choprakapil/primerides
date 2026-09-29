"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../db/client";
import { createAccessToken, verifyPassword } from "../auth";

export async function adminLoginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    redirect("/admin/login?error=Username and password are required.");
  }

  let success = false;
  try {
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username }, { email: username }],
        deleted_at: null,
      },
    });

    if (!admin) {
      redirect("/admin/login?error=Invalid username or password.");
    }

    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      redirect("/admin/login?error=Invalid username or password.");
    }

    const token = await createAccessToken(
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        role: admin.role,
        type: "admin",
      },
      86400 * 7 // 7-day cookie session
    );

    const cookieStore = await cookies();
    cookieStore.set("primerides_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    success = true;
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) throw err;
    redirect(`/admin/login?error=${encodeURIComponent(err.message || "Login failed")}`);
  }

  if (success) {
    redirect("/admin");
  }
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("primerides_admin_token");
  redirect("/admin/login");
}
