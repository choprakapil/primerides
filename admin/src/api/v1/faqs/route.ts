import { NextRequest } from "next/server";
import prisma from "../../../lib/prisma";
import { apiError, apiSuccess } from "../../../lib/api-response";

// GET /api/v1/faqs (Public mobile FAQs)
export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        is_active: true,
        deleted_at: null,
      },
      orderBy: { sort_order: "asc" },
    });

    return apiSuccess(faqs, "FAQs retrieved successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch FAQs", 500);
  }
}
