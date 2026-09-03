import React, { Suspense } from "react";
import PageHeader from "@/components/PageHeader";
import CarsCategory from "@/components/CarsCategory";
import VehicleSpotlight from "@/components/VehicleSpotlight";
import RentalCalculator from "@/components/RentalCalculator";
import TrustBar from "@/components/TrustBar";

export const metadata = {
  title: "Our Fleet & Car Categories - Primerides Self Drive Delhi NCR",
  description:
    "Explore Primerides fleet of self-drive vehicles: 7-Seater Innova Crysta, Fortuner 4x4, Thar 4x4, Creta, Swift and Luxury sedans with unlimited KMs.",
};

export default function CarsPage() {
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
      <VehicleSpotlight />
      <RentalCalculator />
      <TrustBar />
    </>
  );
}
