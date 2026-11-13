import React from "react";
import { CreditCard, CheckCircle2 } from "lucide-react";

interface RentalPolicyProps {
  securityDeposit: number;
  extraKmRate: number;
}

export default function RentalPolicy({
  securityDeposit,
  extraKmRate,
}: RentalPolicyProps) {
  return (
    <div className="pt-6 border-t border-slate-200/60 space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-[#c59b27]" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Transparent Rental Terms &amp; Security Deposit
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% Refundable Deposit</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
            ₹{securityDeposit.toLocaleString("en-IN")} held safely and released within 24–48 hrs post-trip inspection.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Fair Extra KM Tariff</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
            Clear ₹{extraKmRate}/km rate for kilometers beyond your chosen package. No surge multipliers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Fair Fuel Policy</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
            Full-to-full or same-level return. Never marked up with refueling penalties.
          </p>
        </div>
      </div>
    </div>
  );
}

