import React from "react";
import ContactPageClient from "@/components/contact/ContactPageClient";
import { getPageMeta } from "@/server/seo";

export async function generateMetadata() {
  const customMeta = await getPageMeta("/contact");
  return {
    title: customMeta?.meta_title || "Contact Primerides - 24/7 Delhi NCR Concierge & Booking Desk",
    description:
      customMeta?.meta_description ||
      "Reach PrimeRides for instant luxury self-drive reservations, airport curbside handover at IGI T1/T2/T3, corporate fleet leases, and 24/7 customer assistance.",
    keywords: customMeta?.meta_keywords ? customMeta.meta_keywords.split(",") : undefined,
    openGraph: {
      title: customMeta?.og_title || customMeta?.meta_title || "Contact Primerides",
      description: customMeta?.og_description || customMeta?.meta_description || "",
      images: customMeta?.og_image ? [customMeta.og_image] : undefined,
    },
  };
}

export default function ContactPage() {
  return <ContactPageClient />;
}
