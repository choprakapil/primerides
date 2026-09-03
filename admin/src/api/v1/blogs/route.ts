import { NextRequest } from "next/server";
import prisma from "../../../lib/prisma";
import { apiError, apiSuccess } from "../../../lib/api-response";

// GET /api/v1/blogs (Public mobile blog feed)
export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
        is_published: true,
        deleted_at: null,
      },
      include: {
        category: true,
      },
      orderBy: { published_at: "desc" },
    });

    return apiSuccess(blogs, "Blogs retrieved successfully");
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch blogs", 500);
  }
}
