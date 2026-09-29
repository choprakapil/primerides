import { NextRequest } from "next/server";
import { rotateRefreshToken } from "@/server/auth/tokens";
import { apiError, apiSuccess } from "@/server/utils/api-response";
import { authRateLimiter } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Apply rate limiting (5 requests per minute per IP)
  const rateLimitResult = await authRateLimiter(req);
  if (rateLimitResult) return rateLimitResult;
  try {
    const body = await req.json().catch(() => ({}));
    const { refreshToken } = body;

    if (!refreshToken) {
      return apiError("Refresh token is required.", 400);
    }

    const ipAddress = req.headers.get("x-forwarded-for") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    const result = await rotateRefreshToken(refreshToken, ipAddress, userAgent);
    if (!result) {
      return apiError("Invalid, expired, or revoked refresh token.", 401);
    }

    return apiSuccess(result, "Token refreshed successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to refresh token", 500);
  }
}
