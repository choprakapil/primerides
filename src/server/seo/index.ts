import { prisma } from "@/server/db/client";

export interface PageMetaInput {
  route_path: string;
  meta_title: string;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
}

export async function getPageMeta(routePath: string) {
  try {
    return await prisma.pageMeta.findUnique({
      where: { route_path: routePath },
    });
  } catch (error) {
    console.error(`[SEO] Failed to fetch metadata for ${routePath}:`, error);
    return null;
  }
}

export async function getAllPageMetas(limit = 100, skip = 0) {
  try {
    return await prisma.pageMeta.findMany({
      orderBy: { route_path: "asc" },
      take: limit,
      skip,
    });
  } catch (error) {
    console.error("[SEO] Failed to fetch all page metadata:", error);
    return [];
  }
}

export async function upsertPageMeta(data: PageMetaInput) {
  const { route_path, ...rest } = data;
  return await prisma.pageMeta.upsert({
    where: { route_path },
    update: {
      meta_title: rest.meta_title,
      meta_description: rest.meta_description ?? null,
      meta_keywords: rest.meta_keywords ?? null,
      og_title: rest.og_title ?? rest.meta_title,
      og_description: rest.og_description ?? rest.meta_description ?? "",
      og_image: rest.og_image ?? null,
      canonical_url: rest.canonical_url ?? null,
      robots: rest.robots ?? "index, follow",
    },
    create: {
      route_path,
      meta_title: rest.meta_title,
      meta_description: rest.meta_description ?? null,
      meta_keywords: rest.meta_keywords ?? null,
      og_title: rest.og_title ?? rest.meta_title,
      og_description: rest.og_description ?? rest.meta_description ?? "",
      og_image: rest.og_image ?? null,
      canonical_url: rest.canonical_url ?? null,
      robots: rest.robots ?? "index, follow",
    },
  });
}
