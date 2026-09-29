"use client";

import React, { useState } from "react";
import { Calendar, DollarSign, ArrowUpRight, TrendingUp } from "lucide-react";
import TrendArrowBadge from "../ui/TrendArrowBadge";

interface DataPoint {
  label: string;
  revenue: number; // in INR
  trips: number;
}

const DATA_7D: DataPoint[] = [
  { label: "Mon", revenue: 145000, trips: 12 },
  { label: "Tue", revenue: 182000, trips: 15 },
  { label: "Wed", revenue: 210000, trips: 18 },
  { label: "Thu", revenue: 265000, trips: 22 },
  { label: "Fri", revenue: 390000, trips: 31 },
  { label: "Sat", revenue: 485000, trips: 38 },
  { label: "Sun", revenue: 440000, trips: 34 },
];

const DATA_30D: DataPoint[] = [
  { label: "W1", revenue: 980000, trips: 84 },
  { label: "W2", revenue: 1240000, trips: 106 },
  { label: "W3", revenue: 1420000, trips: 122 },
  { label: "W4", revenue: 1680000, trips: 145 },
];

const DATA_12M: DataPoint[] = [
  { label: "Oct", revenue: 3200000, trips: 270 },
  { label: "Nov", revenue: 3900000, trips: 330 },
  { label: "Dec", revenue: 5400000, trips: 460 },
  { label: "Jan", revenue: 4800000, trips: 410 },
  { label: "Feb", revenue: 4600000, trips: 390 },
  { label: "Mar", revenue: 5800000, trips: 495 },
];

export default function RevenueTrendAreaChart() {
  const [period, setPeriod] = useState<"7D" | "30D" | "12M">("7D");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const activeData = period === "7D" ? DATA_7D : period === "30D" ? DATA_30D : DATA_12M;

  // Chart Dimensions
  const width = 600;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;

  const maxRevenue = Math.max(...activeData.map((d) => d.revenue)) * 1.15;
  const minRevenue = 0;

  // Calculate coordinates
  const points = activeData.map((d, i) => {
    const x = paddingX + (i / (activeData.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.revenue - minRevenue) / (maxRevenue - minRevenue)) * (height - paddingY * 2);
    return { x, y, data: d };
  });

  // Generate smooth cubic bezier SVG path
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="card h-100 border pastel-card pastel-card-lavender">
      <div className="card-body p-4">
        {/* Header with Title, Period Switcher, and Trend Badge */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <div className="avatar avatar-sm bg-purple-100 text-purple-700 rounded-circle d-flex align-items-center justify-content-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h6 className="card-title mb-0 fw-bold text-dark">Revenue &amp; Trips Dynamic Trend</h6>
              <TrendArrowBadge value="+24.8%" period="vs prev" pastelTheme="mint" />
            </div>
            <p className="text-muted small mb-0 mt-1">
              Real-time rental proceeds across Delhi NCR &amp; Lucknow luxury fleet.
            </p>
          </div>

          {/* Period Toggle Pills */}
          <div className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0">
            {(['7D', '30D', '12M'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  setHoverIndex(null);
                }}
                className={`nav-link px-2.5 py-1 text-xs ${period === p ? "active" : ""}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Highlight Stats Bar */}
        <div className="d-flex align-items-baseline gap-3 mb-2 pt-1">
          <div>
            <span className="text-muted text-[11px] fw-semibold text-uppercase tracking-wider">
              {hoverIndex !== null ? activePoint.data.label + " Proceeds" : "Current Volume"}
            </span>
            <div className="h4 mb-0 fw-bold text-dark">
              ₹{(activePoint.data.revenue / 1000).toFixed(1)}k
            </div>
          </div>
          <div className="border-start ps-3">
            <span className="text-muted text-[11px] fw-semibold text-uppercase tracking-wider">
              Active Bookings
            </span>
            <div className="h6 mb-0 fw-bold text-purple-700">
              {activePoint.data.trips} Trips
            </div>
          </div>
        </div>

        {/* Interactive SVG Area Chart */}
        <div className="position-relative w-100 mt-2" style={{ overflow: "visible" }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-100 h-auto"
            style={{ maxHeight: "210px" }}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              {/* Pastel Lavender Area Gradient */}
              <linearGradient id="lavenderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.38" />
                <stop offset="70%" stopColor="#c4b5fd" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ede9fe" stopOpacity="0" />
              </linearGradient>

              {/* Grid Horizontal Line Filter */}
              <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines */}
            {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = height - paddingY - ratio * (height - paddingY * 2);
              return (
                <line
                  key={idx}
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Area */}
            <path d={areaPath} fill="url(#lavenderGradient)" />

            {/* Spline Stroke */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Active Vertical Crosshair */}
            {hoverIndex !== null && (
              <line
                x1={activePoint.x}
                y1={paddingY}
                x2={activePoint.x}
                y2={height - paddingY}
                stroke="#8b5cf6"
                strokeDasharray="3 3"
                strokeWidth="1.5"
              />
            )}

            {/* Interactive Data Dots & Hit Targets */}
            {points.map((pt, idx) => {
              const isCurrent = hoverIndex === idx || (hoverIndex === null && idx === points.length - 1);
              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(idx)}
                >
                  {/* Invisible Hitbox for easy touch/mouse hovering */}
                  <rect
                    x={pt.x - 20}
                    y={0}
                    width={40}
                    height={height}
                    fill="transparent"
                  />

                  {/* Pulsing Outer Ring on Active Point */}
                  {isCurrent && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="9"
                      fill="#8b5cf6"
                      fillOpacity="0.2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Central Node */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isCurrent ? "5" : "3.5"}
                    fill="#ffffff"
                    stroke="#8b5cf6"
                    strokeWidth={isCurrent ? "2.5" : "1.5"}
                    className="chart-dot-glow"
                  />

                  {/* X-Axis Label */}
                  <text
                    x={pt.x}
                    y={height - 8}
                    textAnchor="middle"
                    fill={isCurrent ? "#7c3aed" : "#94a3b8"}
                    fontSize="10.5"
                    fontWeight={isCurrent ? "700" : "500"}
                  >
                    {pt.data.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
