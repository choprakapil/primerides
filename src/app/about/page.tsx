import React from "react";
import PageHeader from "@/components/PageHeader";
import AboutSection from "@/components/AboutSection";
import TrustBar from "@/components/TrustBar";
import VideoBanner from "@/components/VideoBanner";
import Testimonials from "@/components/Testimonials";

export const metadata = {
  title: "About Primerides - Self-Drive Car Rental Company in Delhi NCR",
  description:
    "Learn about Primerides, Delhi NCR's trusted self-drive car rental company providing company-owned vehicles with unlimited KMs and doorstep airport delivery.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Primerides"
        breadcrumb="About Us"
        badge1="Luxury Mobility Standard"
        badge2="Prime Verified Fleet"
      />
      <AboutSection />
      <TrustBar />
      <VideoBanner />
      <Testimonials />
    </>
  );
}
