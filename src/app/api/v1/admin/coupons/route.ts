import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiCreated, apiUnauthorized } from "@/server/utils/api-response";

/**
 * GET /api/v1/admin/coupons
 * Returns all active and configured discount coupons with redemption stats.
 */
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, [ADMIN_PERMISSIONS.COUPONS_VIEW, ADMIN_PERMISSIONS.COUPONS_MANAGE])) {
      return apiError("Forbidden: You lack permissions to view discount coupons.", 403);
    }

    const coupons = await prisma.coupon.findMany({
      where: { deleted_at: null },
      include: {
        _count: {
          select: { bookings: true },
        },
        bookings: {
          select: {
            id: true,
            booking_code: true,
            full_name: true,
            discount_amount: true,
            total_amount: true,
            created_at: true,
            status: true,
          },
          orderBy: { created_at: "desc" },
          take: 10,
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Calculate total discount granted across bookings for each coupon
    const enrichedCoupons = coupons.map((c: any) => {
      const totalDiscountGiven = (c.bookings || []).reduce(
        (sum: number, b: any) => sum + Number(b.discount_amount || 0),
        0
      );
      return {
        ...c,
        total_discount_given: totalDiscountGiven,
      };
    });

    return apiSuccess(enrichedCoupons, "Coupons retrieved successfully.");
  } catch (err: any) {
    console.error("Admin coupons GET error:", err);
    return apiError(err.message || "Failed to fetch coupons", 500);
  }
}

/**
 * POST /api/v1/admin/coupons
 * Creates a new promotional coupon code.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.COUPONS_MANAGE)) {
      return apiError("Forbidden: You lack coupons.manage permission.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_booking_amount,
      max_discount_amount,
      valid_from,
      valid_until,
      usage_limit,
      is_active,
    } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return apiError("Promo coupon code is required.", 400);
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await prisma.coupon.findFirst({
      where: { code: cleanCode, deleted_at: null },
    });

    if (existing) {
      return apiError(`Coupon code '${cleanCode}' already exists.`, 400);
    }

    const parsedType = discount_type === "fixed" ? "fixed" : "percentage";
    const parsedValue = Number(discount_value);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      return apiError("Discount value must be a positive number.", 400);
    }

    if (parsedType === "percentage" && parsedValue > 100) {
      return apiError("Percentage discount cannot exceed 100%.", 400);
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description?.trim() || null,
        discount_type: parsedType,
        discount_value: parsedValue,
        min_booking_amount: min_booking_amount ? Number(min_booking_amount) : 0,
        max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
        valid_from: valid_from ? new Date(valid_from) : null,
        valid_until: valid_until ? new Date(valid_until) : null,
        usage_limit: usage_limit ? parseInt(usage_limit, 10) : null,
        is_active: is_active !== undefined ? !!is_active : true,
      },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "COUPON_CREATE",
        entity: "Coupon",
        entity_id: newCoupon.id,
        after_state: {
          code: newCoupon.code,
          discount_type: newCoupon.discount_type,
          discount_value: Number(newCoupon.discount_value),
        },
      },
    });

    return apiCreated(newCoupon, `Coupon code '${newCoupon.code}' created successfully.`);
  } catch (err: any) {
    console.error("Admin coupons POST error:", err);
    return apiError(err.message || "Failed to create coupon", 500);
  }
}

/**
 * PATCH /api/v1/admin/coupons
 * Updates coupon configuration or toggles active status.
 */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.COUPONS_MANAGE)) {
      return apiError("Forbidden: You lack coupons.manage permission.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const { id, is_active, description, usage_limit, valid_until, min_booking_amount, max_discount_amount } = body;

    const couponId = Number(id);
    if (!couponId || isNaN(couponId)) {
      return apiError("Valid coupon ID is required.", 400);
    }

    const current = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!current || current.deleted_at) {
      return apiError("Coupon not found.", 404);
    }

    const updateData: any = {};
    if (is_active !== undefined) updateData.is_active = !!is_active;
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (usage_limit !== undefined) updateData.usage_limit = usage_limit ? parseInt(usage_limit, 10) : null;
    if (valid_until !== undefined) updateData.valid_until = valid_until ? new Date(valid_until) : null;
    if (min_booking_amount !== undefined) updateData.min_booking_amount = min_booking_amount ? Number(min_booking_amount) : 0;
    if (max_discount_amount !== undefined) updateData.max_discount_amount = max_discount_amount ? Number(max_discount_amount) : null;

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: updateData,
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "COUPON_UPDATE",
        entity: "Coupon",
        entity_id: updated.id,
        before_state: { is_active: current.is_active },
        after_state: updateData,
      },
    });

    return apiSuccess(updated, `Coupon '${updated.code}' updated successfully.`);
  } catch (err: any) {
    console.error("Admin coupons PATCH error:", err);
    return apiError(err.message || "Failed to update coupon", 500);
  }
}

/**
 * DELETE /api/v1/admin/coupons
 * Soft deletes a coupon code.
 */
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.COUPONS_MANAGE)) {
      return apiError("Forbidden: You lack coupons.manage permission.", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const couponId = Number(id);

    if (!couponId || isNaN(couponId)) {
      return apiError("Valid coupon ID is required.", 400);
    }

    const current = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!current || current.deleted_at) {
      return apiError("Coupon not found or already retired.", 404);
    }

    const retired = await prisma.coupon.update({
      where: { id: couponId },
      data: { deleted_at: new Date(), is_active: false },
    });

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "COUPON_DELETE",
        entity: "Coupon",
        entity_id: retired.id,
        before_state: { code: current.code },
        after_state: { deleted_at: new Date().toISOString() },
      },
    });

    return apiSuccess(null, `Coupon '${retired.code}' has been retired.`);
  } catch (err: any) {
    console.error("Admin coupons DELETE error:", err);
    return apiError(err.message || "Failed to delete coupon", 500);
  }
}
