import React from "react";

interface AdminSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Authoritative Admin Section Primitive.
 * Used for structural, semantic grouping WITHOUT forcing a heavy boxed card container.
 * Promotes workspace-first information layout.
 */
export default function AdminSection({
  children,
  title,
  subtitle,
  action,
  className = "",
}: AdminSectionProps) {
  return (
    <section className={`space-y-3.5 ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#e8edf2]/80">
          <div>
            {title && (
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#1c274c] tracking-tight leading-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-[13px] text-slate-500 font-medium pt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="min-w-0">{children}</div>
    </section>
  );
}
