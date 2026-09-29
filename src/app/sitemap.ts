import { MetadataRoute } from "next";
import { prisma } from "@/server/db/client";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/cars`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/blogs`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  // Dynamic car slugs
  let carRoutes: MetadataRoute.Sitemap = [];
  try {
    const cars = await prisma.car.findMany({
      where: { deleted_at: null, is_available: true },
      select: { slug: true, updated_at: true },
    });
    carRoutes = cars
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${BASE_URL}/cars/${c.slug}`,
        lastModified: c.updated_at ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }));
  } catch {
    // Non-fatal — skip dynamic car routes if DB is unavailable
  }

  // Dynamic blog slugs
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const blogs = await prisma.blog.findMany({
      where: { deleted_at: null, is_published: true },
      select: { slug: true, updated_at: true },
    });
    blogRoutes = blogs
      .filter((b) => b.slug)
      .map((b) => ({
        url: `${BASE_URL}/blogs/${b.slug}`,
        lastModified: b.updated_at ?? now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
  } catch {
    // Non-fatal
  }

  return [...staticRoutes, ...carRoutes, ...blogRoutes];
}
