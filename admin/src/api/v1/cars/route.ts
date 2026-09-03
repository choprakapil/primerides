import { NextRequest } from "next/server";
import prisma from "../../../lib/prisma";
import { apiError, apiSuccess } from "../../../lib/api-response";

// GET /api/v1/cars (List fleet with search & filters for Mobile Apps)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null,
      is_available: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(brand ? { brand: { contains: brand } } : {}),
      ...(featured === "true" ? { is_featured: true } : {}),
    };

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { sort_order: "asc" },
        skip,
        take: limit,
      }),
      prisma.car.count({ where }),
    ]);

    return apiSuccess(cars, "Fleet retrieved successfully", {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve cars", 500);
  }
}
