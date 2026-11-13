import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Admin Field Wrapper
 * Standardizes label, required indicator, helper text, and accessible error message.
 */
export function AdminField({
  label,
  htmlFor,
  required,
  error,
  success,
  helperText,
  children,
  className = "",
}: {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  success?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 w-full ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold text-slate-700 tracking-wide select-none"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 pt-0.5" role="alert">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {success && !error && (
        <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 pt-0.5">
          <CheckCircle2 className="w-3 h-3 shrink-0" />
          <span>{success}</span>
        </p>
      )}
      {helperText && !error && !success && (
        <p className="text-[11px] text-slate-500 pt-0.5">{helperText}</p>
      )}
    </div>
  );
}

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  icon?: React.ReactNode;
  prefixAddon?: React.ReactNode;
  suffixAddon?: React.ReactNode;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      icon,
      prefixAddon,
      suffixAddon,
      className = "",
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <AdminField
        label={label}
        htmlFor={inputId}
        required={props.required}
        error={error}
        success={success}
        helperText={helperText}
      >
        <div
          className={`flex items-center h-9.5 rounded-xl border bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white overflow-hidden transition-all duration-150 ${
            disabled ? "bg-slate-100 opacity-60 cursor-not-allowed" : ""
          } ${
            error
              ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-400/20"
              : success
              ? "border-emerald-400 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-400/20"
              : "border-slate-400 hover:border-slate-500 focus-within:border-[#c59b27] focus-within:ring-2 focus-within:ring-[#c59b27]/25 shadow-2xs"
          }`}
        >
          {prefixAddon ? (
            <span className="h-full px-3.5 bg-slate-100 border-r border-slate-300 text-xs sm:text-[13px] font-bold text-[#c59b27] flex items-center justify-center shrink-0 select-none">
              {prefixAddon}
            </span>
          ) : icon ? (
            <span className="h-full px-3 bg-slate-100 border-r border-slate-300 text-slate-500 flex items-center justify-center shrink-0 select-none">
              {icon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full h-full px-3 bg-transparent border-none outline-none text-xs sm:text-[13px] text-[#1c274c] placeholder:text-slate-400 font-medium ${className}`}
            {...props}
          />

          {suffixAddon && (
            <span className="h-full px-3 bg-slate-100 border-l border-slate-300 text-xs font-semibold text-slate-500 flex items-center justify-center shrink-0 select-none">
              {suffixAddon}
            </span>
          )}
        </div>
      </AdminField>
    );
  }
);
AdminInput.displayName = "AdminInput";

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  children: React.ReactNode;
}

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, error, success, helperText, children, className = "", id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <AdminField
        label={label}
        htmlFor={selectId}
        required={props.required}
        error={error}
        success={success}
        helperText={helperText}
      >
        <div
          className={`flex items-center h-9.5 rounded-xl border bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white overflow-hidden transition-all duration-150 ${
            disabled ? "bg-slate-100 opacity-60 cursor-not-allowed" : ""
          } ${
            error
              ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-400/20"
              : "border-slate-400 hover:border-slate-500 focus-within:border-[#c59b27] focus-within:ring-2 focus-within:ring-[#c59b27]/25 shadow-2xs"
          }`}
        >
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full h-full px-3 bg-transparent border-none outline-none text-xs sm:text-[13px] text-[#1c274c] cursor-pointer font-medium ${className}`}
            {...props}
          >
            {children}
          </select>
        </div>
      </AdminField>
    );
  }
);
AdminSelect.displayName = "AdminSelect";

interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
}

export const AdminTextarea = React.forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ label, error, success, helperText, className = "", id, disabled, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <AdminField
        label={label}
        htmlFor={textareaId}
        required={props.required}
        error={error}
        success={success}
        helperText={helperText}
      >
        <div
          className={`p-2.5 rounded-xl border bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white transition-all duration-150 ${
            disabled ? "bg-slate-100 opacity-60 cursor-not-allowed" : ""
          } ${
            error
              ? "border-red-400 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-400"
              : "border-slate-400 hover:border-slate-500 focus-within:border-[#c59b27] focus-within:ring-2 focus-within:ring-[#c59b27]/25 shadow-2xs"
          }`}
        >
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            disabled={disabled}
            className={`w-full bg-transparent border-none outline-none text-xs sm:text-[13px] text-[#1c274c] placeholder:text-slate-400 resize-none ${className}`}
            {...props}
          />
        </div>
      </AdminField>
    );
  }
);
AdminTextarea.displayName = "AdminTextarea";

interface AdminCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  description?: string;
}

export const AdminCheckbox = React.forwardRef<HTMLInputElement, AdminCheckboxProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const checkboxId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label
        htmlFor={checkboxId}
        className={`flex items-start gap-2.5 cursor-pointer select-none group ${className}`}
      >
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-[#e8edf2] text-[#c59b27] focus:ring-[#c59b27] cursor-pointer"
          {...props}
        />
        <div className="text-xs">
          <span className="font-semibold text-[#1c274c] group-hover:text-[#c59b27] transition-colors">
            {label}
          </span>
          {description && (
            <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      </label>
    );
  }
);
AdminCheckbox.displayName = "AdminCheckbox";
