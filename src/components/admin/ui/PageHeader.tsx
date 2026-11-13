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
    <div className={`dash-page-header ${className}`}>
      {/* Left: Title block */}
      <div className="dash-page-header-left">
        {eyebrow && (
          <span className="dash-page-eyebrow">{eyebrow}</span>
        )}
        <h1 className="dash-page-title">
          {icon && <span className="dash-page-title-icon">{icon}</span>}
          {title}
        </h1>
        {description && (
          <p className="dash-page-description">{description}</p>
        )}
      </div>

      {/* Right: Action buttons */}
      {actions && (
        <div className="dash-page-actions">
          {actions}
        </div>
      )}
    </div>
  );
}

export const PageHeader = AdminPageHeader;
export default AdminPageHeader;
