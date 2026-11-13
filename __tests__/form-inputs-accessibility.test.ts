import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Risk #19 Audit: Form Inputs Missing Associated Labels or ARIA Attributes", () => {
  it("Test 1: FleetSearchFilter.tsx has associated labels and ARIA attributes on all filter controls", () => {
    const filePath = path.join(process.cwd(), "src/components/fleet/FleetSearchFilter.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    // Start Date input and label association
    expect(content).toContain('htmlFor="fleet-filter-start-date"');
    expect(content).toContain('id="fleet-filter-start-date"');
    expect(content).toContain('aria-label="Rental pickup date"');

    // End Date input and label association
    expect(content).toContain('htmlFor="fleet-filter-end-date"');
    expect(content).toContain('id="fleet-filter-end-date"');
    expect(content).toContain('aria-label="Rental return date"');

    // Budget Range slider attributes
    expect(content).toContain('htmlFor="fleet-filter-budget"');
    expect(content).toContain('id="fleet-filter-budget"');
    expect(content).toContain('aria-label="Maximum daily rental budget"');
    expect(content).toContain("aria-valuemin={1500}");
    expect(content).toContain("aria-valuemax={15000}");
    expect(content).toContain("aria-valuenow={filters.maxPrice}");
    expect(content).toContain("aria-valuetext=");

    // Brand select
    expect(content).toContain('htmlFor="fleet-filter-brand"');
    expect(content).toContain('id="fleet-filter-brand"');
    expect(content).toContain('aria-label="Filter by vehicle make or brand"');

    // Group semantics & aria-pressed on toggle button groups
    expect(content).toContain('role="group" aria-labelledby="fleet-filter-city-label"');
    expect(content).toContain('role="group" aria-labelledby="fleet-filter-category-label"');
    expect(content).toContain('role="group" aria-labelledby="fleet-filter-transmission-label"');
    expect(content).toContain('role="group" aria-labelledby="fleet-filter-fuel-label"');
    expect(content).toContain('role="group" aria-labelledby="fleet-filter-seats-label"');
    expect(content).toContain("aria-pressed={isSelected}");
  });

  it("Test 2: CarBookingCard.tsx has associated labels and ARIA attributes for booking form inputs", () => {
    const filePath = path.join(process.cwd(), "src/components/CarBookingCard.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    // Pickup DateTime
    expect(content).toContain('htmlFor="booking-pickup-datetime"');
    expect(content).toContain('id="booking-pickup-datetime"');
    expect(content).toContain('aria-label="Pickup Date and Time"');

    // Return DateTime
    expect(content).toContain('htmlFor="booking-return-datetime"');
    expect(content).toContain('id="booking-return-datetime"');
    expect(content).toContain('aria-label="Return Date and Time"');

    // Pickup Address
    expect(content).toContain('htmlFor="booking-pickup-address"');
    expect(content).toContain('id="booking-pickup-address"');
    expect(content).toContain('aria-label="Pickup and Return Address"');

    // Promo Code
    expect(content).toContain('htmlFor="booking-promo-code"');
    expect(content).toContain('id="booking-promo-code"');
    expect(content).toContain('aria-label="Enter promo or coupon code"');
  });

  it("Test 3: HeroSection.tsx has associated labels and ARIA attributes on hero booking form", () => {
    const filePath = path.join(process.cwd(), "src/components/HeroSection.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    // Pickup Location select
    expect(content).toContain('htmlFor="hero-pickup-location"');
    expect(content).toContain('id="hero-pickup-location"');
    expect(content).toContain('aria-label="Pick up Location"');

    // Dropoff Location select
    expect(content).toContain('htmlFor="hero-dropoff-location"');
    expect(content).toContain('id="hero-dropoff-location"');
    expect(content).toContain('aria-label="Drop off Location"');

    // Pickup Date input
    expect(content).toContain('htmlFor="hero-pickup-date"');
    expect(content).toContain('id="hero-pickup-date"');
    expect(content).toContain('aria-label="Pickup Date"');
  });

  it("Test 4: AdminHeader.tsx has accessible name on global operations search input", () => {
    const filePath = path.join(process.cwd(), "src/components/admin/AdminHeader.tsx");
    const content = fs.readFileSync(filePath, "utf-8");

    expect(content).toContain('id="admin-global-search"');
    expect(content).toContain('aria-label="Search operations, reservations, and fleet"');
  });

  it("Test 5: Admin operation managers have accessible names on their search and filter inputs", () => {
    const managers = [
      {
        file: "src/components/admin/BookingsManager.tsx",
        id: "admin-search-bookings",
        ariaLabel: "Search bookings by code, customer, or car",
      },
      {
        file: "src/components/admin/FleetManager.tsx",
        id: "admin-search-fleet",
        ariaLabel: "Search fleet by model, brand, or hub",
      },
      {
        file: "src/components/admin/AccountsManager.tsx",
        id: "admin-search-accounts",
        ariaLabel: "Search transactions by ID, customer, or method",
      },
      {
        file: "src/components/admin/CustomerDirectory.tsx",
        id: "admin-search-customers",
        ariaLabel: "Search customers by name, phone, email, or ID",
      },
      {
        file: "src/components/admin/CouponsManager.tsx",
        id: "admin-search-coupons",
        ariaLabel: "Search coupon code or description",
      },
      {
        file: "src/components/admin/LocationsManager.tsx",
        id: "admin-search-locations",
        ariaLabel: "Search locations by hub, address, or code",
      },
      {
        file: "src/components/admin/TestimonialsManager.tsx",
        id: "admin-search-testimonials",
        ariaLabel: "Search testimonials by client or review text",
      },
      {
        file: "src/components/admin/StaffManager.tsx",
        id: "admin-search-staff",
        ariaLabel: "Search staff by name, email, or role",
      },
      {
        file: "src/components/admin/AuditManager.tsx",
        id: "admin-search-audit",
        ariaLabel: "Search audit logs by action, entity, actor name, or ID",
      },
      {
        file: "src/components/admin/CmsManager.tsx",
        id: "admin-search-faqs",
        ariaLabel: "Search FAQs by question, category, or answer",
      },
    ];

    for (const m of managers) {
      const filePath = path.join(process.cwd(), m.file);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain(`id="${m.id}"`);
      expect(content).toContain(`aria-label="${m.ariaLabel}"`);
    }
  });
});
