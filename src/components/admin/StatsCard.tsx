import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="card border h-100 shadow-sm">
      <div className="card-header pb-0 border-0 bg-transparent pt-3 px-4 d-flex align-items-center justify-content-between">
        <div
          className="avatar rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
          style={{ width: "42px", height: "42px" }}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={`badge px-2.5 py-1.5 rounded-pill ${
              trendUp
                ? "bg-success-subtle text-success"
                : "bg-danger-subtle text-danger"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="card-body pt-3 px-4 pb-4">
        <p
          className="text-muted mb-1 text-uppercase fw-semibold"
          style={{ fontSize: "11px", letterSpacing: "0.5px" }}
        >
          {title}
        </p>
        <h2 className="mb-0 fw-bold text-dark">{value}</h2>
        {subtitle && (
          <small className="text-muted d-block mt-1" style={{ fontSize: "12px" }}>
            {subtitle}
          </small>
        )}
      </div>
    </div>
  );
}
