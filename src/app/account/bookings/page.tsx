import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/server/auth/customer";
import { getCustomerBookings, getCustomerPortalStats } from "@/server/booking";
import BookingsListClient from "@/components/account/BookingsListClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function CustomerBookingsPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/login?callbackUrl=/account/bookings");
  }

  const [rawBookings, stats] = await Promise.all([
    getCustomerBookings(customer.id),
    getCustomerPortalStats(customer.id),
  ]);

  const bookings = JSON.parse(JSON.stringify(rawBookings));

  return (
    <div className="py-2">
      {/* Page Header */}
      <div className="app-page-head d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill mb-2 fw-semibold" style={{ fontSize: "11px" }}>
            RESERVATIONS
          </span>
          <h4 className="fw-bold text-dark mb-1">
            My Bookings & Trips
          </h4>
          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            Track live trip status, handover passes, and cancellation requests.
          </p>
        </div>

        <Link href="/cars" className="btn btn-primary d-flex align-items-center gap-1.5 px-3">
          <i className="fi fi-rr-plus"></i>
          <span>Rent Another Car</span>
        </Link>
      </div>

      <BookingsListClient
        bookings={bookings}
        hasVerifiedDL={!!stats.hasVerifiedDL}
      />
    </div>
  );
}
