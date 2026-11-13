import React from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getPageMeta } from "@/server/seo";

export async function generateMetadata() {
  const customMeta = await getPageMeta("/privacy");
  return {
    title: customMeta?.meta_title || "Privacy Policy — PrimeRides Data Protection",
    description:
      customMeta?.meta_description ||
      "PrimeRides privacy policy: how we collect, use, store, and protect your personal data including name, phone, ID documents, and payment information.",
    keywords: customMeta?.meta_keywords ? customMeta.meta_keywords.split(",") : undefined,
    openGraph: {
      title: customMeta?.og_title || customMeta?.meta_title || "Privacy Policy — PrimeRides",
      description: customMeta?.og_description || customMeta?.meta_description || "",
      images: customMeta?.og_image ? [customMeta.og_image] : undefined,
    },
  };
}

const PRIVACY_SECTIONS = [
  {
    id: "data-collected",
    title: "1. Data We Collect",
    content: [
      "Account information: full name, email address, mobile number, and password (stored as a secure salted hash — never in plain text).",
      "Identity documents: driving licence (front and back), Aadhaar card, or passport — collected solely for KYC verification prior to vehicle dispatch.",
      "Booking data: rental dates, vehicle category, pickup/drop locations, KM packages selected, and transaction payment IDs.",
      "Payment safety: We partner with RBI-licensed payment gateways (e.g. Razorpay). PrimeRides never stores credit/debit card numbers or CVV codes.",
      "Device & telemetry data: IP address, device model, and crash logs — strictly utilized for fraud prevention and service stability.",
    ],
  },
  {
    id: "use-of-data",
    title: "2. How We Use Your Data",
    content: [
      "To process, execute, and verify your self-drive vehicle reservation.",
      "To perform identity validation and ensure driver eligibility prior to vehicle handover.",
      "To dispatch real-time booking vouchers, vehicle status updates, and emergency roadside alerts via SMS and WhatsApp.",
      "To prevent unauthorized vehicle use, investigate damage disputes, and enforce traffic compliance.",
      "We strictly adhere to a zero-spam policy: We NEVER sell or broker personal contact information to third-party advertisers.",
    ],
  },
  {
    id: "data-sharing",
    title: "3. Authorized Data Sharing",
    content: [
      "Payment Gateways: Customer identification and booking sums are shared securely with encrypted payment gateways.",
      "SMS & Communication Gateways: Mobile numbers are transmitted to licensed telecom aggregators solely for transactional alert delivery.",
      "Law Enforcement: Records may be disclosed when required by court orders, statutory regulations, or to report vehicle theft.",
      "No Commercial Third Parties: We do not license or disclose customer profiles to marketing agencies.",
    ],
  },
  {
    id: "data-retention",
    title: "4. Data Retention & Safeguards",
    content: [
      "Customer account profiles remain active until deletion is requested by the registered account owner.",
      "KYC documentation is retained in compliance with Indian regulatory and transport authority guidelines.",
      "Financial and booking transaction records are maintained for statutory audit and tax filing compliance.",
      "You may request deletion of discretionary personal data by writing to privacy@primerides.in.",
    ],
  },
  {
    id: "data-security",
    title: "5. Security Infrastructure",
    content: [
      "All web and mobile sessions are encrypted end-to-end via TLS 1.3 cryptographic protocols.",
      "Customer credentials and tokens are secured using industry-standard hashing algorithms.",
      "Access to administrative portals requires verified multi-factor staff authentication and audit logging.",
      "Curbside vehicle condition inspection media is archived in access-controlled cloud repositories.",
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Privacy Rights",
    content: [
      "Access & Correction: You may review and update your profile details anytime via your PrimeRides customer dashboard.",
      "Data Portability: You may request an export of your historical reservation records.",
      "Consent Withdrawal: You may opt out of promotional communications with a single tap or email request.",
      "Our compliance grievance desk responds to all formal privacy inquiries within 48 business hours.",
    ],
  },
];

export default async function PrivacyPage() {
  return (
    <>
      <PageHeader
        title="Privacy Policy"
        breadcrumb="Privacy Policy"
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
                  <i className="fa-solid fa-shield-halved" style={{ color: "var(--primary-color, #c59b27)" }}></i>
                  <h6 className="fw-bold mb-0 text-dark">Privacy Sections</h6>
                </div>
                <nav className="d-flex flex-column gap-2">
                  {PRIVACY_SECTIONS.map((s) => (
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
                    <i className="fa-solid fa-clock text-warning"></i>
                    <span>Updated: September 2026</span>
                  </div>
                  <Link href="/terms" className="btn btn-outline-dark btn-sm w-100 rounded-pill mt-2">
                    View Terms &amp; Conditions &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Privacy Content */}
            <div className="col-lg-8">
              {/* Commitment Banner */}
              <div
                className="p-4 rounded-4 shadow-sm mb-4 d-flex align-items-start gap-3"
                style={{ background: "#ecfdf5", border: "1px solid #a7f3d0" }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shrink-0"
                  style={{ width: "42px", height: "42px", background: "#d1fae5", color: "#059669", fontSize: "18px" }}
                >
                  <i className="fa-solid fa-lock"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-success mb-1">Our Privacy Commitment</h6>
                  <p className="text-secondary fs-14 mb-0" style={{ color: "#065f46" }}>
                    PrimeRides never sells your personal data. We collect only what is strictly necessary to provide safe, verified, and legal vehicle mobility services across Delhi NCR and Lucknow.
                  </p>
                </div>
              </div>

              <div className="d-flex flex-column gap-4">
                {PRIVACY_SECTIONS.map((section) => (
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
                  <h5 className="fw-bold mb-2">Questions Regarding Your Personal Data?</h5>
                  <p className="text-white-50 fs-14 mb-3">
                    Our Data Protection Officer and compliance desk are available at privacy@primerides.in.
                  </p>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Link href="/contact" className="btn-prime py-2 px-4 rounded-pill fs-14 text-decoration-none">
                      Contact Data Concierge &rarr;
                    </Link>
                    <Link href="/terms" className="btn btn-outline-light py-2 px-4 rounded-pill fs-14">
                      Review Rental Terms
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
