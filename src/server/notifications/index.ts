/**
 * PrimeRides Notification & Communication Engine
 *
 * Architecture:
 * - Enterprise-grade notification pipeline supporting Email, SMS, and WhatsApp.
 * - Email: Resend adapter with luxury gold-accented HTML templates and graceful console stub.
 * - SMS: DLT-compliant Indian gateway adapter (Fast2SMS / MSG91) with phone normalizer.
 * - WhatsApp: Concierge direct link generator and Meta WhatsApp Cloud API adapter.
 *
 * Environment variables:
 *   RESEND_API_KEY             — Resend.com API key for production email delivery
 *   EMAIL_FROM / NOTIFICATION_FROM — Verified sender (default: noreply@primerides.in)
 *   ADMIN_ALERT_EMAIL          — Operations inbox for internal alerts
 *   SMS_PROVIDER               — "fast2sms" | "msg91" | "stub" (default: stub)
 *   FAST2SMS_API_KEY / SMS_API_KEY — Fast2SMS authorization key
 *   MSG91_AUTH_KEY             — MSG91 authorization key
 *   SMS_SENDER_ID              — DLT 6-character sender ID (default: PRMRDS)
 *   WHATSAPP_API_TOKEN         — Meta WhatsApp Cloud API access token
 *   WHATSAPP_PHONE_NUMBER_ID   — Meta WhatsApp business phone number ID
 */

import "server-only";
import { getSiteSettings } from "@/server/settings";
import { formatIstDateTime } from "@/lib/dates";
export { formatIstDateTime };

// ─────────────────────────────────────────────────────────────────────────────
// Types & Contexts
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationPayload {
  to: string;             // Recipient email or phone number
  subject?: string;       // Email subject line
  body: string;           // Plain-text content (SMS / WhatsApp / Text-only email)
  htmlBody?: string;      // Responsive branded HTML email content
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

export interface PasswordResetNotificationContext {
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  resetUrl: string;
  expiresInMinutes?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Luxury Gold Email Template Builder
// ─────────────────────────────────────────────────────────────────────────────

interface EmailTemplateOptions {
  title: string;
  badgeText?: string;
  badgeVariant?: "gold" | "green" | "red" | "blue";
  recipientName: string;
  introText: string;
  items?: { label: string; value: string; isHighlight?: boolean }[];
  warningText?: string;
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}

function renderBrandEmailTemplate(opts: EmailTemplateOptions): string {
  const badgeColors = {
    gold: { bg: "rgba(197, 155, 39, 0.15)", text: "#f7d58b", border: "rgba(197, 155, 39, 0.4)" },
    green: { bg: "rgba(34, 197, 94, 0.15)", text: "#86efac", border: "rgba(34, 197, 94, 0.4)" },
    red: { bg: "rgba(239, 68, 68, 0.15)", text: "#fca5a5", border: "rgba(239, 68, 68, 0.4)" },
    blue: { bg: "rgba(59, 130, 246, 0.15)", text: "#93c5fd", border: "rgba(59, 130, 246, 0.4)" },
  };

  const badgeStyle = badgeColors[opts.badgeVariant || "gold"];

  const itemsHtml = opts.items && opts.items.length > 0
    ? `
      <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#0d1424;border-radius:12px;border:1px solid #1e293b;overflow:hidden">
        <tbody>
          ${opts.items.map((item, idx) => `
            <tr style="${idx > 0 ? "border-top:1px solid #1e293b;" : ""}">
              <td style="padding:12px 18px;color:#94a3b8;font-size:13px;width:38%">${item.label}</td>
              <td style="padding:12px 18px;color:${item.isHighlight ? "#f7d58b" : "#f8fafc"};font-size:${item.isHighlight ? "16px" : "14px"};font-weight:${item.isHighlight ? "700" : "500"};text-align:right">${item.value}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `
    : "";

  const ctaHtml = opts.ctaUrl && opts.ctaText
    ? `
      <div style="text-align:center;margin:28px 0 16px 0">
        <a href="${opts.ctaUrl}" style="display:inline-block;background:linear-gradient(135deg, #f7d58b 0%, #c59b27 100%);color:#090e1a;font-weight:700;font-size:14px;text-decoration:none;padding:12px 32px;border-radius:9999px;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(197, 155, 39, 0.25)">
          ${opts.ctaText} →
        </a>
      </div>
    `
    : "";

  const warningHtml = opts.warningText
    ? `
      <div style="background:rgba(239, 68, 68, 0.1);border-left:3px solid #ef4444;padding:12px 16px;border-radius:4px;margin:20px 0;color:#fca5a5;font-size:13px;line-height:1.5">
        ${opts.warningText}
      </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#060a12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#060a12;padding:40px 16px">
    <tr>
      <td align="center">
        <!-- Master Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background:#0d1424;border:1px solid #1e293b;border-radius:18px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5)">
          <!-- Brand Header -->
          <tr>
            <td style="background:linear-gradient(180deg, #151f34 0%, #0d1424 100%);padding:32px 36px;border-bottom:1px solid #1e293b;text-align:center">
              <span style="font-size:24px;font-weight:800;letter-spacing:3px;color:#f7d58b;text-transform:uppercase">PRIME<span style="color:#c59b27">RIDES</span></span>
              <div style="font-size:11px;letter-spacing:3px;color:#94a3b8;text-transform:uppercase;margin-top:4px;font-weight:500">Luxury Self-Drive Fleet</div>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:36px">
              ${opts.badgeText ? `
                <div style="margin-bottom:16px">
                  <span style="display:inline-block;background:${badgeStyle.bg};color:${badgeStyle.text};border:1px solid ${badgeStyle.border};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;padding:4px 12px;border-radius:9999px">
                    ${opts.badgeText}
                  </span>
                </div>
              ` : ""}

              <h1 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 16px 0;letter-spacing:-0.3px">${opts.title}</h1>
              <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 16px 0">Dear <strong>${opts.recipientName}</strong>,</p>
              <p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 20px 0">${opts.introText}</p>

              ${itemsHtml}
              ${warningHtml}
              ${ctaHtml}

              <div style="margin-top:32px;padding-top:20px;border-top:1px solid #1e293b;color:#94a3b8;font-size:12px;line-height:1.6">
                ${opts.footerNote || "For instant concierge assistance or booking modifications, reply to this email or connect with our 24/7 dedicated support desk."}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#090d18;padding:24px 36px;border-top:1px solid #172033;text-align:center;color:#64748b;font-size:11px;line-height:1.6">
              © ${new Date().getFullYear()} PrimeRides Luxury Mobility. All rights reserved.<br>
              Chandigarh • Mohali • Panchkula • Dehradun • Delhi NCR
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Delivery Primitives
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispatches an email via Resend API or logs gracefully to the console.
 */
export async function sendEmail(payload: NotificationPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || process.env.NOTIFICATION_FROM || "PrimeRides <noreply@primerides.in>";

  if (!apiKey) {
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

/**
 * Normalises phone number to 10-digit Indian standard.
 */
export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.substring(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.substring(1);
  }
  return digits.slice(-10);
}

/**
 * Dispatches an SMS via Fast2SMS, MSG91, or logs gracefully as a stub.
 */
export async function sendSMS(phone: string, message: string, dltTemplateId?: string): Promise<void> {
  const cleanPhone = normalizeIndianPhone(phone);
  const provider = (process.env.SMS_PROVIDER || "stub").toLowerCase();
  const fast2SmsKey = process.env.FAST2SMS_API_KEY || (provider === "fast2sms" ? process.env.SMS_API_KEY : undefined);
  const msg91Key = process.env.MSG91_AUTH_KEY || (provider === "msg91" ? process.env.SMS_API_KEY : undefined);
  const senderId = process.env.SMS_SENDER_ID || "PRMRDS";

  // Fast2SMS Integration
  if (fast2SmsKey) {
    try {
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: dltTemplateId ? "dlt" : "q",
          message,
          numbers: cleanPhone,
          flash: 0,
          ...(dltTemplateId ? { sender_id: senderId, message_id: dltTemplateId } : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[Notification:SMS:Fast2SMS] Failed:", err);
      }
      return;
    } catch (err) {
      console.error("[Notification:SMS:Fast2SMS] Request error:", err);
      return;
    }
  }

  // MSG91 Integration
  if (msg91Key) {
    try {
      const res = await fetch("https://control.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: {
          authkey: msg91Key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: dltTemplateId || process.env.MSG91_DEFAULT_TEMPLATE_ID || "",
          short_url: "0",
          recipients: [{ mobiles: `91${cleanPhone}`, message }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[Notification:SMS:MSG91] Failed:", err);
      }
      return;
    } catch (err) {
      console.error("[Notification:SMS:MSG91] Request error:", err);
      return;
    }
  }

  // Graceful Stub Logging
  console.log(`[Notification:SMS:STUB] TO=+91${cleanPhone} MSG="${message}"`);
}

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Integration & Concierge Link Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates a direct WhatsApp click-to-chat URL with pre-filled message.
 */
export function generateWhatsAppConciergeLink(phone?: string, text?: string): string {
  const settings = getSiteSettings();
  const rawTarget = phone || settings.whatsapp || "+91-90453-01702";
  const cleanDigits = rawTarget.replace(/[^0-9]/g, "");
  const formattedPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
  const defaultText = text || "Hello PrimeRides Concierge, I would like to inquire about a luxury car reservation.";
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(defaultText)}`;
}

/**
 * Generates a customer-facing pre-filled WhatsApp link for a specific reservation.
 */
export function generateBookingWhatsAppLink(ctx: BookingNotificationContext): string {
  const text =
    `Hello PrimeRides Team,\n\n` +
    `I have a question regarding my reservation:\n` +
    `• Booking Code: ${ctx.bookingCode}\n` +
    `• Vehicle: ${ctx.carName}\n` +
    `• Guest: ${ctx.customerName}\n\n` +
    `Could you please assist me?`;
  return generateWhatsAppConciergeLink(undefined, text);
}

/**
 * Sends a message via Meta WhatsApp Cloud API or logs to console stub.
 */
export async function sendWhatsAppNotification(phone: string, message: string): Promise<void> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const cleanPhone = normalizeIndianPhone(phone);

  if (!token || !phoneId) {
    console.log(`[Notification:WhatsApp:STUB] TO=+91${cleanPhone} MSG="${message}"`);
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: `91${cleanPhone}`,
        type: "text",
        text: { preview_url: true, body: message },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Notification:WhatsApp] Failed:", err);
    }
  } catch (err) {
    console.error("[Notification:WhatsApp] Request error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// High-Level Domain Workflows
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fired immediately after a booking is confirmed or paid.
 */
export async function notifyBookingConfirmed(ctx: BookingNotificationContext): Promise<void> {
  const settings = getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://primerides.in";

  const startFormatted = formatIstDateTime(ctx.startDate);
  const endFormatted = formatIstDateTime(ctx.endDate);

  const smsBody =
    `Hi ${ctx.customerName}, your PrimeRides booking for ${ctx.carName} is confirmed! ` +
    `Code: ${ctx.bookingCode}. Pickup: ${startFormatted}. ` +
    `Complete your KYC at ${siteUrl}/account/documents prior to handover. Concierge: ${settings.whatsapp || "+91-90453-01702"}`;

  const promises: Promise<void>[] = [
    sendSMS(ctx.customerPhone, smsBody),
    sendWhatsAppNotification(ctx.customerPhone, smsBody),
  ];

  if (ctx.customerEmail) {
    const htmlBody = renderBrandEmailTemplate({
      title: "Reservation Confirmed",
      badgeText: "Booking Confirmed",
      badgeVariant: "gold",
      recipientName: ctx.customerName,
      introText: "Your luxury driving experience has been reserved. Here are the full details of your upcoming booking:",
      items: [
        { label: "Booking Code", value: ctx.bookingCode, isHighlight: true },
        { label: "Vehicle", value: ctx.carName },
        { label: "Pickup Schedule", value: startFormatted },
        { label: "Return Schedule", value: endFormatted },
        { label: "Pickup Hub", value: ctx.pickupLocation || "Doorstep Delivery" },
        { label: "Total Paid", value: `₹${ctx.totalAmount.toLocaleString("en-IN")}`, isHighlight: true },
      ],
      warningText: "⚠️ Mandatory KYC: Please ensure you upload your valid Driving Licence and Aadhaar/Passport before arriving for vehicle handover.",
      ctaText: "Upload KYC Documents",
      ctaUrl: `${siteUrl}/account/documents`,
      footerNote: `Need roadside assistance or customized delivery? WhatsApp our concierge at ${settings.whatsapp || "+91-90453-01702"}.`,
    });

    promises.push(
      sendEmail({
        to: ctx.customerEmail,
        subject: `Reservation Confirmed — ${ctx.carName} (${ctx.bookingCode}) — PrimeRides`,
        body: smsBody,
        htmlBody,
      })
    );
  }

  // Alert operations team
  const alertEmail = process.env.ADMIN_ALERT_EMAIL || settings.email;
  if (alertEmail) {
    promises.push(
      sendEmail({
        to: alertEmail,
        subject: `[Operations Alert] New Booking Confirmed — ${ctx.bookingCode}`,
        body: `New booking created:\nCode: ${ctx.bookingCode}\nCustomer: ${ctx.customerName} (${ctx.customerPhone})\nCar: ${ctx.carName}\nPickup: ${startFormatted}\nTotal: ₹${ctx.totalAmount}`,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://primerides.in";
  const isApproved = ctx.status === "verified";

  const smsBody = isApproved
    ? `Hi ${ctx.customerName}, great news! Your ${ctx.documentType} has been verified by PrimeRides. You are cleared for vehicle handover.`
    : `Hi ${ctx.customerName}, your ${ctx.documentType} could not be verified. ${ctx.rejectionReason ? `Reason: ${ctx.rejectionReason}. ` : ""}Please re-upload at ${siteUrl}/account/documents`;

  const promises: Promise<void>[] = [
    sendSMS(ctx.customerPhone, smsBody),
  ];

  if (ctx.customerEmail) {
    const htmlBody = renderBrandEmailTemplate({
      title: isApproved ? "KYC Documents Approved" : "KYC Action Required",
      badgeText: isApproved ? "Verification Complete" : "Action Required",
      badgeVariant: isApproved ? "green" : "red",
      recipientName: ctx.customerName,
      introText: isApproved
        ? `We are pleased to inform you that your ${ctx.documentType} has been reviewed and verified by our compliance team. You are now cleared for fast-track vehicle handover!`
        : `Our compliance team reviewed your uploaded ${ctx.documentType} and was unable to verify it.`,
      warningText: !isApproved && ctx.rejectionReason ? `Reason: ${ctx.rejectionReason}` : undefined,
      ctaText: isApproved ? "View My Bookings" : "Re-Upload Documents",
      ctaUrl: isApproved ? `${siteUrl}/account/bookings` : `${siteUrl}/account/documents`,
      footerNote: `If you have questions regarding document standards, please message us on WhatsApp: ${settings.whatsapp || "+91-90453-01702"}.`,
    });

    promises.push(
      sendEmail({
        to: ctx.customerEmail,
        subject: isApproved
          ? "KYC Verification Approved — PrimeRides"
          : "Action Required: KYC Verification Update — PrimeRides",
        body: smsBody,
        htmlBody,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://primerides.in";
  const body =
    `Hi ${ctx.customerName}, your PrimeRides booking ${ctx.bookingCode} for ${ctx.carName} has been cancelled as requested. ` +
    `Refunds are processed within 5–7 business days per policy. Explore vehicles: ${siteUrl}/cars`;

  const promises: Promise<void>[] = [sendSMS(ctx.customerPhone, body)];

  if (ctx.customerEmail) {
    const htmlBody = renderBrandEmailTemplate({
      title: "Booking Cancellation Confirmed",
      badgeText: "Booking Cancelled",
      badgeVariant: "red",
      recipientName: ctx.customerName,
      introText: `Your reservation <strong>${ctx.bookingCode}</strong> for <strong>${ctx.carName}</strong> has been cancelled as per your request.`,
      items: [
        { label: "Booking Code", value: ctx.bookingCode },
        { label: "Vehicle", value: ctx.carName },
        { label: "Refund Timeline", value: "5–7 Business Days", isHighlight: true },
      ],
      ctaText: "Browse Luxury Fleet",
      ctaUrl: `${siteUrl}/cars`,
      footerNote: "Any eligible refund will be credited to the original payment source according to our terms.",
    });

    promises.push(
      sendEmail({
        to: ctx.customerEmail,
        subject: `Cancellation Confirmed — ${ctx.bookingCode} — PrimeRides`,
        body,
        htmlBody,
      })
    );
  }

  await Promise.allSettled(promises);
}

/**
 * Fired when a password reset is requested.
 */
export async function notifyPasswordReset(ctx: PasswordResetNotificationContext): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://primerides.in";
  const expiresIn = ctx.expiresInMinutes || 60;

  const body =
    `Hi ${ctx.customerName}, you requested to reset your PrimeRides password. ` +
    `Use this link to set a new password: ${ctx.resetUrl} (Valid for ${expiresIn} minutes). ` +
    `If you did not request this, please ignore this message.`;

  const promises: Promise<void>[] = [];

  if (ctx.customerPhone) {
    promises.push(sendSMS(ctx.customerPhone, body));
  }

  if (ctx.customerEmail) {
    const htmlBody = renderBrandEmailTemplate({
      title: "Reset Your Password",
      badgeText: "Security Notice",
      badgeVariant: "gold",
      recipientName: ctx.customerName,
      introText: `We received a request to reset the password for your PrimeRides account. Click the button below to choose a new password. This link is valid for ${expiresIn} minutes.`,
      warningText: "If you did not request this change, you can safely disregard this email. Your password will remain unchanged.",
      ctaText: "Reset My Password",
      ctaUrl: ctx.resetUrl,
      footerNote: "For your security, never forward or share this password reset link with anyone.",
    });

    promises.push(
      sendEmail({
        to: ctx.customerEmail,
        subject: "Reset your PrimeRides password",
        body,
        htmlBody,
      })
    );
  }

  await Promise.allSettled(promises);
}
