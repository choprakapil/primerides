import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { GET, PUT } from "@/app/api/v1/admin/settings/route";
import { createAccessToken } from "@/server/auth/jwt";
import { createBookingSafe } from "@/server/booking";
import { getSiteSettings, saveSiteSettings } from "@/server/settings";

describe("Issue #15: Configurable GSTIN & Tax Settings in Admin", () => {
  let superAdminToken: string;
  let limitedAdminToken: string;
  let testAdminUser: any;
  let testLimitedUser: any;
  const createdBookingIds: number[] = [];
  const initialSettings = getSiteSettings();

  beforeAll(async () => {
    // 1. Ensure a superadmin exists for testing
    testAdminUser = await prisma.adminUser.findFirst({
      where: { role: "superadmin", is_active: true },
    });

    if (!testAdminUser) {
      testAdminUser = await prisma.adminUser.create({
        data: {
          username: `tax_admin_${Date.now()}`,
          email: `taxadmin_${Date.now()}@primerides.in`,
          password: "$2b$10$abcdefghijklmnopqrstuv",
          name: "Tax Compliance Admin",
          role: "superadmin",
          is_active: true,
        },
      });
    }

    superAdminToken = await createAccessToken({
      id: testAdminUser.id,
      username: testAdminUser.username,
      email: testAdminUser.email,
      name: testAdminUser.name,
      role: "superadmin",
      type: "admin",
    });

    // 2. Limited staff admin without admins.manage permission
    testLimitedUser = await prisma.adminUser.findFirst({
      where: { role: "viewer", is_active: true },
    });

    if (!testLimitedUser) {
      testLimitedUser = await prisma.adminUser.create({
        data: {
          username: `staff_viewer_${Date.now()}`,
          email: `staffviewer_${Date.now()}@primerides.in`,
          password: "$2b$10$abcdefghijklmnopqrstuv",
          name: "Staff Viewer",
          role: "viewer",
          permissions: JSON.stringify(["bookings.view"]),
          is_active: true,
        },
      });
    }

    limitedAdminToken = await createAccessToken({
      id: testLimitedUser.id,
      username: testLimitedUser.username,
      email: testLimitedUser.email,
      name: testLimitedUser.name,
      role: "viewer",
      type: "admin",
    });
  });

  afterAll(async () => {
    // Restore original settings
    saveSiteSettings(initialSettings);

    // Clean up test bookings
    if (createdBookingIds.length > 0) {
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
  });

  it("Test 1: GET and PUT /api/v1/admin/settings reject unauthenticated calls with 401", async () => {
    const unauthGetReq = new NextRequest("http://localhost/api/v1/admin/settings");
    const getRes = await GET(unauthGetReq);
    expect(getRes.status).toBe(401);

    const unauthPutReq = new NextRequest("http://localhost/api/v1/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ gstRatePercentage: 18 }),
    });
    const putRes = await PUT(unauthPutReq);
    expect(putRes.status).toBe(401);
  });

  it("Test 2: PUT /api/v1/admin/settings rejects staff without admins.manage permission with 403", async () => {
    const forbiddenReq = new NextRequest("http://localhost/api/v1/admin/settings", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${limitedAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gstRatePercentage: 18 }),
    });

    const res = await PUT(forbiddenReq);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain("Insufficient permission");
  });

  it("Test 3: Validation guards reject invalid tax rates and invalid GSTIN formats", async () => {
    // A. Rate > 100
    const invalidRateReq = new NextRequest("http://localhost/api/v1/admin/settings", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gstRatePercentage: 125 }),
    });
    const rateRes = await PUT(invalidRateReq);
    expect(rateRes.status).toBe(400);
    const rateJson = await rateRes.json();
    expect(rateJson.error).toContain("between 0 and 100");

    // B. Negative rate
    const negativeRateReq = new NextRequest("http://localhost/api/v1/admin/settings", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gstRatePercentage: -5 }),
    });
    const negRes = await PUT(negativeRateReq);
    expect(negRes.status).toBe(400);

    // C. Too short GSTIN
    const shortGstinReq = new NextRequest("http://localhost/api/v1/admin/settings", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gstNumber: "123" }),
    });
    const gstinRes = await PUT(shortGstinReq);
    expect(gstinRes.status).toBe(400);
    const gstinJson = await gstinRes.json();
    expect(gstinJson.error).toContain("at least 10 characters");
  });

  it("Test 4: Admin updates legal corporate name, GSTIN, SAC code, and 12% GST rate via API", async () => {
    const updateReq = new NextRequest("http://localhost/api/v1/admin/settings", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        legalCorporateName: "PrimeRides Luxury Mobility Private Limited",
        gstNumber: "07TESTGSTIN9999",
        sacCode: "996602",
        gstRatePercentage: 12,
        cgstRatePercentage: 6,
        sgstRatePercentage: 6,
        igstRatePercentage: 12,
        taxInvoiceAddress: "Aerocity Terminal 3 Hospitality Hub, New Delhi 110037",
        taxInvoiceState: "07 - Delhi",
      }),
    });

    const updateRes = await PUT(updateReq);
    expect(updateRes.status).toBe(200);
    const updateJson = await updateRes.json();
    expect(updateJson.success).toBe(true);
    expect(updateJson.data.gstRatePercentage).toBe(12);
    expect(updateJson.data.gstNumber).toBe("07TESTGSTIN9999");
    expect(updateJson.data.legalCorporateName).toBe("PrimeRides Luxury Mobility Private Limited");

    // Verify GET returns configured settings
    const getReq = new NextRequest("http://localhost/api/v1/admin/settings", {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.data.gstRatePercentage).toBe(12);
    expect(getJson.data.legalCorporateName).toBe("PrimeRides Luxury Mobility Private Limited");
    expect(getJson.data.sacCode).toBe("996602");
  });

  it("Test 5: Live booking dynamically applies configured 12% GST and records full tax snapshot data", async () => {
    const car = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: { where: { is_active: true } } },
    });

    if (!car || car.rental_plans.length === 0) {
      console.warn("No available car with plans found, skipping booking test");
      return;
    }

    const futureStart = new Date(Date.now() + 86400000 * 95);
    const futureEnd = new Date(Date.now() + 86400000 * 97);

    const bookingResult = await createBookingSafe({
      fullName: "Configurable Tax Test Customer",
      phone: "+919111122223",
      carId: car.id,
      rentalPlanId: car.rental_plans[0].id,
      startDate: futureStart,
      endDate: futureEnd,
      idempotencyKey: `tax-cfg-${Date.now()}`,
    });

    expect(bookingResult.success).toBe(true);
    const bookingId = bookingResult.booking!.id;
    createdBookingIds.push(bookingId);

    // Fetch the price snapshot
    const snapshot = await prisma.priceSnapshot.findUnique({
      where: { booking_id: bookingId },
    });

    expect(snapshot).toBeDefined();
    const data = snapshot!.snapshot_data as any;

    const planPrice = Number(car.rental_plans[0].price);
    const expectedGstAt12Percent = Math.round(planPrice * 12) / 100;
    const actualTaxAmount = Number(snapshot!.tax_amount);

    // Verify tax_amount matches configured 12% GST
    expect(actualTaxAmount).toBe(expectedGstAt12Percent);

    // Verify snapshot_data has all configured tax metadata
    expect(data.gstRate).toBe(12);
    expect(data.cgstRate).toBe(6);
    expect(data.sgstRate).toBe(6);
    expect(data.gstin).toBe("07TESTGSTIN9999");
    expect(data.sacCode).toBe("996602");
    expect(data.legalCorporateName).toBe("PrimeRides Luxury Mobility Private Limited");
    expect(data.taxInvoiceAddress).toBe("Aerocity Terminal 3 Hospitality Hub, New Delhi 110037");
    expect(data.taxInvoiceState).toBe("07 - Delhi");

    // Split check: CGST + SGST = totalGst
    expect(data.cgstAmount + data.sgstAmount).toBe(actualTaxAmount);

    console.log(
      `✅ Configured 12% GST successfully applied: Plan ₹${planPrice} → GST ₹${actualTaxAmount} (CGST ₹${data.cgstAmount} + SGST ₹${data.sgstAmount}), Entity: "${data.legalCorporateName}", GSTIN: ${data.gstin}`
    );
  });
});
