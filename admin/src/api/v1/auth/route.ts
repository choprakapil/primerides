import { NextRequest } from "next/server";
import prisma from "../../../lib/prisma";
import { createToken, hashPassword, verifyPassword } from "../../../lib/auth";
import { apiCreated, apiError, apiSuccess } from "../../../lib/api-response";

// POST /api/v1/auth (Mobile Login or Register)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, password, fullName, email, deviceType, fcmToken } = body;

    if (!phone) {
      return apiError("Phone number is required.", 400);
    }

    if (action === "register") {
      if (!fullName || !password) {
        return apiError("Full name and password are required for registration.", 400);
      }

      const existing = await prisma.customerUser.findFirst({
        where: { phone, deleted_at: null },
      });

      if (existing) {
        return apiError("An account with this phone number already exists.", 409);
      }

      const hashedPassword = await hashPassword(password);
      const customer = await prisma.customerUser.create({
        data: {
          phone,
          password: hashedPassword,
          full_name: fullName,
          email,
          device_type: deviceType || "mobile",
          fcm_token: fcmToken,
          is_verified: true,
        },
      });

      const token = await createToken({
        id: customer.id,
        phone: customer.phone,
        name: customer.full_name,
        type: "customer",
      });

      return apiCreated({
        token,
        customer: {
          id: customer.id,
          fullName: customer.full_name,
          phone: customer.phone,
          email: customer.email,
        },
      }, "Customer registered successfully.");
    }

    // Default: Login
    const customer = await prisma.customerUser.findFirst({
      where: { phone, deleted_at: null },
    });

    if (!customer || !customer.password) {
      return apiError("Invalid credentials or account not found.", 401);
    }

    const isValid = await verifyPassword(password, customer.password);
    if (!isValid) {
      return apiError("Invalid credentials.", 401);
    }

    // Update FCM token if passed
    if (fcmToken) {
      await prisma.customerUser.update({
        where: { id: customer.id },
        data: { fcm_token: fcmToken, device_type: deviceType },
      });
    }

    const token = await createToken({
      id: customer.id,
      phone: customer.phone,
      name: customer.full_name,
      type: "customer",
    });

    return apiSuccess({
      token,
      customer: {
        id: customer.id,
        fullName: customer.full_name,
        phone: customer.phone,
        email: customer.email,
        avatarUrl: customer.avatar_url,
      },
    }, "Login successful.");
  } catch (err: any) {
    return apiError(err.message || "Authentication error", 500);
  }
}
