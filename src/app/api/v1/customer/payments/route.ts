import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentCustomer } from "@/server/auth/customer";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getCustomerPayments, getCustomerPortalStats, getCustomerUnpaidBookings } from "@/server/booking";

/**
 * GET /api/v1/customer/payments
 * Fetches transaction ledger history, unpaid bookings, and financial metric aggregates for the authenticated customer.
 */
export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return apiUnauthorized("Authentication required. Please log in.");
    }

    const [rawPayments, rawUnpaidBookings, stats] = await Promise.all([
      getCustomerPayments(customer.id),
      getCustomerUnpaidBookings(customer.id),
      getCustomerPortalStats(customer.id),
    ]);

    const payments = JSON.parse(JSON.stringify(rawPayments));
    const unpaidBookings = JSON.parse(JSON.stringify(rawUnpaidBookings));

    const totalCaptured = payments
      .filter((p: any) => p.status === "captured" || p.status === "successful")
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const totalAuthorized = payments
      .filter((p: any) => p.status === "authorized")
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const totalRefunded = payments
      .filter((p: any) => p.status === "refunded")
      .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    return apiSuccess({
      payments,
      unpaidBookings,
      stats: {
        totalCaptured,
        totalAuthorized,
        totalRefunded,
        totalTransactions: payments.length,
        totalTrips: stats.totalTrips,
        activeBookings: stats.activeBookings,
        hasVerifiedDL: stats.hasVerifiedDL,
      },
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch customer payment ledger", 500);
  }
}

/**
 * POST /api/v1/customer/payments
 * Allows an authenticated customer to pay for their car rental booking:
 * - Online Gateway (Simulated Razorpay): Card / Netbanking (instant capture)
 * - UPI Transfer: Scanned QR code with customer UTR reference number
 * - Cash on Delivery / Pay at Curbside Handover: Customer schedules payment upon key handover
 */

export async function POST(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return apiUnauthorized("Authentication required. Please log in.");
    }

    const body = await req.json().catch(() => ({}));
    const { bookingId, paymentMethod, transactionRef, amount, notes } = body;

    if (!bookingId || !paymentMethod) {
      return apiError("Booking ID and payment method are required.", 400);
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(String(bookingId), 10) },
      include: {
        payments: true,
        price_snapshot: true,
        car: true,
      },
    });

    if (!booking || booking.deleted_at) {
      return apiError("Booking not found.", 404);
    }

    if (booking.customer_id !== customer.id) {
      return apiError("Forbidden: You do not have authorization for this booking.", 403);
    }

    if (booking.status === "cancelled") {
      return apiError("Cannot submit payment for a cancelled booking.", 400);
    }

    const requiredTotal = Number(booking.total_amount || 0);

    // Check existing paid amount
    const alreadyPaidAmount = (booking.payments || [])
      .filter((p) => p.status === "captured" || p.status === "successful")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    if (alreadyPaidAmount >= requiredTotal && requiredTotal > 0) {
      return apiError("This booking is already fully paid.", 400);
    }

    const payableAmount = amount ? Number(amount) : requiredTotal;

    // Handle Payment Modes
    if (paymentMethod === "handover_cod") {
      // Customer selected to pay at vehicle curbside handover
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          notes: notes || "Payment scheduled for Curbside Handover (COD / POS Terminal)",
          admin_notes: `[Customer Selected: Pay at Curbside Handover] Scheduled collection: ₹${requiredTotal.toLocaleString("en-IN")}`,
          status: booking.status === "pending" ? "confirmed" : booking.status,
        },
      });

      return apiSuccess(
        {
          bookingId: booking.id,
          bookingCode: booking.booking_code,
          method: "handover_cod",
          status: "scheduled_at_handover",
          amount: payableAmount,
        },
        "Curbside handover payment confirmed. Please have Cash, Card, or UPI ready at vehicle delivery."
      );
    }

    // Online Payment or UPI QR with UTR
    const generatedRef =
      transactionRef && String(transactionRef).trim()
        ? String(transactionRef).trim()
        : `PAY_PR_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const gateway = paymentMethod === "upi" ? "upi" : "razorpay";

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          booking_id: booking.id,
          transaction_ref: generatedRef,
          gateway,
          amount: payableAmount,
          currency: "INR",
          status: "captured",
          payment_method: paymentMethod,
          metadata: {
            customer_id: customer.id,
            customer_name: customer.fullName,
            customer_phone: customer.phone,
            paid_via: paymentMethod === "upi" ? "UPI QR Transfer" : "Online Gateway (Simulated Razorpay)",
            notes,
          },
        },
      });

      // If booking was pending, auto-confirm since payment is captured
      if (booking.status === "pending") {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: "confirmed",
          },
        });

        await tx.bookingStatusHistory.create({
          data: {
            booking_id: booking.id,
            from_status: "pending",
            to_status: "confirmed",
            changed_by_user_id: customer.id,
            changed_by_role: "customer",
            reason: `Payment of ₹${payableAmount} captured via ${paymentMethod.toUpperCase()}`,
          },
        });
      }

      return createdPayment;
    });

    return apiSuccess(
      {
        paymentId: payment.id,
        transactionRef: payment.transaction_ref,
        amount: Number(payment.amount),
        status: payment.status,
        bookingCode: booking.booking_code,
      },
      "Payment processed successfully! Your reservation is confirmed."
    );
  } catch (err: any) {
    return apiError(err.message || "Failed to process customer payment", 500);
  }
}
