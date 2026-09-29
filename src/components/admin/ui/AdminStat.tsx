import React from "react";

interface AdminStatProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconClass?: string;
  avatarBg?: string;
  badge?: string;
  badgeType?: "success" | "danger" | "warning" | "info" | "primary";
  trend?: string;
  className?: string;
}

export default function AdminStat({
  label,
  value,
  subtitle,
  icon,
  iconClass,
  avatarBg = "bg-primary-subtle text-primary",
  badge,
  badgeType = "success",
  trend,
  className = "",
}: AdminStatProps) {
  const badgeClassMap = {
    success: "bg-success-subtle text-success",
    danger: "bg-danger-subtle text-danger",
    warning: "bg-warning-subtle text-warning",
    info: "bg-info-subtle text-info",
    primary: "bg-primary-subtle text-primary",
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header pb-0 border-0 bg-transparent pt-3 px-4 d-flex align-items-center justify-content-between">
        <div
          className={`avatar rounded-circle d-flex align-items-center justify-content-center ${avatarBg}`}
          style={{ width: "44px", height: "44px" }}
        >
          {iconClass ? (
            <i className={`fi ${iconClass}`} style={{ fontSize: "20px" }}></i>
          ) : icon ? (
            icon
          ) : (
            <i className="fi fi-rr-stats" style={{ fontSize: "20px" }}></i>
          )}
        </div>

        {(badge || trend) && (
          <span className={`badge px-2.5 py-1.5 rounded-pill ${badgeClassMap[badgeType]}`}>
            {badge || trend}
          </span>
        )}
      </div>

      <div className="card-body d-flex align-items-end pt-3 px-4 pb-4">
        <div className="clearfix me-auto">
          <p
            className="text-muted mb-1 text-uppercase fw-semibold"
            style={{ fontSize: "11.5px", letterSpacing: "0.5px" }}
          >
            {label}
          </p>
          <h2 className="mb-0 fw-bold text-dark">{value}</h2>
          {subtitle && (
            <small className="text-muted d-block mt-1" style={{ fontSize: "12px" }}>
              {subtitle}
            </small>
          )}
        </div>
      </div>
    </div>
  );
}
