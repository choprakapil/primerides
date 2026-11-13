import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { buildCategoryWhere, getFleetCars, getFleetCarsWithAvailability } from "@/server/fleet";
import { GET } from "@/app/api/v1/cars/route";
import { NextRequest } from "next/server";

describe("Issue #21: Footer Category Links & Query Parameter Resolution", () => {
  it("verifies Footer.tsx uses canonical ?category= links and has no broken ?filter= links", () => {
    const footerPath = path.join(process.cwd(), "src/components/Footer.tsx");
    const footerContent = fs.readFileSync(footerPath, "utf-8");

    // Ensure no ?filter= links exist in Footer
    expect(footerContent).not.toContain("/cars?filter=");

    // Ensure all 5 fleet categories are present with ?category=
    expect(footerContent).toContain('href="/cars?category=hatchback"');
    expect(footerContent).toContain('href="/cars?category=compact-suv"');
    expect(footerContent).toContain('href="/cars?category=adventure"');
    expect(footerContent).toContain('href="/cars?category=suv"');
    expect(footerContent).toContain('href="/cars?category=luxury"');
  });

  it("verifies FleetSearchFilter.tsx contains all 5 fleet categories and matches slugs", () => {
    const filterPath = path.join(process.cwd(), "src/components/fleet/FleetSearchFilter.tsx");
    const filterContent = fs.readFileSync(filterPath, "utf-8");

    expect(filterContent).toContain('value: "all"');
    expect(filterContent).toContain('value: "suv"');
    expect(filterContent).toContain('value: "compact-suv"');
    expect(filterContent).toContain('value: "adventure"');
    expect(filterContent).toContain('value: "hatchback"');
    expect(filterContent).toContain('value: "luxury"');
  });

  it("verifies FleetSearchResults.tsx and CarsPage parse category, filter, and type", () => {
    const resultsPath = path.join(process.cwd(), "src/components/fleet/FleetSearchResults.tsx");
    const resultsContent = fs.readFileSync(resultsPath, "utf-8");
    expect(resultsContent).toContain('searchParams?.get("category") || searchParams?.get("filter") || searchParams?.get("type")');

    const pagePath = path.join(process.cwd(), "src/app/cars/page.tsx");
    const pageContent = fs.readFileSync(pagePath, "utf-8");
    expect(pageContent).toContain("resolvedParams.category");
    expect(pageContent).toContain("resolvedParams.filter");
    expect(pageContent).toContain("categorySlug: category && category !== \"all\" ? category : undefined");
  });

  describe("buildCategoryWhere mapping function", () => {
    it("returns empty object for undefined or 'all'", () => {
      expect(buildCategoryWhere()).toEqual({});
      expect(buildCategoryWhere(undefined, "all")).toEqual({});
    });

    it("prefers categoryId when provided", () => {
      expect(buildCategoryWhere(5, "suv")).toEqual({ category_id: 5 });
    });

    it("maps hatchback to include standard and premium hatchbacks", () => {
      const clause = buildCategoryWhere(undefined, "hatchback");
      expect(clause).toEqual({
        category: {
          slug: { in: ["hatchback", "premium-hatchbacks", "hatchbacks"] },
        },
      });
    });

    it("maps suv and compact-suv to their respective slug arrays", () => {
      const suvClause = buildCategoryWhere(undefined, "suv");
      expect(suvClause).toEqual({
        category: {
          slug: { in: ["suv", "suvs", "7-seater-suv"] },
        },
      });

      const compactClause = buildCategoryWhere(undefined, "compact-suv");
      expect(compactClause).toEqual({
        category: {
          slug: { in: ["compact-suv", "compact-suvs"] },
        },
      });
    });

    it("maps adventure and 4x4", () => {
      const advClause = buildCategoryWhere(undefined, "adventure");
      expect(advClause).toEqual({
        category: {
          slug: { in: ["adventure", "4x4", "adventure-4x4"] },
        },
      });
    });

    it("maps luxury and legacy sedan alias", () => {
      const luxClause = buildCategoryWhere(undefined, "luxury");
      expect(luxClause).toEqual({
        category: {
          slug: { in: ["luxury", "sedan", "sedans", "luxury-sedans"] },
        },
      });

      const sedanClause = buildCategoryWhere(undefined, "sedan");
      expect(sedanClause).toEqual({
        category: {
          slug: { in: ["luxury", "sedan", "sedans", "luxury-sedans"] },
        },
      });
    });
  });

  describe("Database fleet retrieval filtered by category", () => {
    it("successfully fetches vehicles filtered by categorySlug", async () => {
      const suvCars = await getFleetCars({ categorySlug: "suv" });
      expect(Array.isArray(suvCars)).toBe(true);
      if (suvCars.length > 0) {
        for (const car of suvCars) {
          expect(["suv", "suvs", "7-seater-suv"]).toContain(car.category.slug);
        }
      }

      const advCars = await getFleetCarsWithAvailability({ categorySlug: "adventure" });
      expect(Array.isArray(advCars)).toBe(true);
      if (advCars.length > 0) {
        for (const car of advCars) {
          expect(["adventure", "4x4", "adventure-4x4"]).toContain(car.category.slug);
        }
      }
    });
  });

  describe("API Endpoint GET /api/v1/cars parameter compatibility", () => {
    it("handles ?category= query parameter", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/cars?category=suv");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data.cars)).toBe(true);
    });

    it("handles legacy ?filter= query parameter for backwards compatibility", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/cars?filter=adventure");
      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data.cars)).toBe(true);
    });
  });
});
