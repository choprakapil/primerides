import React from "react";
import PageHeader from "@/components/PageHeader";
import FaqSection from "@/components/FaqSection";
import TrustBar from "@/components/TrustBar";
import { getPageMeta } from "@/server/seo";
import { prisma } from "@/server/db/client";

export async function generateMetadata() {
  const customMeta = await getPageMeta("/faq");
  return {
    title: customMeta?.meta_title || "Rental FAQs & Policies - Primerides Self Drive Delhi NCR",
    description:
      customMeta?.meta_description ||
      "Find answers to all frequently asked questions regarding documents, deposits, outstation permits, unlimited KMs, and roadside assistance.",
    keywords: customMeta?.meta_keywords ? customMeta.meta_keywords.split(",") : undefined,
    openGraph: {
      title: customMeta?.og_title || customMeta?.meta_title || "Rental FAQs & Policies - Primerides",
      description: customMeta?.og_description || customMeta?.meta_description || "",
      images: customMeta?.og_image ? [customMeta.og_image] : undefined,
    },
  };
}

export default async function FaqPage() {
  let dbFaqs: Array<{ id: number; question: string; answer: string; category?: string }> = [];
  try {
    const rawFaqs = await prisma.fAQ.findMany({
      where: { deleted_at: null, is_active: true },
      orderBy: { sort_order: "asc" },
      select: { id: true, question: true, answer: true, category: true },
    });
    dbFaqs = rawFaqs;
  } catch (error) {
    console.error("[FAQ Page] Failed to query live FAQs:", error);
  }

  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        breadcrumb="FAQs & Rental Policies"
        badge1="Instant Self-Service Help"
        badge2="24/7 Handover Desk"
      />
      <FaqSection showAll={true} items={dbFaqs.length > 0 ? dbFaqs : undefined} />
      <TrustBar />
    </>
  );
}
