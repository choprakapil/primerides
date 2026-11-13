import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/server/db/client";
import { createAccessToken } from "@/server/auth/jwt";
import { DELETE } from "@/app/api/v1/admin/cars/[id]/route";
import { NextRequest } from "next/server";

describe("Issue #25: Car Deletion Safety with Active/Upcoming Reservations", () => {
  let adminToken: string;
  let testCarId: number;
  let testLocationId: number;
  let testCategoryId: number;
  const createdBookingIds: number[] = [];

  beforeAll(async () => {
    // 1. Get or create an admin for RBAC authentication
    let admin = await prisma.adminUser.findFirst({
      where: { is_active: true },
    });

    if (!admin) {
      admin = await prisma.adminUser.create({
        data: {
          username: `testadmin_${Date.now()}`,
          email: `testadmin_${Date.now()}@primerides.in`,
          password: "$2b$10$abcdefghijklmnopqrstuvwxyz123456",
          name: "Test SuperAdmin",
          role: "superadmin",
          is_active: true,
        },
      });
    }

    adminToken = await createAccessToken(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        type: "admin",
      },
      3600
    );

    // 2. Fetch or create a location and category
    const loc = await prisma.location.findFirst({ where: { is_active: true } });
    testLocationId = loc?.id || 1;

    const cat = await prisma.carCategory.findFirst({ where: { is_active: true } });
    testCategoryId = cat?.id || 1;

    // 3. Create a dedicated test car
    const testCar = await prisma.car.create({
      data: {
        name: "Test Safety Mercedes E-Class",
        slug: `test-safety-mercedes-${Date.now()}`,
        brand: "Mercedes-Benz",
        category_id: testCategoryId,
        location_id: testLocationId,
        price_per_day: 8500,
        security_deposit: 15000,
        primary_image: "/assets/img/cars/test.jpg",
        is_available: true,
        fleet_count: 1,
      },
    });
    testCarId = testCar.id;
  });

  afterAll(async () => {
    // Clean up created bookings
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

    // Clean up the test car and its rental plans
    if (testCarId) {
      await prisma.rentalPlan.deleteMany({ where: { car_id: testCarId } });
      await prisma.auditLog.deleteMany({
        where: { entity: "Car", entity_id: testCarId },
      });
      await prisma.car.deleteMany({ where: { id: testCarId } });
    }
  });

  it("Test 1: Rejects deletion when vehicle has an active ongoing trip (status: 'active')", async () => {
    const activeBooking = await prisma.booking.create({
      data: {
        booking_code: `PR-ACT-${Date.now().toString().slice(-6)}`,
        full_name: "Active Renter",
        phone: "+919876543210",
        car_id: testCarId,
        location_id: testLocationId,
        start_date: new Date(Date.now() - 86400000), // Started yesterday
        end_date: new Date(Date.now() + 86400000 * 2), // Ends in 2 days
        status: "active",
        total_amount: 17000,
      },
    });
    createdBookingIds.push(activeBooking.id);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/cars/${testCarId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: String(testCarId) }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/Cannot delete vehicle/i);
    expect(json.error).toContain(activeBooking.booking_code);

    // Verify car was NOT deleted
    const carAfter = await prisma.car.findUnique({ where: { id: testCarId } });
    expect(carAfter?.deleted_at).toBeNull();
    expect(carAfter?.is_available).toBe(true);

    // Clean up active booking
    await prisma.booking.delete({ where: { id: activeBooking.id } });
    createdBookingIds.splice(createdBookingIds.indexOf(activeBooking.id), 1);
  });

  it("Test 2: Rejects deletion when vehicle has an upcoming confirmed reservation (status: 'confirmed')", async () => {
    const confirmedBooking = await prisma.booking.create({
      data: {
        booking_code: `PR-CNF-${Date.now().toString().slice(-6)}`,
        full_name: "Upcoming Confirmed Renter",
        phone: "+919876543211",
        car_id: testCarId,
        location_id: testLocationId,
        start_date: new Date(Date.now() + 86400000 * 5), // Starts in 5 days
        end_date: new Date(Date.now() + 86400000 * 8), // Ends in 8 days
        status: "confirmed",
        total_amount: 25500,
      },
    });
    createdBookingIds.push(confirmedBooking.id);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/cars/${testCarId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: String(testCarId) }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/Cannot delete vehicle/i);
    expect(json.error).toContain(confirmedBooking.booking_code);

    // Verify car was NOT deleted
    const carAfter = await prisma.car.findUnique({ where: { id: testCarId } });
    expect(carAfter?.deleted_at).toBeNull();

    // Clean up confirmed booking
    await prisma.booking.delete({ where: { id: confirmedBooking.id } });
    createdBookingIds.splice(createdBookingIds.indexOf(confirmedBooking.id), 1);
  });

  it("Test 3: Rejects deletion when vehicle has an upcoming pending reservation (status: 'pending')", async () => {
    const pendingBooking = await prisma.booking.create({
      data: {
        booking_code: `PR-PND-${Date.now().toString().slice(-6)}`,
        full_name: "Upcoming Pending Renter",
        phone: "+919876543212",
        car_id: testCarId,
        location_id: testLocationId,
        start_date: new Date(Date.now() + 86400000 * 10),
        end_date: new Date(Date.now() + 86400000 * 12),
        status: "pending",
        total_amount: 17000,
      },
    });
    createdBookingIds.push(pendingBooking.id);

    const req = new NextRequest(`http://localhost:3000/api/v1/admin/cars/${testCarId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: String(testCarId) }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/Cannot delete vehicle/i);
    expect(json.error).toContain(pendingBooking.booking_code);

    // Clean up pending booking
    await prisma.booking.delete({ where: { id: pendingBooking.id } });
    createdBookingIds.splice(createdBookingIds.indexOf(pendingBooking.id), 1);
  });

  it("Test 4: Allows deletion when vehicle has only completed and cancelled historical bookings", async () => {
    // 1. Create a historical completed booking
    const completedBooking = await prisma.booking.create({
      data: {
        booking_code: `PR-CMP-${Date.now().toString().slice(-6)}`,
        full_name: "Past Completed Renter",
        phone: "+919876543213",
        car_id: testCarId,
        location_id: testLocationId,
        start_date: new Date(Date.now() - 86400000 * 10),
        end_date: new Date(Date.now() - 86400000 * 7),
        status: "completed",
        total_amount: 25500,
      },
    });
    createdBookingIds.push(completedBooking.id);

    // 2. Create a historical cancelled booking
    const cancelledBooking = await prisma.booking.create({
      data: {
        booking_code: `PR-CNC-${Date.now().toString().slice(-6)}`,
        full_name: "Cancelled Renter",
        phone: "+919876543214",
        car_id: testCarId,
        location_id: testLocationId,
        start_date: new Date(Date.now() + 86400000 * 2),
        end_date: new Date(Date.now() + 86400000 * 4),
        status: "cancelled",
        total_amount: 17000,
      },
    });
    createdBookingIds.push(cancelledBooking.id);

    // 3. Attempt deletion — should SUCCEED
    const req = new NextRequest(`http://localhost:3000/api/v1/admin/cars/${testCarId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: String(testCarId) }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.deletedId).toBe(testCarId);

    // Verify car was soft deleted
    const carAfter = await prisma.car.findUnique({ where: { id: testCarId } });
    expect(carAfter?.deleted_at).not.toBeNull();
    expect(carAfter?.is_available).toBe(false);
  });

  it("Test 5: Returns 404 if attempting to delete an already deleted vehicle", async () => {
    const req = new NextRequest(`http://localhost:3000/api/v1/admin/cars/${testCarId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: String(testCarId) }) });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toMatch(/Vehicle not found/i);
  });
});
