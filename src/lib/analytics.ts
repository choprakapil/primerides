/**
 * Unified Analytics & Conversion Telemetry Module
 * Integrates Google Analytics 4 (GA4) and Meta Pixel (Facebook Pixel)
 * with standardized event tracking for luxury mobility booking funnels.
 */

export interface DispatchedAnalyticsEvent {
  platform: "ga4" | "meta" | "internal";
  eventName: string;
  payload: Record<string, any>;
  timestamp: string;
}

// Global in-memory log of dispatched events for development debugging and automated tests
const eventLog: DispatchedAnalyticsEvent[] = [];

export function getDispatchedEvents(): DispatchedAnalyticsEvent[] {
  return [...eventLog];
}

export function clearDispatchedEvents(): void {
  eventLog.length = 0;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    __PRIMERIDES_ANALYTICS_EVENTS__?: DispatchedAnalyticsEvent[];
  }
}

/**
 * Low-level event dispatcher to GA4 and Meta Pixel
 */
export function trackCustomEvent(eventName: string, params: Record<string, any> = {}) {
  const timestamp = new Date().toISOString();
  const eventRecord: DispatchedAnalyticsEvent = {
    platform: "internal",
    eventName,
    payload: params,
    timestamp,
  };
  eventLog.push(eventRecord);

  if (typeof window !== "undefined") {
    window.__PRIMERIDES_ANALYTICS_EVENTS__ = eventLog;

    // Dispatch to Google Analytics 4 (gtag)
    if (typeof window.gtag === "function") {
      try {
        window.gtag("event", eventName, params);
        eventLog.push({
          platform: "ga4",
          eventName,
          payload: params,
          timestamp,
        });
      } catch (err) {
        console.warn("[Analytics:GA4] Event dispatch failed:", err);
      }
    }

    // Dispatch to Meta Pixel (fbq)
    if (typeof window.fbq === "function") {
      try {
        window.fbq("trackCustom", eventName, params);
        eventLog.push({
          platform: "meta",
          eventName,
          payload: params,
          timestamp,
        });
      } catch (err) {
        console.warn("[Analytics:Meta] Event dispatch failed:", err);
      }
    }
  }

  return eventRecord;
}

export interface ViewItemData {
  id: string | number;
  name: string;
  category?: string;
  price?: number;
  currency?: string;
}

/**
 * Track Vehicle Detail Page View
 */
export function trackViewItem(item: ViewItemData) {
  const currency = item.currency || "INR";
  const payload = {
    currency,
    value: item.price || 0,
    items: [
      {
        item_id: String(item.id),
        item_name: item.name,
        item_category: item.category || "Self-Drive Fleet",
        price: item.price || 0,
      },
    ],
  };

  const timestamp = new Date().toISOString();
  eventLog.push({ platform: "internal", eventName: "view_item", payload, timestamp });

  if (typeof window !== "undefined") {
    if (typeof window.gtag === "function") {
      window.gtag("event", "view_item", payload);
      eventLog.push({ platform: "ga4", eventName: "view_item", payload, timestamp });
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "ViewContent", {
        content_name: item.name,
        content_category: item.category || "Self-Drive Fleet",
        content_ids: [String(item.id)],
        content_type: "product",
        value: item.price || 0,
        currency,
      });
      eventLog.push({ platform: "meta", eventName: "ViewContent", payload, timestamp });
    }
  }
}

export interface BookingStartedData {
  bookingId?: number | string;
  bookingCode?: string;
  carId?: number | string;
  carName: string;
  price: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  package?: string;
}

/**
 * Track Checkout Initiation / Booking Form Submission
 */
export function trackBookingStarted(data: BookingStartedData) {
  const currency = data.currency || "INR";
  const payload = {
    booking_id: data.bookingId,
    booking_code: data.bookingCode,
    currency,
    value: data.price,
    items: [
      {
        item_id: String(data.carId || data.bookingId || "rental"),
        item_name: data.carName,
        item_variant: data.package || "Self-Drive Rental",
        price: data.price,
      },
    ],
    start_date: data.startDate,
    end_date: data.endDate,
  };

  const timestamp = new Date().toISOString();
  eventLog.push({ platform: "internal", eventName: "booking_started", payload, timestamp });

  if (typeof window !== "undefined") {
    // GA4 begin_checkout
    if (typeof window.gtag === "function") {
      window.gtag("event", "begin_checkout", payload);
      eventLog.push({ platform: "ga4", eventName: "begin_checkout", payload, timestamp });
    }
    // Meta InitiateCheckout
    if (typeof window.fbq === "function") {
      window.fbq("track", "InitiateCheckout", {
        content_name: data.carName,
        value: data.price,
        currency,
        num_items: 1,
      });
      eventLog.push({ platform: "meta", eventName: "InitiateCheckout", payload, timestamp });
    }
  }
}

export interface PaymentInitiatedData {
  bookingId: number | string;
  amount: number;
  currency?: string;
  orderId?: string;
}

/**
 * Track Payment Gateway Dialog Opening
 */
export function trackPaymentInitiated(data: PaymentInitiatedData) {
  const currency = data.currency || "INR";
  const payload = {
    booking_id: data.bookingId,
    currency,
    value: data.amount,
    payment_type: "Razorpay / UPI",
    order_id: data.orderId,
  };

  const timestamp = new Date().toISOString();
  eventLog.push({ platform: "internal", eventName: "payment_initiated", payload, timestamp });

  if (typeof window !== "undefined") {
    if (typeof window.gtag === "function") {
      window.gtag("event", "add_payment_info", payload);
      eventLog.push({ platform: "ga4", eventName: "add_payment_info", payload, timestamp });
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "AddPaymentInfo", {
        value: data.amount,
        currency,
      });
      eventLog.push({ platform: "meta", eventName: "AddPaymentInfo", payload, timestamp });
    }
  }
}

export interface PaymentCompletedData {
  bookingId: number | string;
  bookingCode?: string;
  amount: number;
  currency?: string;
  transactionRef?: string;
  carName?: string;
}

/**
 * Track Successful Payment & Purchase Conversion
 */
export function trackPaymentCompleted(data: PaymentCompletedData) {
  const currency = data.currency || "INR";
  const payload = {
    transaction_id: data.transactionRef || String(data.bookingId),
    booking_code: data.bookingCode,
    value: data.amount,
    currency,
    items: [
      {
        item_id: String(data.bookingId),
        item_name: data.carName || "Self-Drive Rental",
        price: data.amount,
      },
    ],
  };

  const timestamp = new Date().toISOString();
  eventLog.push({ platform: "internal", eventName: "payment_completed", payload, timestamp });

  if (typeof window !== "undefined") {
    // GA4 purchase
    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", payload);
      eventLog.push({ platform: "ga4", eventName: "purchase", payload, timestamp });
    }
    // Meta Purchase
    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", {
        content_name: data.carName || "Self-Drive Car Rental",
        value: data.amount,
        currency,
        order_id: data.transactionRef || String(data.bookingId),
      });
      eventLog.push({ platform: "meta", eventName: "Purchase", payload, timestamp });
    }
  }
}

export interface LeadData {
  type: string;
  carName?: string;
  location?: string;
  phone?: string;
}

/**
 * Track Customer Inquiry / WhatsApp Lead
 */
export function trackLead(data: LeadData) {
  const payload = {
    lead_type: data.type,
    car_name: data.carName,
    location: data.location,
  };

  const timestamp = new Date().toISOString();
  eventLog.push({ platform: "internal", eventName: "generate_lead", payload, timestamp });

  if (typeof window !== "undefined") {
    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", payload);
      eventLog.push({ platform: "ga4", eventName: "generate_lead", payload, timestamp });
    }
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", {
        content_name: data.carName || data.type,
        content_category: data.location || "Delhi NCR",
      });
      eventLog.push({ platform: "meta", eventName: "Lead", payload, timestamp });
    }
  }
}
