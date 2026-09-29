import React from "react";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin } from "@/server/auth/rbac";
import PageContainer from "@/components/admin/ui/PageContainer";
import PageHeader from "@/components/admin/ui/PageHeader";
import AdminButton from "@/components/admin/ui/AdminButton";
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview";
import { Plus, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();

  // Fetch real database counts in parallel
  const [totalCars, activeBookings, pendingKyc, totalCustomers, recentBookings] = await Promise.all([
    prisma.car.count({ where: { deleted_at: null } }),
    prisma.booking.count({ where: { status: { in: ["confirmed", "active"] } } }),
    prisma.identityDocument.count({ where: { status: "pending" } }),
    prisma.customerUser.count({ where: { deleted_at: null } }),
    prisma.booking.findMany({
      take: 6,
      orderBy: { created_at: "desc" },
      include: {
        car: true,
        customer: true,
        location: true,
      },
    }),
  ]);

  const sanitizedBookings = recentBookings.map((b: any) => ({
    id: b.id,
    booking_code: b.booking_code,
    total_amount: Number(b.total_amount),
    status: b.status,
    customer: b.customer ? { full_name: b.customer.full_name, phone: b.customer.phone } : null,
    car: b.car ? { name: b.car.name, brand: b.car.brand, fuel_type: b.car.fuel_type } : null,
    location: b.location ? { name: b.location.name, city: b.location.city } : null,
  }));

  return (
    <PageContainer>
      {/* Nexlink Standard Page Header */}
      <PageHeader
        eyebrow="Operations Cockpit"
        title="Operations Dashboard"
        description="Real-time fleet telemetry, multi-city reservations, and dynamic rental operations."
        actions={
          <>
            <AdminButton
              href="/admin/cars"
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4 me-1" />}
            >
              Add Vehicle
            </AdminButton>
            <AdminButton
              href="/admin/bookings"
              variant="secondary"
              size="sm"
              icon={<Eye className="w-4 h-4 me-1" />}
            >
              All Bookings
            </AdminButton>
          </>
        }
      />

      {/* Main Interactive & Draggable Operations Cockpit */}
      <AdminDashboardOverview
        stats={{
          totalCars,
          activeBookings,
          pendingKyc,
          totalCustomers,
        }}
        recentBookings={sanitizedBookings}
      />
    </PageContainer>
  );
}
