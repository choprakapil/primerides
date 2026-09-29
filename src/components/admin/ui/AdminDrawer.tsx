"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  placement?: "right" | "left";
  size?: "sm" | "md" | "lg";
}

/**
 * Authoritative Admin Drawer Primitive (AdminDrawer).
 * Off-canvas sliding workspace for detailed inspections (e.g. KYC inspection, Staff creation)
 * without losing page context.
 * - Right or Left placement
 * - ESC key handling
 * - Viewport-constrained internal scrolling
 * - Responsive width
 */
export default function AdminDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  placement = "right",
  size = "md",
}: AdminDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const titleId = `drawer-title-${title.toLowerCase().replace(/\s+/g, "-")}`;
  const subtitleId = subtitle ? `drawer-desc-${title.toLowerCase().replace(/\s+/g, "-")}` : undefined;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "w-full max-w-sm", // 384px
    md: "w-full max-w-md sm:max-w-lg", // 448-512px
    lg: "w-full max-w-lg sm:max-w-2xl", // 512-672px
  };

  const placementClasses = {
    right: "inset-y-0 right-0 animate-in slide-in-from-right duration-200",
    left: "inset-y-0 left-0 animate-in slide-in-from-left duration-200",
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
    >
      <div
        ref={drawerRef}
        className={`fixed ${placementClasses[placement]} ${sizeClasses[size]} bg-white border-l border-[#e8edf2] shadow-2xl flex flex-col h-full overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-100 bg-white shrink-0">
          <div className="pr-3 min-w-0">
            <h3 id={titleId} className="font-heading text-base sm:text-lg font-bold text-[#1c274c] tracking-tight truncate">
              {title}
            </h3>
            {subtitle && (
              <p id={subtitleId} className="text-xs text-slate-500 mt-0.5 font-medium truncate">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-w-0 space-y-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
