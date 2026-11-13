"use client";

import React from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: AdminModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "modal-sm",
    md: "",
    lg: "modal-lg",
    xl: "modal-xl",
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 1055,
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`modal-dialog modal-dialog-centered ${sizeClasses[size]}`}
        style={{ maxWidth: size === "xl" ? "1060px" : undefined }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border border-slate-200/90 shadow-2xl rounded-3xl overflow-hidden bg-white">
          {/* Top subtle luxury brandline */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1c274c] via-[#c59b27] to-[#1c274c] shrink-0" />

          <div className="modal-header py-4 px-6 border-bottom border-slate-100 bg-gradient-to-r from-white via-slate-50/40 to-white d-flex align-items-center justify-content-between">
            <div className="min-w-0 pr-4">
              <h5 className="modal-title font-heading font-black text-[#1c274c] mb-0 tracking-tight fs-5">
                {title}
              </h5>
              {subtitle && (
                <p className="text-slate-500 text-xs mb-0 mt-1 font-medium">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/90 text-slate-500 hover:text-slate-800 d-flex align-items-center justify-center transition-all border border-slate-200/70 shadow-2xs shrink-0 cursor-pointer"
              aria-label="Close"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            className="modal-body p-4 sm:p-5 bg-slate-100/40 max-h-[calc(100vh-160px)] overflow-y-auto"
            style={{ maxHeight: "calc(85vh - 130px)", overflowY: "auto" }}
          >
            {children}
          </div>

          {footer && (
            <div className="modal-footer py-3.5 px-6 border-top border-slate-100 bg-slate-50/80 d-flex align-items-center justify-content-end gap-2.5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
