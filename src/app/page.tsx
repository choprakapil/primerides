import React from "react";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import TrustBar from "@/components/TrustBar";
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
      <SearchBar />
      <TrustBar />
      <CarsCategory />
      <AboutSection />
      <VideoBanner />
      <Testimonials />
      <BlogSection />
      <FaqSection />
    </>
  );
}
