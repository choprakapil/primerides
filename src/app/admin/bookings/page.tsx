import React from "react";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import ForbiddenCard from "@/components/admin/ForbiddenCard";
import BookingsManager from "@/components/admin/BookingsManager";
import { PageContainer } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminBookingsPage() {
  const admin = await getCurrentAdmin();
  if (
    !admin ||
    !hasAdminPermission(admin, [ADMIN_PERMISSIONS.BOOKINGS_MANAGE, ADMIN_PERMISSIONS.BOOKINGS_VIEW])
  ) {
    return (
      <PageContainer>
        <ForbiddenCard permissionRequired="bookings.view or bookings.manage" moduleName="Reservations & Bookings" />
      </PageContainer>
    );
  }

  const [bookings, leads, verifiedCustomerDocs, availableCars, availableLocations] = await Promise.all([
    prisma.booking.findMany({
      where: { deleted_at: null },
      include: {
        car: true,
        location: true,
        price_snapshot: true,
        payments: true,
        trip: true,
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.contactLead.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: "desc" },
    }),
    prisma.identityDocument.findMany({
      where: {
        status: "verified",
        type: { in: ["driving_license_front", "driving_license_back"] },
      },
      select: { customer_id: true },
    }),
    prisma.car.findMany({
      where: { deleted_at: null, is_available: true },
      select: {
        id: true,
        name: true,
        brand: true,
        fuel_type: true,
        transmission: true,
        price_per_day: true,
        location_id: true,
        fleet_count: true,
        rental_plans: {
          where: { is_active: true },
          select: {
            id: true,
            name: true,
            plan_type: true,
            price: true,
            free_km: true,
            extra_km_rate: true,
            security_deposit: true,
            duration_days: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { is_active: true },
      select: { id: true, name: true, city: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const verifiedCustomerIds = new Set(verifiedCustomerDocs.map((d) => d.customer_id));

  const sanitizedCars = availableCars.map((c) => ({
    id: c.id,
    name: c.name,
    brand: c.brand,
    fuel_type: c.fuel_type,
    transmission: c.transmission,
    price_per_day: Number(c.price_per_day),
    location_id: c.location_id,
    fleet_count: c.fleet_count || 1,
    rental_plans: c.rental_plans.map((p) => ({
      id: p.id,
      name: p.name,
      plan_type: p.plan_type,
      price: Number(p.price),
      free_km: p.free_km,
      extra_km_rate: Number(p.extra_km_rate),
      security_deposit: Number(p.security_deposit),
      duration_days: p.duration_days,
    })),
  }));

  const sanitizedLocations = availableLocations.map((l) => ({
    id: l.id,
    name: l.name,
    city: l.city,
  }));

  const sanitizedBookings = bookings.map((b) => {
    const totalPaid = (b.payments || [])
      .filter((p) => p.status === "captured" || p.status === "successful")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const requiredTotal = Number(b.total_amount || 0);
    const isPaid = totalPaid >= requiredTotal && requiredTotal > 0;

    return {
      id: b.id,
      booking_code: b.booking_code,
      customer_id: b.customer_id,
      full_name: b.full_name,
      phone: b.phone,
      email: b.email,
      car_name: b.car_name,
      car: b.car ? { name: b.car.name, brand: b.car.brand } : null,
      location: b.location ? { name: b.location.name, city: b.location.city } : null,
      start_date: b.start_date.toISOString(),
      end_date: b.end_date.toISOString(),
      with_chauffeur: b.with_chauffeur,
      base_amount: Number(b.base_amount || 0),
      coupon_code: b.coupon_code || null,
      discount_amount: Number(b.discount_amount || 0),
      total_amount: requiredTotal,
      totalPaid,
      isPaid,
      payments: (b.payments || []).map((p) => ({
        id: p.id,
        amount: Number(p.amount || 0),
        gateway: p.gateway,
        status: p.status,
        payment_method: p.payment_method,
        transaction_ref: p.transaction_ref,
        created_at: p.created_at.toISOString(),
      })),
      trip: b.trip
        ? {
            start_odometer: b.trip.start_odometer,
            end_odometer: b.trip.end_odometer,
            start_fuel_level: b.trip.start_fuel_level,
            end_fuel_level: b.trip.end_fuel_level,
            inspection_notes: b.trip.inspection_notes,
          }
        : null,
      status: b.status,
      admin_notes: b.admin_notes,
      price_snapshot: b.price_snapshot
        ? {
            plan_name: b.price_snapshot.plan_name,
            free_km: b.price_snapshot.free_km,
            security_deposit: Number(b.price_snapshot.security_deposit || 5000),
          }
        : null,
      hasVerifiedDL: b.customer_id ? verifiedCustomerIds.has(b.customer_id) : false,
    };
  });

  const sanitizedLeads = leads.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email,
    subject: l.subject,
    message: l.message,
    source: l.source,
    status: l.status,
    created_at: l.created_at.toISOString(),
  }));

  return (
    <BookingsManager
      initialBookings={sanitizedBookings}
      initialLeads={sanitizedLeads}
      availableCars={sanitizedCars}
      availableLocations={sanitizedLocations}
    />
  );
}
