"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = true,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{
        backgroundColor: "rgba(28, 39, 76, 0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 1060,
      }}
      onClick={onCancel}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "420px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-body p-4 text-center">
            <div
              className={`avatar avatar-lg rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center ${
                isDestructive
                  ? "bg-danger-subtle text-danger"
                  : "bg-warning-subtle text-warning"
              }`}
              style={{ width: "52px", height: "52px" }}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h5 className="fw-bold text-dark mb-2">{title}</h5>
            <p className="text-muted mb-4" style={{ fontSize: "13px", lineHeight: "1.5" }}>
              {message}
            </p>

            <div className="d-flex align-items-center justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-light border btn-sm px-3"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`btn btn-sm px-3.5 ${
                  isDestructive ? "btn-danger text-white" : "btn-primary text-white"
                }`}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
