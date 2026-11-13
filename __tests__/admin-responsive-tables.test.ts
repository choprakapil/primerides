import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Issue #24: Admin Tables Responsiveness on Tablet Portrait (768px)", () => {
  const bookingsManagerPath = path.resolve(__dirname, "../src/components/admin/BookingsManager.tsx");
  const fleetManagerPath = path.resolve(__dirname, "../src/components/admin/FleetManager.tsx");

  it("verifies BookingsManager provides tablet portrait and mobile card view fallback", () => {
    const content = fs.readFileSync(bookingsManagerPath, "utf-8");

    // Must have responsive card container for viewport < xl (1200px), covering 768px tablet portrait
    expect(content).toContain("block xl:hidden space-y-3.5");

    // Desktop table must be hidden on tablet portrait / mobile and shown on >= xl
    expect(content).toContain("hidden xl:block overflow-x-auto min-w-0");

    // Must include phone tel: link for one-tap calling
    expect(content).toContain("href={`tel:${b.phone}`}");

    // Must include booking code copy and status trigger
    expect(content).toContain("copyBookingCode(b.booking_code)");
    expect(content).toContain("setEditingStatusBooking(b)");

    // Must include official GST Tax Invoice download
    expect(content).toContain("href={`/api/v1/bookings/${b.id}/invoice`}");

    // Must include KYC driving license badge
    expect(content).toContain("b.hasVerifiedDL");
    expect(content).toContain("Verified DL (Ready)");
    expect(content).toContain("Unverified (DL Required)");

    // Must include quick handover and refund action buttons in the responsive card
    expect(content).toContain("setHandoverBooking(b)");
    expect(content).toContain("openRefundModal(b)");
  });

  it("verifies BookingsManager Leads tab removes strict 1000px min-width and includes responsive cards", () => {
    const content = fs.readFileSync(bookingsManagerPath, "utf-8");

    // Must have responsive card container for leads on tablet portrait
    expect(content).toContain("block xl:hidden space-y-3");

    // Leads desktop table must NOT mandate 1000px minimum width
    expect(content).not.toContain("min-w-[1000px]");

    // Leads desktop table should have reasonable min-width
    expect(content).toContain("min-w-[760px]");

    // Leads responsive card must support tel: link, inspection, and WhatsApp action
    expect(content).toContain("href={`tel:${lead.phone}`}");
    expect(content).toContain("setInspectingLead(lead)");
    expect(content).toContain("api.whatsapp.com/send?phone=");
  });

  it("verifies FleetManager uses col-lg-6 instead of col-md-6 to prevent 2-column squashing at 768px", () => {
    const content = fs.readFileSync(fleetManagerPath, "utf-8");

    // Must not use col-md-6 which breaks at 768px tablet portrait
    expect(content).not.toContain("col-12 col-md-6 col-xl-4");

    // Must use col-lg-6 so cards take full width at 768px with single-column layout
    expect(content).toContain("col-12 col-lg-6 col-xl-4");
  });
});
