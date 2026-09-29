import React from "react";
import PageHeader from "@/components/PageHeader";
import BlogSection from "@/components/BlogSection";
import TrustBar from "@/components/TrustBar";

export const metadata = {
  title: "Road Trip Blogs & Travel Guides - Primerides Delhi NCR",
  description:
    "Read inspiring road trip itineraries, mountain expedition guides, vehicle comparisons, and Delhi NCR self-drive travel tips from Primerides.",
};

export default function BlogsPage() {
  return (
    <>
      <PageHeader
        title="Road Trip Journal & Travel Guides"
        subtitle="Expeditions & Tips"
        breadcrumb="Blogs"
        bgImage="/assets/img/slider/3.jpg"
      />
      <BlogSection />
      <TrustBar />
    </>
  );
}
