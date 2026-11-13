import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  trackBookingStarted,
  trackPaymentCompleted,
  trackPaymentInitiated,
  trackViewItem,
  trackLead,
  trackCustomEvent,
  getDispatchedEvents,
  clearDispatchedEvents,
} from "@/lib/analytics";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import fs from "fs";
import path from "path";

describe("Issue #23: Unified Analytics & Conversion Telemetry (GA4 & Meta Pixel)", () => {
  beforeEach(() => {
    clearDispatchedEvents();
    if (typeof window !== "undefined") {
      delete (window as any).gtag;
      delete (window as any).fbq;
    }
  });

  it("verifies layout.tsx imports and renders AnalyticsScripts", () => {
    const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    expect(layoutContent).toContain('import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";');
    expect(layoutContent).toContain("<AnalyticsScripts />");
  });

  it("verifies AnalyticsScripts configures GA4 and Meta Pixel when env variables are provided", () => {
    const prevGa = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const prevMeta = process.env.NEXT_PUBLIC_META_PIXEL_ID;

    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123456";
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "998877665544332";

    try {
      const element = AnalyticsScripts();
      expect(element).toBeDefined();

      const [gaFragment, metaFragment] = React.Children.toArray(element.props.children) as any[];

      // Verify GA4 Script tags
      const gaChildren = React.Children.toArray(gaFragment.props.children) as any[];
      expect(gaChildren[0].props.src).toBe("https://www.googletagmanager.com/gtag/js?id=G-TEST123456");
      expect(gaChildren[1].props.children).toContain("G-TEST123456");

      // Verify Meta Pixel Script tag
      const metaChildren = React.Children.toArray(metaFragment.props.children) as any[];
      expect(metaChildren[0].props.children).toContain("998877665544332");

      // Verify noscript fallback renders in static HTML
      const html = renderToStaticMarkup(element);
      expect(html).toContain("https://www.facebook.com/tr?id=998877665544332");
    } finally {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = prevGa;
      process.env.NEXT_PUBLIC_META_PIXEL_ID = prevMeta;
    }
  });

  it("dispatches booking_started event with complete e-commerce payload", () => {
    const mockGtag = vi.fn();
    const mockFbq = vi.fn();

    (global as any).window = (global as any).window || {};
    (global as any).window.gtag = mockGtag;
    (global as any).window.fbq = mockFbq;

    trackBookingStarted({
      bookingId: 101,
      bookingCode: "PR/2627/000101",
      carId: 5,
      carName: "Mahindra Thar 4x4",
      price: 9500,
      currency: "INR",
      startDate: "2026-11-01T10:00:00.000Z",
      endDate: "2026-11-03T10:00:00.000Z",
      package: "Unlimited KM Adventure",
    });

    const events = getDispatchedEvents();
    expect(events.length).toBeGreaterThan(0);

    const internalEvent = events.find((e) => e.eventName === "booking_started");
    expect(internalEvent).toBeDefined();
    expect(internalEvent?.payload.booking_code).toBe("PR/2627/000101");
    expect(internalEvent?.payload.value).toBe(9500);
    expect(internalEvent?.payload.items[0].item_name).toBe("Mahindra Thar 4x4");

    // Verify GA4 begin_checkout forward
    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "begin_checkout",
      expect.objectContaining({
        value: 9500,
        currency: "INR",
        booking_code: "PR/2627/000101",
      })
    );

    // Verify Meta InitiateCheckout forward
    expect(mockFbq).toHaveBeenCalledWith(
      "track",
      "InitiateCheckout",
      expect.objectContaining({
        content_name: "Mahindra Thar 4x4",
        value: 9500,
        currency: "INR",
      })
    );
  });

  it("dispatches payment_completed event upon purchase confirmation", () => {
    const mockGtag = vi.fn();
    const mockFbq = vi.fn();

    (global as any).window = (global as any).window || {};
    (global as any).window.gtag = mockGtag;
    (global as any).window.fbq = mockFbq;

    trackPaymentCompleted({
      bookingId: 102,
      bookingCode: "PR/2627/000102",
      amount: 14500,
      currency: "INR",
      transactionRef: "pay_RazorpayTest123",
      carName: "Toyota Fortuner 4x4",
    });

    const events = getDispatchedEvents();
    const internalEvent = events.find((e) => e.eventName === "payment_completed");
    expect(internalEvent).toBeDefined();
    expect(internalEvent?.payload.transaction_id).toBe("pay_RazorpayTest123");
    expect(internalEvent?.payload.value).toBe(14500);

    // Verify GA4 purchase forward
    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "purchase",
      expect.objectContaining({
        transaction_id: "pay_RazorpayTest123",
        value: 14500,
        currency: "INR",
      })
    );

    // Verify Meta Purchase forward
    expect(mockFbq).toHaveBeenCalledWith(
      "track",
      "Purchase",
      expect.objectContaining({
        content_name: "Toyota Fortuner 4x4",
        value: 14500,
        currency: "INR",
        order_id: "pay_RazorpayTest123",
      })
    );
  });

  it("dispatches payment_initiated, view_item, and generate_lead events", () => {
    const mockGtag = vi.fn();
    const mockFbq = vi.fn();

    (global as any).window = (global as any).window || {};
    (global as any).window.gtag = mockGtag;
    (global as any).window.fbq = mockFbq;

    trackPaymentInitiated({
      bookingId: 103,
      amount: 5000,
      currency: "INR",
      orderId: "order_rzp_456",
    });

    trackViewItem({
      id: 12,
      name: "BMW 5 Series Luxury Sedan",
      price: 15000,
      category: "Luxury",
    });

    trackLead({
      type: "whatsapp_reservation",
      carName: "Innova Crysta",
      location: "Delhi T3 Airport",
    });

    const events = getDispatchedEvents();
    expect(events.some((e) => e.eventName === "payment_initiated")).toBe(true);
    expect(events.some((e) => e.eventName === "view_item")).toBe(true);
    expect(events.some((e) => e.eventName === "generate_lead")).toBe(true);

    expect(mockGtag).toHaveBeenCalledWith("event", "add_payment_info", expect.anything());
    expect(mockGtag).toHaveBeenCalledWith("event", "view_item", expect.anything());
    expect(mockGtag).toHaveBeenCalledWith("event", "generate_lead", expect.anything());

    expect(mockFbq).toHaveBeenCalledWith("track", "AddPaymentInfo", expect.anything());
    expect(mockFbq).toHaveBeenCalledWith("track", "ViewContent", expect.anything());
    expect(mockFbq).toHaveBeenCalledWith("track", "Lead", expect.anything());
  });

  it("gracefully operates when gtag and fbq are not available (no errors thrown)", () => {
    (global as any).window = {};

    expect(() => {
      trackBookingStarted({
        carName: "Test Vehicle",
        price: 3000,
      });
      trackPaymentCompleted({
        bookingId: 999,
        amount: 3000,
      });
      trackCustomEvent("test_event", { foo: "bar" });
    }).not.toThrow();

    const events = getDispatchedEvents();
    expect(events.length).toBe(3);
  });
});
