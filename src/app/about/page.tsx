import React from "react";
import PageHeader from "@/components/PageHeader";
import AboutSection from "@/components/AboutSection";
import TrustBar from "@/components/TrustBar";
import VideoBanner from "@/components/VideoBanner";
import Testimonials from "@/components/Testimonials";
import { getPageMeta } from "@/server/seo";
import { getAboutConfig } from "@/server/settings";

export async function generateMetadata() {
  const customMeta = await getPageMeta("/about");
  return {
    title: customMeta?.meta_title || "About Primerides - Self-Drive Car Rental Company in Delhi NCR",
    description:
      customMeta?.meta_description ||
      "Learn about Primerides, Delhi NCR's trusted self-drive car rental company providing company-owned vehicles with unlimited KMs and doorstep airport delivery.",
    keywords: customMeta?.meta_keywords ? customMeta.meta_keywords.split(",") : undefined,
    openGraph: {
      title: customMeta?.og_title || customMeta?.meta_title || "About Primerides",
      description: customMeta?.og_description || customMeta?.meta_description || "",
      images: customMeta?.og_image ? [customMeta.og_image] : undefined,
    },
  };
}

export default async function AboutPage() {
  const aboutConfig = getAboutConfig();

  return (
    <>
      <PageHeader
        title={aboutConfig.pageTitle || "About Primerides"}
        subtitle={aboutConfig.eyebrow || "Our Journey & Vision"}
        breadcrumb="About Us"
        bgImage="/assets/img/slider/5.jpg"
      />

      {/* Dynamic Key Stats Banner */}
      <section
        style={{
          background: "#090e1a",
          borderBottom: "1px solid rgba(197, 155, 39, 0.2)",
          padding: "36px 0",
        }}
      >
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color, #c59b27)", fontSize: "36px" }}>
                {aboutConfig.statHappy || "10,000+"}
              </h3>
              <p className="text-white-50 fs-13 text-uppercase fw-semibold mb-0">Happy Travelers</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color, #c59b27)", fontSize: "36px" }}>
                {aboutConfig.statFleet || "50+"}
              </h3>
              <p className="text-white-50 fs-13 text-uppercase fw-semibold mb-0">Company-Owned Cars</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color, #c59b27)", fontSize: "36px" }}>
                {aboutConfig.statRating || "4.9/5"}
              </h3>
              <p className="text-white-50 fs-13 text-uppercase fw-semibold mb-0">Verified Rating</p>
            </div>
            <div className="col-6 col-md-3">
              <h3 className="fw-bold mb-1" style={{ color: "var(--primary-color, #c59b27)", fontSize: "36px" }}>
                {aboutConfig.statReviews || "1,200+"}
              </h3>
              <p className="text-white-50 fs-13 text-uppercase fw-semibold mb-0">Google Reviews</p>
            </div>
          </div>
        </div>
      </section>

      <AboutSection />
      <TrustBar />
      <VideoBanner />
      <Testimonials />
    </>
  );
}
