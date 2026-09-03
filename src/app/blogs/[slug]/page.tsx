import React from "react";
import PageHeader from "@/components/PageHeader";
import { BLOG_POSTS } from "@/data/blogs";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={post.title}
        subtitle={post.tag}
        breadcrumb="Blog Article"
        bgImage={post.img}
      />
      <section className="section-padding section-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="mb-4">
                <img
                  src={post.img}
                  alt={post.title}
                  className="rounded-4 w-100 shadow-sm"
                  style={{ maxHeight: "460px", objectFit: "cover" }}
                />
              </div>
              <div className="d-flex justify-content-between align-items-center text-muted small mb-4 pb-3 border-bottom">
                <span>
                  <i className="fa-regular fa-calendar me-1"></i> {post.date}
                </span>
                <span>
                  By <strong className="text-dark">{post.author}</strong>
                </span>
                <span>
                  <i className="fa-regular fa-clock me-1"></i> {post.readTime}
                </span>
              </div>
              <div className="article-body" style={{ color: "var(--text-body)", fontSize: "16px", lineHeight: 1.8 }}>
                <p className="lead fw-medium" style={{ color: "var(--text-heading)", marginBottom: "25px" }}>
                  {post.excerpt}
                </p>

                <h3 className="fw-bold mt-5 mb-3" style={{ color: "var(--text-heading)" }}>
                  1. Choosing the Right Self-Drive Vehicle
                </h3>
                <p>
                  When setting out on high-altitude expeditions or multi-day family road trips across North India, the choice of vehicle determines your comfort, fuel economy, and safety. 4x4 SUVs like the Mahindra Thar and Toyota Fortuner offer the ground clearance and low-range gearboxes needed for water crossings and rocky terrain, while the Innova Crysta provides plush captain seating and generous luggage room.
                </p>

                <h3 className="fw-bold mt-5 mb-3" style={{ color: "var(--text-heading)" }}>
                  2. Unlimited Kilometers & FASTag Advantage
                </h3>
                <p>
                  With Primerides unlimited kilometer policy, you can explore scenic detours and mountain hamlets without looking at the odometer or calculating per-kilometer surcharge penalties. Plus, active FASTags on all cars allow seamless toll transactions on Yamuna Expressway, Delhi-Mumbai Expressway, and Eastern Peripheral Roadways.
                </p>

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
