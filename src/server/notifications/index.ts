/**
 * PrimeRides Notification Module
 *
 * Architecture: Stub-first design.
 * - All notification functions are real, typed, and wired into the booking/KYC engine.
 * - Email delivery uses a provider-agnostic interface (Resend by default when
 *   RESEND_API_KEY is configured; graceful console fallback otherwise).
 * - SMS/WhatsApp is queued to a stub that logs messages to the console.
 *   To wire a real provider (Twilio, MSG91, etc.) replace the `sendSMS` function.
 *
 * Environment variables:
 *   RESEND_API_KEY        — Resend.com API key (optional; enables real email delivery)
 *   NOTIFICATION_FROM     — Sender address for emails (e.g. noreply@primerides.in)
 *   ADMIN_ALERT_EMAIL     — Operations team email for internal alerts
 */

import "server-only";
import { getSiteSettings } from "@/server/settings";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationPayload {
  to: string;             // Email address or phone number
  subject?: string;       // Email subject
  body: string;           // Plain-text body (SMS / WhatsApp)
  htmlBody?: string;      // Optional HTML for email
}

export interface BookingNotificationContext {
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  bookingCode: string;
  carName: string;
  startDate: Date | string;
  endDate: Date | string;
  totalAmount: number;
  pickupLocation?: string | null;
}

export interface KycNotificationContext {
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  documentType: string;
  status: "verified" | "rejected";
  rejectionReason?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Delivery primitives
// ─────────────────────────────────────────────────────────────────────────────

async function sendEmail(payload: NotificationPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_FROM || "PrimeRides <noreply@primerides.in>";

  if (!apiKey) {
    // Graceful stub: log to console when Resend is not configured
    console.log(
      `[Notification:Email:STUB] TO=${payload.to} SUBJECT="${payload.subject}"\n${payload.body}`
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [payload.to],
        subject: payload.subject || "Notification from PrimeRides",
        text: payload.body,
        html: payload.htmlBody || `<pre>${payload.body}</pre>`,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Notification:Email] Resend delivery failed:", err);
    }
  } catch (err) {
    console.error("[Notification:Email] Resend request error:", err);
  }
}

async function sendSMS(phone: string, message: string): Promise<void> {
  // Stub — replace with MSG91, Twilio, or Fast2SMS integration
  // Normalise phone to 10-digit or 91+10-digit format for Indian numbers
  const normalised = phone.replace(/[^0-9]/g, "");
  console.log(
    `[Notification:SMS:STUB] TO=${normalised} MSG="${message}"`
  );
  // To enable real SMS, add your provider call here and set env vars.
}

// ─────────────────────────────────────────────────────────────────────────────
// Customer-facing notifications
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fired immediately after a booking is created (pending status).
 */
export async function notifyBookingConfirmed(ctx: BookingNotificationContext): Promise<void> {
  const settings = getSiteSettings();

  const start = new Date(ctx.startDate).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const body =
    `Hi ${ctx.customerName},\n\n` +
    `Your PrimeRides reservation is confirmed!\n\n` +
    `Booking Code: ${ctx.bookingCode}\n` +
    `Vehicle: ${ctx.carName}\n` +
    `Pickup: ${start}\n` +
    `Location: ${ctx.pickupLocation || "Doorstep delivery"}\n` +
    `Total: ₹${ctx.totalAmount.toLocaleString("en-IN")}\n\n` +
    `Please upload your Driving Licence at primerides.in/account/documents to complete KYC before handover.\n\n` +
    `For assistance: ${settings.whatsapp || "+91-90453-01702"}\n` +
    `PrimeRides — Luxury Made Accessible`;

  const promises: Promise<void>[] = [sendSMS(ctx.customerPhone, body)];

  if (ctx.customerEmail) {
    promises.push(
      sendEmail({
        to: ctx.customerEmail,
        subject: `Your PrimeRides reservation is confirmed — ${ctx.bookingCode}`,
        body,
        htmlBody: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
            <div style="background:#090e1a;padding:24px 32px;border-radius:16px 16px 0 0">
              <h2 style="color:#d8a834;margin:0;font-size:20px">Reservation Confirmed</h2>
            </div>
            <div style="background:#ffffff;padding:24px 32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none">
              <p>Hi <strong>${ctx.customerName}</strong>,</p>
              <p>Your luxury ride is booked. Here's your summary:</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
                <tr><td style="padding:8px 0;color:#64748b">Booking Code</td><td style="padding:8px 0;font-family:monospace;color:#d8a834;font-weight:700">${ctx.bookingCode}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b">Vehicle</td><td style="padding:8px 0;font-weight:600">${ctx.carName}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b">Pickup</td><td style="padding:8px 0">${start}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b">Location</td><td style="padding:8px 0">${ctx.pickupLocation || "Doorstep delivery"}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;border-top:1px solid #f1f5f9">Total Amount</td><td style="padding:8px 0;font-weight:700;font-size:18px;color:#d8a834;border-top:1px solid #f1f5f9">₹${ctx.totalAmount.toLocaleString("en-IN")}</td></tr>
              </table>
              <p style="color:#ef4444;font-size:13px">⚠️ Please upload your Driving Licence to complete KYC — vehicle handover requires a verified DL.</p>
              <a href="https://primerides.in/account/documents" style="display:inline-block;background:#d8a834;color:#090e1a;font-weight:700;padding:10px 24px;border-radius:100px;text-decoration:none;font-size:13px;margin-top:8px">Upload Documents →</a>
            </div>
          </div>
        `,
      })
    );
  }

  // Alert operations team
  const alertEmail = process.env.ADMIN_ALERT_EMAIL || settings.email;
  if (alertEmail) {
    promises.push(
      sendEmail({
        to: alertEmail,
        subject: `[PrimeRides] New Booking — ${ctx.bookingCode} — ${ctx.carName}`,
        body: `New booking created:\nCode: ${ctx.bookingCode}\nCustomer: ${ctx.customerName} (${ctx.customerPhone})\nCar: ${ctx.carName}\nPickup: ${start}\nTotal: ₹${ctx.totalAmount}`,
      })
    );
  }

  await Promise.allSettled(promises);
}

/**
 * Fired when an admin approves or rejects a KYC document.
 */
export async function notifyKycStatusChange(ctx: KycNotificationContext): Promise<void> {
  const settings = getSiteSettings();

  const isApproved = ctx.status === "verified";

  const body = isApproved
    ? `Hi ${ctx.customerName},\n\nGreat news! Your ${ctx.documentType} has been verified by PrimeRides.\n\nYou are now cleared for vehicle handover. Show your booking code at the time of pickup.\n\nFor assistance: ${settings.whatsapp || "+91-90453-01702"}\nPrimeRides`
    : `Hi ${ctx.customerName},\n\nWe were unable to verify your ${ctx.documentType}.\n\n${ctx.rejectionReason ? `Reason: ${ctx.rejectionReason}\n\n` : ""}Please re-upload a clearer copy at primerides.in/account/documents.\n\nFor assistance: ${settings.whatsapp || "+91-90453-01702"}\nPrimeRides`;

  const promises: Promise<void>[] = [sendSMS(ctx.customerPhone, body)];

  if (ctx.customerEmail) {
    promises.push(
      sendEmail({
        to: ctx.customerEmail,
        subject: isApproved
          ? "Your KYC is approved — PrimeRides"
          : "Action required: KYC verification issue — PrimeRides",
        body,
        htmlBody: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
            <div style="background:${isApproved ? "#090e1a" : "#7f1d1d"};padding:24px 32px;border-radius:16px 16px 0 0">
              <h2 style="color:${isApproved ? "#d8a834" : "#fca5a5"};margin:0;font-size:18px">${isApproved ? "✅ KYC Verified" : "⚠️ KYC Action Required"}</h2>
            </div>
            <div style="background:#ffffff;padding:24px 32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none">
              <p>Hi <strong>${ctx.customerName}</strong>,</p>
              <p>${body.split("\n\n").slice(1).join("</p><p>")}</p>
              ${!isApproved ? `<a href="https://primerides.in/account/documents" style="display:inline-block;background:#dc2626;color:#fff;font-weight:700;padding:10px 24px;border-radius:100px;text-decoration:none;font-size:13px;margin-top:8px">Re-upload Documents →</a>` : ""}
            </div>
          </div>
        `,
      })
    );
  }

  await Promise.allSettled(promises);
}

/**
 * Fired when a customer self-cancels a booking.
 */
export async function notifyBookingCancelled(
  ctx: Pick<BookingNotificationContext, "customerName" | "customerEmail" | "customerPhone" | "bookingCode" | "carName">
): Promise<void> {
  const body =
    `Hi ${ctx.customerName},\n\n` +
    `Your PrimeRides reservation ${ctx.bookingCode} for ${ctx.carName} has been cancelled as requested.\n\n` +
    `Security deposit refunds are processed within 5–7 business days per our cancellation policy.\n\n` +
    `To rebook: primerides.in/cars\nPrimeRides`;

  const promises: Promise<void>[] = [sendSMS(ctx.customerPhone, body)];
  if (ctx.customerEmail) {
    promises.push(
      sendEmail({
        to: ctx.customerEmail,
        subject: `Cancellation confirmed — ${ctx.bookingCode} — PrimeRides`,
        body,
      })
    );
  }
  await Promise.allSettled(promises);
}
