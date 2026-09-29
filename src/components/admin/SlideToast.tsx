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
          success: "bg-white border-emerald-200 text-emerald-800 shadow-[0_8px_30px_rgba(16,185,129,0.12)]",
          error: "bg-white border-red-200 text-red-800 shadow-[0_8px_30px_rgba(239,68,68,0.12)]",
          warning: "bg-white border-amber-200 text-amber-800 shadow-[0_8px_30px_rgba(245,158,11,0.12)]",
          info: "bg-white border-blue-200 text-blue-800 shadow-[0_8px_30px_rgba(59,130,246,0.12)]",
        };

        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-4 rounded-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 ${bgColors[toast.type]}`}
          >
            <div className="flex items-start space-x-3">
              {icons[toast.type]}
              <span className="text-sm font-semibold leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
