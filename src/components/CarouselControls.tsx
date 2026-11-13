"use client";

type CarouselControlsProps = {
  currentIndex: number;
  maxIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  label: string;
  previousLabel: string;
  nextLabel: string;
  className?: string;
};

export default function CarouselControls({
  currentIndex,
  maxIndex,
  onPrevious,
  onNext,
  label,
  previousLabel,
  nextLabel,
  className = "",
}: CarouselControlsProps) {
  const total = maxIndex + 1;

  return (
    <div className={`fleet-carousel-controls ${className}`} role="group" aria-label={label}>
      <span className="fleet-carousel-count" aria-live="polite">
        <strong>{String(currentIndex + 1).padStart(2, "0")}</strong>
        <span> / {String(total).padStart(2, "0")}</span>
      </span>
      <span className="fleet-carousel-progress" aria-hidden="true">
        <span style={{ width: `${((currentIndex + 1) / total) * 100}%` }} />
      </span>
      <button type="button" onClick={onPrevious} className="carousel-arrow-btn" aria-label={previousLabel}>
        <i className="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <button type="button" onClick={onNext} className="carousel-arrow-btn" aria-label={nextLabel}>
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  );
}
