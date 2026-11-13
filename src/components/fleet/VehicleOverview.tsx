import React from "react";
import { Compass } from "lucide-react";

interface VehicleOverviewProps {
  displayName: string;
  description?: string | null;
  locationName?: string;
  categoryName?: string;
}

export default function VehicleOverview({
  displayName,
  description,
  locationName,
  categoryName,
}: VehicleOverviewProps) {
  const fallbackText = `The ${displayName} is maintained to PrimeRides white-glove standards for executive self-drive journeys and premium chauffeur itineraries in ${
    locationName || "Delhi NCR"
  }. Every vehicle undergoes a multi-point pre-delivery inspection, deep interior detailing, active FASTag toll pass, and 24/7 dedicated roadside concierge assistance.`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Compass className="w-4 h-4 text-[#c59b27]" />
        <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
          Vehicle Overview &amp; Driving Experience
        </h2>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed font-normal">
        {description && description.trim() ? description : fallbackText}
      </p>
    </div>
  );
}

