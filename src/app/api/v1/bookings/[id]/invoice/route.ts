import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { getCurrentCustomer } from "@/server/auth/customer";
import { apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { getInvoiceDataForBooking, generateTaxInvoicePdf } from "@/server/invoicing/pdf";
import { prisma } from "@/server/db/client";

/**
 * GET /api/v1/bookings/[id]/invoice
 *
 * Downloads or views statutory GST Tax Invoice (PDF or JSON).
 * Accessible by:
 * 1. Authenticated customer who owns the booking.
 * 2. Authenticated administrator with bookings view/manage permissions.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id, 10);
    if (isNaN(bookingId) || bookingId <= 0) {
      return apiError("Invalid booking identifier.", 400);
    }

    // 1. Resolve calling actor (Admin or Customer)
    const [admin, customer] = await Promise.all([
      getCurrentAdmin(req),
      getCurrentCustomer(req),
    ]);

    if (!admin && !customer) {
      return apiUnauthorized("Authentication required to access tax invoices.");
    }

    // 2. Fetch target booking record for ownership validation
    const bookingRecord = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        booking_code: true,
        customer_id: true,
        phone: true,
        email: true,
        status: true,
      },
    });

    if (!bookingRecord) {
      return apiError("Booking record not found.", 404);
    }

    // 3. Ownership / RBAC authorization check
    let isAuthorized = false;

    if (admin) {
      isAuthorized =
        hasAdminPermission(admin, ADMIN_PERMISSIONS.BOOKINGS_VIEW) ||
        hasAdminPermission(admin, ADMIN_PERMISSIONS.BOOKINGS_MANAGE) ||
        admin.role === "superadmin";
    }

    if (!isAuthorized && customer) {
      const isOwner =
        bookingRecord.customer_id === customer.id ||
        (customer.phone && bookingRecord.phone === customer.phone) ||
        (customer.email && bookingRecord.email === customer.email);
      if (isOwner) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return apiError("You do not have permission to view this tax invoice.", 403);
    }

    // 4. Resolve complete invoice data
    const invoiceData = await getInvoiceDataForBooking(bookingId);
    if (!invoiceData) {
      return apiError("Failed to assemble tax invoice data.", 500);
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format")?.toLowerCase();

    // JSON API response
    if (format === "json") {
      return apiSuccess(invoiceData);
    }

    // PDF Binary response (Default)
    const pdfBuffer = generateTaxInvoicePdf(invoiceData);
    const sanitizedCode = invoiceData.bookingCode.replace(/[^a-zA-Z0-9_-]/g, "_");
    const isInline = searchParams.get("inline") === "true" || searchParams.get("inline") === "1";
    const dispositionType = isInline ? "inline" : "attachment";

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${dispositionType}; filename="Invoice-${sanitizedCode}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err: any) {
    console.error("Error generating tax invoice:", err);
    return apiError(err.message || "Failed to generate tax invoice.", 500);
  }
}
