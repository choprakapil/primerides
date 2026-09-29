export interface PageMetaDTO {
  id: number;
  routePath: string;
  metaTitle: string;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  robots: string;
}
