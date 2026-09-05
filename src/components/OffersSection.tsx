"use client";

import React, { useState } from "react";
import { MotionIcon } from "motion-icons-react";
import { useModal } from "@/context/ModalContext";
import { OFFERS_DATA } from "@/data";

export default function OffersSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { openBookingModal } = useModal();

  const OFFERS = OFFERS_DATA;

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
              <MotionIcon name="Sparkles" animation="spin" trigger="always" size={13} color="#c59b27" />
              <span className="fw-bold">PROMO DEALS &amp; COUPONS</span>
            </div>
            <h2 className="offers-section-title mb-1">
              Exclusive <span>Offers</span>
            </h2>
            <p className="offers-section-subtext mb-0">
              Grab the best deals and make your journey more exciting.
            </p>
          </div>

          <div className="mt-3 mt-md-0">
            <a
              href="#categoriesSection"
              className="view-all-offers-link d-inline-flex align-items-center gap-1.5"
            >
              <span>View All Fleet</span>
              <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>

        {/* 3 Offers Banner Cards */}
        <div className="row g-4">
          {OFFERS.map((offer) => (
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
                    alt={offer.title}
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
