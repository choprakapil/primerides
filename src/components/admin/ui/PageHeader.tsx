import React from "react";

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  icon,
  className = "",
}: AdminPageHeaderProps) {
  return (
    <div className={`app-page-head d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4 ${className}`}>
      <div>
        {eyebrow && (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill mb-2 fw-semibold" style={{ fontSize: "11px" }}>
            {eyebrow}
          </span>
        )}
        <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          {icon && <span className="text-primary shrink-0">{icon}</span>}
          <span>{title}</span>
        </h4>
        {description && (
          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="d-flex flex-wrap align-items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export const PageHeader = AdminPageHeader;
export default AdminPageHeader;
