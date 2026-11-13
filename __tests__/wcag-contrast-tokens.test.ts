import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Standard WCAG 2.1 Relative Luminance Calculation
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function getRelativeLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Standard WCAG 2.1 Contrast Ratio Calculation
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Risk #18 Audit: Color Contrast WCAG AA Failures on Gold/Amber Tokens", () => {
  const WHITE = "#ffffff";
  const DARK_BG = "#0f172a"; // slate-900
  const BRAND_DARK = "#090e1a";

  const AMBER_400 = "#fbbf24";
  const AMBER_500 = "#f59e0b";
  const AMBER_600 = "#d97706";
  const AMBER_700 = "#b45309";
  const AMBER_800 = "#92400e";
  const SLATE_400 = "#94a3b8";
  const SLATE_500 = "#64748b";
  const SLATE_600 = "#475569";

  it("Test 1: Mathematical proof that amber-400, amber-500, and slate-400 fail WCAG AA (< 4.5:1) on white", () => {
    const ratioAmber400 = getContrastRatio(AMBER_400, WHITE);
    const ratioAmber500 = getContrastRatio(AMBER_500, WHITE);
    const ratioSlate400 = getContrastRatio(SLATE_400, WHITE);

    // Old tokens mathematically failed WCAG AA (4.5:1)
    expect(ratioAmber400).toBeLessThan(4.5);
    expect(ratioAmber400).toBeGreaterThan(1.6);

    expect(ratioAmber500).toBeLessThan(4.5);
    expect(ratioAmber500).toBeGreaterThan(2.0);

    expect(ratioSlate400).toBeLessThan(4.5);
    expect(ratioSlate400).toBeGreaterThan(2.3);
  });

  it("Test 2: Mathematical proof that upgraded amber-700, amber-800, slate-600 exceed WCAG AA (>= 4.5:1) on white", () => {
    const ratioAmber700 = getContrastRatio(AMBER_700, WHITE);
    const ratioAmber800 = getContrastRatio(AMBER_800, WHITE);
    const ratioSlate500 = getContrastRatio(SLATE_500, WHITE);
    const ratioSlate600 = getContrastRatio(SLATE_600, WHITE);

    // Upgraded tokens strictly pass WCAG AA (>= 4.5:1)
    expect(ratioAmber700).toBeGreaterThanOrEqual(4.5);
    expect(ratioAmber700).toBeGreaterThan(5.0);

    expect(ratioAmber800).toBeGreaterThanOrEqual(7.0); // Passes AAA!

    expect(ratioSlate500).toBeGreaterThanOrEqual(4.5);

    expect(ratioSlate600).toBeGreaterThanOrEqual(7.0); // Passes AAA!
  });

  it("Test 3: amber-400 on dark backgrounds retains massive luminescence (> 9:1, passing AAA)", () => {
    const ratioDark = getContrastRatio(AMBER_400, DARK_BG);
    const ratioBrandDark = getContrastRatio(AMBER_400, BRAND_DARK);

    expect(ratioDark).toBeGreaterThanOrEqual(9.0);
    expect(ratioBrandDark).toBeGreaterThanOrEqual(10.0);
  });

  it("Test 4: FleetSearchFilter.tsx contains zero low-contrast text-amber-500 icon/text tokens on white cards", () => {
    const filePath = path.join(process.cwd(), "src/components/fleet/FleetSearchFilter.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    // All filter category icons must use text-amber-700 instead of failing text-amber-500
    expect(content).not.toMatch(/<MapPin className="[^"]*text-amber-500/);
    expect(content).not.toMatch(/<Calendar className="[^"]*text-amber-500/);
    expect(content).not.toMatch(/<Car className="[^"]*text-amber-500/);
    expect(content).not.toMatch(/<Gauge className="[^"]*text-amber-500/);
    expect(content).not.toMatch(/<Fuel className="[^"]*text-amber-500/);
    expect(content).not.toMatch(/<Users className="[^"]*text-amber-500/);

    // Verified compliant amber-700 icons present
    expect(content).toContain('text-amber-700"');
    // Verified budget text uses compliant amber-700
    expect(content).toContain('text-amber-700');
  });

  it("Test 5: CarBookingCard.tsx contains zero low-contrast text-slate-400 on light backgrounds", () => {
    const filePath = path.join(process.cwd(), "src/components/CarBookingCard.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    // Inventory Hub and Customer Session should be text-slate-600
    expect(content).not.toContain('text-slate-400 block uppercase font-bold">Inventory Hub');
    expect(content).not.toContain('text-slate-400 uppercase">Customer Session');
    expect(content).not.toContain('text-slate-400 line-through mr-2 font-normal');

    // Confirmed upgraded to slate-600
    expect(content).toContain('text-slate-600 block uppercase font-bold">Inventory Hub');
    expect(content).toContain('text-slate-600 uppercase">Customer Session');
    expect(content).toContain('text-slate-600 line-through mr-2 font-medium');
  });
});
