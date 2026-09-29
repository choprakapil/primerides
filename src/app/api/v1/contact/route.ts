import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { apiCreated, apiError } from "@/server/utils/api-response";
import { contactRateLimiter } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Apply rate limiting (5 submissions per hour per IP)
  const rateLimitResult = await contactRateLimiter(req);
  if (rateLimitResult) return rateLimitResult;
  try {
    const body = await req.json();
    const { name, phone, email, carType, pickupCity, message } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return apiError("Please provide a valid full name (at least 2 characters).", 400);
    }

    if (!phone || typeof phone !== "string" || phone.trim().length < 10) {
      return apiError("Please provide a valid 10-digit mobile phone number.", 400);
    }

    const cleanPhone = phone.trim();
    const cleanName = name.trim();
    const cleanEmail = email && typeof email === "string" ? email.trim() : null;
    const cleanCar = carType && typeof carType === "string" ? carType.trim() : null;
    const cleanCity = pickupCity && typeof pickupCity === "string" ? pickupCity.trim() : null;
    const cleanMessage = message && typeof message === "string" ? message.trim() : "";

    const lead = await prisma.contactLead.create({
      data: {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        subject: cleanCar ? `Inquiry for ${cleanCar}` : "General Rental Inquiry",
        message: `${cleanCity ? `[Hub: ${cleanCity}] ` : ""}${cleanMessage || "Requesting rental availability and price quote."}`,
        source: "contact_page",
        status: "new",
      },
    });

    return apiCreated(
      {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        status: lead.status,
        created_at: lead.created_at,
      },
      "Thank you! Your rental inquiry has been registered with our 24/7 concierge desk."
    );
  } catch (error: any) {
    console.error("Error creating contact lead:", error);
    return apiError("Internal server error. Failed to submit contact inquiry.", 500);
  }
}
