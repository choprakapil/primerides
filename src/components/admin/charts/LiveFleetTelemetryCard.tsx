"use client";

import React from "react";
import { Radio, Navigation, ShieldCheck, Zap } from "lucide-react";
import TrendArrowBadge from "../ui/TrendArrowBadge";

export default function LiveFleetTelemetryCard() {
  return (
    <div className="card h-100 border pastel-card pastel-card-peach">
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="position-relative d-inline-flex">
              <div className="avatar avatar-sm bg-amber-100 text-amber-700 rounded-circle d-flex align-items-center justify-content-center">
                <Radio className="w-4 h-4" />
              </div>
              <span className="position-absolute top-0 end-0 translate-middle p-1 bg-success border border-light rounded-circle">
                <span className="visually-hidden">Online</span>
              </span>
            </div>
            <div>
              <h6 className="card-title mb-0 fw-bold text-dark">GPS Telemetry &amp; Fleet Radar</h6>
              <div className="d-flex align-items-center gap-1.5 mt-0.5">
                <span className="telemetry-radar-dot" />
                <span className="text-[11px] font-semibold text-emerald-700">Live Tracking Active</span>
              </div>
            </div>
          </div>
          <TrendArrowBadge value="100%" period="connected" pastelTheme="mint" />
        </div>

        {/* Live Metrics Grid */}
        <div className="row g-2 my-2">
          <div className="col-6">
            <div className="p-2.5 rounded-3 bg-white border border-amber-200/60 shadow-2xs">
              <div className="d-flex align-items-center gap-1.5 text-amber-800 text-[11px] font-bold mb-1">
                <Navigation className="w-3 h-3 text-amber-600" />
                <span>On-Road In Trip</span>
              </div>
              <div className="h4 mb-0 fw-bold text-dark">18 Cars</div>
              <div className="text-[10px] text-muted mt-0.5">Speed &lt; 90 km/h nominal</div>
            </div>
          </div>

          <div className="col-6">
            <div className="p-2.5 rounded-3 bg-white border border-amber-200/60 shadow-2xs">
              <div className="d-flex align-items-center gap-1.5 text-purple-800 text-[11px] font-bold mb-1">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>Geofence Status</span>
              </div>
              <div className="h4 mb-0 fw-bold text-success">Secured</div>
              <div className="text-[10px] text-muted mt-0.5">0 boundary breaches</div>
            </div>
          </div>
        </div>

        {/* Fastag & Battery Health Bar */}
        <div className="mt-3 pt-2 border-top border-amber-100">
          <div className="d-flex align-items-center justify-content-between text-xs mb-1.5">
            <span className="text-muted font-medium d-flex align-items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Fastag Fleet Wallet
            </span>
            <span className="fw-bold text-dark">₹84,250 (Auto-Reload On)</span>
          </div>
          <div className="progress progress-sm rounded-pill bg-slate-200/80" style={{ height: "5px" }}>
            <div
              className="progress-bar bg-amber-500 rounded-pill"
              style={{ width: "82%" }}
              role="progressbar"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
