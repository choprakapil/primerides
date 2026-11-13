import React from "react";
import { ShieldCheck, Check } from "lucide-react";

interface VehicleFeaturesProps {
  features?: string[] | null;
  extraKmRate?: number;
}

export default function VehicleFeatures({
  features,
  extraKmRate,
}: VehicleFeaturesProps) {
  const defaultInclusions = [
    "Flexible 300 km / 450 km / 600 km Package Options",
    "Comprehensive Commercial Insurance Included",
    "24/7 Roadside Emergency & Concierge Assistance",
    "Sanitized & Detailed Cabin Before Every Handover",
    "Active FASTag & GPS Telemetry Enabled",
    `Transparent ₹${extraKmRate || 7}/km Extra KM Tariff with Zero Hidden Fees`,
    "Curbside Doorstep Delivery & Airport Pickup Available",
    "100% Refundable Security Deposit Policy",
  ];

  const resolvedList = Array.isArray(features) && features.length > 0 ? features : defaultInclusions;

  return (
    <div className="pt-6 border-t border-slate-200/60">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-[#c59b27]" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Guaranteed Inclusions With Every Booking
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
        {resolvedList.map((feat, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-50 text-[#c59b27] flex items-center justify-center shrink-0 border border-[#c59b27]/30">
              <Check className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span className="text-sm font-medium text-slate-800 leading-snug">
              {feat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

