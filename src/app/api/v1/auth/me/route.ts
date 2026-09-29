import { NextRequest } from "next/server";
import { getCurrentCustomer } from "@/server/auth/customer";
import { apiSuccess, apiUnauthorized } from "@/server/utils/api-response";

export async function GET(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return apiUnauthorized("You are not authenticated. Please log in.");
  }

  return apiSuccess({ customer }, "Profile retrieved successfully.");
}
