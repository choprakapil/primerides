import React from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendArrowBadgeProps {
  value: string | number;
  period?: string;
  type?: "up" | "down" | "neutral" | "auto";
  size?: "sm" | "md";
  pastelTheme?: "mint" | "rose" | "sky" | "lavender" | "peach";
  className?: string;
}

export default function TrendArrowBadge({
  value,
  period,
  type = "auto",
  size = "sm",
  pastelTheme,
  className = "",
}: TrendArrowBadgeProps) {
  const strVal = String(value);
  let resolvedType = type;
  if (type === "auto") {
    if (strVal.startsWith("+") || (!strVal.startsWith("-") && parseFloat(strVal) > 0)) {
      resolvedType = "up";
    } else if (strVal.startsWith("-") || parseFloat(strVal) < 0) {
      resolvedType = "down";
    } else {
      resolvedType = "neutral";
    }
  }

  const themeClass = pastelTheme
    ? {
        mint: "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70",
        rose: "bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/70",
        sky: "bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100/70",
        lavender: "bg-purple-50 text-purple-700 border-purple-200/80 hover:bg-purple-100/70",
        peach: "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70",
      }[pastelTheme]
    : resolvedType === "up"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70"
    : resolvedType === "down"
    ? "bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/70"
    : "bg-slate-100 text-slate-700 border-slate-200/80";

  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const textSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold border rounded-pill px-2 py-0.5 shadow-2xs transition-all duration-200 ${themeClass} ${textSize} ${className}`}
    >
      {resolvedType === "up" && <ArrowUpRight className={`${iconSize} text-emerald-600 shrink-0 transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} />}
      {resolvedType === "down" && <ArrowDownRight className={`${iconSize} text-rose-600 shrink-0 transform transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5`} />}
      {resolvedType === "neutral" && <Minus className={`${iconSize} text-slate-500 shrink-0`} />}
      <span>{strVal}</span>
      {period && <span className="opacity-70 font-normal text-[10px] ms-0.5">{period}</span>}
    </span>
  );
}
