import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-[#141414] border border-white/10 shadow-lg hover:border-white/20 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{title}</span>
        <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendUp
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-2 text-xs text-neutral-500">{subtitle}</p>}
    </div>
  );
}
