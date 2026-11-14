"use client";

import React, { useState, useEffect, useRef } from "react";
import { FLEET_CARS } from "@/data/fleet";
import CarouselControls from "@/components/CarouselControls";
import CarCard from "@/components/fleet/CarCard";

interface CarsCategoryProps {
  initialCars?: any[];
}

export default function CarsCategory({ initialCars }: CarsCategoryProps) {
  const [cars, setCars] = useState<any[]>(
    Array.isArray(initialCars) && initialCars.length > 0 ? initialCars : FLEET_CARS
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sync with initialCars if passed or fetch from live database API
  useEffect(() => {
    if (Array.isArray(initialCars) && initialCars.length > 0) {
      setCars(initialCars);
      return;
    }

    fetch("/api/v1/cars")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setCars(json.data);
        }
      })
      .catch((err) => console.error("Error loading live fleet for carousel:", err));
  }, [initialCars]);

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

  const maxIndex = Math.max(0, cars.length - visibleCount);

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, maxIndex));
  }, [maxIndex]);

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
      className="section-padding section-alt position-relative overflow-hidden"
      id="categoriesSection"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        {/* Header with Title & Top-Right Slider Arrows */}
        <div className="fleet-section-heading d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 pb-2">
          <div className="section-header-block text-start mb-0">
            <span className="section-subtitle-tag">
              <i className="fa-solid fa-fire text-gold"></i> Top-Rated Fleet
            </span>
            <h2 className="section-title-large mb-2">
              Most Booked <span>Cars</span>
            </h2>
            <p className="mb-0" style={{ maxWidth: "680px" }}>
              Our highest-rated self-drive SUVs, 4x4s, and premium vehicles across Delhi NCR &amp; Lucknow with flexible KM packages and zero hidden fees.
            </p>
          </div>

          {/* Top-Right Slider Controls */}
          <CarouselControls
            currentIndex={currentIndex}
            maxIndex={maxIndex}
            onPrevious={handlePrev}
            onNext={handleNext}
            label="Fleet carousel controls"
            previousLabel="Previous cars"
            nextLabel="Next cars"
            className="carousel-controls-desktop mt-3 mt-md-0 align-self-start align-self-md-end flex-shrink-0"
          />
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
            {cars.map((car) => (
              <div
                key={car.slug || car.id}
                className="flex-shrink-0 align-self-start"
                style={{
                  width: `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`,
                }}
              >
                <CarCard car={car} variant="carousel" />
              </div>
            ))}
          </div>
        </div>
        <CarouselControls
          currentIndex={currentIndex}
          maxIndex={maxIndex}
          onPrevious={handlePrev}
          onNext={handleNext}
          label="Fleet carousel controls"
          previousLabel="Previous cars"
          nextLabel="Next cars"
          className="carousel-controls-mobile"
        />
      </div>
    </section>
  );
}
