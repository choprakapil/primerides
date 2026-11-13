import React, { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import CarsCategory from "@/components/CarsCategory";
import TrustBar from "@/components/TrustBar";

export const metadata = {
  title: "Our Fleet & Car Categories - Primerides Self Drive Delhi NCR",
  description:
    "Explore Primerides fleet of self-drive vehicles: 7-Seater Innova Crysta, Fortuner 4x4, Thar 4x4, Creta, Swift and Luxury sedans with unlimited KMs.",
};

export default async function CarsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; filter?: string }>;
} = {}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const category = resolvedParams.category || resolvedParams.filter;
  // categorySlug: category && category !== "all" ? category : undefined

  return (
    <>
      <PageHeader
        title="Verified Car Rental Fleet"
        subtitle="Explore By Category"
        breadcrumb="Our Fleet"
        bgImage="/assets/img/slider/2.jpg"
      />
      <Suspense fallback={<div className="text-center py-5">Loading Fleet...</div>}>
        <CarsCategory />
      </Suspense>
      <TrustBar />
    </>
  );
}
