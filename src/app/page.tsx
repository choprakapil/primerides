import React from "react";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ChooseLocation from "@/components/ChooseLocation";
import CarsCategory from "@/components/CarsCategory";
import OffersSection from "@/components/OffersSection";
import AboutSection from "@/components/AboutSection";
import CtaSection from "@/components/CtaSection";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import FaqSection from "@/components/FaqSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ChooseLocation />
      <CarsCategory />
      <OffersSection />
      <AboutSection />
      <CtaSection />
      <Testimonials />
      <BlogSection />
      <FaqSection />
    </>
  );
}
