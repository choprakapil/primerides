import React from "react";
import PageHeader from "@/components/PageHeader";
import FaqSection from "@/components/FaqSection";
import TrustBar from "@/components/TrustBar";

export const metadata = {
  title: "Rental FAQs & Policies - Primerides Self Drive Delhi NCR",
  description:
    "Find answers to all frequently asked questions regarding documents, deposits, outstation permits, unlimited KMs, and roadside assistance.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Policies & Clarity"
        breadcrumb="FAQs"
        bgImage="/assets/img/slider/1.jpg"
      />
      <FaqSection showAll={true} />
      <TrustBar />
    </>
  );
}
