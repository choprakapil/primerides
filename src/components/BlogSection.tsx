"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/blogs";

export default function BlogSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 992) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, BLOG_POSTS.length - visibleCount);

  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) handleNext();
    else if (diff < -45) handlePrev();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const gap = 24;

  return (
    <section
      className="section-padding section-alt"
      id="blogSection"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Header: Left-aligned Headings + Top Right Arrow Controls */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div className="section-header-block text-start mb-0">
            <span className="section-subtitle-tag">
              <i className="fa-solid fa-newspaper"></i> Road Trip Journal
            </span>
            <h2 className="section-title-large mb-2">
              Latest From Our <span>Travel Desk</span>
            </h2>
            <p className="mb-0" style={{ maxWidth: "680px" }}>
              Expert driving tips, scenic highway itineraries, mountain pass guides, and road-trip planning advice.
            </p>
          </div>

          {/* Arrows on Top Right */}
          <div className="d-flex gap-2 mt-3 mt-md-0 align-self-start align-self-md-end flex-shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              className="carousel-arrow-btn"
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: "var(--primary-color)",
                color: "#ffffff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 4px 14px rgba(197, 155, 39, 0.35)",
              }}
              aria-label="Previous Blogs"
            >
              <i className="fa-solid fa-chevron-left" style={{ fontSize: "15px" }}></i>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="carousel-arrow-btn"
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: "var(--primary-color)",
                color: "#ffffff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 4px 14px rgba(197, 155, 39, 0.35)",
              }}
              aria-label="Next Blogs"
            >
              <i className="fa-solid fa-chevron-right" style={{ fontSize: "15px" }}></i>
            </button>
          </div>
        </div>

        {/* Carousel Viewport with 24px Gutter Spacing */}
        <div
          className="position-relative overflow-hidden pb-1"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="d-flex"
            style={{
              gap: `${gap}px`,
              transform: `translateX(calc(-${currentIndex} * ((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount} + ${gap}px)))`,
              transition: "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
              willChange: "transform",
            }}
          >
            {BLOG_POSTS.map((b, idx) => (
              <div
                key={idx}
                className="flex-shrink-0"
                style={{
                  width: `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`,
                }}
              >
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
                    <div className="mt-auto pt-3 border-top d-flex justify-content-end align-items-center">
                      <Link
                        href={"/blogs/" + b.slug}
                        className="small fw-bold text-decoration-none d-inline-flex align-items-center gap-1.5"
                        style={{ color: "var(--primary-color)" }}
                      >
                        <span>Read Article</span>
                        <i className="fa-solid fa-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="d-flex justify-content-center gap-2 mt-4 mb-2">
          {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => setCurrentIndex(dotIdx)}
              style={{
                width: dotIdx === currentIndex ? "26px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background: dotIdx === currentIndex ? "var(--primary-color)" : "#cbd5e1",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              aria-label={`Slide ${dotIdx + 1}`}
            />
          ))}
        </div>

        {/* View All Guides Link */}
        <div className="text-center mt-4">
          <Link href="/blogs" className="btn-prime-outline">
            View All Road Trip Guides <i className="fa-solid fa-arrow-right ms-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
