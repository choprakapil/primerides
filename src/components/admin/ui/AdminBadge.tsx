import React from "react";

export type AdminBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "primary"
  | "brand";

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: AdminBadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export default function AdminBadge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
}: AdminBadgeProps) {
  const variantMap: Record<AdminBadgeVariant, string> = {
    success: "bg-success-subtle text-success border border-success-subtle",
    warning: "bg-warning-subtle text-warning border border-warning-subtle",
    danger: "bg-danger-subtle text-danger border border-danger-subtle",
    info: "bg-info-subtle text-info border border-info-subtle",
    primary: "bg-primary-subtle text-primary border border-primary-subtle",
    brand: "bg-primary-subtle text-primary border border-primary-subtle",
    neutral: "bg-light text-secondary border",
  };

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-2xs" : "px-2.5 py-1 text-xs";

  return (
    <span className={`badge rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5 ${variantMap[variant]} ${sizeClass} ${className}`}>
      {dot && (
        <span
          className="rounded-circle shrink-0"
          style={{ width: "5px", height: "5px", backgroundColor: "currentColor" }}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

export type BadgeVariant = AdminBadgeVariant;
