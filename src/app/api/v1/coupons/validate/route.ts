import { NextRequest } from "next/server";
import { validateCoupon } from "@/server/booking";
import { apiError, apiSuccess } from "@/server/utils/api-response";

/**
 * POST /api/v1/coupons/validate
 * Validates a coupon code against an entered booking gross amount.
 * Returns discount calculations and coupon details.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { code, amount, customerId, phone, platform: bodyPlatform } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return apiError("Please enter a promo code.", 400);
    }

    const grossAmount = Number(amount);
    if (isNaN(grossAmount) || grossAmount <= 0) {
      return apiError("Invalid booking amount for coupon calculation.", 400);
    }

    const headerPlatform = req.headers.get("x-client-platform");
    const targetPlatform = bodyPlatform || headerPlatform || "web";

    const result = await validateCoupon(code.trim(), grossAmount, {
      customerId: customerId ? Number(customerId) : undefined,
      phone: phone ? String(phone).trim() : undefined,
      platform: targetPlatform,
    });

    if (!result.valid) {
      return apiError(result.error || "Invalid coupon code.", 400);
    }

    return apiSuccess(
      {
        code: result.coupon?.code,
        description: result.coupon?.description,
        discountType: result.discountType,
        discountValue: result.discountValue,
        discountAmount: result.discountAmount,
        applicablePlatforms: result.coupon?.applicable_platforms,
        newUsersOnly: result.coupon?.new_users_only,
        perUserLimit: result.coupon?.per_user_limit,
        grossAmount,
        netPayableAmount: result.netPayableAmount,
      },
      `Coupon ${result.coupon?.code} applied successfully! You saved ₹${result.discountAmount?.toLocaleString("en-IN")}.`
    );
  } catch (err: any) {
    console.error("Coupon validation error:", err);
    return apiError(err.message || "Failed to validate coupon", 500);
  }
}
