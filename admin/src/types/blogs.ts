export interface BlogCategoryDTO {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
}

export interface BlogDTO {
  id: number;
  title: string;
  slug: string;
  categoryId: number;
  categoryName?: string;
  featuredImage?: string | null;
  imageAlt?: string | null;
  summary?: string | null;
  content: string;
  authorName: string;
  readTime?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
}
