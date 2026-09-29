"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ExternalLink,
  Save,
  CheckCircle2,
  Award,
  ShieldCheck,
  Target,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  PageContainer,
  PageHeader,
} from "@/components/admin/ui";
import { AboutConfig, DEFAULT_ABOUT_CONFIG } from "@/types/siteSettings";

export default function AdminCmsAboutPage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [aboutData, setAboutData] = useState<AboutConfig>(DEFAULT_ABOUT_CONFIG);

  useEffect(() => {
    fetch("/api/v1/admin/cms/about")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setAboutData(json.data);
        }
      })
      .catch((err) => console.error("Failed to load about config:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const res = await fetch("/api/v1/admin/cms/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aboutData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save about configuration");

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      alert("Error saving about page content: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CMS & Content"
        title="About Us Management"
        description="Edit the company narrative, mission & vision statements, impact statistics, and leadership promises displayed on the /about page."
        icon={<Users className="w-5 h-5 text-[#5955D1]" />}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border border-[#e8edf2] text-slate-700 bg-white hover:bg-slate-50 hover:text-[#5955D1] transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live About Page</span>
            </Link>
            <AdminButton
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[#5955D1] hover:bg-[#b0871e] text-white px-4 py-2 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving to Storage..." : "Save About Us Content"}</span>
            </AdminButton>
          </div>
        }
      />

      {isSaved && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm">
            <strong>About Us Saved!</strong> Changes have been updated.
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Main Narrative Card */}
        <AdminCard className="p-6 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Brand Story & Introduction</h2>
            <p className="text-xs text-slate-500">Page header headline and introductory narrative.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Eyebrow Tag</label>
              <input
                type="text"
                value={aboutData.eyebrow}
                onChange={(e) => setAboutData({ ...aboutData, eyebrow: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Main Title</label>
              <input
                type="text"
                value={aboutData.pageTitle}
                onChange={(e) => setAboutData({ ...aboutData, pageTitle: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Introductory Subtitle</label>
              <textarea
                rows={3}
                value={aboutData.subtitle}
                onChange={(e) => setAboutData({ ...aboutData, subtitle: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
              />
            </div>
          </div>
        </AdminCard>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdminCard className="p-5 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Target className="w-4 h-4 text-[#5955D1]" />
              <h3 className="font-bold text-sm text-slate-900">Our Mission Statement</h3>
            </div>
            <textarea
              rows={4}
              value={aboutData.mission}
              onChange={(e) => setAboutData({ ...aboutData, mission: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1]"
            />
          </AdminCard>

          <AdminCard className="p-5 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-[#5955D1]" />
              <h3 className="font-bold text-sm text-slate-900">Our Vision Statement</h3>
            </div>
            <textarea
              rows={4}
              value={aboutData.vision}
              onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1]"
            />
          </AdminCard>
        </div>

        {/* Live Counters */}
        <AdminCard className="p-6 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5955D1]" />
              <h3 className="font-bold text-sm text-slate-900">Milestone Impact Statistics</h3>
            </div>
            <span className="text-[11px] text-slate-400">Counters shown in the About Us stats strip</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Happy Explorers</label>
              <input
                type="text"
                value={aboutData.statHappy}
                onChange={(e) => setAboutData({ ...aboutData, statHappy: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Fleet Size</label>
              <input
                type="text"
                value={aboutData.statFleet}
                onChange={(e) => setAboutData({ ...aboutData, statFleet: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Google Rating</label>
              <input
                type="text"
                value={aboutData.statRating}
                onChange={(e) => setAboutData({ ...aboutData, statRating: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Verified Reviews</label>
              <input
                type="text"
                value={aboutData.statReviews}
                onChange={(e) => setAboutData({ ...aboutData, statReviews: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1]"
              />
            </div>
          </div>
        </AdminCard>
      </div>
    </PageContainer>
  );
}
