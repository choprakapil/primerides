import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentCustomer } from "@/server/auth/customer";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { getInvoiceDataForBooking } from "@/server/invoicing/pdf";
import { formatIstDate, formatIstDateTime } from "@/lib/dates";
import { prisma } from "@/server/db/client";
import InvoicePrintActions from "./InvoicePrintActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface InvoicePageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function BookingInvoicePage({ params }: InvoicePageProps) {
  const resolvedParams = await params;
  const bookingId = parseInt(resolvedParams.id, 10);
  if (isNaN(bookingId) || bookingId <= 0) notFound();

  // 1. Authenticate customer or admin
  const [customer, admin] = await Promise.all([
    getCurrentCustomer(),
    getCurrentAdmin(),
  ]);

  if (!customer && !admin) {
    redirect(`/account/login?callbackUrl=/account/bookings/${bookingId}/invoice`);
  }

  // 2. Fetch booking record
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      customer_id: true,
      phone: true,
      email: true,
    },
  });

  if (!booking) notFound();

  // 3. Authorization check
  let isAuthorized = false;
  if (admin) {
    isAuthorized =
      hasAdminPermission(admin, ADMIN_PERMISSIONS.BOOKINGS_VIEW) ||
      hasAdminPermission(admin, ADMIN_PERMISSIONS.BOOKINGS_MANAGE) ||
      admin.role === "superadmin";
  }

  if (!isAuthorized && customer) {
    const isOwner =
      booking.customer_id === customer.id ||
      (customer.phone && booking.phone === customer.phone) ||
      (customer.email && booking.email === customer.email);
    if (isOwner) isAuthorized = true;
  }

  if (!isAuthorized) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold text-danger mb-2">Access Denied</h4>
        <p className="text-muted">You do not have permission to access this tax invoice.</p>
        <Link href="/account/bookings" className="btn btn-outline-dark btn-sm">
          Return to Bookings
        </Link>
      </div>
    );
  }

  const invoice = await getInvoiceDataForBooking(bookingId);
  if (!invoice) notFound();

  return (
    <div className="py-4 bg-light min-vh-100">
      <div className="container" style={{ maxWidth: "860px" }}>
        {/* Top Action Bar (Hidden in Print) */}
        <InvoicePrintActions
          bookingId={bookingId}
          bookingCode={invoice.bookingCode}
        />

        {/* Printable Tax Invoice Paper */}
        <div
          id="invoice-paper"
          className="bg-white rounded-3 shadow-sm border p-4 p-md-5 position-relative"
          style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
        >
          {/* Top Brand Accent Stripe */}
          <div
            className="position-absolute top-0 start-0 end-0"
            style={{ height: "6px", backgroundColor: "#c59b27" }}
          />

          {/* Header Row */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-3 border-bottom pb-4 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="fs-3 fw-black text-dark tracking-tight">
                  {invoice.supplier.brandName.toUpperCase()}
                </span>
                <span
                  className="badge px-2 py-0.5 rounded-pill text-2xs fw-bold"
                  style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                >
                  SELF-DRIVE
                </span>
              </div>
              <div className="fw-bold text-dark fs-6 mb-1">
                {invoice.supplier.legalName}
              </div>
              <div className="text-muted small" style={{ fontSize: "12px", lineHeight: "1.4" }}>
                {invoice.supplier.address}
                <br />
                State: <strong>{invoice.supplier.state}</strong> &bull; Concierge: {invoice.supplier.phone}
                <br />
                Email: {invoice.supplier.email}
              </div>
            </div>

            <div className="text-sm-end">
              <div className="badge bg-light text-dark border px-3 py-1.5 rounded-pill fw-bold text-xs mb-1">
                ORIGINAL FOR RECIPIENT
              </div>
              <h4 className="fw-black text-dark mb-0 font-monospace">TAX INVOICE</h4>
              <div className="text-muted text-xs">
                Under Section 31 of CGST Act, 2017
              </div>
              <div className="mt-2 text-xs font-monospace">
                GSTIN: <strong>{invoice.supplier.gstin}</strong>
                <br />
                SAC: <strong>{invoice.supplier.sacCode}</strong>
              </div>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="row g-3 mb-4">
            {/* Left Card: Invoice & Rental Details */}
            <div className="col-12 col-md-6">
              <div className="p-3 rounded-3 bg-light border h-100">
                <div
                  className="text-uppercase fw-bold text-xs mb-2 pb-1 border-bottom"
                  style={{ color: "#c59b27", letterSpacing: "0.5px" }}
                >
                  Invoice &amp; Rental Record
                </div>
                <div className="d-flex justify-content-between text-xs py-1">
                  <span className="text-muted">Invoice No:</span>
                  <span className="fw-bold text-dark font-monospace">{invoice.bookingCode}</span>
                </div>
                <div className="d-flex justify-content-between text-xs py-1">
                  <span className="text-muted">Invoice Date:</span>
                  <span className="fw-semibold text-dark">{formatIstDate(invoice.invoiceDate)}</span>
                </div>
                <div className="d-flex justify-content-between text-xs py-1">
                  <span className="text-muted">Place of Supply:</span>
                  <span className="fw-semibold text-dark">{invoice.supplier.state}</span>
                </div>
                <div className="d-flex justify-content-between text-xs py-1">
                  <span className="text-muted">Supply Category:</span>
                  <span className="fw-semibold text-dark">
                    {invoice.financials.isInterState ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)"}
                  </span>
                </div>
                <div className="d-flex justify-content-between text-xs py-1">
                  <span className="text-muted">Reverse Charge:</span>
                  <span className="fw-semibold text-dark">No</span>
                </div>
              </div>
            </div>

            {/* Right Card: Customer Billed To */}
            <div className="col-12 col-md-6">
              <div className="p-3 rounded-3 bg-light border h-100">
                <div
                  className="text-uppercase fw-bold text-xs mb-2 pb-1 border-bottom text-dark"
                  style={{ letterSpacing: "0.5px" }}
                >
                  Billed To (Customer Details)
                </div>
                <div className="d-flex justify-content-between text-xs py-1">
                  <span className="text-muted">Customer Name:</span>
                  <span className="fw-bold text-dark">{invoice.customer.name}</span>
                </div>
                <div className="d-flex justify-content-between text-xs py-1">
                  <span className="text-muted">Contact Phone:</span>
                  <span className="fw-semibold text-dark">{invoice.customer.phone}</span>
                </div>
                <div className="d-flex justify-content-between text-xs py-1">
                  <span className="text-muted">Email:</span>
                  <span className="fw-semibold text-dark">{invoice.customer.email || "Registered Profile"}</span>
                </div>
                <div className="d-flex justify-content-between text-xs py-1">
                  <span className="text-muted">Pickup Hub:</span>
                  <span className="fw-semibold text-dark">{invoice.rental.pickupLocation}</span>
                </div>
                <div className="d-flex justify-content-between text-xs py-1">
                  <span className="text-muted">Drop Hub:</span>
                  <span className="fw-semibold text-dark">{invoice.rental.dropLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="table-responsive mb-4">
            <table className="table table-bordered align-middle mb-0" style={{ fontSize: "12.5px" }}>
              <thead className="table-dark text-uppercase text-2xs">
                <tr>
                  <th style={{ width: "40px" }} className="text-center">#</th>
                  <th>Description of Service &amp; Vehicle Hire</th>
                  <th style={{ width: "90px" }} className="text-center">SAC Code</th>
                  <th style={{ width: "160px" }} className="text-center">Rental Window (IST)</th>
                  <th style={{ width: "130px" }} className="text-end">Taxable Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center fw-bold">1</td>
                  <td>
                    <div className="fw-bold text-dark">
                      {invoice.rental.carName} {invoice.rental.category && `(${invoice.rental.category})`}
                    </div>
                    <div className="text-muted text-xs">
                      Package: {invoice.rental.planName} &bull; {invoice.rental.withChauffeur ? "Chauffeur Driven" : "Self-Drive"}
                    </div>
                  </td>
                  <td className="text-center font-monospace">{invoice.supplier.sacCode}</td>
                  <td className="text-center text-xs">
                    {formatIstDate(invoice.rental.startDate)}
                    <br />
                    to {formatIstDate(invoice.rental.endDate)}
                  </td>
                  <td className="text-end fw-bold font-monospace">
                    ₹{(invoice.financials.taxableAmount + (invoice.financials.discountAmount || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {invoice.financials.discountAmount > 0 && (
                  <tr className="table-danger-subtle">
                    <td className="text-center">&bull;</td>
                    <td colSpan={3} className="text-danger fw-semibold">
                      Promotional Discount {invoice.financials.couponCode && `(Promo Code: ${invoice.financials.couponCode})`}
                    </td>
                    <td className="text-end text-danger fw-bold font-monospace">
                      -₹{invoice.financials.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tax Calculation & Totals Summary */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <div className="p-3 rounded-3 bg-light border text-xs text-muted h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="fw-bold text-dark mb-1">Tax Exemption &amp; Deposit Note</div>
                  <p className="mb-2">
                    In compliance with Indian GST rules, refundable security deposits are advances held in trust and do not constitute consideration for supply. Deposits attract 0% GST liability.
                  </p>
                  <p className="mb-0">
                    Jurisdiction: Courts of New Delhi, India. All rentals are subject to PrimeRides standard vehicle handover terms.
                  </p>
                </div>
                <div className="pt-2 border-top mt-3 text-2xs">
                  24/7 Concierge: {invoice.supplier.phone} &bull; {invoice.supplier.email}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="border rounded-3 overflow-hidden text-xs">
                <div className="d-flex justify-content-between p-2.5 bg-light border-bottom">
                  <span className="text-muted">Net Taxable Rental Value:</span>
                  <span className="fw-bold text-dark font-monospace">
                    ₹{invoice.financials.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {invoice.financials.isInterState ? (
                  <div className="d-flex justify-content-between p-2.5 border-bottom">
                    <span className="text-muted">Integrated GST (IGST @ {invoice.financials.igstRate}%):</span>
                    <span className="fw-semibold text-dark font-monospace">
                      ₹{invoice.financials.igstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="d-flex justify-content-between p-2.5 border-bottom">
                      <span className="text-muted">Central GST (CGST @ {invoice.financials.cgstRate}%):</span>
                      <span className="fw-semibold text-dark font-monospace">
                        ₹{invoice.financials.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between p-2.5 border-bottom">
                      <span className="text-muted">State GST (SGST @ {invoice.financials.sgstRate}%):</span>
                      <span className="fw-semibold text-dark font-monospace">
                        ₹{invoice.financials.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                )}

                <div className="d-flex justify-content-between p-2.5 bg-light border-bottom">
                  <span className="fw-bold text-dark">Total GST Output Tax ({invoice.financials.gstRate}%):</span>
                  <span className="fw-bold text-dark font-monospace">
                    ₹{invoice.financials.totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="d-flex justify-content-between p-2.5 border-bottom">
                  <span className="text-muted">Refundable Security Deposit (Exempt):</span>
                  <span className="fw-semibold text-dark font-monospace">
                    ₹{invoice.financials.securityDeposit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div
                  className="d-flex justify-content-between p-3 text-white fw-bold fs-6"
                  style={{ backgroundColor: "#0f172a" }}
                >
                  <span>Grand Total (GST &amp; Deposit Incl.):</span>
                  <span className="font-monospace" style={{ color: "#facc15" }}>
                    ₹{invoice.financials.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Settlement Stamp */}
          <div className="p-3 rounded-3 bg-emerald-50 border border-emerald-200 mb-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <span className="badge bg-emerald-600 text-white rounded-pill px-2.5 py-1 text-2xs fw-bold me-2">
                  PAYMENT SETTLED
                </span>
                <span className="small text-dark fw-semibold">
                  Ref: <span className="font-monospace">{invoice.payment?.transactionRef || invoice.bookingCode}</span>
                </span>
              </div>
              <div className="text-muted text-xs">
                Method: {invoice.payment?.method || "Online Razorpay / UPI"} &bull; Status: {(invoice.payment?.status || "successful").toUpperCase()}
              </div>
            </div>
          </div>

          {/* Statutory Attestation Footer */}
          <div className="border-top pt-3 text-center text-muted text-2xs">
            <div className="mb-1">
              This is a computer-generated tax invoice issued in accordance with Rule 46 of the Central Goods and Services Tax (CGST) Rules, 2017.
            </div>
            <div>
              {invoice.supplier.legalName} &bull; Reg Office: {invoice.supplier.address} &bull; GSTIN: {invoice.supplier.gstin}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
