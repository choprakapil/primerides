import React from "react";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";

/**
 * Compact Operational Empty State
 */
export function AdminEmptyState({
  icon,
  title = "No items found",
  description = "There are no records currently available in this view.",
  action,
  className = "",
}: {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-lg bg-white border border-[#e8edf2] shadow-sm space-y-2.5 ${className}`}>
      <div className="w-9 h-9 mx-auto rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#1c274c]">{title}</h4>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

/**
 * Compact Operational Loading State
 */
export function AdminLoadingState({
  message = "Loading data...",
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`p-8 text-center rounded-lg bg-white border border-[#e8edf2] shadow-sm flex items-center justify-center gap-2.5 text-xs text-slate-600 font-medium ${className}`}>
      <RefreshCw className="w-4 h-4 animate-spin text-[#5955D1] shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Compact Operational Error State
 */
export function AdminErrorState({
  title = "Unable to load data",
  error,
  onRetry,
  className = "",
}: {
  title?: string;
  error?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`p-5 rounded-lg bg-red-50/80 border border-red-200 text-red-800 text-xs space-y-2 ${className}`}>
      <div className="flex items-center gap-2 font-bold text-red-700">
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
        <span>{title}</span>
      </div>
      {error && <p className="text-slate-600 pl-6">{error}</p>}
      {onRetry && (
        <div className="pl-6 pt-1">
          <button
            onClick={onRetry}
            className="px-2.5 py-1 rounded-md bg-white border border-red-300 text-red-700 hover:bg-red-50 text-[11px] font-bold cursor-pointer transition-colors"
          >
            Retry Request
          </button>
        </div>
      )}
    </div>
  );
}
