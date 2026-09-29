import React from "react";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import ForbiddenCard from "@/components/admin/ForbiddenCard";
import LocationsManager from "@/components/admin/LocationsManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rental Hubs & Locations | PrimeRides Admin",
};

export default async function AdminLocationsPage() {
  const admin = await getCurrentAdmin();
  if (
    !admin ||
    !hasAdminPermission(admin, [ADMIN_PERMISSIONS.FLEET_MANAGE, ADMIN_PERMISSIONS.BOOKINGS_VIEW])
  ) {
    return (
      <ForbiddenCard
        permissionRequired="fleet.manage or bookings.view"
        moduleName="Rental Locations & Operational Hubs"
      />
    );
  }

  const locations = await prisma.location.findMany({
    where: { deleted_at: null },
    include: {
      _count: {
        select: {
          cars: { where: { deleted_at: null } },
          bookings: { where: { deleted_at: null } },
        },
      },
    },
    orderBy: { sort_order: "asc" },
  });

  const stats = {
    totalHubs: locations.length,
    activeHubs: locations.filter((l) => l.is_active).length,
    totalVehiclesAssigned: locations.reduce((sum, l) => sum + l._count.cars, 0),
    totalReservations: locations.reduce((sum, l) => sum + l._count.bookings, 0),
  };

  const sanitized = locations.map((l) => ({
    id: l.id,
    city: l.city,
    name: l.name,
    slug: l.slug,
    address: l.address,
    is_active: l.is_active,
    sort_order: l.sort_order,
    created_at: l.created_at.toISOString(),
    _count: {
      cars: l._count.cars,
      bookings: l._count.bookings,
    },
  }));

  return <LocationsManager initialLocations={sanitized} stats={stats} />;
}
