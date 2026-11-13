import React from "react";
import PageHeader from "@/components/PageHeader";
import BlogsCatalog from "@/components/blog/BlogsCatalog";
import TrustBar from "@/components/TrustBar";
import { getBlogs } from "@/server/cms";

export const metadata = {
  title: "Road Trip Blogs & Travel Guides - Primerides Delhi NCR",
  description:
    "Read inspiring road trip itineraries, mountain expedition guides, vehicle comparisons, and Delhi NCR self-drive travel tips from Primerides.",
};

export default async function BlogsPage() {
  const blogs = await getBlogs(100);

  return (
    <>
      <PageHeader
        title="Road Trip Journal & Travel Guides"
        breadcrumb="Travel Guides"
        badge1="Prime Editorial Desk"
        badge2="Verified Road Itineraries"
      />
      <BlogsCatalog initialBlogs={blogs} />
      <TrustBar />
    </>
  );
}
