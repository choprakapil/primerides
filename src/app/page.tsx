import React from "react";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ChooseLocation from "@/components/ChooseLocation";
import CarsCategory from "@/components/CarsCategory";
import AboutSection from "@/components/AboutSection";
import VideoBanner from "@/components/VideoBanner";
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
      <AboutSection />
      <VideoBanner />
      <Testimonials />
      <BlogSection />
      <FaqSection />
    </>
  );
}
