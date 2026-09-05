"use client";

import React, { useState, useEffect, useRef } from "react";
import { FLEET_CARS } from "@/data/fleet";
import { useModal } from "@/context/ModalContext";

export default function CarsCategory() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedKmMap, setSelectedKmMap] = useState<Record<string, string>>({});
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const { openBookingModal } = useModal();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        setVisibleCount(1);
      } else if (window.innerWidth < 992) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1200) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, FLEET_CARS.length - visibleCount);

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

  const kmOptions = ["250 KM", "375 KM", "525 KM"];

  const handleKmSelect = (carId: string, km: string) => {
    setSelectedKmMap((prev) => ({ ...prev, [carId]: km }));
  };

  const gap = 24;

  return (
    <section
      className="section-padding section-white position-relative overflow-hidden"
      id="categoriesSection"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Header with Title & Top-Right Slider Arrows */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 pb-2">
          <div className="section-header-block text-start mb-0">
            <span className="section-subtitle-tag">
              <i className="fa-solid fa-fire text-gold"></i> Top-Rated Fleet
            </span>
            <h2 className="section-title-large mb-2">
              Most Booked <span>Cars</span>
            </h2>
            <p className="mb-0" style={{ maxWidth: "680px" }}>
              Our highest-rated self-drive SUVs, 4x4s, and premium vehicles across Delhi NCR with unlimited kilometers and zero hidden fees.
            </p>
          </div>

          {/* Top-Right Slider Controls */}
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
              aria-label="Previous Cars"
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
              aria-label="Next Cars"
            >
              <i className="fa-solid fa-chevron-right" style={{ fontSize: "15px" }}></i>
            </button>
          </div>
        </div>

        {/* Single Smooth Carousel Viewport */}
        <div
          className="position-relative overflow-hidden pb-2"
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
            {FLEET_CARS.map((car) => {
              const selectedKm = selectedKmMap[car.id] || "250 KM";
              return (
                <div
                  key={car.id}
                  className="flex-shrink-0"
                  style={{
                    width: `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`,
                  }}
                >
                  <div className="modern-car-card h-100 d-flex flex-column">
                    {/* Car Image Preview */}
                    <div className="modern-car-img-box position-relative">
                      <img
                        src={car.img}
                        alt={car.name}
                        className="modern-car-img"
                      />
                      {car.badge && (
                        <span className="modern-car-badge position-absolute top-0 start-0 m-2">
                          {car.badge}
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="modern-car-body d-flex flex-column flex-grow-1">
                      {/* Car Name */}
                      <h3 className="modern-car-name mb-2" title={car.name}>
                        {car.name}
                      </h3>

                      {/* Specs Row: Transmission, Fuel, Seats */}
                      <div className="modern-car-specs d-flex align-items-center gap-3 mb-3">
                        <span className="spec-item d-flex align-items-center gap-1">
                          <i className="fa-solid fa-gear text-muted"></i>
                          <span>{car.transmission.split(" ")[0]}</span>
                        </span>
                        <span className="spec-item d-flex align-items-center gap-1">
                          <i className="fa-solid fa-gas-pump text-muted"></i>
                          <span>{car.fuel.split(" ")[0]}</span>
                        </span>
                        <span className="spec-item d-flex align-items-center gap-1">
                          <i className="fa-solid fa-user-group text-muted"></i>
                          <span>{car.seats.split(" ")[0]} Seats</span>
                        </span>
                      </div>

                      {/* Price Line */}
                      <div className="modern-car-price mb-2">
                        <span className="price-val">{car.price}</span>
                        <span className="price-unit"> / day</span>
                      </div>

                      {/* KM Package Selector */}
                      <div className="modern-km-packages d-flex align-items-center gap-2 mb-3">
                        {kmOptions.map((km) => (
                          <button
                            key={km}
                            type="button"
                            className={`km-pill-btn ${selectedKm === km ? "active" : ""}`}
                            onClick={() => handleKmSelect(car.id, km)}
                          >
                            {km}
                          </button>
                        ))}
                      </div>

                      {/* View Car Details / Book Button - styled with header call style */}
                      <div className="mt-auto pt-2">
                        <button
                          type="button"
                          onClick={() => openBookingModal(car.name, car.priceRaw, car.img)}
                          className="modern-card-btn w-100 d-flex align-items-center justify-content-center gap-2"
                        >
                          <span>View Car Details</span>
                          <i className="fa-solid fa-arrow-right arrow-icon"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
