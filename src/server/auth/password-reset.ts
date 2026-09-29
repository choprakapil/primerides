import crypto from "crypto";
import { prisma } from "../db/client";

/**
 * Generates a cryptographically secure 64-character hex token,
 * hashes it with SHA-256 for secure DB storage, and stores it in tbl_password_reset_tokens.
 */
export async function createPasswordResetToken(userId: number): Promise<{
  rawToken: string;
  expiresAt: Date;
}> {
  // 1. Generate 32 bytes of cryptographic randomness
  const rawToken = crypto.randomBytes(32).toString("hex");

  // 2. Compute SHA-256 hash of the token for database storage
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  // 3. Set expiration to 60 minutes from now
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // 4. Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: {
      user_id: userId,
      used_at: null,
    },
    data: {
      used_at: new Date(),
    },
  });

  // 5. Create new reset token record
  await prisma.passwordResetToken.create({
    data: {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
  });

  return { rawToken, expiresAt };
}

/**
 * Validates whether a given raw token is authentic, unconsumed, and not expired.
 */
export async function validatePasswordResetToken(rawToken: string): Promise<{
  valid: boolean;
  userId?: number;
  resetTokenId?: number;
  customerName?: string;
  customerEmail?: string | null;
  customerPhone?: string;
  error?: string;
}> {
  if (!rawToken || typeof rawToken !== "string" || rawToken.length < 32) {
    return { valid: false, error: "Invalid password reset token format." };
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const record = await prisma.passwordResetToken.findUnique({
    where: { token_hash: tokenHash },
    include: { user: true },
  });

  if (!record) {
    return { valid: false, error: "This password reset link is invalid or has expired." };
  }

  if (record.used_at) {
    return {
      valid: false,
      error: "This password reset link has already been used. Please request a new one.",
    };
  }

  if (new Date() > record.expires_at) {
    return {
      valid: false,
      error: "This password reset link has expired. Reset links are valid for 60 minutes.",
    };
  }

  if (!record.user || record.user.deleted_at) {
    return { valid: false, error: "The associated customer account could not be found." };
  }

  return {
    valid: true,
    userId: record.user_id,
    resetTokenId: record.id,
    customerName: record.user.full_name,
    customerEmail: record.user.email,
    customerPhone: record.user.phone,
  };
}

/**
 * Consumes the reset token so it can never be used again.
 */
export async function markPasswordResetTokenUsed(resetTokenId: number): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { id: resetTokenId },
    data: { used_at: new Date() },
  });
}
