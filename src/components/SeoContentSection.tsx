"use client";

import React, { useState } from "react";
import { MotionIcon } from "motion-icons-react";
import Link from "next/link";
import { POPULAR_SEARCHES, ROAD_TRIP_ROUTES, TARIFF_TABLE_DATA } from "@/data";
export default function SeoContentSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Loaded from microservice / data layer (seo.ts)

  return (
    <section className="seo-content-section position-relative overflow-hidden" id="seoContentSection">
      <div className="container position-relative" style={{ zIndex: 5 }}>
        <div className="seo-card-wrapper position-relative">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div className="seo-icon-pill">
                <i className="fa-solid fa-earth-americas text-gold"></i>
              </div>
              <div>
                <h2 className="seo-main-heading mb-0">
                  Self-Drive Car Rental in Delhi NCR &amp; Lucknow — <span>PrimeRides Guide</span>
                </h2>
                <small className="text-muted">Comprehensive Fleet Guide, Tariffs &amp; Booking Information</small>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="seo-toggle-btn d-none d-md-inline-flex align-items-center gap-1.5"
            >
              <span>{isExpanded ? "Collapse Content" : "Read Full Guide"}</span>
              <i className={`fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
            </button>
          </div>

          {/* CKEditor-Rendered Rich SEO Content Container */}
          <div
            className={`seo-prose-container position-relative ${
              isExpanded ? "expanded" : "collapsed"
            }`}
          >
            {/* SEO Content Section 1: Overview */}
            <div className="seo-content-block mb-4">
              <h3 className="seo-subheading">
                Premium Self-Drive Car Rentals in Delhi NCR, Gurugram, Noida &amp; Lucknow
              </h3>
              <p>
                Welcome to <strong>PrimeRides</strong>, North India’s premier company-owned self-drive car rental platform. Whether you need a rugged <strong>Toyota Fortuner 4x4</strong> for high-altitude mountain expeditions to Himachal and Ladakh, a spacious <strong>Toyota Innova Crysta</strong> for family touring, or a fuel-efficient compact hatchback like the <strong>Maruti Suzuki Swift</strong> or <strong>Hyundai i20</strong> for daily city commutes, PrimeRides delivers immaculate vehicles directly to your doorstep.
              </p>
            </div>

            {/* SEO Content Section 2: Airport Delivery */}
            <div className="seo-content-block mb-4">
              <h3 className="seo-subheading">
                Instant Airport Delivery at Delhi IGI Airport (T1, T2 &amp; T3) and Lucknow Airport
              </h3>
              <p>
                Flying into Delhi or Lucknow? PrimeRides offers seamless <strong>15-minute airport curbside delivery</strong> at Indira Gandhi International Airport (Terminal 1, Terminal 2, and Terminal 3 Arrivals) as well as Chaudhary Charan Singh International Airport, Lucknow. With our 100% paperless digital KYC verification completed prior to your landing, you step directly off your flight, collect your sanitized car keys, and hit the expressway without waiting in rental queues or dealing with brokers.
              </p>
            </div>

            {/* SEO Content Section 3: Key Benefits & Features */}
            <div className="seo-content-block mb-4">
              <h3 className="seo-subheading">Why Rent Self-Drive Cars with PrimeRides?</h3>
              <ul className="seo-feature-list">
                <li>
                  <strong>Unlimited Kilometers Plans:</strong> Drive without checking your odometer. Zero per-kilometer penalty fees on designated outstation journeys.
                </li>
                <li>
                  <strong>Zero Security Deposit Options:</strong> Enjoy transparent bookings with verified KYC credentials and instant 24-hour deposit refund timelines.
                </li>
                <li>
                  <strong>100% Company-Owned Vehicles:</strong> Every vehicle undergoes a 50-point mechanical check, AC sanitization, and tire depth inspection before dispatch.
                </li>
                <li>
                  <strong>All-India Tourist Permits &amp; FASTag:</strong> Every SUV and sedan is equipped with an active national FASTag and valid interstate commercial permits.
                </li>
                <li>
                  <strong>24x7 Roadside Assistance (RSA):</strong> Round-the-clock emergency support, towing services, and immediate mechanical assistance across India.
                </li>
              </ul>
            </div>

            {/* SEO Content Section 4: Outstation Routes */}
            <div className="seo-content-block mb-4">
              <h3 className="seo-subheading">Popular Self-Drive Road Trip Routes from Delhi NCR</h3>
              <p>
                PrimeRides is the preferred rental partner for adventurous road trips across North India:
              </p>
              <div className="row g-3">
                {ROAD_TRIP_ROUTES.map((item) => (
                  <div key={item.id} className="col-md-6 col-12">
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <h5 className="fw-bold mb-1" style={{ fontSize: "14.5px", color: "#111827" }}>
                        {item.title}
                      </h5>
                      <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                        {item.route} Recommended: <em>{item.recommendedCars}</em>.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Content Section 5: Tariffs & Pricing Table Summary */}
            <div className="seo-content-block mb-4">
              <h3 className="seo-subheading">Transparent Self-Drive Car Rental Tariffs (Starting Rates)</h3>
              <div className="table-responsive">
                <table className="table table-bordered table-sm seo-tariff-table">
                  <thead className="table-dark">
                    <tr>
                      <th>Car Category</th>
                      <th>Popular Vehicle Models</th>
                      <th>Seating</th>
                      <th>Starting Tariff / Day</th>
                      <th>Best Suited For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TARIFF_TABLE_DATA.map((t, idx) => (
                      <tr key={idx}>
                        <td><strong>{t.category}</strong></td>
                        <td>{t.popularModels}</td>
                        <td>{t.seating}</td>
                        <td>{t.startingTariff}</td>
                        <td>{t.bestSuitedFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gradient Fade Overlay when collapsed */}
            {!isExpanded && <div className="seo-fade-overlay position-absolute bottom-0 start-0 w-100"></div>}
          </div>

          {/* Expand / Collapse Button for Mobile / Center */}
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="seo-readmore-btn d-inline-flex align-items-center gap-2"
            >
              <span>{isExpanded ? "Show Less Content" : "Read Full SEO Guide"}</span>
              <i className={`fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
            </button>
          </div>

          {/* Popular Search Keyword Cloud */}
          <div className="mt-4 pt-4 border-top">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="fa-solid fa-tags text-gold" style={{ fontSize: "13px" }}></i>
              <strong style={{ fontSize: "13px", color: "#111827", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Popular Searches &amp; Keywords:
              </strong>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((keyword, idx) => (
                <Link
                  key={idx}
                  href="/cars"
                  className="seo-tag-pill"
                >
                  {keyword}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
