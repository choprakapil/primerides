"use client";

import React, { useState } from "react";
import { PieChart, Sparkles, Car } from "lucide-react";
import TrendArrowBadge from "../ui/TrendArrowBadge";

interface Segment {
  id: string;
  name: string;
  percentage: number;
  count: number;
  color: string;
  pastelBg: string;
}

const SEGMENTS: Segment[] = [
  { id: "sedan", name: "Luxury Sedans", percentage: 42, count: 18, color: "#8b5cf6", pastelBg: "#ede9fe" },
  { id: "suv", name: "Executive SUVs", percentage: 31, count: 14, color: "#0ea5e9", pastelBg: "#e0f2fe" },
  { id: "sports", name: "Sports & Exotics", percentage: 17, count: 7, color: "#10b981", pastelBg: "#d1fae5" },
  { id: "convertible", name: "Convertibles", percentage: 10, count: 4, color: "#f59e0b", pastelBg: "#fef3c7" },
];

export default function FleetUtilizationDonutChart() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>(SEGMENTS);

  React.useEffect(() => {
    fetch("/api/v1/cars")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          const cars = json.data;
          const total = cars.length;
          const catMap: Record<string, number> = {};
          cars.forEach((c: any) => {
            const catName = c.category?.name || "Luxury Sedans";
            catMap[catName] = (catMap[catName] || 0) + 1;
          });

          const colors = [
            { color: "#8b5cf6", pastelBg: "#ede9fe" },
            { color: "#0ea5e9", pastelBg: "#e0f2fe" },
            { color: "#10b981", pastelBg: "#d1fae5" },
            { color: "#f59e0b", pastelBg: "#fef3c7" },
          ];

          const calculated = Object.entries(catMap).map(([name, count], idx) => ({
            id: `cat-${idx}`,
            name,
            count,
            percentage: Math.round((count / total) * 100),
            color: colors[idx % colors.length].color,
            pastelBg: colors[idx % colors.length].pastelBg,
          }));

          if (calculated.length > 0) {
            setSegments(calculated);
          }
        }
      })
      .catch(() => {});
  }, []);

  // SVG Geometry
  const size = 200;
  const center = size / 2;
  const radius = 76;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  const activeSegment = hoveredId ? segments.find((s) => s.id === hoveredId) : null;
  const totalUnits = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="card h-100 border pastel-card pastel-card-mint">
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar avatar-sm bg-emerald-100 text-emerald-700 rounded-circle d-flex align-items-center justify-content-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h6 className="card-title mb-0 fw-bold text-dark">Fleet Category Breakdown</h6>
              <span className="text-muted text-xs">Live active deployment</span>
            </div>
          </div>
          <TrendArrowBadge value="+91.2%" period="deployed" pastelTheme="mint" />
        </div>

        {/* Chart & Central Metric */}
        <div className="d-flex align-items-center justify-content-center my-2 position-relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {/* Base Ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Segment Arcs */}
            {segments.map((seg) => {
              const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += (seg.percentage / 100) * circumference;
              const isHovered = hoveredId === seg.id;

              return (
                <circle
                  key={seg.id}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    cursor: "pointer",
                    opacity: hoveredId && !isHovered ? 0.45 : 1,
                  }}
                  onMouseEnter={() => setHoveredId(seg.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              );
            })}
          </svg>

          {/* Central Metric Badge in Center of Donut */}
          <div className="position-absolute top-50 start-50 translate-middle text-center user-select-none pointer-events-none">
            {activeSegment ? (
              <div className="animate-in zoom-in-95 duration-200">
                <div className="h4 mb-0 fw-bold text-dark">{activeSegment.percentage}%</div>
                <div className="text-[10.5px] font-bold text-muted text-uppercase tracking-wider">
                  {activeSegment.count} Units
                </div>
              </div>
            ) : (
              <div>
                <div className="h3 mb-0 fw-bold text-dark">{totalUnits || 43}</div>
                <div className="text-[10px] font-bold text-muted text-uppercase tracking-wider">
                  Total Cars
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend Chips with pastel styling */}
        <div className="row g-2 mt-2 pt-1">
          {segments.map((seg) => {
            const isHovered = hoveredId === seg.id;
            return (
              <div key={seg.id} className="col-6">
                <div
                  onMouseEnter={() => setHoveredId(seg.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`d-flex align-items-center justify-content-between p-2 rounded-3 border transition-all cursor-pointer ${
                    isHovered ? "bg-white shadow-sm border-dark/20 scale-102" : "bg-light/60 border-transparent"
                  }`}
                >
                  <div className="d-flex align-items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-circle shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-xs font-semibold text-dark text-truncate">
                      {seg.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-muted ms-1">
                    {seg.percentage}%
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
