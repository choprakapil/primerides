"use client";

import React, { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Camera, Shield } from "lucide-react";

export interface CarGalleryProps {
  primaryImage?: string | null;
  galleryImages?: string[] | null;
  carName: string;
  brand?: string;
  badge?: string | null;
}

export default function CarGallery({
  primaryImage,
  galleryImages,
  carName,
  badge,
}: CarGalleryProps) {
  // Normalize images list from actual vehicle data without hardcoding any specific vehicle's assets
  const fallbackPrimary = "/assets/img/cars/1.jpg";
  const validPrimary = primaryImage && primaryImage.trim() ? primaryImage : fallbackPrimary;

  const validGallery = Array.isArray(galleryImages)
    ? galleryImages.filter((img): img is string => typeof img === "string" && img.trim().length > 0)
    : [];

  const images = Array.from(new Set([validPrimary, ...validGallery]));

  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = useCallback((idx: number) => {
    setActiveIndex(idx);
    const targetThumb = thumbnailRefs.current[idx];
    if (targetThumb && scrollContainerRef.current) {
      targetThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, []);

  const handlePrev = useCallback(() => {
    handleSelect((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length, handleSelect]);

  const handleNext = useCallback(() => {
    handleSelect((activeIndex + 1) % images.length);
  }, [activeIndex, images.length, handleSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrev();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  return (
    <div className="space-y-3" role="region" aria-label={`${carName} photo gallery`}>
      {/* Main Vehicle Showcase Stage: Sleek, Cinematic, Unboxed */}
      <div className="relative h-72 sm:h-[440px] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.06)] flex items-center justify-center group">
        <img
          src={images[activeIndex] || fallbackPrimary}
          alt={`${carName} - View ${activeIndex + 1} of ${images.length}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#090e1a]/85 text-[#f7d58b] backdrop-blur-md shadow-md border border-[#c59b27]/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#c59b27]" />
            <span>Prime Certified Clean</span>
          </span>
          {badge && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-md">
              {badge}
            </span>
          )}
        </div>

        {/* Photo Counter Badge (Only when multi-image) */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 pointer-events-none">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#090e1a]/80 text-white backdrop-blur-md shadow-sm border border-white/15 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {activeIndex + 1} / {images.length}
              </span>
            </span>
          </div>
        )}

        {/* Bottom Floating Assurance Badge */}
        <div className="absolute bottom-4 right-4 pointer-events-none">
          <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/95 text-slate-800 backdrop-blur-md shadow-md border border-slate-200/80 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Commercial Insurance</span>
          </span>
        </div>

        {/* Next & Previous Stage Controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label={`Previous photo of ${carName}`}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg border border-slate-200/80 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label={`Next photo of ${carName}`}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg border border-slate-200/80 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row (Only when multi-image exists) */}
      {images.length > 1 && (
        <div
          ref={scrollContainerRef}
          role="tablist"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label={`${carName} photo angles`}
          className="flex sm:grid sm:grid-cols-4 gap-2.5 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory scroll-smooth touch-pan-x px-1 py-1 focus:outline-none"
        >
          {images.map((img, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <button
                key={idx}
                ref={(el) => {
                  thumbnailRefs.current[idx] = el;
                }}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-label={`View photo angle ${idx + 1} of ${images.length}`}
                onClick={() => handleSelect(idx)}
                className={`snap-start shrink-0 w-24 sm:w-auto h-16 sm:h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 relative ${
                  isSelected
                    ? "border-[#c59b27] ring-2 ring-[#c59b27]/25 shadow-md scale-[1.02]"
                    : "border-slate-200/90 hover:border-amber-300 opacity-75 hover:opacity-100 bg-slate-100"
                }`}
              >
                <img
                  src={img}
                  alt={`${carName} angle ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <span className="absolute bottom-1 right-1.5 w-2 h-2 rounded-full bg-[#c59b27] shadow-xs" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
