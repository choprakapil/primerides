"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db/client";
import { requireAdminPermission, ADMIN_PERMISSIONS } from "../auth/rbac";
import { hasVerifiedDrivingLicense } from "../kyc";

/**
 * Updates a booking status (e.g. pending -> confirmed -> active -> completed)
 * Writes Booking, BookingStatusHistory, and AuditLog atomically in one transaction.
 */
export async function updateBookingStatusAction(
  bookingId: number,
  newStatus: string,
  notes?: string
) {
  // Strict RBAC Gate
  const admin = await requireAdminPermission(ADMIN_PERMISSIONS.BOOKINGS_MANAGE);

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { success: false, error: "Booking not found" };

    const oldStatus = booking.status;

    // ENFORCEMENT GATE: confirmed -> active requires verified driving license
    if (newStatus === "active") {
      if (booking.customer_id) {
        const hasDL = await hasVerifiedDrivingLicense(booking.customer_id);
        if (!hasDL) {
          return {
            success: false,
            error: "Customer's driving license is not yet verified",
          };
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: newStatus,
          ...(notes ? { admin_notes: notes } : {}),
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          booking_id: bookingId,
          from_status: oldStatus,
          to_status: newStatus,
          changed_by_user_id: admin.id,
          changed_by_role: `admin (${admin.username})`,
          reason: notes || `Status updated to ${newStatus} by admin`,
        },
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "BOOKING_STATUS_CHANGED",
          entity: "Booking",
          entity_id: bookingId,
          before_state: { status: oldStatus },
          after_state: { status: newStatus, notes },
        },
      });
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/account");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update booking status" };
  }
}

/**
 * Cancels a booking, creates a Cancellation record, writes BookingStatusHistory,
 * and records an AuditLog row atomically.
 */
export async function cancelBookingAction(params: {
  bookingId: number;
  reason: string;
  refundAmount?: number;
  penaltyAmount?: number;
  notes?: string;
}) {
  const { bookingId, reason, refundAmount, penaltyAmount, notes } = params;

  // Strict RBAC Gate
  const admin = await requireAdminPermission(ADMIN_PERMISSIONS.BOOKINGS_MANAGE);

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { success: false, error: "Booking not found" };

    const oldStatus = booking.status;

    await prisma.$transaction(async (tx) => {
      // 1. Update Booking status to cancelled
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "cancelled",
          admin_notes: notes || reason,
        },
      });

      // 2. Create Cancellation Record
      await tx.cancellation.create({
        data: {
          booking_id: bookingId,
          reason,
          refund_amount: refundAmount !== undefined ? refundAmount : booking.total_amount,
          penalty_amount: penaltyAmount || 0,
          cancelled_by: `admin (${admin.username})`,
          processed_at: new Date(),
        },
      });

      // 3. Create Booking Status History
      await tx.bookingStatusHistory.create({
        data: {
          booking_id: bookingId,
          from_status: oldStatus,
          to_status: "cancelled",
          changed_by_user_id: admin.id,
          changed_by_role: `admin (${admin.username})`,
          reason,
        },
      });

      // 4. Create Audit Log Entry
      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "BOOKING_CANCELLED",
          entity: "Booking",
          entity_id: bookingId,
          before_state: { status: oldStatus },
          after_state: {
            status: "cancelled",
            reason,
            refundAmount,
            penaltyAmount,
          },
        },
      });
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/account");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to cancel booking" };
  }
}

/**
 * Assigns a driver/chauffeur to a booking and writes an AuditLog.
 */
export async function assignDriverAction(bookingId: number, driverId: number) {
  const admin = await requireAdminPermission(ADMIN_PERMISSIONS.BOOKINGS_MANAGE);

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { success: false, error: "Booking not found" };

    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) return { success: false, error: "Driver not found" };

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { driver_id: driverId },
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "DRIVER_ASSIGNED",
          entity: "Booking",
          entity_id: bookingId,
          before_state: { driver_id: booking.driver_id },
          after_state: { driver_id: driverId, driver_name: driver.name },
        },
      });
    });

    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to assign driver" };
  }
}
