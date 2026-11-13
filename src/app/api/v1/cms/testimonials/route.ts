import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { REVIEWS_DATA } from "@/data/reviews";
import { apiError, apiSuccess } from "@/server/utils/api-response";

/**
 * GET /api/v1/cms/testimonials
 * Public endpoint for featured customer testimonials and reviews.
 * Auto-seeds initial testimonials from REVIEWS_DATA if table is empty.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    let testimonials = await prisma.testimonial.findMany({
      where: {
        deleted_at: null,
        is_featured: true,
      },
      orderBy: { created_at: "desc" },
      take: limit,
      skip,
    });

    if (testimonials.length === 0 && page === 1) {
      // Auto-seed default reviews if DB is empty
      const totalCount = await prisma.testimonial.count();
      if (totalCount === 0) {
        await prisma.testimonial.createMany({
          data: REVIEWS_DATA.map((r) => ({
            client_name: r.name,
            role_title: r.trip ? `${r.trip} • ${r.car}` : r.car,
            rating: r.rating || 5,
            comment: r.text,
            avatar_url: r.img || "/assets/img/team/1.jpg",
            is_featured: true,
          })),
        });

        testimonials = await prisma.testimonial.findMany({
          where: { deleted_at: null, is_featured: true },
          orderBy: { created_at: "desc" },
          take: limit,
          skip,
        });
      }
    }

    const total = await prisma.testimonial.count({ where: { deleted_at: null, is_featured: true } });

    return apiSuccess({ testimonials, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }, "Testimonials retrieved successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to load testimonials", 500);
  }
}
