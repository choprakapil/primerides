import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { verifyWebhookSignature } from "@/server/payments/razorpay";
import { notifyBookingConfirmed } from "@/server/notifications";

/**
 * POST /api/v1/payments/webhook
 * Processes incoming asynchronous Razorpay events (order.paid, payment.captured, payment.failed).
 * Verifies authenticity via HMAC SHA-256 with RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    // Verify cryptographic webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("Invalid Razorpay webhook signature received.");
      return NextResponse.json(
        { success: false, error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const eventData = JSON.parse(rawBody);
    const event = eventData.event;
    const payload = eventData.payload;

    console.log(`Received Razorpay webhook event: ${event}`);

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id || payload.order?.entity?.id;
      const paymentId = paymentEntity?.id;
      const bookingIdNote = paymentEntity?.notes?.bookingId;

      if (orderId) {
        // Find existing payment record by orderId or bookingId
        const payment = await prisma.payment.findFirst({
          where: {
            OR: [
              { transaction_ref: orderId },
              ...(paymentId ? [{ transaction_ref: paymentId }] : []),
              ...(bookingIdNote ? [{ booking_id: parseInt(bookingIdNote, 10) }] : []),
            ],
          },
          include: {
            booking: {
              include: { customer: true, car: true },
            },
          },
        });

        if (payment && payment.status !== "successful") {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: "successful",
                transaction_ref: paymentId || payment.transaction_ref,
                payment_method: paymentEntity?.method || "razorpay_webhook",
                metadata: {
                  ...(payment.metadata as object),
                  webhookCapturedAt: new Date().toISOString(),
                  razorpayEvent: event,
                  paymentId,
                },
              },
            });

            if (payment.booking && payment.booking.status === "pending") {
              await tx.booking.update({
                where: { id: payment.booking_id },
                data: { status: "confirmed" },
              });
            }

            await tx.auditLog.create({
              data: {
                actor_id: null,
                actor_type: "system",
                action: "WEBHOOK_PAYMENT_CAPTURED",
                entity: "Payment",
                entity_id: payment.id,
                before_state: { status: payment.status },
                after_state: { status: "successful", event },
              },
            });
          });

          // Trigger notification
          if (payment.booking) {
            notifyBookingConfirmed({
              customerName: payment.booking.full_name || payment.booking.customer?.full_name || "Customer",
              customerEmail: payment.booking.email || payment.booking.customer?.email,
              customerPhone: payment.booking.phone || payment.booking.customer?.phone || "",
              bookingCode: payment.booking.booking_code,
              carName: payment.booking.car_name || payment.booking.car?.name || "Vehicle",
              startDate: payment.booking.start_date,
              endDate: payment.booking.end_date,
              totalAmount: Number(payment.booking.total_amount || 0),
              pickupLocation: payment.booking.pickup_location,
            }).catch((err) =>
              console.error("Webhook notification error:", err)
            );
          }
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        await prisma.payment.updateMany({
          where: { transaction_ref: orderId },
          data: {
            status: "failed",
            metadata: {
              failureReason: paymentEntity?.error_description || "Payment failed via gateway",
              failedAt: new Date().toISOString(),
            },
          },
        });
      }
    } else if (event === "refund.processed") {
      const refundEntity = payload.refund?.entity;
      if (refundEntity?.id) {
        const refundId = String(refundEntity.id);
        const paymentId = refundEntity.payment_id ? String(refundEntity.payment_id) : null;
        const amountInRupees = Number(refundEntity.amount || 0) / 100;
        const bookingIdNote = refundEntity.notes?.bookingId;
        const bookingCodeNote = refundEntity.notes?.bookingCode;

        // 1. Locate existing refund payment row (created during admin/customer refund action)
        const existingRefund = await prisma.payment.findFirst({
          where: { transaction_ref: refundId },
          include: { booking: true },
        });

        if (existingRefund) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: existingRefund.id },
              data: {
                status: "refunded",
                metadata: {
                  ...(existingRefund.metadata as object),
                  webhookProcessedAt: new Date().toISOString(),
                  razorpayRefundStatus: refundEntity.status || "processed",
                  speedProcessed: refundEntity.speed_processed,
                },
              },
            });

            await tx.auditLog.create({
              data: {
                actor_id: null,
                actor_type: "system",
                action: "WEBHOOK_REFUND_PROCESSED",
                entity: "Payment",
                entity_id: existingRefund.id,
                before_state: { status: existingRefund.status },
                after_state: {
                  status: "refunded",
                  refundId,
                  amount: amountInRupees,
                  event,
                },
              },
            });
          });
        } else {
          // 2. External refund initiated directly in Razorpay Dashboard: Reconcile ledger
          let targetBookingId: number | null = bookingIdNote ? parseInt(String(bookingIdNote), 10) : null;
          let primaryPayment = null;

          if (paymentId) {
            primaryPayment = await prisma.payment.findFirst({
              where: { transaction_ref: paymentId },
              include: { booking: true },
            });
            if (primaryPayment?.booking_id) {
              targetBookingId = primaryPayment.booking_id;
            }
          }

          if (!targetBookingId && bookingCodeNote) {
            const bookingByCode = await prisma.booking.findUnique({
              where: { booking_code: String(bookingCodeNote) },
            });
            if (bookingByCode) {
              targetBookingId = bookingByCode.id;
            }
          }

          if (targetBookingId) {
            await prisma.$transaction(async (tx) => {
              const createdPayment = await tx.payment.create({
                data: {
                  booking_id: targetBookingId!,
                  amount: amountInRupees,
                  currency: refundEntity.currency || "INR",
                  status: "refunded",
                  gateway: primaryPayment?.gateway || "razorpay",
                  transaction_ref: refundId,
                  payment_method: "refund",
                  metadata: {
                    source: "razorpay_dashboard_webhook",
                    razorpayEvent: "refund.processed",
                    originalPaymentRef: paymentId,
                    reconciledAt: new Date().toISOString(),
                    speedProcessed: refundEntity.speed_processed,
                    notes: refundEntity.notes,
                  },
                },
              });

              await tx.cancellation.upsert({
                where: { booking_id: targetBookingId! },
                create: {
                  booking_id: targetBookingId!,
                  reason: refundEntity.notes?.reason || "Refund processed via Razorpay Dashboard",
                  cancelled_by: "gateway_webhook",
                  refund_amount: amountInRupees,
                  penalty_amount: 0,
                  processed_at: new Date(),
                },
                update: {
                  refund_amount: amountInRupees,
                  processed_at: new Date(),
                },
              });

              await tx.auditLog.create({
                data: {
                  actor_id: null,
                  actor_type: "system",
                  action: "WEBHOOK_EXTERNAL_REFUND_RECONCILED",
                  entity: "Payment",
                  entity_id: createdPayment.id,
                  after_state: {
                    booking_id: targetBookingId,
                    refundId,
                    amount: amountInRupees,
                    source: "razorpay_webhook",
                  },
                },
              });
            });
          }
        }
      }
    } else if (event === "refund.failed") {
      const refundEntity = payload.refund?.entity;
      if (refundEntity?.id) {
        const refundId = String(refundEntity.id);
        const errorCode = refundEntity.error_code || "REFUND_FAILED";
        const errorDescription = refundEntity.error_description || "Gateway failed to disburse refund to customer account.";
        const amountInRupees = Number(refundEntity.amount || 0) / 100;

        const existingRefund = await prisma.payment.findFirst({
          where: { transaction_ref: refundId },
          include: { booking: true },
        });

        if (existingRefund) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: existingRefund.id },
              data: {
                status: "failed",
                metadata: {
                  ...(existingRefund.metadata as object),
                  webhookFailedAt: new Date().toISOString(),
                  errorCode,
                  errorDescription,
                  gatewayRefundStatus: "failed",
                },
              },
            });

            await tx.auditLog.create({
              data: {
                actor_id: null,
                actor_type: "system",
                action: "WEBHOOK_REFUND_FAILED_ALERT",
                entity: "Payment",
                entity_id: existingRefund.id,
                before_state: { status: existingRefund.status },
                after_state: {
                  status: "failed",
                  refundId,
                  amount: amountInRupees,
                  errorCode,
                  errorDescription,
                  alert: "ATTENTION_REQUIRED_MANUAL_PAYOUT",
                },
              },
            });
          });
        }
      }
    } else if (event === "refund.speed_changed") {
      const refundEntity = payload.refund?.entity;
      if (refundEntity?.id) {
        const existingRefund = await prisma.payment.findFirst({
          where: { transaction_ref: String(refundEntity.id) },
        });

        if (existingRefund) {
          await prisma.payment.update({
            where: { id: existingRefund.id },
            data: {
              metadata: {
                ...(existingRefund.metadata as object),
                speedRequested: refundEntity.speed_requested,
                speedProcessed: refundEntity.speed_processed,
                speedUpdatedAt: new Date().toISOString(),
              },
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error("Error processing Razorpay webhook:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
