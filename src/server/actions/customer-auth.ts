"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../db/client";
import { hashPassword, verifyPassword } from "../auth/passwords";
import { createAccessToken, createRefreshTokenSession } from "../auth/tokens";
import {
  createPasswordResetToken,
  validatePasswordResetToken,
  markPasswordResetTokenUsed,
} from "../auth/password-reset";
import { getCurrentCustomer } from "../auth/customer";

export async function customerRegisterAction(formData: FormData) {
  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim()?.toLowerCase() || undefined;
  const password = formData.get("password") as string;

  if (!fullName || !phone || !password) {
    redirect("/account/register?error=Full+name,+phone+number,+and+password+are+required.");
  }

  if (password.length < 6) {
    redirect("/account/register?error=Password+must+be+at+least+6+characters+long.");
  }

  let success = false;
  try {
    const existing = await prisma.customerUser.findFirst({
      where: {
        OR: [{ phone }, ...(email ? [{ email }] : [])],
        deleted_at: null,
      },
    });

    if (existing) {
      const msg = existing.phone === phone
        ? "An account with this phone number already exists."
        : "An account with this email already exists.";
      redirect(`/account/register?error=${encodeURIComponent(msg)}`);
    }

    const hashedPassword = await hashPassword(password);
    const customer = await prisma.customerUser.create({
      data: {
        full_name: fullName,
        phone,
        email: email || null,
        password: hashedPassword,
        is_verified: true,
      },
    });

    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for") || undefined;
    const userAgent = headerList.get("user-agent") || undefined;

    const session = await createRefreshTokenSession({
      userId: customer.id,
      userType: "customer",
      ipAddress,
      userAgent,
    });

    const accessToken = await createAccessToken({
      id: customer.id,
      phone: customer.phone,
      name: customer.full_name,
      type: "customer",
      sessionId: session.sessionId,
    }, 900); // 15 min

    const cookieStore = await cookies();
    cookieStore.set("primerides_customer_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 900,
      path: "/",
    });

    cookieStore.set("primerides_customer_refresh", session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    success = true;
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) throw err;
    redirect(`/account/register?error=${encodeURIComponent(err.message || "Registration failed")}`);
  }

  if (success) {
    redirect("/account");
  }
}

export async function customerLoginAction(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim();
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string)?.trim() || "/account";

  if (!identifier || !password) {
    redirect(`/account/login?error=Phone+number+or+email+and+password+are+required.&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  let success = false;
  try {
    const customer = await prisma.customerUser.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier.toLowerCase() }],
        deleted_at: null,
      },
    });

    if (!customer || !customer.password) {
      redirect(`/account/login?error=Invalid+credentials+or+account+not+found.&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }

    const isValid = await verifyPassword(password, customer.password);
    if (!isValid) {
      redirect(`/account/login?error=Invalid+credentials.&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }

    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for") || undefined;
    const userAgent = headerList.get("user-agent") || undefined;

    const session = await createRefreshTokenSession({
      userId: customer.id,
      userType: "customer",
      ipAddress,
      userAgent,
    });

    const accessToken = await createAccessToken({
      id: customer.id,
      phone: customer.phone,
      name: customer.full_name,
      type: "customer",
      sessionId: session.sessionId,
    }, 900); // 15 mins

    const cookieStore = await cookies();
    cookieStore.set("primerides_customer_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 900,
      path: "/",
    });

    cookieStore.set("primerides_customer_refresh", session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    success = true;
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) throw err;
    redirect(`/account/login?error=${encodeURIComponent(err.message || "Login failed")}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (success) {
    redirect(callbackUrl.startsWith("/") ? callbackUrl : "/account");
  }
}

export async function customerLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("primerides_customer_token");
  cookieStore.delete("primerides_customer_refresh");
  redirect("/account/login");
}

export async function customerRequestPasswordResetAction(formData: FormData) {
  const identifier = (formData.get("identifier") as string)?.trim();

  if (!identifier) {
    redirect("/account/forgot-password?error=Please+enter+your+phone+number+or+email+address.");
  }

  let resetToken = "";
  try {
    const customer = await prisma.customerUser.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier.toLowerCase() }],
        deleted_at: null,
      },
    });

    if (customer) {
      const { rawToken } = await createPasswordResetToken(customer.id);
      resetToken = rawToken;
    }
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) throw err;
    redirect(`/account/forgot-password?error=${encodeURIComponent(err.message || "Failed to process password reset request")}`);
  }

  // If in local dev or token generated, pass token in searchParams so testing simulation works effortlessly
  const query = new URLSearchParams({
    sent: "true",
    identifier,
    ...(resetToken ? { token: resetToken } : {}),
  });

  redirect(`/account/forgot-password?${query.toString()}`);
}

export async function customerResetPasswordAction(formData: FormData) {
  const token = (formData.get("token") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    redirect("/account/forgot-password?error=Password+reset+token+is+missing+or+invalid.");
  }

  if (!password || password.length < 6) {
    redirect(`/account/reset-password?token=${encodeURIComponent(token)}&error=Password+must+be+at+least+6+characters+long.`);
  }

  if (password !== confirmPassword) {
    redirect(`/account/reset-password?token=${encodeURIComponent(token)}&error=Passwords+do+not+match.`);
  }

  try {
    const validation = await validatePasswordResetToken(token);
    if (!validation.valid || !validation.userId || !validation.resetTokenId) {
      redirect(`/account/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(validation.error || "Invalid or expired reset token.")}`);
    }

    // 1. Hash the new password with Argon2id
    const hashedPassword = await hashPassword(password);

    // 2. Update user's password in database
    await prisma.customerUser.update({
      where: { id: validation.userId },
      data: { password: hashedPassword },
    });

    // 3. Mark the reset token as used (single-use protection)
    await markPasswordResetTokenUsed(validation.resetTokenId);

    // 4. Revoke any active sessions for this customer to force clean login
    await prisma.session.updateMany({
      where: {
        user_id: validation.userId,
        user_type: "customer",
        is_revoked: false,
      },
      data: { is_revoked: true },
    });
  } catch (err: any) {
    if (err?.message?.includes("NEXT_REDIRECT")) throw err;
    redirect(`/account/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(err.message || "Failed to reset password")}`);
  }

  redirect("/account/login?success=Your+password+has+been+successfully+reset.+Please+sign+in+with+your+new+password.");
}

export async function updateCustomerProfileAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { success: false, error: "Authentication required. Please log in again." };
  }

  const fullName = (formData.get("fullName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim()?.toLowerCase() || null;

  if (!fullName) {
    return { success: false, error: "Full name is required." };
  }

  try {
    if (email) {
      const existing = await prisma.customerUser.findFirst({
        where: {
          email,
          id: { not: customer.id },
          deleted_at: null,
        },
      });
      if (existing) {
        return { success: false, error: "This email address is already registered by another account." };
      }
    }

    await prisma.customerUser.update({
      where: { id: customer.id },
      data: {
        full_name: fullName,
        email,
      },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update profile." };
  }
}

export async function updateCustomerPasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { success: false, error: "Authentication required. Please log in again." };
  }

  const currentPassword = (formData.get("currentPassword") as string)?.trim();
  const newPassword = (formData.get("newPassword") as string)?.trim();
  const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: "All password fields are required." };
  }

  if (newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters long." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "New password and confirmation do not match." };
  }

  try {
    const dbCustomer = await prisma.customerUser.findUnique({
      where: { id: customer.id },
    });

    if (!dbCustomer || !dbCustomer.password) {
      return { success: false, error: "Account credentials could not be verified." };
    }

    const isValid = await verifyPassword(currentPassword, dbCustomer.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.customerUser.update({
      where: { id: customer.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update password." };
  }
}
