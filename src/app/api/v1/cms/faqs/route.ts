import { NextRequest } from "next/server";
import { getFaqs } from "@/server/cms";
import { apiSuccess, apiError } from "@/server/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const faqs = await getFaqs();
    return apiSuccess(faqs, "FAQs retrieved successfully.");
  } catch (error: any) {
    console.error("Error fetching FAQs:", error);
    return apiError("Failed to fetch FAQs.", 500);
  }
}
