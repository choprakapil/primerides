import React from "react";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/blogs";

export default function BlogSection() {
  return (
    <section className="section-padding section-alt" id="blogSection">
      <div className="container">
        <div className="section-header-block">
          <span className="section-subtitle-tag">
            <i className="fa-solid fa-newspaper"></i> Road Trip Journal
          </span>
          <h2 className="section-title-large">
            Latest From Our <span>Travel Desk</span>
          </h2>
          <p>
            Expert driving tips, scenic highway itineraries, mountain pass guides, and road-trip planning advice.
          </p>
        </div>

        <div className="row g-4">
          {BLOG_POSTS.map((b, idx) => (
            <div key={idx} className="col-lg-4 col-md-6">
              <div
                className="rounded-4 overflow-hidden h-100 d-flex flex-column"
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--border-color)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                }}
              >
                <div className="position-relative overflow-hidden" style={{ height: "220px" }}>
                  <img
                    src={b.img}
                    alt={b.title}
                    className="w-100 h-100"
                    style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                  />
                  <span
                    className="position-absolute top-0 start-0 m-3 badge px-3 py-2 rounded-pill text-white fw-bold"
                    style={{ background: "var(--primary-gradient)", fontSize: "11px" }}
                  >
                    {b.tag}
                  </span>
                </div>
                <div className="p-4 d-flex flex-column flex-grow-1">
                  <div className="d-flex justify-content-between text-muted small mb-2">
                    <span>
                      <i className="fa-regular fa-calendar me-1"></i> {b.date}
                    </span>
                    <span>
                      <i className="fa-regular fa-clock me-1"></i> {b.readTime}
                    </span>
                  </div>
                  <h5 className="fw-bold mb-3" style={{ lineHeight: 1.4, fontSize: "17px" }}>
                    <Link href={`/blogs/${b.slug}`} className="text-decoration-none" style={{ color: "var(--text-heading)" }}>
                      {b.title}
                    </Link>
                  </h5>
                  <p className="small text-muted mb-4" style={{ lineHeight: 1.6 }}>
                    {b.excerpt}
                  </p>
                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="small text-muted">
                      By <strong className="text-dark">{b.author}</strong>
                    </span>
                    <Link
                      href={`/blogs/${b.slug}`}
                      className="small fw-bold text-decoration-none"
                      style={{ color: "var(--primary-color)" }}
                    >
                      Read Article <i className="fa-solid fa-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5">
          <Link href="/blogs" className="btn-prime-outline">
            View All Road Trip Guides <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
