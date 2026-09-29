import React from "react";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import ForbiddenCard from "@/components/admin/ForbiddenCard";
import CouponsManager from "@/components/admin/CouponsManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCouponsPage() {
  const admin = await getCurrentAdmin();
  if (
    !admin ||
    !hasAdminPermission(admin, [
      ADMIN_PERMISSIONS.COUPONS_VIEW,
      ADMIN_PERMISSIONS.COUPONS_MANAGE,
      ADMIN_PERMISSIONS.PRICING_MANAGE,
    ])
  ) {
    return (
      <ForbiddenCard
        permissionRequired="coupons.view, coupons.manage or pricing.manage"
        moduleName="Coupon Code Management"
      />
    );
  }

  // Fetch all coupons with booking redemptions
  const rawCoupons = await prisma.coupon.findMany({
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
          phone: true,
          car_name: true,
          discount_amount: true,
          base_amount: true,
          total_amount: true,
          status: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
        take: 20,
      },
    },
    orderBy: { created_at: "desc" },
  });

  const serializedCoupons = rawCoupons.map((c) => {
    const totalDiscountGiven = c.bookings.reduce(
      (sum, b) => sum + Number(b.discount_amount || 0),
      0
    );

    return {
      id: c.id,
      code: c.code,
      description: c.description,
      discount_type: c.discount_type,
      discount_value: Number(c.discount_value),
      min_booking_amount: c.min_booking_amount ? Number(c.min_booking_amount) : 0,
      max_discount_amount: c.max_discount_amount ? Number(c.max_discount_amount) : null,
      valid_from: c.valid_from ? c.valid_from.toISOString() : null,
      valid_until: c.valid_until ? c.valid_until.toISOString() : null,
      usage_limit: c.usage_limit,
      used_count: c.used_count,
      is_active: c.is_active,
      created_at: c.created_at.toISOString(),
      updated_at: c.updated_at.toISOString(),
      redemption_count: c._count.bookings,
      total_discount_given: totalDiscountGiven,
      recent_redemptions: c.bookings.map((b) => ({
        id: b.id,
        booking_code: b.booking_code,
        full_name: b.full_name,
        phone: b.phone,
        car_name: b.car_name,
        discount_amount: Number(b.discount_amount || 0),
        base_amount: Number(b.base_amount || 0),
        total_amount: Number(b.total_amount || 0),
        status: b.status,
        created_at: b.created_at.toISOString(),
      })),
    };
  });

  const canManage = hasAdminPermission(admin, [
    ADMIN_PERMISSIONS.COUPONS_MANAGE,
    ADMIN_PERMISSIONS.PRICING_MANAGE,
  ]);

  return <CouponsManager initialCoupons={serializedCoupons} canManage={canManage} />;
}
