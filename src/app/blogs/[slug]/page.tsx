import React from "react";
import PageHeader from "@/components/PageHeader";
import { getBlogs, getBlogBySlug } from "@/server/cms";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const blogs = await getBlogs();
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return { title: "Blog Article - PrimeRides" };
  }

  return {
    title: `${post.title} | PrimeRides Road Trip Desk`,
    description: post.summary || `Read about ${post.title} on the PrimeRides travel desk.`,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={post.title}
        subtitle={post.categoryName}
        breadcrumb="Blog Article"
        bgImage={post.featuredImage}
      />
      <section className="section-padding section-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="mb-4">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="rounded-4 w-100 shadow-sm"
                  style={{ maxHeight: "460px", objectFit: "cover" }}
                />
              </div>
              <div className="d-flex justify-content-between align-items-center text-muted small mb-4 pb-3 border-bottom">
                <span>
                  <i className="fa-regular fa-calendar me-1"></i> {post.publishedAt}
                </span>
                <span>
                  By <strong className="text-dark">{post.authorName}</strong>
                </span>
                <span>
                  <i className="fa-regular fa-clock me-1"></i> {post.readTime}
                </span>
              </div>
              <div className="article-body" style={{ color: "var(--text-body)", fontSize: "16px", lineHeight: 1.8 }}>
                {post.summary && (
                  <p className="lead fw-medium" style={{ color: "var(--text-heading)", marginBottom: "25px" }}>
                    {post.summary}
                  </p>
                )}

                {/* Article Content Rendered */}
                <div className="prose max-w-none text-neutral-800 space-y-4">
                  {post.content.split("\n\n").map((paragraph, pIdx) => {
                    if (paragraph.startsWith("### ")) {
                      return (
                        <h3 key={pIdx} className="fw-bold mt-5 mb-3" style={{ color: "var(--text-heading)" }}>
                          {paragraph.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith("1. ") || paragraph.startsWith("2. ") || paragraph.startsWith("3. ")) {
                      return (
                        <div key={pIdx} className="p-3 bg-light rounded-3 my-2 border-start border-3 border-warning">
                          {paragraph}
                        </div>
                      );
                    }
                    return (
                      <p key={pIdx} style={{ lineHeight: 1.8, marginBottom: "18px" }}>
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                <div
                  className="my-5 p-4 rounded-4"
                  style={{
                    background: "var(--primary-light)",
                    borderLeft: "4px solid var(--primary-color)",
                  }}
                >
                  <h5 className="fw-bold mb-2" style={{ color: "var(--text-heading)" }}>
                    <i className="fa-solid fa-lightbulb me-2 text-warning"></i> Primerides Travel Tip
                  </h5>
                  <p className="mb-0 small" style={{ color: "var(--text-heading)" }}>
                    Always inspect tyre pressure (including spare tyre) before ascending hill stations, and ensure offline Google Maps are downloaded for remote areas with spotty cellular reception.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-top d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <Link href="/blogs" className="btn-prime-outline">
                    <i className="fa-solid fa-arrow-left me-1"></i> Back to All Blogs
                  </Link>
                  <Link href="/cars" className="btn-prime">
                    Book a Car for This Trip <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
