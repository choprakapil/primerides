"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Car,
  ExternalLink,
  Save,
  CheckCircle2,
  Layers,
  ArrowRight,
  Shield,
  Gauge,
  Sliders,
} from "lucide-react";
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  PageContainer,
  PageHeader,
} from "@/components/admin/ui";

export default function AdminCmsFleetPage() {
  const [isSaved, setIsSaved] = useState(false);

  const [fleetPageData, setFleetPageData] = useState({
    eyebrow: "PREMIUM SELF-DRIVE COLLECTION",
    title: "Explore Our Luxury Fleet",
    subtitle:
      "From mountain-dominating 4x4 SUVs to executive long-wheelbase sedans, choose your ideal drive with unlimited kilometers and zero security deposit.",
  });

  const categories = [
    {
      id: "suv-4x4",
      name: "Luxury SUVs & 4x4s",
      badge: "Most Popular",
      desc: "Fortuner 4x4, Thar 4x4, Scorpio-N, Jimny for expeditions and rugged terrains.",
      count: "18+ Vehicles",
    },
    {
      id: "luxury-sedan",
      name: "Executive & VIP Sedans",
      badge: "Chauffeur / Self-Drive",
      desc: "BMW 5 Series, Mercedes E-Class, Rolls Royce Cullinan for weddings & delegations.",
      count: "12+ Vehicles",
    },
    {
      id: "family-mpv",
      name: "Premium Family MUVs",
      badge: "Family Choice",
      desc: "Toyota Innova Crysta & Hycross 7-8 seaters with cavernous luggage capacity.",
      count: "14+ Vehicles",
    },
    {
      id: "compact-urban",
      name: "Urban & Compact SUVs",
      badge: "City Smart",
      desc: "Hyundai Creta, Kia Seltos, Maruti Brezza for smooth city cruising.",
      count: "16+ Vehicles",
    },
  ];

  const kmTiers = [
    { tier: "250 KM / Day", extraKm: "₹14/km", desc: "Best for local city running and short airport pick-drops." },
    { tier: "375 KM / Day", extraKm: "₹12/km", desc: "Ideal for Agra, Jaipur, or Haridwar weekend getaways." },
    { tier: "525 KM / Day", extraKm: "₹10/km", desc: "Perfect for Himachal, Uttarakhand, and mountain expeditions." },
    { tier: "Unlimited KM", extraKm: "Zero", desc: "Total peace of mind with 100% unrestricted driving freedom." },
  ];

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CMS & Content"
        title="Fleet Page Management"
        description="Configure the public fleet catalog page headlines, vehicle category spotlights, and KM plan rules."
        icon={<Car className="w-5 h-5 text-[#5955D1]" />}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/cars"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border border-[#e8edf2] text-slate-700 bg-white hover:bg-slate-50 hover:text-[#5955D1] transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live Fleet Page</span>
            </Link>
            <Link
              href="/admin/cars"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 transition-all shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 text-[#5955D1]" />
              <span>Manage Vehicle Inventory</span>
            </Link>
            <AdminButton
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-[#5955D1] hover:bg-[#b0871e] text-white px-4 py-2 text-xs font-bold rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Fleet Page Config</span>
            </AdminButton>
          </div>
        }
      />

      {isSaved && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm">
            <strong>Fleet Page Saved!</strong> Header copy and category representations updated.
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Banner Section */}
        <AdminCard className="p-6 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Fleet Page Header Copy</h2>
            <p className="text-xs text-slate-500">Eyebrow, title, and descriptive text displayed at /cars.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Eyebrow Pill</label>
              <input
                type="text"
                value={fleetPageData.eyebrow}
                onChange={(e) => setFleetPageData({ ...fleetPageData, eyebrow: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Page Headline</label>
              <input
                type="text"
                value={fleetPageData.title}
                onChange={(e) => setFleetPageData({ ...fleetPageData, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Page Subtitle</label>
              <textarea
                rows={3}
                value={fleetPageData.subtitle}
                onChange={(e) => setFleetPageData({ ...fleetPageData, subtitle: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
              />
            </div>
          </div>
        </AdminCard>

        {/* Categories Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Vehicle Categories Highlighted on Website</h3>
            <span className="text-xs text-slate-500">4 active categories</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c) => (
              <AdminCard key={c.id} className="p-4 bg-white border border-[#e8edf2] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{c.name}</h4>
                  <AdminBadge variant="neutral" className="text-[10px]">
                    {c.badge}
                  </AdminBadge>
                </div>
                <p className="text-xs text-slate-500">{c.desc}</p>
                <div className="text-[11px] font-semibold text-[#5955D1] pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>{c.count}</span>
                  <Link href="/admin/cars" className="text-slate-600 hover:text-[#5955D1] flex items-center gap-1">
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </AdminCard>
            ))}
          </div>
        </div>

        {/* KM Plan Tiers Info */}
        <AdminCard className="p-5 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Gauge className="w-4 h-4 text-[#5955D1]" />
            <h3 className="font-bold text-sm text-slate-900">Standard Kilometre Package Tiers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {kmTiers.map((tier, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-[#e8edf2] space-y-1">
                <span className="font-bold text-xs text-slate-900 block">{tier.tier}</span>
                <span className="text-[11px] text-[#5955D1] font-semibold block">Extra KM: {tier.extraKm}</span>
                <p className="text-[11px] text-slate-500 leading-tight">{tier.desc}</p>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>
    </PageContainer>
  );
}
