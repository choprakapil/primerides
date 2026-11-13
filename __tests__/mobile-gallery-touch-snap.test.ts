import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Mobile Car Gallery Touch Snap (Issue #29)", () => {
  const galleryPath = path.resolve(__dirname, "../src/components/fleet/CarGallery.tsx");
  const slugPagePath = path.resolve(__dirname, "../src/app/cars/[slug]/page.tsx");

  const gallerySource = fs.readFileSync(galleryPath, "utf-8");
  const slugPageSource = fs.readFileSync(slugPagePath, "utf-8");

  it("exports a client component with interactive photo gallery features", () => {
    expect(gallerySource).toMatch(/["']use client["']/);
    expect(gallerySource).toMatch(/export default function CarGallery/);
  });

  it("implements CSS scroll snap on the mobile thumbnail container to prevent cutoffs on swipe", () => {
    // Must feature snap-x, snap-mandatory, scroll-smooth, and touch-pan-x
    expect(gallerySource).toMatch(/snap-x/);
    expect(gallerySource).toMatch(/snap-mandatory/);
    expect(gallerySource).toMatch(/scroll-smooth/);
    expect(gallerySource).toMatch(/touch-pan-x/);
  });

  it("applies snap-start to individual thumbnail items so each card snaps cleanly to viewport edge", () => {
    // Thumbnails must have snap-start to align cleanly
    expect(gallerySource).toMatch(/snap-start/);
    expect(gallerySource).toMatch(/shrink-0/);
  });

  it("integrates CarGallery in the vehicle details page with primary and gallery images", () => {
    expect(slugPageSource).toMatch(/import CarGallery from ["']@\/components\/fleet\/CarGallery["']/);
    expect(slugPageSource).toMatch(/<CarGallery[\s\S]*?primaryImage=\{car\.primary_image/);
    expect(slugPageSource).toMatch(/galleryImages=\{/);
  });

  it("supports keyboard navigation (ArrowLeft and ArrowRight) and WCAG tablist semantics", () => {
    expect(gallerySource).toMatch(/ArrowLeft/);
    expect(gallerySource).toMatch(/ArrowRight/);
    expect(gallerySource).toMatch(/role="tablist"/);
    expect(gallerySource).toMatch(/role="tab"/);
    expect(gallerySource).toMatch(/aria-selected=/);
  });

  it("provides photo counter badge and accessible prev/next stage controls", () => {
    expect(gallerySource).toMatch(/aria-label=\{`Previous photo/);
    expect(gallerySource).toMatch(/aria-label=\{`Next photo/);
    expect(gallerySource).toMatch(/activeIndex \+ 1\} \/ \{images\.length\}/);
  });
});
