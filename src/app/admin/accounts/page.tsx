import React from "react";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import ForbiddenCard from "@/components/admin/ForbiddenCard";
import AccountsManager from "@/components/admin/AccountsManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAccountsPage() {
  const admin = await getCurrentAdmin();
  if (
    !admin ||
    !hasAdminPermission(admin, [
      ADMIN_PERMISSIONS.PAYMENTS_VIEW,
      ADMIN_PERMISSIONS.PAYMENTS_MANAGE,
      ADMIN_PERMISSIONS.BOOKINGS_VIEW,
      ADMIN_PERMISSIONS.BOOKINGS_MANAGE,
    ])
  ) {
    return (
      <ForbiddenCard
        permissionRequired="payments.view or bookings.view"
        moduleName="Accounts & Financial Reports"
      />
    );
  }

  // Fetch all payment transactions with booking and customer relations
  const [payments, bookings] = await Promise.all([
    prisma.payment.findMany({
      include: {
        booking: {
          include: {
            car: {
              select: {
                id: true,
                name: true,
                brand: true,
              },
            },
            location: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
            rental_plan: {
              select: {
                id: true,
                name: true,
                free_km: true,
              },
            },
            price_snapshot: {
              select: {
                plan_name: true,
                free_km: true,
                extra_km_rate: true,
                security_deposit: true,
                tax_amount: true,
              },
            },
            customer: {
              select: {
                id: true,
                full_name: true,
                phone: true,
                email: true,
              },
            },
            trip: {
              select: {
                start_odometer: true,
                start_fuel_level: true,
                inspection_notes: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.booking.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        booking_code: true,
        full_name: true,
        phone: true,
        base_amount: true,
        discount_amount: true,
        coupon_code: true,
        total_amount: true,
        status: true,
        created_at: true,
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            payment_method: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    }),
  ]);

  // Sanitize for RSC / Client Component boundary
  const sanitizedPayments = JSON.parse(JSON.stringify(payments));
  const sanitizedBookings = JSON.parse(JSON.stringify(bookings));

  return (
    <AccountsManager
      initialPayments={sanitizedPayments}
      initialBookings={sanitizedBookings}
      currentAdmin={{
        username: admin.username,
        role: admin.role,
      }}
    />
  );
}
