import { prisma } from "../db/client";

/**
 * expireStalePendingBookings
 *
 * Finds all bookings in "pending" status that were created more than
 * `PENDING_TTL_MINUTES` minutes ago (default: 30 minutes) and transitions
 * them to "expired" status. This releases locked vehicle inventory so
 * that other customers can book the same car for overlapping dates.
 *
 * Each expired booking gets:
 *  - Status updated to "expired"
 *  - A BookingStatusHistory audit trail record
 *  - A Cancellation record (cancelled_by: "system")
 *
 * This function is designed to be called periodically (e.g. every 5 minutes)
 * via a cron endpoint or a background worker.
 *
 * @param ttlMinutes - Number of minutes after which a pending booking expires (default: 30)
 * @returns Object with count of expired bookings and their booking codes
 */
export async function expireStalePendingBookings(
  ttlMinutes: number = 30
): Promise<{ expiredCount: number; expiredBookingCodes: string[] }> {
  const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000);

  // 1. Find all stale pending bookings
  const staleBookings = await prisma.booking.findMany({
    where: {
      status: "pending",
      deleted_at: null,
      created_at: { lt: cutoff },
    },
    select: {
      id: true,
      booking_code: true,
      customer_id: true,
      car_name: true,
      created_at: true,
    },
  });

  if (staleBookings.length === 0) {
    return { expiredCount: 0, expiredBookingCodes: [] };
  }

  const expiredCodes: string[] = [];

  // 2. Expire each booking in its own transaction for isolation
  for (const booking of staleBookings) {
    try {
      await prisma.$transaction(async (tx) => {
        // A. Update booking status to "expired"
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "expired" },
        });

        // B. Create cancellation record
        await tx.cancellation.upsert({
          where: { booking_id: booking.id },
          create: {
            booking_id: booking.id,
            reason: `Automatically expired: pending checkout was not completed within ${ttlMinutes} minutes.`,
            cancelled_by: "system",
            refund_amount: 0,
            penalty_amount: 0,
            processed_at: new Date(),
          },
          update: {
            reason: `Automatically expired: pending checkout was not completed within ${ttlMinutes} minutes.`,
            cancelled_by: "system",
            refund_amount: 0,
            penalty_amount: 0,
            processed_at: new Date(),
          },
        });

        // C. Record audit trail
        await tx.bookingStatusHistory.create({
          data: {
            booking_id: booking.id,
            from_status: "pending",
            to_status: "expired",
            changed_by_role: "system",
            changed_by_user_id: null,
            reason: `System auto-expiry: booking ${booking.booking_code} was pending for more than ${ttlMinutes} minutes without payment completion. Inventory released.`,
          },
        });
      });

      expiredCodes.push(booking.booking_code);
      console.log(
        `[Cleanup:PendingExpiry] Expired booking ${booking.booking_code} (ID: ${booking.id}, created: ${booking.created_at.toISOString()})`
      );
    } catch (err: any) {
      // Log but don't halt — other bookings should still be processed
      console.error(
        `[Cleanup:PendingExpiry] Failed to expire booking ${booking.booking_code} (ID: ${booking.id}):`,
        err.message
      );
    }
  }

  console.log(
    `[Cleanup:PendingExpiry] Completed: ${expiredCodes.length}/${staleBookings.length} bookings expired.`
  );

  return {
    expiredCount: expiredCodes.length,
    expiredBookingCodes: expiredCodes,
  };
}
