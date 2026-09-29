import { NextRequest } from "next/server";
import { prisma } from "@/server/db/client";
import { requireAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import { apiSuccess, apiCreated, apiError } from "@/server/utils/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireAdminPermission(ADMIN_PERMISSIONS.CONTENT_MANAGE);

    const blogs = await prisma.blog.findMany({
      where: { deleted_at: null },
      include: { category: true },
      orderBy: { published_at: "desc" },
    });

    return apiSuccess(blogs, "Admin blogs retrieved.");
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return apiError(error.message, 403);
    }
    console.error("Admin blogs fetch error:", error);
    return apiError("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminPermission(ADMIN_PERMISSIONS.CONTENT_MANAGE);
    const body = await req.json();

    const {
      title,
      slug,
      category_id,
      category_name,
      summary,
      content,
      featured_image,
      author_name,
      read_time,
      is_published,
    } = body;

    if (!title || !content) {
      return apiError("Title and content are required fields.", 400);
    }

    const generatedSlug =
      slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    // Resolve or create category
    let resolvedCategoryId = category_id;
    if (!resolvedCategoryId) {
      const catName = category_name?.trim() || "Travel Guides";
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const existingCat = await prisma.blogCategory.findFirst({
        where: { OR: [{ slug: catSlug }, { name: catName }] },
      });

      if (existingCat) {
        resolvedCategoryId = existingCat.id;
      } else {
        const newCat = await prisma.blogCategory.create({
          data: { name: catName, slug: catSlug },
        });
        resolvedCategoryId = newCat.id;
      }
    }

    const blog = await prisma.blog.create({
      data: {
        title: title.trim(),
        slug: generatedSlug,
        category_id: resolvedCategoryId,
        summary: summary?.trim() || null,
        content: content.trim(),
        featured_image: featured_image?.trim() || "/assets/img/blog/1.jpg",
        author_name: author_name?.trim() || "PrimeRides Editorial",
        read_time: read_time?.trim() || "5 min read",
        is_published: is_published !== undefined ? Boolean(is_published) : true,
        published_at: new Date(),
      },
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        actor_id: admin.id,
        actor_type: "admin",
        action: "BLOG_CREATED",
        entity: "Blog",
        entity_id: blog.id,
        after_state: blog as any,
      },
    });

    return apiCreated(blog, "Blog article published successfully.");
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return apiError(error.message, 403);
    }
    if (error.code === "P2002") {
      return apiError("A blog post with this title / slug already exists.", 409);
    }
    console.error("Admin blog creation error:", error);
    return apiError(error.message || "Failed to create blog.", 500);
  }
}
