"use client";

import React, { useState } from "react";

interface AdminTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/**
 * Authoritative Admin Tooltip Primitive (AdminTooltip).
 * Accessible tooltip for icon navigation, compact buttons, and status icons.
 * - Triggered via mouse hover or keyboard focus
 * - role="tooltip"
 * - Compact typography (11px, dark navy background, gold accent border)
 */
export default function AdminTooltip({
  content,
  children,
  position = "right",
  className = "",
}: AdminTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={`absolute z-80 pointer-events-none whitespace-nowrap px-2 py-1 rounded-md bg-[#1c274c] text-white text-[11px] font-semibold tracking-normal shadow-floating border border-slate-700/60 animate-in fade-in zoom-in-95 duration-100 ${positionClasses[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
