import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { hashPassword } from "@/server/auth/passwords";
import { createAccessToken, createRefreshTokenSession } from "@/server/auth/tokens";
import { apiCreated, apiError } from "@/server/utils/api-response";
import { authRateLimiter } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Apply rate limiting (5 requests per minute per IP)
  const rateLimitResult = await authRateLimiter(req);
  if (rateLimitResult) return rateLimitResult;
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, fullName, password, email, deviceType, fcmToken } = body;

    // 1. Validation
    if (!phone?.trim() || !fullName?.trim() || !password) {
      return apiError("Phone number, full name, and password are required.", 400);
    }

    if (password.length < 6) {
      return apiError("Password must be at least 6 characters long.", 400);
    }

    const cleanPhone = phone.trim();
    const cleanEmail = email?.trim()?.toLowerCase() || null;

    // 2. Check Existing Phone
    const existingPhone = await prisma.customerUser.findUnique({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      return apiError("An account with this phone number already exists.", 409);
    }

    // 3. Check Existing Email if provided
    if (cleanEmail) {
      const existingEmail = await prisma.customerUser.findFirst({
        where: { email: cleanEmail, deleted_at: null },
      });
      if (existingEmail) {
        return apiError("An account with this email address already exists.", 409);
      }
    }

    // 4. Hash Password with Argon2id
    const hashedPassword = await hashPassword(password);

    // 5. Create Customer User
    const customer = await prisma.customerUser.create({
      data: {
        phone: cleanPhone,
        full_name: fullName.trim(),
        email: cleanEmail,
        password: hashedPassword,
        is_verified: true,
      },
    });

    // 6. Record Device if FCM token provided
    if (fcmToken) {
      await prisma.userDevice.create({
        data: {
          user_id: customer.id,
          device_type: deviceType || "web",
          fcm_token: fcmToken,
          is_active: true,
        },
      });
    }

    // 7. Create Session & Tokens
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

    const res = apiCreated({
      accessToken,
      refreshToken: session.refreshToken,
      tokenType: "Bearer",
      expiresIn: 900,
      customer: {
        id: customer.id,
        fullName: customer.full_name,
        phone: customer.phone,
        email: customer.email,
        createdAt: customer.created_at,
      },
    }, "Customer account registered successfully.");

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
    console.error("Register API error:", err);
    return apiError(err.message || "Registration failed", 500);
  }
}
