import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — PrimeRides Self Drive",
  description:
    "Read PrimeRides rental terms and conditions including eligibility, KM packages, fuel policy, damage liability, cancellation, and interstate travel rules.",
};

const sections = [
  {
    id: "eligibility",
    title: "1. Eligibility & Documentation",
    content: [
      "Renters must be at least 21 years of age and hold a valid Indian driving licence (minimum 1 year old).",
      "A government-issued photo ID (Aadhaar / Passport) must be presented at the time of vehicle handover.",
      "International renters must present a valid International Driving Permit (IDP) along with their home country licence.",
      "PrimeRides reserves the right to refuse rental at its sole discretion if documentation is incomplete or if the renter is deemed unfit to drive.",
    ],
  },
  {
    id: "booking",
    title: "2. Bookings & Reservations",
    content: [
      "All bookings are confirmed only after receipt of a booking confirmation email / SMS with a unique booking code.",
      "Prices are quoted inclusive of the selected KM package. Additional kilometres are billed at the rate specified in your rental plan.",
      "Booking modifications (date/vehicle changes) are subject to availability and may result in price adjustments.",
      "PrimeRides pricing is KM-based — not daily-rate-based. Your bill is calculated from the KM package and actual usage.",
    ],
  },
  {
    id: "cancellation",
    title: "3. Cancellation & Refund Policy",
    content: [
      "Cancellations made more than 48 hours before the pickup time are eligible for a full refund of the rental amount (excluding payment gateway charges).",
      "Cancellations made 24–48 hours before pickup attract a 25% cancellation fee.",
      "Cancellations made less than 24 hours before pickup, or no-shows, are non-refundable.",
      "Security deposits are refunded in full within 5–7 business days after the vehicle is returned undamaged and with the agreed fuel level.",
      "Refund timelines depend on your bank and payment gateway. PrimeRides is not responsible for banking delays.",
    ],
  },
  {
    id: "security-deposit",
    title: "4. Security Deposit",
    content: [
      "A refundable security deposit is collected at the time of booking or vehicle handover (as specified).",
      "The deposit will be forfeited in cases of vehicle damage, traffic violations, toll evasion, or breach of these terms.",
      "PrimeRides will provide an itemised deduction statement before any deposit is retained.",
    ],
  },
  {
    id: "vehicle-use",
    title: "5. Permitted Vehicle Use",
    content: [
      "Vehicles must be driven only by the registered renter unless an additional authorised driver is declared and approved at the time of booking.",
      "Smoking inside the vehicle is strictly prohibited. A cleaning fee of ₹2,000 will be charged for violations.",
      "Vehicles must not be used for any commercial purpose, sub-letting, racing, off-roading (unless booked as an adventure category), towing, or transporting goods.",
      "Pets are not permitted in the vehicle unless prior written approval is obtained.",
    ],
  },
  {
    id: "fuel",
    title: "6. Fuel Policy",
    content: [
      "All vehicles are delivered with a full tank of fuel. The vehicle must be returned with a full tank.",
      "If the vehicle is returned with less fuel, the difference will be charged at current market rates plus a ₹200 service fee.",
    ],
  },
  {
    id: "damage",
    title: "7. Damage & Liability",
    content: [
      "The renter is fully responsible for any damage to the vehicle during the rental period, including damage caused by third parties.",
      "Minor damage (scratches, dents) not covered by insurance will be billed at actual repair cost.",
      "In the event of an accident, the renter must immediately inform PrimeRides and file a First Information Report (FIR) with the nearest police station.",
      "PrimeRides is not responsible for personal belongings left in the vehicle.",
    ],
  },
  {
    id: "interstate",
    title: "8. Interstate Travel",
    content: [
      "Interstate travel is permitted for specific locations and must be declared at the time of booking.",
      "Additional tolls, state permits, and entry taxes incurred during interstate travel are the renter's responsibility.",
      "Travel to neighbouring countries (Nepal, Bhutan, Bangladesh) or to restricted zones (Leh-Ladakh without NOC, etc.) is not permitted without prior written approval.",
    ],
  },
  {
    id: "disputes",
    title: "9. Disputes & Governing Law",
    content: [
      "Any disputes arising from this agreement shall be subject to the exclusive jurisdiction of courts in Delhi NCR.",
      "PrimeRides reserves the right to modify these terms at any time. Continued use of the service constitutes acceptance of the updated terms.",
      "For support, contact us at info@primerides.in or through the contact form on our website.",
    ],
  },
];

export default function TermsPage() {
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
            Terms & Conditions
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            These terms govern your use of PrimeRides self-drive car rental services across Delhi NCR and Lucknow. Please read them carefully before making a reservation.
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

              {/* Footer CTA */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm text-center space-y-3">
                <p className="text-sm text-slate-700">
                  Have questions about these terms?
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
                    href="/privacy"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Privacy Policy
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
