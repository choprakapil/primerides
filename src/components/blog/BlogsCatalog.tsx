"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { BlogItemDTO } from "@/server/cms";
import {
  Compass,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Sparkles,
  Car,
  MessageCircle,
  TrendingUp,
  X,
} from "lucide-react";

interface BlogsCatalogProps {
  initialBlogs: BlogItemDTO[];
}

export default function BlogsCatalog({ initialBlogs }: BlogsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Extract unique categories and their counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialBlogs.length };
    initialBlogs.forEach((b) => {
      const cat = b.categoryName || "Travel Journal";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [initialBlogs]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialBlogs.forEach((b) => {
      if (b.categoryName) set.add(b.categoryName);
    });
    return ["all", ...Array.from(set)];
  }, [initialBlogs]);

  // Filtered blogs
  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter((blog) => {
      const matchesCategory =
        selectedCategory === "all" ||
        blog.categoryName.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === "" ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [initialBlogs, selectedCategory, searchQuery]);

  // Featured / Recent Guides for Sidebar
  const recentArticles = useMemo(() => {
    return initialBlogs.slice(0, 3);
  }, [initialBlogs]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedBlogs = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredBlogs.slice(start, start + itemsPerPage);
  }, [filteredBlogs, safePage, itemsPerPage]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    // Smooth scroll to top of list on mobile
    if (typeof window !== "undefined" && window.innerWidth < 992) {
      window.scrollTo({ top: 320, behavior: "smooth" });
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="section-padding bg-[#fafaf9]">
      <div className="container">
        <div className="row g-4 lg:g-5">
          {/* ========================================================
              LEFT COLUMN: SEARCH BAR, ACTIVE FILTERS & BLOG CARDS
             ======================================================== */}
          <div className="col-12 col-lg-8 col-xl-8">
            {/* Top Controls: Search Bar & Count */}
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
              <div>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Showing <strong className="text-dark">{paginatedBlogs.length}</strong> of{" "}
                  <strong className="text-dark">{filteredBlogs.length}</strong> published travel guides
                </p>
                {selectedCategory !== "all" && (
                  <div className="d-inline-flex align-items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-pill bg-light border text-dark" style={{ fontSize: "11.5px" }}>
                    <span>Category: <strong>{selectedCategory}</strong></span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="border-0 bg-transparent p-0 ms-1 text-muted hover:text-dark"
                      title="Clear category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Search */}
              <div className="position-relative" style={{ minWidth: "260px" }}>
                <Search className="w-4 h-4 text-muted position-absolute top-50 start-0 translate-middle-y ms-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search routes, tips, fleet..."
                  className="form-control form-control-sm ps-5 bg-white border rounded-pill text-xs py-2 shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="border-0 bg-transparent position-absolute top-50 end-0 translate-middle-y me-3 text-muted hover:text-dark p-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Empty State */}
            {paginatedBlogs.length === 0 ? (
              <div className="bg-white rounded-4 border p-5 text-center my-4 shadow-sm">
                <Compass className="w-12 h-12 text-warning mx-auto mb-3 opacity-75" />
                <h4 className="fw-bold text-dark mb-2">No Travel Guides Found</h4>
                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "420px", fontSize: "13px" }}>
                  We couldn't find any articles matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try another topic or clear your active filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="btn btn-primary btn-sm px-4 rounded-pill"
                >
                  View All Travel Guides
                </button>
              </div>
            ) : (
              /* Blog Cards Grid - Using Exact Homepage blog-card-prime Structure */
              <div className="row g-4">
                {paginatedBlogs.map((blog) => (
                  <div key={blog.id} className="col-12 col-md-6">
                    <article className="blog-card-prime h-100">
                      <div className="blog-thumb">
                        <img
                          src={blog.featuredImage || "/assets/img/blog/1.jpg"}
                          alt={blog.title}
                          loading="lazy"
                        />
                        <span className="blog-tag-pill">
                          {blog.categoryName}
                        </span>
                      </div>
                      <div className="blog-body flex-grow-1 d-flex flex-column justify-content-between">
                        <div>
                          <div className="blog-meta">
                            <span className="blog-meta-date">
                              <i className="fa-regular fa-calendar me-1"></i> {blog.publishedAt}
                            </span>
                            <span className="blog-meta-read-time">
                              <i className="fa-regular fa-clock me-1"></i> {blog.readTime || "5 min read"}
                            </span>
                          </div>
                          <h3 className="blog-title">
                            <Link href={`/blogs/${blog.slug}`}>
                              {blog.title}
                            </Link>
                          </h3>
                          <p className="blog-excerpt">{blog.summary}</p>
                        </div>
                        <div className="blog-footer mt-3 pt-2">
                          <Link
                            href={`/blogs/${blog.slug}`}
                            className="blog-link"
                          >
                            <span>Read Article</span>
                            <i className="fa-solid fa-arrow-right ms-1.5" aria-hidden="true"></i>
                          </Link>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex align-items-center justify-content-center gap-2 mt-5 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center disabled:opacity-40"
                  style={{ width: "36px", height: "36px" }}
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isCur = pageNum === safePage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`btn btn-sm rounded-circle font-monospace fw-bold d-flex align-items-center justify-content-center ${
                        isCur
                          ? "btn-primary text-white"
                          : "btn-light border text-dark"
                      }`}
                      style={{ width: "36px", height: "36px", fontSize: "12px" }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center disabled:opacity-40"
                  style={{ width: "36px", height: "36px" }}
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ========================================================
              RIGHT COLUMN: SIDEBAR (CATEGORIES, TRENDING, FLEET CTA)
             ======================================================== */}
          <div className="col-12 col-lg-4 col-xl-4">
            <div className="sticky-top" style={{ top: "100px", zIndex: 10 }}>
              <div className="d-flex flex-column gap-4">
                {/* 1. Blog Categories Widget */}
                <div className="card border rounded-4 p-4 shadow-sm bg-white">
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "16px" }}>
                      <FolderOpen className="w-4 h-4 text-[#c59b27]" />
                      <span>Blog Categories</span>
                    </h5>
                    <span className="badge bg-light text-muted border">{categories.length}</span>
                  </div>

                  <div className="d-flex flex-column gap-1.5">
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat;
                      const label = cat === "all" ? "All Travel Guides" : cat;
                      const count = categoryCounts[cat] || 0;

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategorySelect(cat)}
                          className={`w-100 text-start px-3 py-2.5 rounded-3 d-flex align-items-center justify-content-between transition-all border ${
                            isSelected
                              ? "bg-[#0b0f19] text-[#c59b27] border-[#0b0f19] fw-bold shadow-xs"
                              : "bg-white text-secondary border-transparent hover:bg-light hover:text-dark"
                          }`}
                          style={{ fontSize: "13px" }}
                        >
                          <span className="text-truncate me-2">{label}</span>
                          <span
                            className={`badge rounded-pill ${
                              isSelected
                                ? "bg-[#c59b27] text-dark"
                                : "bg-light text-muted border"
                            }`}
                            style={{ fontSize: "11px" }}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Featured / Popular Guides */}
                <div className="card border rounded-4 p-4 shadow-sm bg-white">
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "16px" }}>
                      <TrendingUp className="w-4 h-4 text-[#c59b27]" />
                      <span>Featured Guides</span>
                    </h5>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {recentArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/blogs/${article.slug}`}
                        className="d-flex align-items-center gap-3 text-decoration-none group text-dark"
                      >
                        <div
                          className="rounded-3 overflow-hidden flex-shrink-0 bg-light"
                          style={{ width: "70px", height: "55px" }}
                        >
                          <img
                            src={article.featuredImage || "/assets/img/blog/1.jpg"}
                            alt={article.title}
                            className="w-100 h-100 object-fit-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <span className="text-muted d-block" style={{ fontSize: "10.5px" }}>
                            {article.publishedAt} • {article.categoryName}
                          </span>
                          <h6
                            className="fw-bold mb-0 text-truncate-2 group-hover:text-primary transition-colors"
                            style={{ fontSize: "12.5px", lineHeight: "1.35" }}
                          >
                            {article.title}
                          </h6>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 3. Luxury Self-Drive Callout */}
                <div
                  className="rounded-4 p-4 text-white position-relative overflow-hidden shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #090e1a 0%, #151e30 100%)",
                    border: "1px solid rgba(197, 155, 39, 0.3)",
                  }}
                >
                  <div className="d-inline-flex align-items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-[#c59b27]/20 text-[#c59b27] border border-[#c59b27]/30 mb-3" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>
                    <Sparkles className="w-3 h-3 text-[#c59b27]" />
                    <span>SELF-DRIVE IN DELHI &amp; LUCKNOW</span>
                  </div>

                  <h5 className="fw-bold text-white mb-2" style={{ fontSize: "17px" }}>
                    Planning Your Road Trip?
                  </h5>
                  <p className="text-slate-300 mb-3" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                    Reserve Mahindra Thar 4x4, Toyota Innova Crysta, or luxury BMW sedans with zero advance fee &amp; doorstep handover.
                  </p>

                  <Link
                    href="/cars"
                    className="btn btn-primary btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 fw-semibold"
                  >
                    <Car className="w-4 h-4" />
                    <span>Explore Luxury Fleet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* 4. WhatsApp Road Trip Assistance */}
                <div className="card border rounded-4 p-3 bg-white shadow-sm d-flex flex-row align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-2.5">
                    <div className="avatar rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
                      <i className="fa-brands fa-whatsapp fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "12.5px" }}>Need Itinerary Help?</h6>
                      <small className="text-muted" style={{ fontSize: "11px" }}>Talk to our road trip experts</small>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/919045301702?text=Hi%20PrimeRides%2C%20I%20am%20planning%20a%20road%20trip%20and%20need%20fleet%20recommendations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-success btn-sm px-3 rounded-pill fw-semibold text-xs"
                  >
                    Chat
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
