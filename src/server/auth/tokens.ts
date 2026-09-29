export * from "./jwt";
import { prisma } from "../db/client";
import { createAccessToken, TokenPayload } from "./jwt";

const JWT_SECRET = process.env.JWT_SECRET || "primerides_super_secure_jwt_secret_2026_fallback";

/**
 * Creates a cryptographically secure random refresh token and records it in tbl_sessions.
 */
export async function createRefreshTokenSession(params: {
  userId: number;
  userType: "admin" | "customer";
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ refreshToken: string; sessionId: string; expiresAt: Date }> {
  const rawBytes = new Uint8Array(32);
  crypto.getRandomValues(rawBytes);
  const refreshToken = Buffer.from(rawBytes).toString("hex");

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(refreshToken + JWT_SECRET));
  const refreshTokenHash = Buffer.from(hashBuffer).toString("hex");

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const session = await prisma.session.create({
    data: {
      user_id: params.userId,
      user_type: params.userType,
      token_hash: "bearer_session",
      refresh_token_hash: refreshTokenHash,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      expires_at: expiresAt,
      is_revoked: false,
    },
  });

  return { refreshToken, sessionId: session.id, expiresAt };
}

/**
 * Validates and rotates a refresh token.
 */
export async function rotateRefreshToken(
  refreshToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; newRefreshToken: string } | null> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(refreshToken + JWT_SECRET));
  const refreshTokenHash = Buffer.from(hashBuffer).toString("hex");

  const session = await prisma.session.findFirst({
    where: {
      refresh_token_hash: refreshTokenHash,
      is_revoked: false,
      expires_at: { gt: new Date() },
    },
  });

  if (!session) return null;

  await prisma.session.update({
    where: { id: session.id },
    data: { is_revoked: true },
  });

  const newSession = await createRefreshTokenSession({
    userId: session.user_id,
    userType: session.user_type as "admin" | "customer",
    ipAddress,
    userAgent,
  });

  const accessToken = await createAccessToken({
    id: session.user_id,
    type: session.user_type as "admin" | "customer",
    sessionId: newSession.sessionId,
  }, 900); // 15 mins

  return { accessToken, newRefreshToken: newSession.refreshToken };
}
