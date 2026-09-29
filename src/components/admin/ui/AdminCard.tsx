import React from "react";

export type AdminCardVariant = "default" | "dark" | "gold-glow";

interface AdminCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: AdminCardVariant;
  style?: React.CSSProperties;
}

export default function AdminCard({
  children,
  title,
  subtitle,
  action,
  className = "",
  variant = "default",
  style,
}: AdminCardProps) {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || action) && (
        <div className="card-header d-flex align-items-center justify-content-between py-3 px-4 border-bottom bg-transparent">
          <div>
            {title && <h5 className="card-title mb-0 fw-bold text-dark">{title}</h5>}
            {subtitle && <small className="text-muted d-block mt-0.5">{subtitle}</small>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body p-4">
        {children}
      </div>
    </div>
  );
}
