import React from "react";
import { prisma } from "@/server/db/client";
import { getCurrentAdmin, hasAdminPermission, ADMIN_PERMISSIONS } from "@/server/auth/rbac";
import ForbiddenCard from "@/components/admin/ForbiddenCard";
import TestimonialsManager from "@/components/admin/TestimonialsManager";
import { REVIEWS_DATA } from "@/data/reviews";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Testimonials & Reviews | PrimeRides Admin",
};

export default async function AdminTestimonialsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasAdminPermission(admin, ADMIN_PERMISSIONS.CONTENT_MANAGE)) {
    return (
      <ForbiddenCard
        permissionRequired="content.manage"
        moduleName="Customer Testimonials & Reviews"
      />
    );
  }

  // Auto-seed if empty
  const count = await prisma.testimonial.count();
  if (count === 0) {
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
      where: { deleted_at: null },
      orderBy: { created_at: "desc" },
    }),
    prisma.testimonial.count({ where: { deleted_at: null } }),
    prisma.testimonial.count({ where: { deleted_at: null, is_featured: true } }),
  ]);

  const avgRating =
    testimonials.length > 0
      ? Number((testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1))
      : 5.0;

  const sanitized = testimonials.map((t) => ({
    id: t.id,
    client_name: t.client_name,
    role_title: t.role_title,
    rating: t.rating,
    comment: t.comment,
    avatar_url: t.avatar_url,
    is_featured: t.is_featured,
    created_at: t.created_at.toISOString(),
  }));

  return (
    <TestimonialsManager
      initialTestimonials={sanitized}
      stats={{
        total: totalCount,
        featured: featuredCount,
        averageRating: avgRating,
      }}
    />
  );
}
