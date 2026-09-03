import { NextRequest } from "next/server";
import prisma from "../../../lib/prisma";
import { verifyToken } from "../../../lib/auth";
import { apiCreated, apiError, apiSuccess, apiUnauthorized } from "../../../lib/api-response";

// POST /api/v1/bookings (Create a booking from Mobile App or Web)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    let customerId: number | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = await verifyToken(token);
      if (payload && payload.type === "customer") {
        customerId = payload.id;
      }
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      email,
      carId,
      carName,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      withChauffeur,
      totalAmount,
      source,
      notes,
    } = body;

    if (!fullName || !phone || !startDate || !endDate) {
      return apiError("Full name, phone, start date, and end date are required.", 400);
    }

    const bookingCode = `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const booking = await prisma.booking.create({
      data: {
        booking_code: bookingCode,
        customer_id: customerId,
        full_name: fullName,
        phone,
        email,
        car_id: carId ? parseInt(carId, 10) : null,
        car_name: carName,
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        pickup_location: pickupLocation,
        drop_location: dropLocation,
        with_chauffeur: !!withChauffeur,
        total_amount: totalAmount ? parseFloat(totalAmount) : null,
        source: source || "mobile_app",
        notes,
      },
    });

    return apiCreated(booking, "Booking request submitted successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to create booking", 500);
  }
}

// GET /api/v1/bookings (Get authenticated customer's booking history)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return apiUnauthorized("Bearer token required to view booking history.");
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload || payload.type !== "customer") {
      return apiUnauthorized("Invalid or expired session token.");
    }

    const bookings = await prisma.booking.findMany({
      where: {
        customer_id: payload.id,
        deleted_at: null,
      },
      include: {
        car: true,
      },
      orderBy: { created_at: "desc" },
    });

    return apiSuccess(bookings, "Customer bookings retrieved");
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve bookings", 500);
  }
}
