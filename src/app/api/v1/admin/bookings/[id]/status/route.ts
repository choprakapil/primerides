import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { hasVerifiedDrivingLicense } from "@/server/kyc";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

/**
 * PATCH /api/v1/admin/bookings/[id]/status
 * Updates a booking status (bookings.manage required).
 * 
 * ENFORCEMENT RULES FOR HANDOVER (status === "active"):
 * 1. Customer must have verified Driving License in tbl_identity_documents.
 * 2. Booking must either already be paid (captured payment in tbl_payments),
 *    OR admin must provide collected payment details (paymentAmount, paymentMethod, paymentRef).
 * 3. Starting odometer reading (startOdometer) and fuel level (startFuelLevel) must be recorded in tbl_trips.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    // Strict RBAC Gate
    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.BOOKINGS_MANAGE)) {
      return apiError("Forbidden: You lack bookings.manage permission to modify reservations.", 403);
    }

    const { id } = await context.params;
    const bookingId = parseInt(id, 10);
    if (isNaN(bookingId)) return apiError("Invalid booking ID.", 400);

    const body = await req.json().catch(() => ({}));
    const {
      status,
      notes,
      // Handover Payment Parameters (required if unpaid)
      paymentAmount,
      paymentMethod,
      paymentRef,
      // Handover Trip Parameters
      startOdometer,
      startFuelLevel,
      inspectionNotes,
    } = body;

    if (!status) return apiError("New status is required.", 400);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: true,
      },
    });
    if (!booking) return apiError("Booking not found.", 404);

    const oldStatus = booking.status;

    // =========================================================================
    // ENFORCEMENT GATE: confirmed -> active (Vehicle Handover Execution)
    // =========================================================================
    if (status === "active") {
      // 1. Driving License Verification Gate
      if (booking.customer_id) {
        const hasDL = await hasVerifiedDrivingLicense(booking.customer_id);
        if (!hasDL) {
          return apiError(
            "Handover Blocked: Customer driving license is not verified. Please verify documents in KYC Queue before vehicle handover.",
            400
          );
        }
      }

      // 2. Payment Verification Gate
      const existingPaidAmount = (booking.payments || [])
        .filter((p) => p.status === "captured" || p.status === "successful")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

      const requiredAmount = Number(booking.total_amount || 0);
      const isAlreadyPaid = existingPaidAmount >= requiredAmount && requiredAmount > 0;

      if (!isAlreadyPaid) {
        // Payment must be entered by admin at handover
        if (!paymentAmount || Number(paymentAmount) <= 0 || !paymentMethod || !paymentRef?.trim()) {
          return apiError(
            `Handover Blocked: Rental payment of ₹${requiredAmount.toLocaleString(
              "en-IN"
            )} has not been completed. You must enter the collected payment details (Cash, POS Card, or UPI) and transaction reference before vehicle handover.`,
            400
          );
        }
      }

      // 3. Vehicle Trip Meter & Inspection Gate
      const odo = parseInt(String(startOdometer || 0), 10);
      if (isNaN(odo) || odo <= 0) {
        return apiError(
          "Handover Blocked: Starting odometer reading is required before vehicle release.",
          400
        );
      }

      if (!startFuelLevel || !String(startFuelLevel).trim()) {
        return apiError(
          "Handover Blocked: Starting fuel level is required before vehicle release.",
          400
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. If handover with collected payment, record payment row
      if (status === "active") {
        const existingPaidAmount = (booking.payments || [])
          .filter((p) => p.status === "captured" || p.status === "successful")
          .reduce((sum, p) => sum + Number(p.amount || 0), 0);

        const requiredAmount = Number(booking.total_amount || 0);
        const isAlreadyPaid = existingPaidAmount >= requiredAmount && requiredAmount > 0;

        if (!isAlreadyPaid && paymentAmount && paymentRef) {
          await tx.payment.create({
            data: {
              booking_id: bookingId,
              transaction_ref: String(paymentRef).trim(),
              gateway: paymentMethod === "cash" ? "cash" : "admin_pos",
              amount: paymentAmount,
              currency: "INR",
              status: "captured",
              payment_method: paymentMethod,
              metadata: {
                collected_at_handover: true,
                collected_by_admin: admin.username,
                start_odometer: startOdometer,
              },
            },
          });
        }

        // 2. Record Trip in tbl_trips
        await tx.trip.upsert({
          where: { booking_id: bookingId },
          create: {
            booking_id: bookingId,
            start_odometer: parseInt(String(startOdometer), 10),
            start_fuel_level: String(startFuelLevel).trim(),
            inspection_notes: inspectionNotes || notes || "Vehicle handed over to customer.",
            started_at: new Date(),
          },
          update: {
            start_odometer: parseInt(String(startOdometer), 10),
            start_fuel_level: String(startFuelLevel).trim(),
            inspection_notes: inspectionNotes || notes || "Vehicle handed over to customer.",
            started_at: new Date(),
          },
        });
      }

      // 3. Update Booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status,
          ...(notes ? { admin_notes: notes } : {}),
        },
      });

      // 4. Record Status History Audit Trail
      await tx.bookingStatusHistory.create({
        data: {
          booking_id: bookingId,
          from_status: oldStatus,
          to_status: status,
          changed_by_user_id: admin.id,
          changed_by_role: `admin (${admin.username})`,
          reason: notes || `Status transitioned to ${status} via Admin Operations`,
        },
      });

      // 5. Write Immutable Audit Log
      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "BOOKING_STATUS_CHANGED",
          entity: "Booking",
          entity_id: bookingId,
          before_state: { status: oldStatus },
          after_state: {
            status,
            notes,
            ...(status === "active"
              ? {
                  startOdometer,
                  startFuelLevel,
                  paymentCollected: paymentAmount ? Number(paymentAmount) : null,
                  paymentMethod: paymentMethod || null,
                  paymentRef: paymentRef || null,
                }
              : {}),
          },
        },
      });
    });

    return apiSuccess(
      {
        bookingId,
        previousStatus: oldStatus,
        newStatus: status,
      },
      "Booking status updated successfully."
    );
  } catch (err: any) {
    return apiError(err.message || "Failed to update booking status", 500);
  }
}
