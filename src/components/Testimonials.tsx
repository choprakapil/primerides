"use client";

import React, { useState, useEffect, useRef } from "react";
import { TESTIMONIALS_DATA } from "@/data/faqs";

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1200) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, TESTIMONIALS_DATA.length - visibleCount);

  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 6000);
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

  const dates = ["2 weeks ago", "1 month ago", "3 weeks ago", "5 days ago", "1 month ago", "2 months ago"];

  return (
    <section
      className="section-padding section-white"
      id="testimonialsSection"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Header with Google Rating Badge & Top-Right Slider Arrows */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div className="section-header-block text-start mb-0">
            <div className="google-rating-pill d-inline-flex align-items-center gap-2 mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span className="fw-bold">4.9 ★ GOOGLE REVIEWS (500+ VERIFIED)</span>
            </div>
            <h2 className="section-title-large mb-2">
              Trusted By <span>10,000+ Explorers</span>
            </h2>
            <p className="mb-0" style={{ maxWidth: "680px" }}>
              Read authentic Google reviews from road-trippers who explored India with PrimeRides.
            </p>
          </div>

          {/* Top-Right Arrows */}
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
              aria-label="Previous Testimonials"
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
              aria-label="Next Testimonials"
            >
              <i className="fa-solid fa-chevron-right" style={{ fontSize: "15px" }}></i>
            </button>
          </div>
        </div>

        {/* Google Reviews Carousel Viewport */}
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
            {TESTIMONIALS_DATA.map((t, idx) => (
              <div
                key={idx}
                className="flex-shrink-0"
                style={{
                  width: `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`,
                }}
              >
                <div className="google-review-card h-100 d-flex flex-column">
                  {/* Google Review Card Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={t.img}
                        alt={t.name}
                        className="google-reviewer-avatar"
                      />
                      <div>
                        <div className="d-flex align-items-center gap-1.5">
                          <h5 className="mb-0 fw-bold" style={{ fontSize: "15.5px", color: "#111827" }}>
                            {t.name}
                          </h5>
                          <i className="fa-solid fa-circle-check text-primary" style={{ fontSize: "12px" }} title="Verified Reviewer"></i>
                        </div>
                        <small className="text-muted" style={{ fontSize: "12px" }}>
                          {dates[idx % dates.length]} • Google Review
                        </small>
                      </div>
                    </div>

                    {/* Official Google 4-Color G Logo */}
                    <div className="google-g-logo flex-shrink-0" title="Google Verified Review">
                      <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                    </div>
                  </div>

                  {/* 5 Google Stars */}
                  <div className="mb-2 d-flex align-items-center gap-1" style={{ color: "#f59e0b", fontSize: "14px" }}>
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fa-solid fa-star"></i>
                    ))}
                    <span className="ms-1 fw-bold text-dark" style={{ fontSize: "12.5px" }}>
                      5.0
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="google-review-text mb-3" style={{ color: "#475569", fontSize: "13.5px", lineHeight: 1.65 }}>
                    &ldquo;{t.text}&rdquo;
                  </p>

                  {/* Card Footer: Vehicle Rented */}
                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="badge bg-light text-dark border px-2.5 py-1.5 rounded-2" style={{ fontSize: "11.5px" }}>
                      <i className="fa-solid fa-car me-1 text-gold"></i> {t.car}
                    </span>
                    <span className="small text-success fw-bold" style={{ fontSize: "11.5px" }}>
                      <i className="fa-solid fa-circle-check me-1"></i> Verified Rental
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="d-flex justify-content-center gap-2 mt-4">
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
      </div>
    </section>
  );
}
