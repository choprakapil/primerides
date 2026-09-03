"use client";

import React from "react";
import { useAdminLayout } from "./AdminLayoutContext";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export default function SlideToast() {
  const { toasts, removeToast } = useAdminLayout();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full">
      {toasts.map((toast) => {
        const bgColors = {
          success: "bg-emerald-950/90 border-emerald-500/50 text-emerald-200",
          error: "bg-red-950/90 border-red-500/50 text-red-200",
          warning: "bg-amber-950/90 border-amber-500/50 text-amber-200",
          info: "bg-blue-950/90 border-blue-500/50 text-blue-200",
        };

        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 ${bgColors[toast.type]}`}
          >
            <div className="flex items-start space-x-3">
              {icons[toast.type]}
              <span className="text-sm font-medium leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
