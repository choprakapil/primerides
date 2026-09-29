import React from "react";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/server/auth/customer";
import { prisma } from "@/server/db/client";
import CustomerDashboardOverview from "@/components/account/CustomerDashboardOverview";

export const dynamic = "force-dynamic";

export default async function AccountDashboardPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/login");
  }

  // Fetch real customer stats and bookings
  const [bookings, verifiedDLCount] = await Promise.all([
    prisma.booking.findMany({
      where: { customer_id: customer.id },
      include: {
        car: true,
        location: true,
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.identityDocument.count({
      where: {
        customer_id: customer.id,
        type: { contains: "driving_license" },
        status: "verified",
      },
    }),
  ]);

  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const activeTrips = bookings.filter((b) => b.status === "active").length;
  const activeBooking = bookings.find((b) => b.status === "active") || null;

  const sanitizedBookings = bookings.map((b) => ({
    id: b.id,
    booking_code: b.booking_code,
    total_amount: Number(b.total_amount),
    status: b.status,
    start_date: b.start_date.toISOString(),
    end_date: b.end_date.toISOString(),
    car: b.car ? { name: b.car.name, fuel_type: b.car.fuel_type, transmission: b.car.transmission } : null,
    location: b.location ? { name: b.location.name, city: b.location.city } : null,
  }));

  const sanitizedActiveBooking = activeBooking ? {
    id: activeBooking.id,
    booking_code: activeBooking.booking_code,
    status: activeBooking.status,
    start_date: activeBooking.start_date.toISOString(),
    end_date: activeBooking.end_date.toISOString(),
    car: activeBooking.car ? { name: activeBooking.car.name, fuel_type: activeBooking.car.fuel_type, transmission: activeBooking.car.transmission } : null,
    location: activeBooking.location ? { name: activeBooking.location.name, city: activeBooking.location.city } : null,
  } : null;

  return (
    <div className="py-2">
      <div className="app-page-head mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h1 className="app-page-title mb-1">Welcome back, {customer.fullName}</h1>
          <p className="app-page-subtitle mb-0">
            Manage your luxury reservations, verify driving license, and monitor travel privileges.
          </p>
        </div>
      </div>

      <CustomerDashboardOverview
        customer={customer}
        activeBooking={sanitizedActiveBooking}
        recentBookings={sanitizedBookings}
        stats={{
          totalBookings: bookings.length,
          activeTrips,
          totalSpent,
          hasVerifiedDL: verifiedDLCount > 0,
        }}
      />
    </div>
  );
}
