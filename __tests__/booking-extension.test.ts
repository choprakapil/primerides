import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/server/db/client";
import { extendBookingSafe } from "@/server/booking";

describe("Booking Extension Workflow (Phase 5 Item 129)", () => {
  let customer1: any;
  let customer2: any;
  let testCar: any;
  let activeBooking: any;

  beforeEach(async () => {
    // 1. Get or create test customers
    customer1 = await prisma.customerUser.findFirst({ where: { phone: "9876500001" } });
    if (!customer1) {
      customer1 = await prisma.customerUser.create({
        data: { phone: "9876500001", full_name: "Customer One", email: "cust1@test.com" },
      });
    }

    customer2 = await prisma.customerUser.findFirst({ where: { phone: "9876500002" } });
    if (!customer2) {
      customer2 = await prisma.customerUser.create({
        data: { phone: "9876500002", full_name: "Customer Two", email: "cust2@test.com" },
      });
    }

    // 2. Get an active vehicle
    testCar = await prisma.car.findFirst({
      where: { deleted_at: null, is_available: true },
      include: { location: true },
    });
    expect(testCar).toBeDefined();

    // 3. Create an active test booking for customer1 (Oct 10 to Oct 12, 2026)
    const startDate = new Date("2026-10-10T10:00:00Z");
    const endDate = new Date("2026-10-12T10:00:00Z");

    activeBooking = await prisma.booking.create({
      data: {
        booking_code: `PR-TEST-EXT-${Date.now().toString().slice(-6)}`,
        customer_id: customer1.id,
        car_id: testCar.id,
        start_date: startDate,
        end_date: endDate,
        status: "active",
        total_amount: 5000,
        security_deposit: 5000,
        full_name: customer1.full_name,
        phone: customer1.phone,
      },
    });
  });

  afterEach(async () => {
    if (activeBooking?.id) {
      await prisma.bookingStatusHistory.deleteMany({ where: { booking_id: activeBooking.id } });
      await prisma.auditLog.deleteMany({ where: { entity: "Booking", entity_id: activeBooking.id } });
      await prisma.booking.deleteMany({ where: { id: activeBooking.id } });
    }
  });

  it("rejects extension when requested by an unauthorized customer", async () => {
    const result = await extendBookingSafe({
      bookingId: activeBooking.id,
      newEndDate: "2026-10-14T10:00:00Z",
      customerId: customer2.id, // Wrong customer
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.error).toContain("Unauthorized");
  });

  it("rejects extension if new return date is before or equal to current return date", async () => {
    const result = await extendBookingSafe({
      bookingId: activeBooking.id,
      newEndDate: "2026-10-11T10:00:00Z", // Earlier than current Oct 12
      customerId: customer1.id,
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.error).toContain("New return date must be strictly after the current scheduled return date");
  });

  it("rejects extension if booking has been cancelled or completed", async () => {
    // Mark as completed
    await prisma.booking.update({
      where: { id: activeBooking.id },
      data: { status: "completed" },
    });

    const result = await extendBookingSafe({
      bookingId: activeBooking.id,
      newEndDate: "2026-10-14T10:00:00Z",
      customerId: customer1.id,
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.error).toContain("Cannot extend booking with status \"completed\"");
  });

  it("rejects extension with HTTP 409 Conflict if vehicle has an overlapping upcoming reservation", async () => {
    // Set car fleet_count to 1
    await prisma.car.update({
      where: { id: testCar.id },
      data: { fleet_count: 1 },
    });

    // Create another customer's confirmed booking on Oct 13 to Oct 15
    const upcomingConflict = await prisma.booking.create({
      data: {
        booking_code: `PR-CONFLICT-${Date.now().toString().slice(-6)}`,
        customer_id: customer2.id,
        car_id: testCar.id,
        start_date: new Date("2026-10-13T10:00:00Z"),
        end_date: new Date("2026-10-15T10:00:00Z"),
        status: "confirmed",
        total_amount: 6000,
        full_name: customer2.full_name,
        phone: customer2.phone,
      },
    });

    // Customer1 attempts to extend through Oct 14 (which overlaps with customer2's booking)
    const result = await extendBookingSafe({
      bookingId: activeBooking.id,
      newEndDate: "2026-10-14T10:00:00Z",
      customerId: customer1.id,
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(409);
    expect(result.error).toContain("reserved for another customer");

    // Clean up conflict booking
    await prisma.booking.delete({ where: { id: upcomingConflict.id } });
  });

  it("successfully extends booking, increments total_amount with GST, and writes status history", async () => {
    // Ensure sufficient fleet_count or no conflicting bookings
    await prisma.car.update({
      where: { id: testCar.id },
      data: { fleet_count: 5 },
    });

    const initialTotal = Number(activeBooking.total_amount);
    const newTargetDate = "2026-10-14T10:00:00Z"; // +2 days

    const result = await extendBookingSafe({
      bookingId: activeBooking.id,
      newEndDate: newTargetDate,
      customerId: customer1.id,
      reason: "Flight delayed by 2 days",
    });

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data?.additionalDays).toBe(2);
    expect(result.data?.additionalTotal).toBeGreaterThan(0);

    // Verify DB update
    const updated = await prisma.booking.findUnique({
      where: { id: activeBooking.id },
    });
    expect(new Date(updated!.end_date).toISOString()).toBe(new Date(newTargetDate).toISOString());
    expect(Number(updated!.total_amount)).toBeGreaterThan(initialTotal);

    // Verify status history
    const history = await prisma.bookingStatusHistory.findFirst({
      where: { booking_id: activeBooking.id },
      orderBy: { created_at: "desc" },
    });
    expect(history?.reason).toContain("Rental extended");
    expect(history?.reason).toContain("Flight delayed by 2 days");
  });
});
