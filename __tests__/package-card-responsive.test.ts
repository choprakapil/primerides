import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("CarBookingCard Responsive Package Layout (Issue #28)", () => {
  const cardPath = path.resolve(__dirname, "../src/components/CarBookingCard.tsx");
  const cardSource = fs.readFileSync(cardPath, "utf-8");

  it("does not contain rigid non-responsive grid-cols-2 without single-column fallback for packages", () => {
    // There should be no raw `<div className="grid grid-cols-2 gap-2.5"`
    expect(cardSource).not.toMatch(/className="grid grid-cols-2 gap-2\.5"/);
  });

  it("uses responsive 1-column layout for narrow viewports with 2-column breakpoint for unlogged package selector", () => {
    // Unlogged package selector should use grid-cols-1 min-[400px]:grid-cols-2 or similar
    expect(cardSource).toMatch(
      /className="grid grid-cols-1 min-\[400px\]:grid-cols-2 gap-2\.5"[^>]*aria-label="Available KM Rental Packages"/
    );
  });

  it("uses responsive 1-column layout for narrow viewports with 2-column breakpoint for logged-in customer package selector", () => {
    // Logged-in package selector should use grid-cols-1 min-[400px]:grid-cols-2 or similar
    expect(cardSource).toMatch(
      /className="grid grid-cols-1 min-\[400px\]:grid-cols-2 gap-2\.5"[^>]*aria-label="Rental Package Options"/
    );
  });

  it("uses responsive padding p-4 sm:p-6 md:p-8 to prevent padding squashing on 320px screens", () => {
    // Card containers should use p-4 on narrow mobile viewports
    expect(cardSource).toMatch(/p-4 sm:p-6 md:p-8 rounded-3xl bg-white/);
  });

  it("stacks pickup and return date-time inputs gracefully on mobile viewports", () => {
    expect(cardSource).toMatch(/grid grid-cols-1 sm:grid-cols-2 gap-3/);
  });
});
