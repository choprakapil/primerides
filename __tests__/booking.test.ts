import { describe, it, expect } from "vitest";
import { createBookingSafe } from "@/server/booking";

describe("Booking Module — Booking Creation & Input Validation", () => {
  it("should reject booking creation when required fields are missing", async () => {
    const result = await createBookingSafe({
      fullName: "",
      phone: "",
      carId: 0,
      startDate: "",
      endDate: "",
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.error).toMatch(/Full name, phone number, vehicle selection, start date, and end date are required/);
  });

  it("should reject invalid date strings", async () => {
    const result = await createBookingSafe({
      fullName: "Priya Patel",
      phone: "+919876543210",
      carId: 1,
      startDate: "invalid-date-string",
      endDate: "2026-10-15",
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.error).toMatch(/Invalid start or end date format/);
  });

  it("should reject return date that is earlier than or equal to pickup date", async () => {
    const now = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const pickupDate = now.toISOString();
    const returnDate = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

    const result = await createBookingSafe({
      fullName: "Vikram Malhotra",
      phone: "+919876543210",
      carId: 1,
      startDate: pickupDate,
      endDate: returnDate,
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.error).toMatch(/Return date must be after pickup date/);
  });

  it("should reject pickup date in the past", async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const result = await createBookingSafe({
      fullName: "Aarav Sharma",
      phone: "+919876543210",
      carId: 1,
      startDate: pastDate,
      endDate: futureDate,
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.error).toMatch(/Pickup date cannot be in the past/);
  });
});
