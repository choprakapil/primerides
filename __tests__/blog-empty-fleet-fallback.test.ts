import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import BlogPostPage from "@/app/blogs/[slug]/page";
import * as fleetModule from "@/server/fleet";
import * as cmsModule from "@/server/cms";

describe("Issue #22: Blog Page Empty Fleet Fallback & TypeError Prevention", () => {
  const sampleBlog = {
    id: 1,
    title: "Delhi to Agra & Jaipur: Golden Triangle Self-Drive Guide",
    slug: "delhi-agra-jaipur-golden-triangle",
    summary: "Complete route guide, toll plaza information, and best vehicle recommendations for the Delhi-Agra-Jaipur circuit.",
    content: "### Trip Overview\n\nThe Golden Triangle connects Delhi, Agra, and Jaipur.\n\n- Ensure cold tyre pressure is set to 33 PSI.\n- FASTag is mandatory at all toll plazas.\n\nEnjoy a luxury self-drive road trip.",
    featuredImage: "/assets/img/blog/golden-triangle.jpg",
    publishedAt: "15 Oct 2026",
    categoryName: "Road Trip Guide",
    readTime: "6 min read",
    authorName: "PrimeRides Travel Desk",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(cmsModule, "getBlogBySlug").mockResolvedValue(sampleBlog as any);
    vi.spyOn(cmsModule, "getBlogs").mockResolvedValue([sampleBlog] as any);
  });

  it("safely renders BlogPostPage when getFleetCars returns an empty array [] without crashing", async () => {
    vi.spyOn(fleetModule, "getFleetCars").mockResolvedValue([] as any);

    // Should resolve without throwing any TypeError: Cannot read properties of undefined (reading 'slug')
    const pageJsx = await BlogPostPage({
      params: Promise.resolve({ slug: "delhi-agra-jaipur-golden-triangle" }),
    });

    expect(pageJsx).toBeDefined();

    const html = renderToStaticMarkup(pageJsx);

    // Verify fallback self-drive fleet card is rendered
    expect(html).toContain("Verified Self-Drive Fleet");
    expect(html).toContain("Explore All Available Vehicles");
    expect(html).toContain("View Fleet Inventory");
    expect(html).toContain('href="/cars"');
    // Verify it did not attempt to link to undefined or null slug
    expect(html).not.toContain("/cars/undefined");
  });

  it("safely handles getFleetCars returning null or undefined (e.g. database blip)", async () => {
    vi.spyOn(fleetModule, "getFleetCars").mockResolvedValue(null as any);

    const pageJsx = await BlogPostPage({
      params: Promise.resolve({ slug: "delhi-agra-jaipur-golden-triangle" }),
    });

    expect(pageJsx).toBeDefined();
    const html = renderToStaticMarkup(pageJsx);

    expect(html).toContain("Verified Self-Drive Fleet");
    expect(html).toContain("Explore All Available Vehicles");
    expect(html).toContain('href="/cars"');
  });

  it("safely handles cars with null/undefined slug in fleet array without throwing TypeError", async () => {
    vi.spyOn(fleetModule, "getFleetCars").mockResolvedValue([
      { id: 99, name: "Unnamed Prototype", slug: undefined, brand: "Custom", price_per_day: 4000 },
    ] as any);

    const pageJsx = await BlogPostPage({
      params: Promise.resolve({ slug: "delhi-agra-jaipur-golden-triangle" }),
    });

    expect(pageJsx).toBeDefined();
    const html = renderToStaticMarkup(pageJsx);
    // Should fallback link to /cars when car slug is falsy
    expect(html).not.toContain("/cars/undefined");
  });

  it("renders recommended vehicle card when matching fleet cars are available", async () => {
    vi.spyOn(fleetModule, "getFleetCars").mockResolvedValue([
      {
        id: 1,
        name: "Toyota Fortuner 4x4",
        slug: "toyota-fortuner-4x4-automatic",
        brand: "Toyota",
        price_per_day: 7500,
        primary_image: "/assets/img/cars/fortuner.jpg",
        location: { city: "Delhi NCR" },
      },
    ] as any);

    const pageJsx = await BlogPostPage({
      params: Promise.resolve({ slug: "delhi-agra-jaipur-golden-triangle" }),
    });

    expect(pageJsx).toBeDefined();
    const html = renderToStaticMarkup(pageJsx);

    expect(html).toContain("Recommended Self-Drive Vehicle For This Route");
    expect(html).toContain("Toyota Fortuner 4x4");
    expect(html).toContain('href="/cars/toyota-fortuner-4x4-automatic"');
    expect(html).toContain("Book This Car");
  });

  it("safely handles null/empty blog content without splitting error", async () => {
    vi.spyOn(cmsModule, "getBlogBySlug").mockResolvedValue({
      ...sampleBlog,
      content: null as any,
    });
    vi.spyOn(fleetModule, "getFleetCars").mockResolvedValue([]);

    const pageJsx = await BlogPostPage({
      params: Promise.resolve({ slug: "delhi-agra-jaipur-golden-triangle" }),
    });

    expect(pageJsx).toBeDefined();
    const html = renderToStaticMarkup(pageJsx);
    expect(html).toContain("Verified Self-Drive Fleet");
  });
});
