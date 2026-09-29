import React from "react";
import Link from "next/link";

export type AdminButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "success"
  | "ghost"
  | "action"
  | "white";

export type AdminButtonSize = "xs" | "sm" | "md" | "lg";

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export default function AdminButton({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  isLoading = false,
  href,
  className = "",
  disabled,
  ...props
}: AdminButtonProps) {
  const variantClassMap: Record<AdminButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline-primary",
    danger: "btn-danger",
    success: "btn-success",
    ghost: "btn-link text-decoration-none",
    action: "btn-action-gray btn-icon rounded-circle",
    white: "btn-white border shadow-sm",
  };

  const sizeClassMap: Record<AdminButtonSize, string> = {
    xs: "btn-sm py-1 px-2 text-xs",
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  const combinedClass = [
    "btn",
    variantClassMap[variant] || "btn-primary",
    sizeClassMap[size] || "",
    "d-inline-flex align-items-center justify-content-center gap-1.5",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {isLoading && (
        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
      )}
      {!isLoading && icon && iconPosition === "left" && (
        <span className="d-inline-flex align-items-center shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && icon && iconPosition === "right" && (
        <span className="d-inline-flex align-items-center shrink-0">{icon}</span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClass} {...(props as any)}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={combinedClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
}
