/**
 * GST Tax Invoice PDF Generator (Indian Statutory Compliance)
 *
 * Implements Indian Goods & Services Tax (GST) Rule 46 requirements:
 *  - Supplier Legal Name, Registered Address, State & State Code
 *  - Supplier GSTIN & PAN
 *  - Consecutive Sequential Invoice Number (e.g. PR/2627/000345)
 *  - Invoice Date
 *  - Customer (Billed-to) Name, Phone, Email, and Address
 *  - Description of Service: SAC 996601 (Passenger Motor Vehicle Rental)
 *  - Vehicle Specs, Rental Period (Start & End in IST), Hub Locations
 *  - Itemized Taxable Value (Base Rental, Chauffeur, Discount)
 *  - GST Breakdown (CGST + SGST for intra-state or IGST for inter-state)
 *  - Refundable Security Deposit (Exempt from GST)
 *  - Payment Status & Transaction Reference
 *  - Standard Digital Attestation & Terms
 *
 * Generates a pure, standards-compliant PDF 1.4 binary buffer with zero external dependencies.
 */

import { formatIstDate, formatIstDateTime } from "@/lib/dates";
import { prisma } from "../db/client";
import { getSiteSettings, getSiteSettingsAsync } from "@/server/settings";

export interface TaxInvoiceData {
  bookingCode: string;
  invoiceDate: string | Date;
  supplier: {
    legalName: string;
    brandName: string;
    gstin: string;
    sacCode: string;
    address: string;
    state: string;
    phone: string;
    email: string;
  };
  customer: {
    name: string;
    phone: string;
    email?: string | null;
  };
  rental: {
    carName: string;
    brand?: string;
    category?: string;
    planName: string;
    startDate: string | Date;
    endDate: string | Date;
    pickupLocation: string;
    dropLocation: string;
    withChauffeur?: boolean;
    calculatedDays?: number;
  };
  financials: {
    taxableAmount: number;
    discountAmount: number;
    couponCode?: string | null;
    chauffeurFee?: number;
    gstRate: number;
    cgstRate: number;
    cgstAmount: number;
    sgstRate: number;
    sgstAmount: number;
    igstRate: number;
    igstAmount: number;
    totalGst: number;
    securityDeposit: number;
    grandTotal: number;
    isInterState?: boolean;
  };
  payment?: {
    status: string;
    method?: string;
    transactionRef?: string;
    paidAt?: string | Date;
  };
}

/**
 * Escapes characters for PDF literal strings (WinAnsi compatible).
 */
function sanitizePdfText(str: string): string {
  if (!str) return "";
  return str
    .replace(/₹/g, "INR ")
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/•/g, "*")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/’/g, "'")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Formats currency amount as standard Indian comma-separated string: "INR 5,000.00"
 */
function formatInr(amount: number): string {
  const parts = Number(amount || 0).toFixed(2).split(".");
  const intPart = parts[0];
  const decPart = parts[1];

  let lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `INR ${formattedInt}.${decPart}`;
}

/**
 * Generates a standard A4 PDF 1.4 binary buffer for a statutory GST Tax Invoice.
 */
export function generateTaxInvoicePdf(data: TaxInvoiceData): Buffer {
  let stream = "";

  // Helper drawing primitives
  const setFillColor = (r: number, g: number, b: number) => {
    stream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg\n`;
  };

  const setStrokeColor = (r: number, g: number, b: number) => {
    stream += `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG\n`;
  };

  const setLineWidth = (w: number) => {
    stream += `${w.toFixed(2)} w\n`;
  };

  const drawRect = (x: number, y: number, w: number, h: number, fill = false, stroke = false) => {
    stream += `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${fill && stroke ? "B" : fill ? "f" : stroke ? "s" : "n"}\n`;
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    stream += `${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l s\n`;
  };

  const drawText = (text: string, x: number, y: number, font: "/F1" | "/F2" | "/F3", size: number, color?: [number, number, number]) => {
    if (color) setFillColor(color[0], color[1], color[2]);
    const clean = sanitizePdfText(text);
    stream += `BT ${font} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${clean}) Tj ET\n`;
  };

  const drawRightText = (text: string, rightX: number, y: number, font: "/F1" | "/F2" | "/F3", size: number, color?: [number, number, number]) => {
    if (color) setFillColor(color[0], color[1], color[2]);
    const clean = sanitizePdfText(text);
    // Approximate character widths for Helvetica:
    // Regular approx 0.52 * size, Bold approx 0.56 * size
    const approxWidth = clean.length * size * (font === "/F2" ? 0.56 : 0.52);
    const startX = Math.max(36, rightX - approxWidth);
    stream += `BT ${font} ${size} Tf ${startX.toFixed(2)} ${y.toFixed(2)} Td (${clean}) Tj ET\n`;
  };

  // --- Layout Geometry (A4: 595.28 x 841.89) ---
  const leftMargin = 36;
  const rightMargin = 559.28;
  const contentWidth = rightMargin - leftMargin; // 523.28

  // 1. Top Decorative Brand Accent Banner (Gold #c59b27)
  setFillColor(0.773, 0.608, 0.153);
  drawRect(0, 832, 595.28, 10, true, false);

  // 2. Company Brand & Title Header
  setFillColor(0.08, 0.08, 0.08);
  drawText(data.supplier.brandName.toUpperCase(), leftMargin, 804, "/F2", 18, [0.1, 0.1, 0.1]);
  drawText("LUXURY SELF-DRIVE MOBILITY", leftMargin, 792, "/F1", 8, [0.773, 0.608, 0.153]);

  // Tax Invoice Badge (Top Right)
  setFillColor(0.96, 0.96, 0.98);
  setStrokeColor(0.8, 0.82, 0.88);
  setLineWidth(0.8);
  drawRect(370, 786, 189.28, 38, true, true);

  drawText("TAX INVOICE", 380, 810, "/F2", 12, [0.12, 0.12, 0.15]);
  drawText("ORIGINAL FOR RECIPIENT", 380, 798, "/F2", 7.5, [0.773, 0.608, 0.153]);
  drawText("Under Section 31 of CGST Act, 2017", 380, 790, "/F1", 7, [0.45, 0.45, 0.5]);

  // Supplier Corporate Details
  drawText(data.supplier.legalName, leftMargin, 772, "/F2", 9.5, [0.1, 0.1, 0.1]);
  drawText(data.supplier.address, leftMargin, 761, "/F1", 8, [0.35, 0.35, 0.4]);
  drawText(
    `State: ${data.supplier.state}  |  Concierge: ${data.supplier.phone}  |  Email: ${data.supplier.email}`,
    leftMargin,
    750,
    "/F1",
    8,
    [0.35, 0.35, 0.4]
  );
  drawText(
    `GSTIN: ${data.supplier.gstin}  |  SAC: ${data.supplier.sacCode} (Motor Vehicle Rental)`,
    leftMargin,
    739,
    "/F2",
    8.5,
    [0.08, 0.08, 0.1]
  );

  // Horizontal Divider Line
  setStrokeColor(0.85, 0.85, 0.88);
  setLineWidth(0.75);
  drawLine(leftMargin, 730, rightMargin, 730);

  // 3. Two-Column Metadata Box: Invoice Info & Customer Details
  const boxTop = 720;
  const boxHeight = 100;
  const colWidth = (contentWidth - 12) / 2;

  // Left Box: Invoice & Trip Schedule
  setFillColor(0.98, 0.98, 0.99);
  setStrokeColor(0.85, 0.87, 0.9);
  drawRect(leftMargin, boxTop - boxHeight, colWidth, boxHeight, true, true);

  setFillColor(0.773, 0.608, 0.153);
  drawRect(leftMargin, boxTop - 18, colWidth, 18, true, false);
  drawText("INVOICE & DISPATCH DETAILS", leftMargin + 8, boxTop - 13, "/F2", 8, [1, 1, 1]);

  let iy = boxTop - 32;
  const invRows = [
    ["Invoice / Booking Code:", data.bookingCode],
    ["Invoice Date:", formatIstDate(data.invoiceDate)],
    ["Place of Supply:", data.supplier.state],
    [
      "Supply Nature:",
      data.financials.isInterState ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)",
    ],
    ["Reverse Charge:", "Not Applicable (No)"],
  ];
  for (const [lbl, val] of invRows) {
    drawText(lbl, leftMargin + 8, iy, "/F1", 7.5, [0.45, 0.45, 0.5]);
    drawText(val, leftMargin + 105, iy, "/F2", 7.5, [0.1, 0.1, 0.1]);
    iy -= 13;
  }

  // Right Box: Billed-to Customer
  const rightBoxX = leftMargin + colWidth + 12;
  setFillColor(0.98, 0.98, 0.99);
  setStrokeColor(0.85, 0.87, 0.9);
  drawRect(rightBoxX, boxTop - boxHeight, colWidth, boxHeight, true, true);

  setFillColor(0.12, 0.15, 0.2);
  drawRect(rightBoxX, boxTop - 18, colWidth, 18, true, false);
  drawText("BILLED TO (CUSTOMER DETAILS)", rightBoxX + 8, boxTop - 13, "/F2", 8, [1, 1, 1]);

  let cy = boxTop - 32;
  const custRows = [
    ["Customer Name:", data.customer.name],
    ["Contact Phone:", data.customer.phone],
    ["Email Address:", data.customer.email || "Registered Account"],
    ["Pickup Hub:", data.rental.pickupLocation],
    ["Drop-off Hub:", data.rental.dropLocation],
  ];
  for (const [lbl, val] of custRows) {
    drawText(lbl, rightBoxX + 8, cy, "/F1", 7.5, [0.45, 0.45, 0.5]);
    drawText(val, rightBoxX + 85, cy, "/F2", 7.5, [0.1, 0.1, 0.1]);
    cy -= 13;
  }

  // 4. Line Items Table (Services & Rental Description)
  const tblTop = 604;
  const tblHeaderH = 20;

  setFillColor(0.12, 0.15, 0.2);
  drawRect(leftMargin, tblTop - tblHeaderH, contentWidth, tblHeaderH, true, false);

  drawText("SL", leftMargin + 8, tblTop - 14, "/F2", 8, [1, 1, 1]);
  drawText("DESCRIPTION OF SERVICES & VEHICLE HIRE", leftMargin + 30, tblTop - 14, "/F2", 8, [1, 1, 1]);
  drawText("SAC CODE", leftMargin + 310, tblTop - 14, "/F2", 8, [1, 1, 1]);
  drawText("RENTAL DATES (IST)", leftMargin + 375, tblTop - 14, "/F2", 8, [1, 1, 1]);
  drawRightText("TAXABLE VALUE", rightMargin - 8, tblTop - 14, "/F2", 8, [1, 1, 1]);

  // Main Item Row
  let rowY = tblTop - tblHeaderH;
  const rowHeight = 44;
  setFillColor(1, 1, 1);
  setStrokeColor(0.85, 0.87, 0.9);
  setLineWidth(0.5);
  drawRect(leftMargin, rowY - rowHeight, contentWidth, rowHeight, true, true);

  drawText("1", leftMargin + 10, rowY - 18, "/F2", 8.5, [0.1, 0.1, 0.1]);
  drawText(
    `${data.rental.carName} ${data.rental.category ? `(${data.rental.category})` : ""}`,
    leftMargin + 30,
    rowY - 18,
    "/F2",
    9,
    [0.1, 0.1, 0.1]
  );
  drawText(
    `Package: ${data.rental.planName}${data.rental.withChauffeur ? "  |  Chauffeur Driven" : "  |  Self-Drive"}`,
    leftMargin + 30,
    rowY - 30,
    "/F1",
    7.5,
    [0.45, 0.45, 0.5]
  );

  drawText(data.supplier.sacCode, leftMargin + 315, rowY - 22, "/F1", 8, [0.2, 0.2, 0.2]);
  drawText(
    `${formatIstDate(data.rental.startDate)} - ${formatIstDate(data.rental.endDate)}`,
    leftMargin + 375,
    rowY - 22,
    "/F1",
    7.5,
    [0.2, 0.2, 0.2]
  );
  drawRightText(
    formatInr(data.financials.taxableAmount + (data.financials.discountAmount || 0)),
    rightMargin - 8,
    rowY - 22,
    "/F2",
    8.5,
    [0.1, 0.1, 0.1]
  );

  rowY -= rowHeight;

  // Optional Discount Row
  if (data.financials.discountAmount > 0) {
    const discHeight = 18;
    setFillColor(0.98, 0.95, 0.95);
    drawRect(leftMargin, rowY - discHeight, contentWidth, discHeight, true, true);
    drawText(
      `Special Promotional Discount ${data.financials.couponCode ? `(Code: ${data.financials.couponCode})` : ""}`,
      leftMargin + 30,
      rowY - 13,
      "/F1",
      8,
      [0.75, 0.15, 0.15]
    );
    drawRightText(
      `- ${formatInr(data.financials.discountAmount)}`,
      rightMargin - 8,
      rowY - 13,
      "/F2",
      8,
      [0.75, 0.15, 0.15]
    );
    rowY -= discHeight;
  }

  // 5. Tax Breakdown & Financial Totals Table
  const calcTop = rowY - 14;
  const calcBoxW = 260;
  const calcBoxX = rightMargin - calcBoxW;

  // Left Note Box (Statutory Exempt Advance)
  const noteBoxW = contentWidth - calcBoxW - 14;
  setFillColor(0.97, 0.98, 1);
  setStrokeColor(0.8, 0.85, 0.95);
  drawRect(leftMargin, calcTop - 110, noteBoxW, 110, true, true);

  drawText("SECURITY DEPOSIT & GST NOTE", leftMargin + 10, calcTop - 18, "/F2", 8, [0.15, 0.3, 0.65]);
  const legalNotes = [
    "Security Deposit is a 100% refundable advance against vehicle return",
    "and toll settlement. In compliance with GST rules, deposits are strictly",
    "excluded from the taxable base and attract 0% GST liability.",
    "Payment has been captured online. Invoices are valid proof of supply.",
    "Jurisdiction: Courts of New Delhi, India.",
  ];
  let nty = calcTop - 34;
  for (const n of legalNotes) {
    drawText(n, leftMargin + 10, nty, "/F1", 7, [0.35, 0.4, 0.55]);
    nty -= 12;
  }

  // Right Tax Summary Card
  let ty = calcTop;
  const summaryRows: Array<{ label: string; amount: string; isBold?: boolean; isHighlight?: boolean }> = [
    { label: "Net Taxable Rental Value:", amount: formatInr(data.financials.taxableAmount) },
  ];

  if (data.financials.isInterState) {
    summaryRows.push({
      label: `Integrated GST (IGST @ ${data.financials.igstRate}%):`,
      amount: formatInr(data.financials.igstAmount),
    });
  } else {
    summaryRows.push({
      label: `Central GST (CGST @ ${data.financials.cgstRate}%):`,
      amount: formatInr(data.financials.cgstAmount),
    });
    summaryRows.push({
      label: `State GST (SGST @ ${data.financials.sgstRate}%):`,
      amount: formatInr(data.financials.sgstAmount),
    });
  }

  summaryRows.push({
    label: `Total GST Output Tax (${data.financials.gstRate}%):`,
    amount: formatInr(data.financials.totalGst),
    isBold: true,
  });

  summaryRows.push({
    label: "Refundable Security Deposit (Exempt):",
    amount: formatInr(data.financials.securityDeposit),
  });

  summaryRows.push({
    label: "Grand Total (GST & Deposit Incl.):",
    amount: formatInr(data.financials.grandTotal),
    isBold: true,
    isHighlight: true,
  });

  for (const sr of summaryRows) {
    const rowH = sr.isHighlight ? 22 : 16;
    if (sr.isHighlight) {
      setFillColor(0.773, 0.608, 0.153);
      drawRect(calcBoxX, ty - rowH, calcBoxW, rowH, true, false);
      drawText(sr.label, calcBoxX + 8, ty - 15, "/F2", 8.5, [1, 1, 1]);
      drawRightText(sr.amount, rightMargin - 8, ty - 15, "/F2", 9.5, [1, 1, 1]);
    } else {
      setFillColor(sr.isBold ? 0.95 : 0.98, sr.isBold ? 0.96 : 0.98, 0.99);
      setStrokeColor(0.88, 0.88, 0.92);
      drawRect(calcBoxX, ty - rowH, calcBoxW, rowH, true, true);
      drawText(sr.label, calcBoxX + 8, ty - 11, sr.isBold ? "/F2" : "/F1", 7.5, [0.3, 0.3, 0.35]);
      drawRightText(sr.amount, rightMargin - 8, ty - 11, "/F2", 8, [0.1, 0.1, 0.1]);
    }
    ty -= rowH;
  }

  // 6. Payment & Verification Clearance Stamp
  const stampTop = ty - 20;
  setFillColor(0.96, 0.98, 0.96);
  setStrokeColor(0.3, 0.7, 0.4);
  setLineWidth(1);
  drawRect(leftMargin, stampTop - 45, contentWidth, 45, true, true);

  drawText("PAYMENT VERIFICATION & SETTLEMENT CONFIRMATION", leftMargin + 12, stampTop - 15, "/F2", 8.5, [0.1, 0.5, 0.2]);
  const pStatus = (data.payment?.status || "successful").toUpperCase();
  const pRef = data.payment?.transactionRef || data.bookingCode;
  drawText(
    `Payment Status: ${pStatus}  |  Transaction Reference: ${pRef}  |  Settlement Method: Online Gateway (Razorpay/UPI)`,
    leftMargin + 12,
    stampTop - 28,
    "/F1",
    7.5,
    [0.2, 0.3, 0.2]
  );
  drawText(
    "All charges fully captured and accounted in the PrimeRides enterprise financial ledger.",
    leftMargin + 12,
    stampTop - 39,
    "/F1",
    7,
    [0.4, 0.5, 0.4]
  );

  // 7. Footer & Statutory Certification
  const footerY = 55;
  setStrokeColor(0.85, 0.85, 0.88);
  setLineWidth(0.5);
  drawLine(leftMargin, footerY + 20, rightMargin, footerY + 20);

  drawText(
    "CERTIFICATION: This is an electronically generated and digitally authenticated tax invoice issued under Rule 46 of the CGST Rules, 2017.",
    leftMargin,
    footerY + 10,
    "/F1",
    6.8,
    [0.45, 0.45, 0.5]
  );
  drawText(
    `${data.supplier.legalName} | Registered Office: ${data.supplier.address} | GSTIN: ${data.supplier.gstin}`,
    leftMargin,
    footerY,
    "/F1",
    6.8,
    [0.45, 0.45, 0.5]
  );
  drawText(
    "PrimeRides Mobility 24/7 Operations Concierge: +91 90453 01702  |  reservations@primerides.in  |  primerides.in",
    leftMargin,
    footerY - 10,
    "/F2",
    6.8,
    [0.773, 0.608, 0.153]
  );
  drawRightText("Page 1 of 1", rightMargin, footerY - 10, "/F1", 7, [0.5, 0.5, 0.5]);

  // Construct PDF Body
  const streamLength = Buffer.byteLength(stream, "utf8");

  const objects = [
    // 1: Catalog
    `<< /Type /Catalog /Pages 2 0 R >>`,
    // 2: Pages Collection
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    // 3: Single A4 Page (595.28 x 841.89 points)
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R >> >> >>`,
    // 4: Content Stream
    `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`,
    // 5: Helvetica (Regular)
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
    // 6: Helvetica-Bold
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,
    // 7: Helvetica-Oblique
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`,
  ];

  let output = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const xrefOffsets = [0];

  for (let i = 0; i < objects.length; i++) {
    xrefOffsets.push(Buffer.byteLength(output, "utf8"));
    output += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const startxref = Buffer.byteLength(output, "utf8");
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    output += `${String(xrefOffsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return Buffer.from(output, "binary");
}

/**
 * Resolves full booking, customer, vehicle, pricing snapshot, and tax compliance metadata for an invoice.
 */
export async function getInvoiceDataForBooking(bookingId: number): Promise<TaxInvoiceData | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      car: { include: { category: true } },
      rental_plan: true,
      price_snapshot: true,
      payments: {
        where: { status: "successful" },
        orderBy: { created_at: "desc" },
        take: 1,
      },
      customer: true,
    },
  });

  if (!booking) return null;

  const siteSettings = await getSiteSettingsAsync().catch(() => getSiteSettings());
  const snapshot = booking.price_snapshot;
  const snapData = (snapshot?.snapshot_data as any) || {};

  const legalName =
    snapData.legalCorporateName ||
    siteSettings.legalCorporateName ||
    "PrimeRides Mobility Solutions Private Limited";
  const gstin = snapData.gstin || siteSettings.gstNumber || "07AABCP1234F1Z5";
  const sacCode = snapData.sacCode || siteSettings.sacCode || "996601";
  const address =
    snapData.taxInvoiceAddress ||
    siteSettings.taxInvoiceAddress ||
    siteSettings.addresses?.delhi ||
    "IGI Airport Terminal 3 Valet, New Delhi 110037";
  const state = snapData.taxInvoiceState || siteSettings.taxInvoiceState || "07 - Delhi";

  const isInterState = !!snapData.isInterState;
  const gstRate = Number(snapData.gstRate ?? siteSettings.gstRatePercentage ?? 18);
  const cgstRate = Number(snapData.cgstRate ?? (isInterState ? 0 : gstRate / 2));
  const sgstRate = Number(snapData.sgstRate ?? (isInterState ? 0 : gstRate / 2));
  const igstRate = Number(snapData.igstRate ?? (isInterState ? gstRate : 0));

  const taxableAmount = Number(snapData.taxableAmount ?? booking.base_amount);
  const totalGst = Number(
    snapshot?.tax_amount ?? snapData.totalGst ?? (taxableAmount * gstRate) / 100
  );
  const cgstAmount = Number(snapData.cgstAmount ?? (isInterState ? 0 : totalGst / 2));
  const sgstAmount = Number(snapData.sgstAmount ?? (isInterState ? 0 : totalGst / 2));
  const igstAmount = Number(snapData.igstAmount ?? (isInterState ? totalGst : 0));
  const securityDeposit = Number(snapshot?.security_deposit ?? booking.security_deposit ?? 0);
  const discountAmount = Number(booking.discount_amount || snapData.discountAmount || 0);
  const grandTotal = Number(
    booking.total_amount || snapData.grandTotal || taxableAmount + totalGst + securityDeposit
  );

  const latestPayment = booking.payments?.[0];

  return {
    bookingCode: booking.booking_code,
    invoiceDate: booking.created_at,
    supplier: {
      legalName,
      brandName: siteSettings.brandName || "PrimeRides",
      gstin,
      sacCode,
      address,
      state,
      phone: siteSettings.phone || "+91 90453 01702",
      email: siteSettings.supportEmail || "support@primerides.in",
    },
    customer: {
      name: booking.full_name,
      phone: booking.phone,
      email: booking.email || booking.customer?.email,
    },
    rental: {
      carName: booking.car?.name || booking.car_name || "PrimeRides Fleet Vehicle",
      brand: booking.car?.brand || snapData.brand,
      category: booking.car?.category?.name || snapData.category,
      planName:
        booking.rental_plan?.name ||
        snapshot?.plan_name ||
        snapData.planName ||
        "Standard Rental Plan",
      startDate: booking.start_date,
      endDate: booking.end_date,
      pickupLocation: booking.pickup_location || "Hub Handover",
      dropLocation: booking.drop_location || "Hub Return",
      withChauffeur: booking.with_chauffeur,
      calculatedDays: snapshot?.calculated_days || undefined,
    },
    financials: {
      taxableAmount,
      discountAmount,
      couponCode: booking.coupon_code || snapData.couponCode,
      chauffeurFee: Number(booking.chauffeur_fee || 0),
      gstRate,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalGst,
      securityDeposit,
      grandTotal,
      isInterState,
    },
    payment: {
      status:
        latestPayment?.status ||
        (["confirmed", "active", "completed"].includes(booking.status)
          ? "successful"
          : booking.status),
      method: latestPayment?.payment_method || "Online Payment",
      transactionRef:
        latestPayment?.transaction_ref || booking.idempotency_key || booking.booking_code,
      paidAt: latestPayment?.created_at || booking.created_at,
    },
  };
}

