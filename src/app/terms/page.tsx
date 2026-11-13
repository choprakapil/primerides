import React from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getPageMeta } from "@/server/seo";
import { getPoliciesConfig } from "@/server/settings";

export async function generateMetadata() {
  const customMeta = await getPageMeta("/terms");
  return {
    title: customMeta?.meta_title || "Terms & Conditions — PrimeRides Luxury Self Drive",
    description:
      customMeta?.meta_description ||
      "Read PrimeRides rental terms and conditions including eligibility, KM packages, fuel policy, damage liability, cancellation, and interstate travel rules.",
    keywords: customMeta?.meta_keywords ? customMeta.meta_keywords.split(",") : undefined,
    openGraph: {
      title: customMeta?.og_title || customMeta?.meta_title || "Terms & Conditions — PrimeRides",
      description: customMeta?.og_description || customMeta?.meta_description || "",
      images: customMeta?.og_image ? [customMeta.og_image] : undefined,
    },
  };
}

const DEFAULT_TERMS_SECTIONS = [
  {
    id: "eligibility",
    title: "1. Eligibility & Documentation",
    content: [
      "Renters must be at least 21 years of age and hold a valid Indian driving licence (minimum 1 year old) or valid International Driving Permit (IDP).",
      "A government-issued photo ID (Aadhaar / Passport) must be presented at the time of vehicle handover for instant verification.",
      "PrimeRides reserves the right to refuse rental at its sole discretion if documentation is incomplete or if the renter is deemed unfit to drive.",
    ],
  },
  {
    id: "booking",
    title: "2. Bookings & Reservations",
    content: [
      "All bookings are confirmed only after receipt of a booking confirmation email/SMS with a unique reservation code.",
      "Prices are quoted inclusive of the selected KM package. Additional kilometres are billed at the rate specified in your rental plan.",
      "Booking modifications (date/vehicle changes) are subject to fleet availability and may result in price adjustments.",
    ],
  },
  {
    id: "cancellation",
    title: "3. Cancellation & Refund Policy",
    content: [
      "Cancellations made more than 24 hours before the pickup time are eligible for a full refund (excluding payment gateway charges).",
      "Cancellations made 12–24 hours before pickup attract a 50% cancellation fee.",
      "Cancellations made less than 12 hours before pickup, or no-shows, are non-refundable.",
      "Security deposits are refunded in full within 5–7 business days after vehicle inspection and FASTag toll reconciliation.",
    ],
  },
  {
    id: "security-deposit",
    title: "4. Security Deposit",
    content: [
      "A refundable security deposit is collected at the time of booking or vehicle curbside handover.",
      "The deposit will be forfeited in cases of vehicle damage, traffic violations, toll evasion, or breach of these terms.",
      "PrimeRides will provide an itemised deduction statement before any deposit is retained.",
    ],
  },
  {
    id: "vehicle-use",
    title: "5. Permitted Vehicle Use",
    content: [
      "Vehicles must be driven only by the registered renter unless an additional authorised driver is declared and approved at booking.",
      "Smoking inside the vehicle is strictly prohibited. A deep sanitization fee of ₹2,000 will be charged for violations.",
      "Vehicles must not be used for any commercial taxi purpose, sub-letting, racing, off-roading, towing, or transporting goods.",
    ],
  },
  {
    id: "fuel",
    title: "6. Fuel Policy",
    content: [
      "All vehicles are delivered on a like-to-like fuel policy. Return the vehicle with the same fuel level as dispatched.",
      "If the vehicle is returned with less fuel, the difference will be charged at current market fuel rates plus a nominal service fee.",
    ],
  },
  {
    id: "damage",
    title: "7. Damage & Liability",
    content: [
      "The renter is responsible for vehicle custody during the rental period. Comprehensive commercial insurance protects against major accidental loss.",
      "Minor damage (scratches, dents) not covered by insurance will be billed at actual authorised workshop repair cost.",
      "In the event of an accident, the renter must immediately inform PrimeRides 24/7 concierge and assist in documentation.",
    ],
  },
  {
    id: "interstate",
    title: "8. Interstate Travel & Permits",
    content: [
      "All PrimeRides vehicles have commercial self-drive all-India permits. Interstate travel must be declared at reservation.",
      "FASTag electronic tolls are billed automatically based on actual usage during the rental duration.",
      "Travel to neighbouring countries (Nepal, Bhutan) is strictly prohibited.",
    ],
  },
  {
    id: "disputes",
    title: "9. Governing Law",
    content: [
      "Any disputes arising from this agreement shall be subject to the exclusive jurisdiction of courts in Delhi NCR.",
      "For operational assistance, reach our concierge at info@primerides.in or call +91 90453 01702.",
    ],
  },
];

export default async function TermsPage() {
  const policies = getPoliciesConfig();
  const dynamicClauses = policies.clauses?.filter((c) => c.isActive) || [];

  return (
    <>
      <PageHeader
        title="Terms & Conditions"
        subtitle="Compliance & Legal"
        breadcrumb="Terms"
        bgImage="/assets/img/slider/1.jpg"
      />

      <section className="section-padding bg-light">
        <div className="container">
          <div className="row g-4">
            {/* Table of Contents Sticky Sidebar */}
            <div className="col-lg-4">
              <div
                className="bg-white p-4 rounded-4 shadow-sm position-sticky"
                style={{ top: "100px", border: "1px solid var(--border-color, #e2e8f0)" }}
              >
                <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                  <i className="fa-solid fa-scale-balanced" style={{ color: "var(--primary-color, #c59b27)" }}></i>
                  <h6 className="fw-bold mb-0 text-dark">Agreement Sections</h6>
                </div>
                <nav className="d-flex flex-column gap-2">
                  {DEFAULT_TERMS_SECTIONS.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="text-decoration-none text-secondary fs-14 py-1 d-flex align-items-center justify-content-between hover-gold"
                    >
                      <span>{s.title}</span>
                      <i className="fa-solid fa-chevron-right fs-12 text-muted"></i>
                    </a>
                  ))}
                </nav>

                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex align-items-center gap-2 text-muted fs-13 mb-2">
                    <i className="fa-solid fa-circle-info text-warning"></i>
                    <span>Effective: September 2026</span>
                  </div>
                  <Link href="/privacy" className="btn btn-outline-dark btn-sm w-100 rounded-pill mt-2">
                    View Privacy Policy &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Legal Content */}
            <div className="col-lg-8">
              {dynamicClauses.length > 0 && (
                <div
                  className="bg-white p-4 rounded-4 shadow-sm mb-4"
                  style={{ border: "1px solid rgba(197, 155, 39, 0.35)", background: "#fdfbf7" }}
                >
                  <span
                    className="badge mb-2 px-3 py-2 rounded-pill"
                    style={{ background: "rgba(197, 155, 39, 0.15)", color: "var(--primary-color, #c59b27)" }}
                  >
                    Active Policy Addendum
                  </span>
                  <h5 className="fw-bold text-dark mb-3">{policies.title}</h5>
                  <p className="text-secondary fs-14 mb-3">{policies.description}</p>
                  <div className="d-flex flex-column gap-3">
                    {dynamicClauses.map((clause) => (
                      <div key={clause.id} className="p-3 bg-white rounded-3 border">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong className="text-dark fs-14">{clause.title}</strong>
                          <span className="badge bg-secondary-subtle text-secondary fs-11">{clause.category}</span>
                        </div>
                        <p className="text-secondary fs-13 mb-2">{clause.content}</p>
                        {clause.points && clause.points.length > 0 && (
                          <ul className="mb-0 ps-3 text-secondary fs-13">
                            {clause.points.map((pt, pIdx) => (
                              <li key={pIdx} className="mb-1">
                                {pt}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex flex-column gap-4">
                {DEFAULT_TERMS_SECTIONS.map((section) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="bg-white p-4 rounded-4 shadow-sm"
                    style={{ border: "1px solid var(--border-color, #e2e8f0)" }}
                  >
                    <h5 className="fw-bold text-dark pb-2 mb-3 border-bottom d-flex align-items-center gap-2">
                      <span
                        className="rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "var(--primary-color, #c59b27)",
                        }}
                      />
                      {section.title}
                    </h5>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                      {section.content.map((item, idx) => (
                        <li key={idx} className="d-flex align-items-start gap-2 text-secondary fs-14">
                          <i
                            className="fa-solid fa-check mt-1"
                            style={{ color: "var(--primary-color, #c59b27)", fontSize: "12px" }}
                          ></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Assistance Bar */}
                <div
                  className="p-4 rounded-4 shadow-sm text-center"
                  style={{
                    background: "linear-gradient(135deg, #090e1a 0%, #151e32 100%)",
                    border: "1px solid rgba(197, 155, 39, 0.3)",
                    color: "#fff",
                  }}
                >
                  <h5 className="fw-bold mb-2">Have Questions About Rental Agreements?</h5>
                  <p className="text-white-50 fs-14 mb-3">
                    Our 24/7 mobility legal &amp; concierge desk is here to clarify any clause or condition.
                  </p>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Link href="/contact" className="btn-prime py-2 px-4 rounded-pill fs-14 text-decoration-none">
                      Contact Legal Concierge &rarr;
                    </Link>
                    <Link href="/privacy" className="btn btn-outline-light py-2 px-4 rounded-pill fs-14">
                      Review Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
