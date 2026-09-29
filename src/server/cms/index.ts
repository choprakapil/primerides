import { prisma } from "../db/client";
import { FAQS_DATA } from "@/data/faqs";
import { BLOG_POSTS } from "@/data/blogs";

export interface FaqItemDTO {
  id: number | string;
  category: string;
  question: string;
  answer: string;
  sort_order?: number;
}

export interface BlogItemDTO {
  id: number | string;
  slug: string;
  title: string;
  categoryName: string;
  summary: string;
  content: string;
  featuredImage: string;
  authorName: string;
  readTime: string;
  publishedAt: string;
}

/**
 * Fetch all active FAQs from database, with fallback to hardcoded data
 */
export async function getFaqs(): Promise<FaqItemDTO[]> {
  try {
    const dbFaqs = await prisma.fAQ.findMany({
      where: {
        is_active: true,
        deleted_at: null,
      },
      orderBy: {
        sort_order: "asc",
      },
    });

    if (dbFaqs.length > 0) {
      return dbFaqs.map((f) => ({
        id: f.id,
        category: f.category,
        question: f.question,
        answer: f.answer,
        sort_order: f.sort_order,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch FAQs from DB, using fallback:", error);
  }

  // Graceful fallback
  return FAQS_DATA.map((f, idx) => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer,
    sort_order: idx + 1,
  }));
}

/**
 * Fetch all published blogs from database with fallback
 */
export async function getBlogs(): Promise<BlogItemDTO[]> {
  try {
    const dbBlogs = await prisma.blog.findMany({
      where: {
        is_published: true,
        deleted_at: null,
      },
      include: {
        category: true,
      },
      orderBy: {
        published_at: "desc",
      },
    });

    if (dbBlogs.length > 0) {
      return dbBlogs.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        categoryName: b.category?.name || "Travel Journal",
        summary: b.summary || "",
        content: b.content,
        featuredImage: b.featured_image || "/assets/img/blog/1.jpg",
        authorName: b.author_name,
        readTime: b.read_time || "5 min read",
        publishedAt: b.published_at ? b.published_at.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
      }));
    }
  } catch (error) {
    console.error("Failed to fetch blogs from DB, using fallback:", error);
  }

  // Graceful fallback
  return BLOG_POSTS.map((b, idx) => ({
    id: idx + 1,
    slug: b.slug,
    title: b.title,
    categoryName: b.tag,
    summary: b.excerpt,
    content: b.excerpt,
    featuredImage: b.img,
    authorName: b.author,
    readTime: b.readTime,
    publishedAt: b.date,
  }));
}

/**
 * Fetch a single blog by slug from database
 */
export async function getBlogBySlug(slug: string): Promise<BlogItemDTO | null> {
  try {
    const blog = await prisma.blog.findFirst({
      where: {
        slug,
        is_published: true,
        deleted_at: null,
      },
      include: {
        category: true,
      },
    });

    if (blog) {
      return {
        id: blog.id,
        slug: blog.slug,
        title: blog.title,
        categoryName: blog.category?.name || "Travel Journal",
        summary: blog.summary || "",
        content: blog.content,
        featuredImage: blog.featured_image || "/assets/img/blog/1.jpg",
        authorName: blog.author_name,
        readTime: blog.read_time || "5 min read",
        publishedAt: blog.published_at ? blog.published_at.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently",
      };
    }
  } catch (error) {
    console.error(`Failed to fetch blog by slug ${slug}:`, error);
  }

  // Check fallback
  const fallback = BLOG_POSTS.find((b) => b.slug === slug);
  if (fallback) {
    return {
      id: fallback.slug,
      slug: fallback.slug,
      title: fallback.title,
      categoryName: fallback.tag,
      summary: fallback.excerpt,
      content: fallback.excerpt,
      featuredImage: fallback.img,
      authorName: fallback.author,
      readTime: fallback.readTime,
      publishedAt: fallback.date,
    };
  }

  return null;
}
