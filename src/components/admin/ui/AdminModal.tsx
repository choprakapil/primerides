"use client";

import React, { useEffect, useRef } from "react";

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
  const modalRef = useRef<HTMLDivElement>(null);

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
      style={{ backgroundColor: "rgba(28, 39, 76, 0.45)", backdropFilter: "blur(4px)", zIndex: 1055 }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`modal-dialog modal-dialog-centered ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header py-3 px-4 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 className="modal-title fw-bold text-dark mb-0">{title}</h5>
              {subtitle && <small className="text-muted d-block mt-0.5">{subtitle}</small>}
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div
            className="modal-body p-4"
            style={{ maxHeight: "calc(80vh - 120px)", overflowY: "auto" }}
          >
            {children}
          </div>

          {footer && (
            <div className="modal-footer py-3 px-4 border-top bg-light d-flex align-items-center justify-content-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
