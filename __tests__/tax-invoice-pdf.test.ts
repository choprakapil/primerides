import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { GET } from "@/app/api/v1/bookings/[id]/invoice/route";
import { generateTaxInvoicePdf, getInvoiceDataForBooking, TaxInvoiceData } from "@/server/invoicing/pdf";
import { createAccessToken } from "@/server/auth/jwt";
import { createBookingSafe } from "@/server/booking";

describe("Issue #16: Downloadable PDF Tax Invoices & Customer Invoicing Portal", () => {
  let superAdminToken: string;
  let customerUser: any;
  let customerToken: string;
  let otherCustomerUser: any;
  let otherCustomerToken: string;
  let testBooking: any;
  const createdBookingIds: number[] = [];

  beforeAll(async () => {
    // 1. Setup Admin Token
    let admin = await prisma.adminUser.findFirst({
      where: { role: "superadmin", is_active: true },
    });
    if (!admin) {
      admin = await prisma.adminUser.create({
        data: {
          username: `invoice_admin_${Date.now()}`,
          email: `invadmin_${Date.now()}@primerides.in`,
          password: "$2b$10$abcdefghijklmnopqrstuv",
          name: "Invoice Superadmin",
          role: "superadmin",
          is_active: true,
        },
      });
    }

    superAdminToken = await createAccessToken({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: "superadmin",
      type: "admin",
    });

    // 2. Setup Primary Customer
    customerUser = await prisma.customerUser.create({
      data: {
        phone: `+9198${Date.now().toString().slice(-8)}`,
        full_name: "Rahul Verma",
        email: `rahul_${Date.now()}@example.com`,
        password: "$2b$10$abcdefghijklmnopqrstuv",
        is_verified: true,
      },
    });

    customerToken = await createAccessToken({
      id: customerUser.id,
      phone: customerUser.phone,
      name: customerUser.full_name,
      email: customerUser.email,
      type: "customer",
    });

    // 3. Setup Second Customer (For unauthorized access testing)
    otherCustomerUser = await prisma.customerUser.create({
      data: {
        phone: `+9197${Date.now().toString().slice(-8)}`,
        full_name: "Sneha Patel",
        email: `sneha_${Date.now()}@example.com`,
        password: "$2b$10$abcdefghijklmnopqrstuv",
        is_verified: true,
      },
    });

    otherCustomerToken = await createAccessToken({
      id: otherCustomerUser.id,
      phone: otherCustomerUser.phone,
      name: otherCustomerUser.full_name,
      email: otherCustomerUser.email,
      type: "customer",
    });

    // 4. Create a confirmed booking with price snapshot
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: { where: { is_active: true } } },
    });

    if (!car || car.rental_plans.length === 0) {
      throw new Error("No available car found for test.");
    }

    const futureStart = new Date(Date.now() + 86400000 * 110);
    const futureEnd = new Date(Date.now() + 86400000 * 112);

    const bookingRes = await createBookingSafe({
      fullName: customerUser.full_name,
      phone: customerUser.phone,
      email: customerUser.email,
      customerId: customerUser.id,
      carId: car.id,
      rentalPlanId: car.rental_plans[0].id,
      startDate: futureStart,
      endDate: futureEnd,
      idempotencyKey: `inv-pdf-test-${Date.now()}`,
    });

    if (!bookingRes.success || !bookingRes.booking) {
      throw new Error("Failed to create test booking: " + bookingRes.error);
    }

    testBooking = bookingRes.booking;
    createdBookingIds.push(testBooking.id);

    // Record a successful payment row so invoice reflects paid status
    await prisma.payment.create({
      data: {
        booking_id: testBooking.id,
        amount: testBooking.total_amount,
        payment_method: "upi",
        status: "successful",
        transaction_ref: `pay_tx_${Date.now()}`,
      },
    });
  });

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await prisma.payment.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.bookingStatusHistory.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.priceSnapshot.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.booking.deleteMany({
        where: { id: { in: createdBookingIds } },
      });
    }

    if (customerUser) {
      await prisma.customerUser.delete({ where: { id: customerUser.id } }).catch(() => {});
    }
    if (otherCustomerUser) {
      await prisma.customerUser.delete({ where: { id: otherCustomerUser.id } }).catch(() => {});
    }
  });

  it("Test 1: PDF Generator produces valid binary PDF 1.4 with statutory GST Rule 46 requirements", () => {
    const mockData: TaxInvoiceData = {
      bookingCode: "PR/2627/000999",
      invoiceDate: new Date(),
      supplier: {
        legalName: "PrimeRides Mobility Solutions Private Limited",
        brandName: "PrimeRides",
        gstin: "07AABCP1234F1Z5",
        sacCode: "996601",
        address: "Indira Gandhi International Airport, Terminal 3 VIP Valet, New Delhi 110037",
        state: "07 - Delhi",
        phone: "+91 90453 01702",
        email: "support@primerides.in",
      },
      customer: {
        name: "Rahul Verma",
        phone: "+919876543210",
        email: "rahul@example.com",
      },
      rental: {
        carName: "BMW 5 Series",
        brand: "BMW",
        category: "Luxury Sedan",
        planName: "Unlimited KM Weekend",
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 2),
        pickupLocation: "IGI Airport T3 Valet",
        dropLocation: "IGI Airport T3 Valet",
      },
      financials: {
        taxableAmount: 10000,
        discountAmount: 1000,
        couponCode: "WELCOME10",
        gstRate: 18,
        cgstRate: 9,
        cgstAmount: 900,
        sgstRate: 9,
        sgstAmount: 900,
        igstRate: 0,
        igstAmount: 0,
        totalGst: 1800,
        securityDeposit: 5000,
        grandTotal: 16800,
        isInterState: false,
      },
      payment: {
        status: "successful",
        transactionRef: "pay_test_12345",
      },
    };

    const pdfBuffer = generateTaxInvoicePdf(mockData);

    // 1. Valid Buffer
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(1500);

    const pdfString = pdfBuffer.toString("binary");

    // 2. Standard PDF Header and EOF
    expect(pdfString.startsWith("%PDF-1.4")).toBe(true);
    expect(pdfString.includes("%%EOF")).toBe(true);

    // 3. Indian GST Rule 46 Statutory Compliance Checks
    expect(pdfString).toContain("TAX INVOICE");
    expect(pdfString).toContain("ORIGINAL FOR RECIPIENT");
    expect(pdfString).toContain("07AABCP1234F1Z5"); // GSTIN
    expect(pdfString).toContain("996601"); // SAC Code
    expect(pdfString).toContain("PR/2627/000999"); // Invoice Number
    expect(pdfString).toContain("PrimeRides Mobility Solutions Private Limited"); // Legal Supplier
    expect(pdfString).toContain("Rahul Verma"); // Customer
    expect(pdfString).toContain("BMW 5 Series"); // Vehicle
    expect(pdfString).toContain("Rule 46"); // Statutory Certification

    console.log(`✅ Pure PDF 1.4 Tax Invoice successfully compiled (${pdfBuffer.length} bytes)`);
  });

  it("Test 2: GET /api/v1/bookings/[id]/invoice rejects unauthenticated requests with 401", async () => {
    const unauthReq = new NextRequest(`http://localhost/api/v1/bookings/${testBooking.id}/invoice`);
    const res = await GET(unauthReq, { params: Promise.resolve({ id: String(testBooking.id) }) });
    expect(res.status).toBe(401);
  });

  it("Test 3: GET /api/v1/bookings/[id]/invoice rejects another customer attempting to access foreign booking with 403", async () => {
    const foreignReq = new NextRequest(`http://localhost/api/v1/bookings/${testBooking.id}/invoice`, {
      headers: { Authorization: `Bearer ${otherCustomerToken}` },
    });
    const res = await GET(foreignReq, { params: Promise.resolve({ id: String(testBooking.id) }) });
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain("do not have permission");
  });

  it("Test 4: Customer who owns the booking downloads official PDF invoice successfully", async () => {
    const ownerReq = new NextRequest(`http://localhost/api/v1/bookings/${testBooking.id}/invoice`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const res = await GET(ownerReq, { params: Promise.resolve({ id: String(testBooking.id) }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain("attachment; filename=");
    expect(res.headers.get("Content-Disposition")).toContain(".pdf");

    const arrayBuf = await res.arrayBuffer();
    const pdfBuf = Buffer.from(arrayBuf);
    expect(pdfBuf.length).toBeGreaterThan(1200);
    expect(pdfBuf.toString("binary").startsWith("%PDF-1.4")).toBe(true);

    console.log(`✅ Customer ${customerUser.full_name} successfully downloaded invoice PDF (${pdfBuf.length} bytes)`);
  });

  it("Test 5: Administrator accesses invoice as structured JSON via ?format=json", async () => {
    const adminJsonReq = new NextRequest(
      `http://localhost/api/v1/bookings/${testBooking.id}/invoice?format=json`,
      {
        headers: { Authorization: `Bearer ${superAdminToken}` },
      }
    );
    const res = await GET(adminJsonReq, { params: Promise.resolve({ id: String(testBooking.id) }) });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.bookingCode).toBe(testBooking.booking_code);
    expect(json.data.supplier.gstin).toBeDefined();
    expect(json.data.supplier.sacCode).toBe("996601");
    expect(json.data.customer.name).toBe(customerUser.full_name);
    expect(json.data.financials.taxableAmount).toBeGreaterThan(0);
    expect(json.data.financials.totalGst).toBeGreaterThan(0);

    console.log(`✅ Admin retrieved invoice JSON for ${json.data.bookingCode}: GSTIN ${json.data.supplier.gstin}`);
  });

  it("Test 6: Administrator downloads invoice as official PDF attachment", async () => {
    const adminPdfReq = new NextRequest(
      `http://localhost/api/v1/bookings/${testBooking.id}/invoice`,
      {
        headers: { Authorization: `Bearer ${superAdminToken}` },
      }
    );
    const res = await GET(adminPdfReq, { params: Promise.resolve({ id: String(testBooking.id) }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    const arrayBuf = await res.arrayBuffer();
    const pdfBuf = Buffer.from(arrayBuf);
    expect(pdfBuf.toString("binary")).toContain(testBooking.booking_code);

    console.log(`✅ Admin downloaded invoice PDF for ${testBooking.booking_code}`);
  });
});
