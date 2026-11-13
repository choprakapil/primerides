import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { POST as createAdminBooking } from "@/app/api/v1/admin/bookings/route";
import { NextRequest } from "next/server";
import { createAccessToken } from "@/server/auth/jwt";
import { createBookingSafe } from "@/server/booking";
import { getFleetCarsWithAvailability } from "@/server/fleet";

describe("Walk-In / Office Counter Booking System", () => {
  const createdBookingIds: number[] = [];
  const createdCustomerIds: number[] = [];
  const createdCarIds: number[] = [];
  let authHeader: string;
  let testCar: any;
  let testAdmin: any;

  beforeAll(async () => {
    // 1. Locate active admin user
    testAdmin = await prisma.adminUser.findFirst({
      where: { deleted_at: null, is_active: true },
    });
    expect(testAdmin).toBeDefined();

    const token = await createAccessToken({
      id: testAdmin!.id,
      username: testAdmin!.username,
      type: "admin",
      role: testAdmin!.role,
    });
    authHeader = `Bearer ${token}`;

    // 2. Fetch a test car with rental plans
    testCar = await prisma.car.findFirst({
      where: { is_available: true, deleted_at: null },
      include: { rental_plans: true, location: true },
    });
    expect(testCar).toBeDefined();
    expect(testCar.rental_plans.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await prisma.payment.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.priceSnapshot.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.bookingStatusHistory.deleteMany({
        where: { booking_id: { in: createdBookingIds } },
      });
      await prisma.auditLog.deleteMany({
        where: { entity: "Booking", entity_id: { in: createdBookingIds } },
      });
      await prisma.booking.deleteMany({
        where: { id: { in: createdBookingIds } },
      });
    }

    if (createdCustomerIds.length > 0) {
      await prisma.identityDocument.deleteMany({
        where: { customer_id: { in: createdCustomerIds } },
      });
      await prisma.customerUser.deleteMany({
        where: { id: { in: createdCustomerIds } },
      });
    }

    if (createdCarIds.length > 0) {
      await prisma.rentalPlan.deleteMany({
        where: { car_id: { in: createdCarIds } },
      });
      await prisma.car.deleteMany({
        where: { id: { in: createdCarIds } },
      });
    }
  });

  it("Test 1: Rejects unauthenticated walk-in booking creation", async () => {
    const fakeReq = new NextRequest("http://localhost:3000/api/v1/admin/bookings", {
      method: "POST",
      body: JSON.stringify({
        fullName: "Walkin Guest",
        phone: "+919999900001",
      }),
    });

    const res = await createAdminBooking(fakeReq);
    expect(res.status).toBe(401);
  });

  it("Test 2: Rejects incomplete payload with 400 Bad Request", async () => {
    const fakeReq = new NextRequest("http://localhost:3000/api/v1/admin/bookings", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Incomplete Guest",
        // missing phone, carId, dates
      }),
    });

    const res = await createAdminBooking(fakeReq);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("required");
  });

  it("Test 3: Creates walk-in booking with counter payment and in-person DL verification", async () => {
    const testPhone = `+919811${Date.now().toString().slice(-6)}`;
    const startDate = new Date(Date.now() + 86400000 * 40).toISOString();
    const endDate = new Date(Date.now() + 86400000 * 42).toISOString();
    const testDlNumber = `DL-04${Date.now().toString().slice(-8)}`;

    const fakeReq = new NextRequest("http://localhost:3000/api/v1/admin/bookings", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Rohan Verma",
        phone: testPhone,
        email: "rohan.verma@example.com",
        carId: testCar.id,
        rentalPlanId: testCar.rental_plans[0].id,
        locationId: testCar.location_id || undefined,
        startDate,
        endDate,
        pickupLocation: "Connaught Place Office Hub",
        dropLocation: "Connaught Place Office Hub",
        withChauffeur: false,
        drivingLicenseNumber: testDlNumber,
        verifyDlInPerson: true,
        notes: "In-person walk-in customer booking at counter",
        status: "confirmed",
        initialPayment: {
          amount: 5000,
          method: "cash",
          reference: `CASH-REC-${Date.now().toString().slice(-6)}`,
        },
      }),
    });

    const res = await createAdminBooking(fakeReq);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();

    const booking = data.data;
    createdBookingIds.push(booking.id);
    if (booking.customer_id) {
      createdCustomerIds.push(booking.customer_id);
    }

    // 1. Sequential Booking Code generated
    expect(booking.booking_code).toMatch(/^PR\/[0-9]{4}\/[0-9]{6}$/);
    expect(booking.full_name).toBe("Rohan Verma");
    expect(booking.phone).toBe(testPhone);
    expect(booking.status).toBe("confirmed");

    // 2. Initial payment record saved and captured
    expect(booking.payments).toBeDefined();
    expect(booking.payments.length).toBe(1);
    expect(Number(booking.payments[0].amount)).toBe(5000);
    expect(booking.payments[0].payment_method).toBe("cash");
    expect(booking.payments[0].status).toBe("captured");

    // 3. In-Person DL verified record created
    expect(booking.hasVerifiedDL).toBe(true);
    const dlDoc = await prisma.identityDocument.findFirst({
      where: {
        customer_id: booking.customer_id,
        status: "verified",
      },
    });
    expect(dlDoc).toBeDefined();
    expect(dlDoc?.file_name).toContain(testDlNumber);

    // 4. Audit Log created for action BOOKING_CREATE_WALKIN
    const auditLog = await prisma.auditLog.findFirst({
      where: {
        action: "BOOKING_CREATE_WALKIN",
        entity_id: booking.id,
      },
    });
    expect(auditLog).toBeDefined();
    expect(auditLog?.actor_id).toBe(testAdmin.id);
  });

  it("Test 4: Correctly decrements available cars across Online & Offline bookings (2 units: 1 online + 1 offline = 0 available, 3rd blocked)", async () => {
    // 1. Setup a dedicated test car with fleet_count = 2 at Delhi NCR (Location 1)
    const testLocation = await prisma.location.findFirst({ where: { is_active: true } });
    expect(testLocation).toBeDefined();

    const category = await prisma.carCategory.findFirst();
    expect(category).toBeDefined();

    const multiUnitCar = await prisma.car.create({
      data: {
        name: `Multi-Unit Fleet Test ${Date.now()}`,
        slug: `multi-unit-test-${Date.now()}`,
        brand: "Maruti Suzuki",
        category_id: category!.id,
        location_id: testLocation!.id,
        price_per_day: 3000,
        fleet_count: 2, // 2 physical cars
        is_available: true,
        primary_image: "/uploads/test-maruti.jpg",
      },
    });
    createdCarIds.push(multiUnitCar.id);

    const plan = await prisma.rentalPlan.create({
      data: {
        car_id: multiUnitCar.id,
        plan_type: "km_package",
        name: "Standard 300 km",
        price: 3000,
        free_km: 300,
        security_deposit: 5000,
        extra_km_rate: 8,
        is_active: true,
      },
    });

    const startDate = new Date(Date.now() + 86400000 * 50).toISOString();
    const endDate = new Date(Date.now() + 86400000 * 52).toISOString();

    // A. Initial State: Both 2 units are available at this location
    const initialInventory = await getFleetCarsWithAvailability({
      locationId: testLocation!.id,
      startDate,
      endDate,
    });
    const carStat0 = initialInventory.find((c) => c.id === multiUnitCar.id);
    expect(carStat0).toBeDefined();
    expect(carStat0!.fleet_count).toBe(2);
    expect(carStat0!.available_units).toBe(2);
    expect(carStat0!.is_sold_out).toBe(false);

    // B. BOOKING 1 (ONLINE): Customer books online via website (source: "web")
    const onlineRes = await createBookingSafe({
      fullName: "Online Customer 1",
      phone: "+919811000111",
      email: "online1@example.com",
      carId: multiUnitCar.id,
      rentalPlanId: plan.id,
      locationId: testLocation!.id,
      startDate,
      endDate,
      source: "web",
    });
    expect(onlineRes.success).toBe(true);
    expect(onlineRes.booking).toBeDefined();
    createdBookingIds.push(onlineRes.booking!.id);

    // Check Live Inventory: exactly 1 unit left available!
    const inventoryAfterOnline = await getFleetCarsWithAvailability({
      locationId: testLocation!.id,
      startDate,
      endDate,
    });
    const carStat1 = inventoryAfterOnline.find((c) => c.id === multiUnitCar.id);
    expect(carStat1).toBeDefined();
    expect(carStat1!.available_units).toBe(1); // 2 - 1 = 1 available
    expect(carStat1!.is_sold_out).toBe(false);

    // C. BOOKING 2 (OFFLINE): Walk-in customer arrives at the office counter
    const offlineReq = new NextRequest("http://localhost:3000/api/v1/admin/bookings", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Walk-In Customer 2",
        phone: "+919811000222",
        email: "walkin2@example.com",
        carId: multiUnitCar.id,
        rentalPlanId: plan.id,
        locationId: testLocation!.id,
        startDate,
        endDate,
        pickupLocation: testLocation!.name,
        dropLocation: testLocation!.name,
        drivingLicenseNumber: "DL-0420250009999",
        verifyDlInPerson: true,
        initialPayment: {
          amount: 3000,
          method: "cash",
          reference: "OFFICE_CASH_01",
        },
      }),
    });

    const offlineRes = await createAdminBooking(offlineReq);
    expect(offlineRes.status).toBe(201);
    const offlineData = await offlineRes.json();
    expect(offlineData.success).toBe(true);
    createdBookingIds.push(offlineData.data.id);
    if (offlineData.data.customer_id) {
      createdCustomerIds.push(offlineData.data.customer_id);
    }

    // Check Live Inventory: 0 units left, marked SOLD OUT!
    const inventoryAfterOffline = await getFleetCarsWithAvailability({
      locationId: testLocation!.id,
      startDate,
      endDate,
    });
    const carStat2 = inventoryAfterOffline.find((c) => c.id === multiUnitCar.id);
    expect(carStat2).toBeDefined();
    expect(carStat2!.available_units).toBe(0); // 2 - 2 = 0 available
    expect(carStat2!.is_sold_out).toBe(true); // SOLD OUT!

    // D. BOOKING 3 (OVERBOOKING ATTEMPT): 3rd customer attempts to book same vehicle for overlapping dates
    const overbookReq = new NextRequest("http://localhost:3000/api/v1/admin/bookings", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: "Unlucky Customer 3",
        phone: "+919811000333",
        carId: multiUnitCar.id,
        rentalPlanId: plan.id,
        locationId: testLocation!.id,
        startDate,
        endDate,
      }),
    });

    const overbookRes = await createAdminBooking(overbookReq);
    expect(overbookRes.status).toBe(409); // 409 Conflict
    const overbookData = await overbookRes.json();
    expect(overbookData.success).toBe(false);
    expect(overbookData.error).toContain("already reserved");

    // E. Location Boundary: Requesting a different location rejects with 400
    const otherLocation = await prisma.location.findFirst({
      where: { id: { not: testLocation!.id }, is_active: true },
    });
    if (otherLocation) {
      const wrongLocRes = await createBookingSafe({
        fullName: "Wrong Location Customer",
        phone: "+919811000444",
        carId: multiUnitCar.id,
        rentalPlanId: plan.id,
        locationId: otherLocation.id,
        startDate: new Date(Date.now() + 86400000 * 60).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 62).toISOString(),
      });
      expect(wrongLocRes.success).toBe(false);
      expect(wrongLocRes.statusCode).toBe(400);
      expect(wrongLocRes.error).toContain("not available in the requested location");
    }
  });
});

