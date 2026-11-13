import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentCustomer } from "@/server/auth/customer";
import { apiSuccess, apiUnauthorized, apiError } from "@/server/utils/api-response";

/**
 * POST /api/v1/customer/device
 * Registers or updates a customer device push notification token (Expo / APNs / FCM).
 */
export async function POST(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return apiUnauthorized("Please sign in to register device notifications.");
    }

    const body = await req.json().catch(() => ({}));
    const { deviceType, fcmToken } = body;

    if (!fcmToken || typeof fcmToken !== "string") {
      return apiError("A valid device notification token is required.", 400);
    }

    const cleanToken = fcmToken.trim();
    const cleanType = (deviceType || "mobile").toLowerCase().slice(0, 20);

    const existingDevice = await prisma.userDevice.findFirst({
      where: {
        user_id: customer.id,
        fcm_token: cleanToken,
      },
    });

    if (existingDevice) {
      await prisma.userDevice.update({
        where: { id: existingDevice.id },
        data: {
          is_active: true,
          last_seen: new Date(),
          device_type: cleanType,
        },
      });
    } else {
      await prisma.userDevice.create({
        data: {
          user_id: customer.id,
          device_type: cleanType,
          fcm_token: cleanToken,
          is_active: true,
          last_seen: new Date(),
        },
      });
    }

    return apiSuccess({ registered: true }, "Device notification token registered successfully.");
  } catch (err: any) {
    console.error("Failed to register customer device token:", err);
    return apiError(err.message || "Failed to register device token", 500);
  }
}
