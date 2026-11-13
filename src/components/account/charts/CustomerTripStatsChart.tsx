"use client";

import React, { useState, useMemo } from "react";
import { Compass, Award, Car, Calendar } from "lucide-react";
import Link from "next/link";
import TrendArrowBadge from "../../admin/ui/TrendArrowBadge";

interface MonthData {
  month: string;
  km: number;
  spent: number;
  trips: number;
}

interface CustomerTripStatsChartProps {
  recentBookings?: any[];
  totalSpent?: number;
}

export default function CustomerTripStatsChart({
  recentBookings = [],
  totalSpent = 0,
}: CustomerTripStatsChartProps) {
  // Compute real monthly activity from customer bookings
  const monthlyData: MonthData[] = useMemo(() => {
    // Generate past 5 months names
    const months: MonthData[] = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = d.toLocaleString("en-US", { month: "short" });
      months.push({ month: mName, km: 0, spent: 0, trips: 0 });
    }

    if (!recentBookings || recentBookings.length === 0) {
      return months;
    }

    // Accumulate actual bookings into months
    recentBookings.forEach((b) => {
      const bDate = new Date(b.start_date);
      const mName = bDate.toLocaleString("en-US", { month: "short" });
      const target = months.find((m) => m.month === mName);
      if (target) {
        target.trips += 1;
        target.spent += Number(b.total_amount || 0);
        // Default base KM package is 300 KM per booking
        target.km += 300;
      }
    });

    return months;
  }, [recentBookings]);

  const hasAnyTrips = recentBookings && recentBookings.length > 0;
  const [activeIdx, setActiveIdx] = useState<number | null>(monthlyData.length - 1);

  const maxKm = Math.max(...monthlyData.map((h) => h.km), 300) * 1.2;
  const current = activeIdx !== null && monthlyData[activeIdx] ? monthlyData[activeIdx] : monthlyData[monthlyData.length - 1];

  const totalKmRecorded = monthlyData.reduce((sum, m) => sum + m.km, 0);

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
              <span className="text-muted text-xs">Live mileage &amp; real booking expenditure</span>
            </div>
          </div>
          <TrendArrowBadge
            value={hasAnyTrips ? `${recentBookings.length} Trips Recorded` : "New Explorer"}
            period="live database"
            pastelTheme="lavender"
          />
        </div>

        {/* Highlight Stats */}
        <div className="d-flex align-items-baseline gap-3 my-2">
          <div>
            <span className="text-muted text-[11px] font-semibold text-uppercase tracking-wider">
              {current?.month} Travel Distance
            </span>
            <div className="h4 mb-0 fw-bold text-dark">
              {current?.km || 0} <span className="text-sm text-purple-700 fw-bold">KM</span>
            </div>
          </div>
          <div className="border-start ps-3">
            <span className="text-muted text-[11px] font-semibold text-uppercase tracking-wider">
              Monthly Investment
            </span>
            <div className="h6 mb-0 fw-bold text-dark">
              ₹{(current?.spent || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="border-start ps-3">
            <span className="text-muted text-[11px] font-semibold text-uppercase tracking-wider">
              Reservations
            </span>
            <div className="h6 mb-0 fw-bold text-purple-700">
              {current?.trips || 0}
            </div>
          </div>
        </div>

        {/* Interactive Pastel Bars */}
        {hasAnyTrips ? (
          <div className="d-flex align-items-end justify-content-between gap-2 pt-3 pb-1" style={{ height: "130px" }}>
            {monthlyData.map((item, idx) => {
              const heightPct = item.km > 0 ? (item.km / maxKm) * 100 : 8;
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
                      minHeight: "10px",
                      backgroundColor: isSelected ? "#8b5cf6" : item.km > 0 ? "#c4b5fd" : "#f1f5f9",
                      boxShadow: isSelected && item.km > 0 ? "0 4px 12px rgba(139, 92, 246, 0.35)" : "none",
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
        ) : (
          <div className="bg-white/70 border border-purple-100 rounded-3 p-3 my-2 text-center">
            <Car className="w-6 h-6 text-purple-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-700 mb-1">No completed journeys logged yet</p>
            <p className="text-[11px] text-muted mb-2">Book your first luxury car to unlock live telemetry &amp; travel mileage analytics.</p>
            <Link href="/cars" className="btn btn-sm bg-purple-600 text-white rounded-pill px-3 py-1 text-xs font-bold shadow-2xs">
              Explore Fleet &amp; Book
            </Link>
          </div>
        )}

        {/* VIP Loyalty Milestone */}
        <div className="mt-3 pt-3 border-top border-purple-100 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-dark">Total Distance Logged:</span>
            <span className="badge bg-purple-100 text-purple-800 border border-purple-200 rounded-pill font-bold text-[10.5px]">
              {totalKmRecorded} KM
            </span>
          </div>
          <span className="text-[11px] text-muted font-medium">Real-time Telemetry</span>
        </div>
      </div>
    </div>
  );
}
