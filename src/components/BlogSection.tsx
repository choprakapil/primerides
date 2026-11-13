"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BLOG_POSTS } from "@/data/blogs";
import CarouselControls from "@/components/CarouselControls";

export default function BlogSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      let nextVisibleCount = 4;
      if (window.innerWidth < 768) {
        nextVisibleCount = 1;
      } else if (window.innerWidth < 992) {
        nextVisibleCount = 2;
      } else if (window.innerWidth < 1200) {
        nextVisibleCount = 3;
      }
      setVisibleCount(nextVisibleCount);
      setCurrentIndex((index) => Math.min(index, Math.max(0, BLOG_POSTS.length - nextVisibleCount)));
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

          {/* Match the fleet carousel count, progress, and arrow controls */}
          <CarouselControls currentIndex={currentIndex} maxIndex={maxIndex} onPrevious={handlePrev} onNext={handleNext} label="Blog carousel controls" previousLabel="Previous blog posts" nextLabel="Next blog posts" className="carousel-controls-desktop mt-3 mt-md-0 align-self-start align-self-md-end flex-shrink-0" />
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
                <article className="blog-card-prime">
                  <div className="blog-thumb">
                    <img
                      src={b.img}
                      alt={b.title}
                      loading="lazy"
                    />
                    <span className="blog-tag-pill">
                      {b.tag}
                    </span>
                  </div>
                  <div className="blog-body">
                    <div className="blog-meta">
                      <span className="blog-meta-date">
                        <i className="fa-regular fa-calendar me-1"></i> {b.date}
                      </span>
                      <span className="blog-meta-read-time">
                        <i className="fa-regular fa-clock me-1"></i> {b.readTime}
                      </span>
                    </div>
                    <h3 className="blog-title">
                      <Link href={`/blogs/${b.slug}`}>
                        {b.title}
                      </Link>
                    </h3>
                    <p className="blog-excerpt">{b.excerpt}</p>
                    <div className="blog-footer">
                      <Link
                        href={"/blogs/" + b.slug}
                        className="blog-link"
                      >
                        <span>Read Article</span>
                        <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
        <CarouselControls currentIndex={currentIndex} maxIndex={maxIndex} onPrevious={handlePrev} onNext={handleNext} label="Blog carousel controls" previousLabel="Previous blog posts" nextLabel="Next blog posts" className="carousel-controls-mobile" />

        {/* View All Guides Link */}
        <div className="text-center mt-4">
          <Link href="/blogs" className="btn-prime-outline blog-view-all-btn">
            View All Road Trip Guides <i className="fa-solid fa-arrow-right ms-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
