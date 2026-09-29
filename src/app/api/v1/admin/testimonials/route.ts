import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiError, apiSuccess, apiCreated, apiUnauthorized } from "@/server/utils/api-response";
import { REVIEWS_DATA } from "@/data/reviews";

/**
 * GET /api/v1/admin/testimonials
 * Fetch all testimonials (with counts & stats) for the admin workspace.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Forbidden: You lack content.manage permission.", 403);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const featured = searchParams.get("featured");

    const where: any = {
      deleted_at: null,
    };

    if (featured === "true") where.is_featured = true;
    if (featured === "false") where.is_featured = false;

    if (search) {
      where.OR = [
        { client_name: { contains: search } },
        { role_title: { contains: search } },
        { comment: { contains: search } },
      ];
    }

    // Auto-seed default reviews if table is empty
    const totalCountCheck = await prisma.testimonial.count();
    if (totalCountCheck === 0) {
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
    }

    const [testimonials, totalCount, featuredCount] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        orderBy: { created_at: "desc" },
      }),
      prisma.testimonial.count({ where: { deleted_at: null } }),
      prisma.testimonial.count({ where: { deleted_at: null, is_featured: true } }),
    ]);

    const avgRating =
      testimonials.length > 0
        ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
        : "5.0";

    return apiSuccess({
      testimonials,
      stats: {
        total: totalCount,
        featured: featuredCount,
        averageRating: Number(avgRating),
      },
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch testimonials", 500);
  }
}

/**
 * POST /api/v1/admin/testimonials
 * Create a new customer testimonial or editorial review.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return apiUnauthorized("Admin authentication required.");

    if (!hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
      return apiError("Forbidden: You lack content.manage permission.", 403);
    }

    const body = await req.json().catch(() => ({}));
    const { client_name, role_title, rating, comment, avatar_url, is_featured } = body;

    if (!client_name || !comment) {
      return apiError("Client name and review comment are required.", 400);
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(String(rating || 5), 10)));

    const testimonial = await prisma.$transaction(async (tx) => {
      const created = await tx.testimonial.create({
        data: {
          client_name: client_name.trim(),
          role_title: role_title?.trim() || null,
          rating: numericRating,
          comment: comment.trim(),
          avatar_url: avatar_url?.trim() || "/assets/img/team/1.jpg",
          is_featured: is_featured !== undefined ? !!is_featured : true,
        },
      });

      await tx.auditLog.create({
        data: {
          actor_id: admin.id,
          actor_type: "admin",
          action: "TESTIMONIAL_CREATED",
          entity: "Testimonial",
          entity_id: created.id,
          before_state: {},
          after_state: {
            client_name: created.client_name,
            rating: created.rating,
            is_featured: created.is_featured,
          },
        },
      });

      return created;
    });

    return apiCreated(testimonial, "Testimonial created successfully.");
  } catch (err: any) {
    return apiError(err.message || "Failed to create testimonial", 500);
  }
}
