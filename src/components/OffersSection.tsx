"use client";

import React, { useState } from "react";
import { MotionIcon } from "motion-icons-react";
import { OFFERS_DATA } from "@/data";

export default function OffersSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
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
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-3">
          <div>
            <div className="offers-pill-badge d-inline-flex align-items-center gap-2 mb-2">
              <MotionIcon name="Sparkles" size={13} color="#c59b27" />
              <span className="fw-bold">PROMO DEALS &amp; COUPONS</span>
            </div>
            <h2 className="offers-section-title mb-1">
              Exclusive <span>Offers</span>
            </h2>
            <p className="offers-section-subtext mb-0">
              Grab the best deals and make your journey more exciting.
            </p>
          </div>

          
        </div>

        {/* 3 Offers Banner Cards */}
        <div className="row g-3">
          {OFFERS.map((offer) => (
            <div key={offer.id} className="col-lg-4 col-md-6 col-12">
              <div
                className={`offer-banner-card offer-banner-card--${offer.id} position-relative overflow-hidden h-100 d-flex flex-column`}
              >
                <div className="offer-car-backdrop">
                  <img
                    src={offer.carImg}
                    alt={offer.title}
                    className="offer-car-thumb"
                  />
                </div>

                <div className="offer-card-copy position-relative">
                  <div className="offer-tag-badge mb-2 d-inline-flex align-items-center">
                    {offer.tag}
                  </div>
                  <h3 className="offer-card-title mb-1">
                    {offer.title}
                  </h3>
                  <div className="offer-card-discount mb-1">
                    {offer.discount}
                  </div>
                  <p className="offer-card-subtext mb-0">
                    {offer.subtext}
                  </p>
                </div>

                <div className="offer-card-footer mt-auto">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(offer.code)}
                    className="promo-code-btn d-inline-flex align-items-center gap-2"
                    title="Click to copy coupon code"
                  >
                    <span className="promo-code-label">Code</span>
                    <strong>{offer.code}</strong>
                    <i
                      className={"fa-solid ms-1 " + (copiedCode === offer.code ? "fa-check text-success" : "fa-copy text-muted")}
                      aria-hidden="true"
                    ></i>
                  </button>

                  {copiedCode === offer.code && (
                    <span className="copied-toast ms-2 fw-bold">
                      Copied!
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
