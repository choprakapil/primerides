import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — PrimeRides Self Drive",
  description:
    "PrimeRides privacy policy: how we collect, use, store, and protect your personal data including name, phone, ID documents, and payment information.",
};

const sections = [
  {
    id: "data-collected",
    title: "1. Data We Collect",
    content: [
      "Account information: full name, email address, mobile number, and password (stored as a secure hash — never in plain text).",
      "Identity documents: driving licence (front and back), Aadhaar card, and passport — collected only for KYC verification before vehicle handover.",
      "Booking data: dates, vehicle preferences, pickup/drop locations, KM packages selected, payment amounts, and booking codes.",
      "Payment information: transaction references and payment gateway confirmation IDs. We do not store full card numbers or CVV.",
      "Device & usage data: IP address, browser type, and pages visited — used for security, analytics, and fraud prevention.",
    ],
  },
  {
    id: "use-of-data",
    title: "2. How We Use Your Data",
    content: [
      "To process and manage your reservations and rental agreements.",
      "To verify your identity and driving eligibility before vehicle handover (KYC gate).",
      "To send booking confirmations, status updates, and operational alerts via SMS/WhatsApp/email.",
      "To prevent fraud, investigate disputes, and enforce our Terms & Conditions.",
      "To improve our fleet, pricing, and customer experience through aggregated (anonymised) analytics.",
      "We do NOT sell your personal data to third parties. Ever.",
    ],
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing",
    content: [
      "Payment processors (e.g., Razorpay): we share booking amount and customer reference to initiate and verify payments.",
      "SMS/WhatsApp gateways: we share your phone number to deliver booking notifications.",
      "Legal authorities: we may disclose data if required by court order, law enforcement, or to protect the safety of others.",
      "We do not share your data with advertisers, data brokers, or any other commercial third parties.",
    ],
  },
  {
    id: "data-retention",
    title: "4. Data Retention",
    content: [
      "Account data is retained for as long as your account is active or until you request deletion.",
      "KYC documents are retained for 3 years after your last trip to comply with Indian regulatory requirements.",
      "Booking and financial records are retained for 7 years for tax and audit compliance.",
      "You may request deletion of your personal data by contacting info@primerides.in. Legally required retention periods may prevent full deletion.",
    ],
  },
  {
    id: "data-security",
    title: "5. Data Security",
    content: [
      "Passwords are hashed using Argon2id — a memory-hard cryptographic algorithm. We cannot reverse your password.",
      "All data is transmitted over HTTPS (TLS 1.2+). We do not transmit personal data over unencrypted connections.",
      "Access to customer data is restricted to authorised PrimeRides staff with role-based permissions and full audit logging.",
      "Identity documents are stored with access controls. Staff can only view documents they are authorised to review.",
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: [
      "Access: You may request a copy of the personal data we hold about you.",
      "Correction: You may update your profile information directly from your account dashboard.",
      "Deletion: You may request account deletion by contacting us at info@primerides.in.",
      "Objection: You may object to specific uses of your data (e.g., marketing communications) by contacting us.",
      "We will respond to all data requests within 30 days.",
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies & Session Data",
    content: [
      "We use HTTP-only, Secure, SameSite=Lax session cookies to keep you logged in. These cookies cannot be accessed by client-side JavaScript.",
      "We use no third-party advertising cookies or cross-site tracking cookies.",
      "You can disable cookies in your browser settings, but this will prevent you from logging into your account.",
    ],
  },
  {
    id: "changes",
    title: "8. Changes to This Policy",
    content: [
      "We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.",
      "Continued use of PrimeRides services after changes constitutes acceptance of the updated policy.",
      "For material changes, we will notify you via email or an in-app notification.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fc]">
      {/* Hero */}
      <section
        className="py-16 md:py-20"
        style={{
          background: "linear-gradient(135deg, #090e1a 0%, #131b2e 60%, #1a2540 100%)",
        }}
      >
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 mb-5">
            Legal
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            We take your privacy seriously. This policy explains how PrimeRides collects, uses, and protects your personal information.
          </p>
          <p className="text-slate-500 text-xs mt-4">Last updated: September 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Table of Contents */}
            <aside className="hidden lg:block">
              <div className="sticky top-6 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Sections</p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block text-xs text-slate-600 hover:text-amber-600 transition-colors py-1"
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Commitment banner */}
              <div className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 013 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.572-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Our Privacy Commitment</p>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    PrimeRides never sells your personal data. We collect only what is necessary to provide safe, reliable, and legal vehicle rentals. Your data stays with us.
                  </p>
                </div>
              </div>

              {sections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm scroll-mt-6"
                >
                  <h2 className="text-base font-extrabold text-[#090e1a] mb-4 pb-3 border-b border-slate-100">
                    {section.title}
                  </h2>
                  <ul className="space-y-3">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Contact */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm text-center space-y-3">
                <p className="text-sm text-slate-700">
                  Questions about your data or this policy?
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #d8a834 0%, #c59b27 100%)" }}
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/terms"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Terms & Conditions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
