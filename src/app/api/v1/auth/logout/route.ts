import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/server/db/client";
import { verifyAccessToken } from "@/server/auth/jwt";
import { apiSuccess } from "@/server/utils/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("authorization");
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get("primerides_customer_token")?.value;
    }

    if (token) {
      const payload = await verifyAccessToken(token);
      if (payload?.sessionId) {
        await prisma.session.updateMany({
          where: { id: payload.sessionId },
          data: { is_revoked: true },
        });
      }
    }

    // If a refreshToken is explicitly sent in body, revoke by hash
    if (body.refreshToken) {
      const encoder = new TextEncoder();
      const JWT_SECRET = process.env.JWT_SECRET || "primerides_super_secure_jwt_secret_2026_fallback";
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(body.refreshToken + JWT_SECRET));
      const refreshTokenHash = Buffer.from(hashBuffer).toString("hex");

      await prisma.session.updateMany({
        where: { refresh_token_hash: refreshTokenHash },
        data: { is_revoked: true },
      });
    }

    // Clear cookies if on web
    const cookieStore = await cookies();
    cookieStore.delete("primerides_customer_token");
    cookieStore.delete("primerides_customer_refresh");

    return apiSuccess({ loggedOut: true }, "Logged out successfully.");
  } catch (err: any) {
    return apiSuccess({ loggedOut: true }, "Session cleared.");
  }
}
