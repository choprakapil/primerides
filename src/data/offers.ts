export interface OfferItem {
  id: string;
  tag: string;
  title: string;
  discount: string;
  subtext: string;
  code: string;
  carImg: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  pillBg: string;
  validUntil?: string;
}

export const OFFERS_DATA: OfferItem[] = [
  {
    id: "weekend",
    tag: "Weekend Special",
    title: "Weekend Getaway",
    discount: "Flat 20% OFF",
    subtext: "On all Outstation & Mountain 4x4 Trips",
    code: "WEEKEND20",
    carImg: "/assets/img/cars/11.jpg",
    bgGradient: "linear-gradient(135deg, #ea580c 0%, #f97316 45%, #c2410c 100%)",
    textColor: "#ffffff",
    accentColor: "#fef08a",
    pillBg: "rgba(255, 255, 255, 0.95)",
    validUntil: "2026-12-31",
  },
  {
    id: "first-ride",
    tag: "Welcome Deal",
    title: "First Booking Offer",
    discount: "Get 15% OFF",
    subtext: "Instant discount on your first PrimeRides trip",
    code: "FIRST15",
    carImg: "/assets/img/cars/7.jpg",
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #111827 100%)",
    textColor: "#ffffff",
    accentColor: "#f59e0b",
    pillBg: "#fef3c7",
    validUntil: "2026-12-31",
  },
  {
    id: "monthly",
    tag: "Extended Stays",
    title: "Monthly Rentals",
    discount: "Special Rates",
    subtext: "Up to 35% savings for long drives & corporate",
    code: "LONGDRIVE",
    carImg: "/assets/img/cars/3.jpg",
    bgGradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)",
    textColor: "#ffffff",
    accentColor: "#7dd3fc",
    pillBg: "rgba(255, 255, 255, 0.95)",
    validUntil: "2026-12-31",
  },
];
