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
                actor_id: 0,
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
