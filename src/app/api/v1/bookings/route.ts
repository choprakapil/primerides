import { NextRequest } from "next/server";
import { getCurrentCustomer } from "@/server/auth/customer";
import { createBookingSafe, getCustomerBookings } from "@/server/booking";
import { apiCreated, apiError, apiSuccess, apiUnauthorized } from "@/server/utils/api-response";
import { bookingRateLimiter } from "@/lib/rateLimit";

/**
 * POST /api/v1/bookings
 * 
 * Strict Secure Booking Creation:
 * 1. Authenticates customer from Bearer header OR HTTP-only 'primerides_customer_token' cookie.
 * 2. REJECTS unauthenticated requests (No guest booking allowed).
 * 3. Extracts customer_id, full_name, phone, email directly from verified session in DB.
 * 4. IGNORES any client-supplied customer_id in request body to prevent privilege escalation / impersonation.
 * 5. Calls atomic booking engine with location and selected KM / Monthly rental plan.
 */
export async function POST(req: NextRequest) {
  // Apply rate limiting (10 bookings per hour per user)
  const rateLimitResult = await bookingRateLimiter(req);
  if (rateLimitResult) return rateLimitResult;
  try {
    // 1. Authenticate Customer (Bearer Header OR Cookie)
    const customer = await getCurrentCustomer();
    if (!customer) {
      return apiUnauthorized("Authentication required. Please log in to complete your reservation.");
    }

    const body = await req.json().catch(() => ({}));
    const {
      carId,
      rentalPlanId,
      locationId,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      withChauffeur,
      notes,
      couponCode,
    } = body;

    const idempotencyKey = req.headers.get("x-idempotency-key") || body.idempotencyKey;

    // 2. Validate Vehicle & Dates
    if (!carId || !startDate || !endDate) {
      return apiError("Vehicle selection, start date, and end date are required.", 400);
    }

    const parsedCarId = typeof carId === "string" ? parseInt(carId, 10) : carId;
    if (isNaN(parsedCarId) || parsedCarId <= 0) {
      return apiError("Invalid vehicle ID provided.", 400);
    }

    const parsedPlanId = rentalPlanId ? (typeof rentalPlanId === "string" ? parseInt(rentalPlanId, 10) : rentalPlanId) : undefined;
    const parsedLocationId = locationId ? (typeof locationId === "string" ? parseInt(locationId, 10) : locationId) : undefined;

    // 3. Execute Atomic Booking Engine (Identity strictly locked to session)
    const result = await createBookingSafe({
      customerId: customer.id,
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email || undefined,
      carId: parsedCarId,
      rentalPlanId: parsedPlanId,
      locationId: parsedLocationId,
      startDate,
      endDate,
      pickupLocation,
      dropLocation,
      withChauffeur: !!withChauffeur,
      couponCode: typeof couponCode === "string" ? couponCode.trim() : undefined,
      source: "web_customer_portal",
      notes,
      idempotencyKey,
    });

    if (!result.success) {
      return apiError(result.error || "Booking creation failed", result.statusCode || 400);
    }

    return apiCreated(result.booking, "Your luxury ride reservation has been confirmed.");
  } catch (err: any) {
    console.error("Booking API error:", err);
    return apiError(err.message || "Failed to process booking reservation", 500);
  }
}

/**
 * GET /api/v1/bookings
 * Returns authenticated customer's booking history only.
 */
export async function GET(req: NextRequest) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return apiUnauthorized("Authentication required to view reservations.");
    }

    const bookings = await getCustomerBookings(customer.id);
    return apiSuccess(bookings, "Customer reservations retrieved successfully.");
  } catch (err: any) {
    console.error("Fetch bookings API error:", err);
    return apiError(err.message || "Failed to retrieve reservations", 500);
  }
}
