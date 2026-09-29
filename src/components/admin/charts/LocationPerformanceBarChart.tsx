"use client";

import React, { useState } from "react";
import { MapPin, BarChart2, ArrowUpRight } from "lucide-react";
import TrendArrowBadge from "../ui/TrendArrowBadge";

interface LocationMetrics {
  city: string;
  state: string;
  activeCars: number;
  utilizationRate: number;
  monthlyRevenue: string;
  growth: string;
  color: string;
  pastelBg: string;
  popularModel: string;
}

const LOCATIONS: LocationMetrics[] = [
  {
    city: "Delhi NCR",
    state: "National Capital Region",
    activeCars: 28,
    utilizationRate: 88,
    monthlyRevenue: "₹28.4L",
    growth: "+22.4%",
    color: "#8b5cf6",
    pastelBg: "#ede9fe",
    popularModel: "Mercedes S-Class",
  },
  {
    city: "Lucknow",
    state: "Uttar Pradesh Hub",
    activeCars: 15,
    utilizationRate: 76,
    monthlyRevenue: "₹14.2L",
    growth: "+31.6%",
    color: "#0ea5e9",
    pastelBg: "#e0f2fe",
    popularModel: "Toyota Glanza & BMW 5",
  },
];

export default function LocationPerformanceBarChart() {
  const [selectedCity, setSelectedCity] = useState<string>("Delhi NCR");

  return (
    <div className="card h-100 border pastel-card pastel-card-sky">
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar avatar-sm bg-sky-100 text-sky-700 rounded-circle d-flex align-items-center justify-content-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h6 className="card-title mb-0 fw-bold text-dark">Hub Performance &amp; Revenue</h6>
              <span className="text-muted text-xs">Comparative multi-city analytics</span>
            </div>
          </div>
          <TrendArrowBadge value="+28.1%" period="regional" pastelTheme="sky" />
        </div>

        {/* Location Comparison Cards */}
        <div className="d-flex flex-column gap-3 mt-3">
          {LOCATIONS.map((loc) => {
            const isSelected = selectedCity === loc.city;

            return (
              <div
                key={loc.city}
                onClick={() => setSelectedCity(loc.city)}
                className={`p-3 rounded-4 border transition-all cursor-pointer ${
                  isSelected ? "bg-white shadow-sm border-sky-300" : "bg-light/60 border-transparent hover:bg-white"
                }`}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-circle shrink-0"
                      style={{ backgroundColor: loc.color }}
                    />
                    <div>
                      <div className="fw-bold text-dark text-sm">{loc.city}</div>
                      <div className="text-[11px] text-muted">{loc.state}</div>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="fw-bold text-dark text-sm">{loc.monthlyRevenue}</div>
                    <TrendArrowBadge value={loc.growth} size="sm" pastelTheme={loc.city === "Delhi NCR" ? "lavender" : "sky"} />
                  </div>
                </div>

                {/* Utilization Progress Bar */}
                <div className="mb-1">
                  <div className="d-flex justify-content-between text-[11px] font-semibold text-muted mb-1">
                    <span>Fleet Utilization ({loc.activeCars} Cars)</span>
                    <span className="fw-bold text-dark">{loc.utilizationRate}%</span>
                  </div>
                  <div className="progress progress-sm rounded-pill bg-slate-200/80" style={{ height: "6px" }}>
                    <div
                      className="progress-bar rounded-pill"
                      role="progressbar"
                      style={{
                        width: `${loc.utilizationRate}%`,
                        backgroundColor: loc.color,
                        transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                      aria-valuenow={loc.utilizationRate}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                {/* Popular Model chip */}
                <div className="d-flex align-items-center justify-content-between mt-2 pt-1 border-top border-light">
                  <span className="text-[10px] text-muted text-uppercase tracking-wider font-semibold">
                    Top Rental
                  </span>
                  <span className="badge bg-light border text-muted rounded-pill text-[10px]">
                    {loc.popularModel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
