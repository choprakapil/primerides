"use client";

import React, { useState } from "react";
import { Activity, Award, Shield, ArrowUpRight, Compass } from "lucide-react";
import TrendArrowBadge from "../../admin/ui/TrendArrowBadge";

interface MonthData {
  month: string;
  km: number;
  spent: number;
}

const HISTORY: MonthData[] = [
  { month: "Nov", km: 450, spent: 28000 },
  { month: "Dec", km: 820, spent: 54000 },
  { month: "Jan", km: 310, spent: 19500 },
  { month: "Feb", km: 640, spent: 41000 },
  { month: "Mar", km: 950, spent: 62000 },
];

export default function CustomerTripStatsChart() {
  const [activeIdx, setActiveIdx] = useState<number | null>(4);

  const maxKm = Math.max(...HISTORY.map((h) => h.km)) * 1.2;
  const current = activeIdx !== null ? HISTORY[activeIdx] : HISTORY[HISTORY.length - 1];

  return (
    <div className="card h-100 border pastel-card pastel-card-lavender">
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar avatar-sm bg-purple-100 text-purple-700 rounded-circle d-flex align-items-center justify-content-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h6 className="card-title mb-0 fw-bold text-dark">Your Luxury Travel Activity</h6>
              <span className="text-muted text-xs">Kilometers explored &amp; mileage history</span>
            </div>
          </div>
          <TrendArrowBadge value="+48.4%" period="vs last month" pastelTheme="lavender" />
        </div>

        {/* Highlight Stats */}
        <div className="d-flex align-items-baseline gap-3 my-2">
          <div>
            <span className="text-muted text-[11px] font-semibold text-uppercase tracking-wider">
              {current.month} Travel Distance
            </span>
            <div className="h4 mb-0 fw-bold text-dark">
              {current.km} <span className="text-sm text-purple-700 fw-bold">KM</span>
            </div>
          </div>
          <div className="border-start ps-3">
            <span className="text-muted text-[11px] font-semibold text-uppercase tracking-wider">
              Booking Investment
            </span>
            <div className="h6 mb-0 fw-bold text-dark">
              ₹{(current.spent).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Interactive Pastel Bars */}
        <div className="d-flex align-items-end justify-content-between gap-2 pt-3 pb-1" style={{ height: "130px" }}>
          {HISTORY.map((item, idx) => {
            const heightPct = (item.km / maxKm) * 100;
            const isSelected = activeIdx === idx;

            return (
              <div
                key={item.month}
                className="d-flex flex-column align-items-center flex-grow-1 cursor-pointer group"
                onClick={() => setActiveIdx(idx)}
              >
                {/* Bar */}
                <div
                  className="w-100 position-relative rounded-pill transition-all duration-300"
                  style={{
                    height: `${heightPct}%`,
                    maxHeight: "95px",
                    minHeight: "12px",
                    backgroundColor: isSelected ? "#8b5cf6" : "#ddd6fe",
                    boxShadow: isSelected ? "0 4px 12px rgba(139, 92, 246, 0.35)" : "none",
                  }}
                />
                {/* Month Label */}
                <span
                  className={`text-[11px] mt-2 font-bold transition-colors ${
                    isSelected ? "text-purple-700" : "text-muted"
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        {/* VIP Loyalty Milestone */}
        <div className="mt-3 pt-3 border-top border-purple-100 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-dark">Prime VIP Concierge Tier:</span>
            <span className="badge bg-purple-100 text-purple-800 border border-purple-200 rounded-pill font-bold text-[10.5px]">
              Platinum Elite
            </span>
          </div>
          <span className="text-[11px] text-muted">2,850 Pts</span>
        </div>
      </div>
    </div>
  );
}
