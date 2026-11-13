import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import fs from "fs";
import path from "path";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

import CarBookingCard from "@/components/CarBookingCard";

describe("Risk #9 Audit: Keyboard-Inaccessible Rental Package Selection", () => {
  const mockCar = {
    id: 1,
    name: "Mahindra Scorpio-N",
    slug: "mahindra-scorpio-n",
    brand: "Mahindra",
    pricePerDay: 2500,
    securityDeposit: 5000,
    freeKm: 150,
    extraKmRate: 7,
    transmission: "Automatic",
    fuelType: "Diesel",
    seats: 7,
    imageUrl: "/images/scorpio.jpg",
    location: {
      id: 1,
      name: "Delhi Airport Hub",
      city: "Delhi NCR",
      address: "IGI Airport Terminal 3",
    },
    rentalPlans: [
      { id: 101, name: "150 KM / Day", plan_type: "daily", price: 2500, security_deposit: 5000, free_km: 150, extra_km_rate: 7, duration_days: 1 },
      { id: 102, name: "300 KM / Day", plan_type: "daily", price: 4000, security_deposit: 5000, free_km: 300, extra_km_rate: 7, duration_days: 1 },
      { id: 103, name: "Unlimited KM", plan_type: "daily", price: 5500, security_deposit: 5000, free_km: 9999, extra_km_rate: 0, duration_days: 1 },
    ],
  };

  const mockCustomer = {
    id: 42,
    fullName: "Aryan Kapoor",
    phone: "+919876543210",
    email: "aryan@primerides.in",
  };

  it("Test 1: Unauthenticated view renders package selection cards as accessible <button type='button'> elements", () => {
    const html = renderToString(
      React.createElement(CarBookingCard, {
        car: mockCar,
        customer: null,
        slug: mockCar.slug,
      })
    );

    // 1. Group role and label
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Available KM Rental Packages"');

    // 2. Buttons instead of plain divs
    expect(html).toContain('<button type="button"');

    // 3. Aria-pressed attributes for active/inactive state
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');

    // 4. Accessible labels with plan name, price, and free km
    expect(html).toContain('aria-label="150 KM / Day: ₹2,500, 150 km included"');
    expect(html).toContain('aria-label="300 KM / Day: ₹4,000, 300 km included"');
    expect(html).toContain('aria-label="Unlimited KM: ₹5,500, 9999 km included"');

    // 5. Visible keyboard focus rings
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("focus-visible:ring-[#c59b27]");
  });

  it("Test 2: Authenticated booking form renders package cards with interactive button semantics", () => {
    const html = renderToString(
      React.createElement(CarBookingCard, {
        car: mockCar,
        customer: mockCustomer,
        slug: mockCar.slug,
      })
    );

    // 1. Group role and label
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Rental Package Options"');

    // 2. Buttons with type="button" so Enter/Space key triggers selection without submitting the form
    expect(html).toContain('<button type="button"');

    // 3. Selection state announced to assistive technology
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');

    // 4. Focus indicator present
    expect(html).toContain("focus-visible:ring-2");
  });

  it("Test 3: Source code forensics guarantee zero inaccessible <div onClick> for package selection", () => {
    const filePath = path.resolve(__dirname, "../src/components/CarBookingCard.tsx");
    const source = fs.readFileSync(filePath, "utf-8");

    // Must NOT contain <div onClick on package selection
    const packageDivClickRegex = /<div[^>]*onClick=[^>]*setSelectedPlanId/g;
    const matches = source.match(packageDivClickRegex);

    expect(matches).toBeNull();

    // Must contain <button type="button" on setSelectedPlanId
    const packageButtonClickRegex = /<button\s+type="button"[^>]*onClick=\{[^}]*setSelectedPlanId/g;
    const buttonMatches = source.match(packageButtonClickRegex);

    expect(buttonMatches).not.toBeNull();
    expect(buttonMatches?.length).toBe(2); // Both unauth and auth views
  });
});
