"use client";

import React, { useState } from "react";
import { MotionIcon } from "motion-icons-react";
import { OFFERS_DATA } from "@/data";

interface OffersSectionProps {
  initialOffers?: any[];
}

const PALETTES = [
  {
    bgGradient: "linear-gradient(135deg, #ea580c 0%, #f97316 45%, #c2410c 100%)", // Warm Vibrant Terracotta / Orange
    textColor: "#ffffff",
    accentColor: "#fef08a",
    pillBg: "rgba(255, 255, 255, 0.95)",
  },
  {
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #111827 100%)", // Deep Midnight Slate
    textColor: "#ffffff",
    accentColor: "#f59e0b",
    pillBg: "#fef3c7",
  },
  {
    bgGradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%)", // Royal Ocean Blue
    textColor: "#ffffff",
    accentColor: "#7dd3fc",
    pillBg: "rgba(255, 255, 255, 0.95)",
  },
];

export default function OffersSection({ initialOffers }: OffersSectionProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Dynamically resolve offers from live database coupons with rich presentation fallbacks
  const offersList = React.useMemo(() => {
    if (Array.isArray(initialOffers) && initialOffers.length > 0) {
      const fallbackImages = [
        "/assets/img/cars/11.jpg",
        "/assets/img/cars/7.jpg",
        "/assets/img/cars/3.jpg",
      ];

      return initialOffers.slice(0, 3).map((c, idx) => {
        const isPct = c.discount_type === "percentage";
        const discountLabel = isPct ? `${c.discount_value}% OFF` : `₹${Number(c.discount_value).toLocaleString("en-IN")} FLAT OFF`;
        const minOrder = c.min_booking_amount ? `Min spend ₹${Number(c.min_booking_amount).toLocaleString("en-IN")}.` : "";
        const maxDisc = c.max_discount_amount ? `Max discount ₹${Number(c.max_discount_amount).toLocaleString("en-IN")}.` : "";
        const palette = PALETTES[idx % PALETTES.length];

        return {
          id: c.code.toLowerCase(),
          tag: isPct ? "Special Percentage Savings" : "Welcome Deal",
          title: c.description || `Exclusive Savings with Code ${c.code}`,
          discount: discountLabel,
          code: c.code,
          subtext: [minOrder, maxDisc, "Valid on luxury self-drive fleet in Delhi NCR & Lucknow."].filter(Boolean).join(" "),
          carImg: fallbackImages[idx % fallbackImages.length],
          bgGradient: palette.bgGradient,
          textColor: palette.textColor,
          accentColor: palette.accentColor,
          pillBg: palette.pillBg,
        };
      });
    }
    return OFFERS_DATA;
  }, [initialOffers]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <section className="offers-section position-relative overflow-hidden">
      <div className="container position-relative" style={{ zIndex: 5 }}>
        {/* Section Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4">
          <div>
            <div className="offers-pill-badge d-inline-flex align-items-center gap-2 mb-2">
              <MotionIcon name="Sparkles" size={13} color="#c59b27" />
              <span className="fw-bold">PROMO DEALS &amp; COUPONS</span>
            </div>
            <h2 className="offers-section-title mb-1">
              Exclusive <span>Offers</span>
            </h2>
            <p className="offers-section-subtext mb-0">
              Grab the best deals and unlock luxury mobility discounts.
            </p>
          </div>
        </div>

        {/* 3 Offers Banner Cards - Multi-Colored Luxury Gradient Design */}
        <div className="row g-4">
          {offersList.map((offer) => (
            <div key={offer.id} className="col-lg-4 col-md-6 col-12">
              <div
                className="offer-banner-card position-relative overflow-hidden h-100 d-flex flex-column justify-content-between"
                style={{
                  background: offer.bgGradient,
                  borderRadius: "22px",
                  padding: "24px 22px",
                  minHeight: "220px",
                  boxShadow: "0 12px 30px -8px rgba(15, 23, 42, 0.15)",
                }}
              >
                {/* Full Height Top-to-Bottom Edge-to-Edge Car Image */}
                <div className="offer-car-backdrop position-absolute end-0 top-0 bottom-0 h-100">
                  <img
                    src={offer.carImg}
                    alt={`${offer.title} Promotional Rental Vehicle`}
                    className="offer-car-thumb w-100 h-100"
                  />
                </div>

                {/* Offer Content */}
                <div className="position-relative" style={{ zIndex: 3, maxWidth: "58%" }}>
                  <div className="offer-tag-badge mb-2 d-inline-block">
                    {offer.tag}
                  </div>
                  <h3 className="offer-card-title mb-1" style={{ color: offer.textColor }}>
                    {offer.title}
                  </h3>
                  <div className="offer-card-discount mb-2" style={{ color: offer.accentColor }}>
                    {offer.discount}
                  </div>
                  <p className="offer-card-subtext mb-3" style={{ color: "rgba(255, 255, 255, 0.95)" }}>
                    {offer.subtext}
                  </p>
                </div>

                {/* Coupon Code Pill with Copy Action */}
                <div className="position-relative mt-auto pt-2" style={{ zIndex: 4 }}>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(offer.code)}
                    className="promo-code-btn d-inline-flex align-items-center gap-2"
                    style={{
                      background: offer.pillBg,
                      color: "#111827",
                      border: "none",
                      borderRadius: "30px",
                      padding: "8px 16px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      transition: "all 0.25s ease",
                    }}
                    title="Click to copy coupon code"
                  >
                    <span>Use Code:</span>
                    <strong style={{ letterSpacing: "1px", color: "#111827" }}>{offer.code}</strong>
                    <i
                      className={"fa-solid ms-1 " + (copiedCode === offer.code ? "fa-check text-success" : "fa-copy text-muted")}
                      aria-hidden="true"
                    ></i>
                  </button>

                  {copiedCode === offer.code && (
                    <span className="copied-toast ms-2 text-white fw-bold" style={{ fontSize: "11.5px" }}>
                      Copied! 🎉
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
