import { NextRequest } from "next/server";
import { getBlogs } from "@/server/cms";
import { apiSuccess, apiError } from "@/server/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    const blogs = await getBlogs();
    return apiSuccess(blogs, "Blogs retrieved successfully.");
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    return apiError("Failed to fetch blogs.", 500);
  }
}
