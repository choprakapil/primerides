"use client";

import React from "react";
import { Crown, Sparkles, Check, PhoneCall, ShieldCheck } from "lucide-react";
import TrendArrowBadge from "../../admin/ui/TrendArrowBadge";

export default function CustomerVipTierCard() {
  return (
    <div className="card h-100 border pastel-card pastel-card-peach">
      <div className="card-body p-4 d-flex flex-column justify-content-between">
        <div>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <div className="avatar avatar-sm bg-amber-100 text-amber-800 rounded-circle d-flex align-items-center justify-content-center">
                <Crown className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h6 className="card-title mb-0 fw-bold text-dark">Prime VIP Concierge</h6>
                <span className="text-muted text-xs">Membership Tier: Platinum Club</span>
              </div>
            </div>
            <TrendArrowBadge value="Tier Active" period="VIP" pastelTheme="peach" />
          </div>

          {/* Tier Points and Progress */}
          <div className="p-3 rounded-4 bg-white border border-amber-200/60 shadow-2xs mb-3">
            <div className="d-flex align-items-center justify-content-between mb-1.5">
              <span className="text-xs font-bold text-dark">2,850 / 3,500 Tier Points</span>
              <span className="text-[11px] font-semibold text-amber-800">650 Pts to Diamond</span>
            </div>
            <div className="progress progress-sm rounded-pill bg-amber-100/70" style={{ height: "6px" }}>
              <div
                className="progress-bar rounded-pill bg-amber-500"
                style={{ width: "81%", transition: "width 0.8s ease" }}
                role="progressbar"
              />
            </div>
          </div>

          {/* Perks list */}
          <div className="d-flex flex-column gap-2 mb-2">
            <div className="d-flex align-items-center gap-2 text-xs text-dark">
              <span className="w-4 h-4 rounded-circle bg-amber-100 text-amber-800 d-flex align-items-center justify-content-center shrink-0">
                <Check className="w-2.5 h-2.5 text-amber-700" />
              </span>
              <span>Zero Waiting Fee at Delhi &amp; Lucknow Airports</span>
            </div>
            <div className="d-flex align-items-center gap-2 text-xs text-dark">
              <span className="w-4 h-4 rounded-circle bg-amber-100 text-amber-800 d-flex align-items-center justify-content-center shrink-0">
                <Check className="w-2.5 h-2.5 text-amber-700" />
              </span>
              <span>Complimentary Chauffeur Upgrade on 3+ Days Bookings</span>
            </div>
            <div className="d-flex align-items-center gap-2 text-xs text-dark">
              <span className="w-4 h-4 rounded-circle bg-amber-100 text-amber-800 d-flex align-items-center justify-content-center shrink-0">
                <Check className="w-2.5 h-2.5 text-amber-700" />
              </span>
              <span>Instant WhatsApp Concierge Desk Priority</span>
            </div>
          </div>
        </div>

        {/* Footer Direct Call Button */}
        <div className="mt-3 pt-3 border-top border-amber-100/80 d-flex align-items-center justify-content-between">
          <span className="text-xs text-muted font-medium">Dedicated Concierge:</span>
          <a
            href="tel:+919999999999"
            className="btn btn-sm btn-white border shadow-2xs text-amber-800 rounded-pill d-inline-flex align-items-center gap-1.5 px-3 py-1 font-bold text-xs hover:bg-amber-50"
          >
            <PhoneCall className="w-3 h-3 text-amber-600" />
            <span>Connect Desk</span>
          </a>
        </div>
      </div>
    </div>
  );
}
