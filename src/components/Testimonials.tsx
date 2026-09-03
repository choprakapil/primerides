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

  return (
    <section
      className="section-padding section-white"
      id="testimonialsSection"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Header: Left-aligned Headings + Top Right Arrow Controls */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div className="section-header-block text-start mb-0">
            <span className="section-subtitle-tag">
              <i className="fa-solid fa-star"></i> Traveler Experiences
            </span>
            <h2 className="section-title-large mb-2">
              Trusted By <span>10,000+ Explorers</span>
            </h2>
            <p className="mb-0" style={{ maxWidth: "680px" }}>
              Read real stories from road-trippers who explored India with Primerides self-drive vehicles.
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
            {TESTIMONIALS_DATA.map((t, idx) => (
              <div
                key={idx}
                className="flex-shrink-0"
                style={{
                  width: `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`,
                }}
              >
                <div
                  className="p-4 rounded-4 h-100 d-flex flex-column"
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src={t.img}
                      alt={t.name}
                      style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <h5 className="mb-0 fw-bold" style={{ fontSize: "16px" }}>
                        {t.name}
                      </h5>
                      <small className="text-muted">{t.trip}</small>
                    </div>
                  </div>
                  <div className="mb-3 d-flex gap-1 text-warning" style={{ fontSize: "14px" }}>
                    {[...Array(t.rating)].map((_, i) => (
                      <i key={i} className="fa-solid fa-star" style={{ color: "var(--primary-color)" }}></i>
                    ))}
                  </div>
                  <p className="small mb-4" style={{ color: "var(--text-body)", lineHeight: 1.7 }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <span className="badge bg-light text-dark border">
                      <i className="fa-solid fa-car me-1 text-muted"></i> {t.car}
                    </span>
                    <span className="small text-success fw-bold">
                      <i className="fa-solid fa-circle-check me-1"></i> Verified Trip
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
