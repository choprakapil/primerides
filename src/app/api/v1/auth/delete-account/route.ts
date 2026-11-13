import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/server/db/client";
import { getCurrentCustomer } from "@/server/auth/customer";
import { apiSuccess, apiUnauthorized, apiError } from "@/server/utils/api-response";

/**
 * POST /api/v1/auth/delete-account
 * DELETE /api/v1/auth/delete-account
 * Complies with Apple App Store Guideline 5.1.1(v) for account deletion.
 * Soft deletes the authenticated customer account, revokes all sessions, and clears cookies.
 */
export async function POST(req: NextRequest) {
  return handleDeleteAccount(req);
}

export async function DELETE(req: NextRequest) {
  return handleDeleteAccount(req);
}

async function handleDeleteAccount(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return apiUnauthorized("Please sign in to delete your account.");
    }

    const now = new Date();

    // 1. Soft-delete the customer user record
    await prisma.customerUser.update({
      where: { id: customer.id },
      data: {
        deleted_at: now,
      },
    });

    // 2. Revoke all active sessions for this customer
    await prisma.session.updateMany({
      where: {
        user_id: customer.id,
        user_type: "customer",
      },
      data: {
        is_revoked: true,
      },
    });

    // 3. Clear auth cookies if present
    const cookieStore = await cookies();
    cookieStore.delete("primerides_customer_token");
    cookieStore.delete("primerides_customer_refresh");

    return apiSuccess(
      { deleted: true },
      "Your PrimeRides account and personal data have been scheduled for deletion."
    );
  } catch (err: any) {
    console.error("Account deletion failed:", err);
    return apiError(err.message || "Failed to delete account", 500);
  }
}
