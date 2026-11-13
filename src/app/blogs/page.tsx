import React, { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import TrustBar from "@/components/TrustBar";
import BlogPaginationList from "@/components/BlogPaginationList";
import { getBlogs } from "@/server/cms";

export const metadata = {
  title: "Road Trip Blogs, Highway Guides & Itineraries - PrimeRides Delhi NCR",
  description:
    "Explore inspiring mountain expeditions, 3-day weekend road trip itineraries from Delhi NCR, vehicle recommendations, and expressway insights from PrimeRides.",
};

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-slate-50/60">
      <PageHeader
        title="Road Trip Journal & Travel Guides"
        subtitle="Expedition Notes, Weekend Escapes & Highway Reviews"
        breadcrumb="Travel Guides"
        bgImage="/assets/img/slider/3.jpg"
      />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3" />
            <p className="font-semibold text-sm">Loading Travel Articles...</p>
          </div>
        }
      >
        <BlogPaginationList blogs={blogs} />
      </Suspense>
      <TrustBar />
    </div>
  );
}
