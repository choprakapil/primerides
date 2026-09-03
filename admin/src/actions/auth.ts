"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "../lib/prisma";
import { createToken, verifyPassword } from "../lib/auth";

export async function adminLoginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  try {
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username }, { email: username }],
        deleted_at: null,
      },
    });

    if (!admin) {
      return { error: "Invalid username or password." };
    }

    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      return { error: "Invalid username or password." };
    }

    const token = await createToken({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      type: "admin",
    });

    const cookieStore = await cookies();
    cookieStore.set("primerides_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred during login." };
  }

  redirect("/admin");
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("primerides_admin_token");
  redirect("/admin/login");
}
