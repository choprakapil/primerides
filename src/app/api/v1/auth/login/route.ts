import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { verifyPassword } from "@/server/auth/passwords";
import { createAccessToken, createRefreshTokenSession } from "@/server/auth/tokens";
import { apiError, apiSuccess } from "@/server/utils/api-response";
import { authRateLimiter } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Apply rate limiting (5 requests per minute per IP)
  const rateLimitResult = await authRateLimiter(req);
  if (rateLimitResult) return rateLimitResult;
  try {
    const body = await req.json().catch(() => ({}));
    const { identifier, phone, email, password, deviceType, fcmToken } = body;

    const loginId = (identifier || phone || email)?.trim();
    if (!loginId || !password) {
      return apiError("Phone number/email and password are required.", 400);
    }

    // Find customer by phone or email
    const customer = await prisma.customerUser.findFirst({
      where: {
        OR: [{ phone: loginId }, { email: loginId.toLowerCase() }],
        deleted_at: null,
      },
    });

    if (!customer || !customer.password) {
      return apiError("Invalid credentials or account not found.", 401);
    }

    // Verify password with Argon2id
    const isValid = await verifyPassword(password, customer.password);
    if (!isValid) {
      return apiError("Invalid credentials.", 401);
    }

    // Record or update user device
    if (fcmToken) {
      const existingDevice = await prisma.userDevice.findFirst({
        where: { user_id: customer.id, fcm_token: fcmToken },
      });
      if (existingDevice) {
        await prisma.userDevice.update({
          where: { id: existingDevice.id },
          data: { last_seen: new Date(), is_active: true },
        });
      } else {
        await prisma.userDevice.create({
          data: {
            user_id: customer.id,
            device_type: deviceType || "web",
            fcm_token: fcmToken,
            is_active: true,
          },
        });
      }
    }

    // Create session & tokens
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

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

    const res = apiSuccess({
      accessToken,
      refreshToken: session.refreshToken,
      tokenType: "Bearer",
      expiresIn: 900,
      customer: {
        id: customer.id,
        fullName: customer.full_name,
        phone: customer.phone,
        email: customer.email,
        avatarUrl: customer.avatar_url,
      },
    }, "Login successful.");

    res.cookies.set("primerides_customer_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 900,
      path: "/",
    });

    res.cookies.set("primerides_customer_refresh", session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return res;
  } catch (err: any) {
    console.error("Login API error:", err);
    return apiError(err.message || "Authentication error", 500);
  }
}
