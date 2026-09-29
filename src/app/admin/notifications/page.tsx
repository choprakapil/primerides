"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Send,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  PageContainer,
  PageHeader,
} from "@/components/admin/ui";
import { DEFAULT_NOTIFICATION_SETTINGS, NotificationSettings } from "@/types/siteSettings";

export default function AdminNotificationsPage() {
  const [data, setData] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/notifications")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setData(json.data);
        }
      })
      .catch((err) => console.error("Error loading notification settings:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update notification settings");
      }

      setSuccessMsg("Announcement bar and notification templates saved successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Communications & Broadcast"
        title="Notifications Management"
        description="Configure public website announcement tickers, automated WhatsApp & SMS templates, and operations staff alert rules."
        icon={<Bell className="w-5 h-5 text-[#5955D1]" />}
        actions={
          <AdminButton
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving Notifications..." : "Save Notification Rules"}</span>
          </AdminButton>
        }
      />

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-semibold">{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-sm font-semibold">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Top Announcement Bar */}
        <AdminCard className="card border mb-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#5955D1]" />
              <h2 className="text-base font-bold text-slate-900">Website Top Announcement Bar</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={data.announcementBar.enabled}
                onChange={(e) =>
                  setData({
                    ...data,
                    announcementBar: { ...data.announcementBar, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 text-[#5955D1] rounded focus:ring-[#5955D1]"
              />
              <span>{data.announcementBar.enabled ? "Active on Website" : "Disabled"}</span>
            </label>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-dark mb-1">Badge Label</label>
              <input
                type="text"
                value={data.announcementBar.badgeText}
                onChange={(e) =>
                  setData({
                    ...data,
                    announcementBar: { ...data.announcementBar, badgeText: e.target.value },
                  })
                }
                className="form-control form-control-sm"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold text-dark mb-1">Action Button Text</label>
              <input
                type="text"
                value={data.announcementBar.linkText}
                onChange={(e) =>
                  setData({
                    ...data,
                    announcementBar: { ...data.announcementBar, linkText: e.target.value },
                  })
                }
                className="form-control form-control-sm"
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold text-dark mb-1">Announcement Headline / Promotion</label>
              <input
                type="text"
                value={data.announcementBar.text}
                onChange={(e) =>
                  setData({
                    ...data,
                    announcementBar: { ...data.announcementBar, text: e.target.value },
                  })
                }
                className="form-control form-control-sm"
              />
            </div>
          </div>
        </AdminCard>

        {/* Section 2: Automated Customer Templates */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Automated WhatsApp & SMS Notification Templates</h3>
            <span className="text-xs text-slate-500">Variables supported: {"{customer_name}"}, {"{booking_id}"}, {"{car_name}"}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Booking Confirmed */}
            <AdminCard className="p-5 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-900">1. Booking Confirmed</span>
                <AdminBadge variant="neutral" className="text-[10px]">WhatsApp & SMS</AdminBadge>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">WhatsApp Message</label>
                <textarea
                  rows={3}
                  value={data.templates.bookingConfirmed.whatsapp}
                  onChange={(e) =>
                    setData({
                      ...data,
                      templates: {
                        ...data.templates,
                        bookingConfirmed: {
                          ...data.templates.bookingConfirmed,
                          whatsapp: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1]"
                />
              </div>
            </AdminCard>

            {/* KYC Approved */}
            <AdminCard className="p-5 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-900">2. KYC Approved (Handover Ready)</span>
                <AdminBadge variant="neutral" className="text-[10px]">Gate Passed</AdminBadge>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">WhatsApp Message</label>
                <textarea
                  rows={3}
                  value={data.templates.kycApproved.whatsapp}
                  onChange={(e) =>
                    setData({
                      ...data,
                      templates: {
                        ...data.templates,
                        kycApproved: {
                          ...data.templates.kycApproved,
                          whatsapp: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1]"
                />
              </div>
            </AdminCard>
          </div>
        </div>

        {/* Section 3: Operations Staff Alerts */}
        <AdminCard className="p-5 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#5955D1]" />
              <h3 className="font-bold text-sm text-slate-900">Operations Staff Event Dispatch</h3>
            </div>
          </div>

          <div className="row g-3">
            <div className="space-y-2">
              <label className="form-label fw-semibold text-dark mb-1">Operations Alert Email</label>
              <input
                type="email"
                value={data.adminAlerts.alertEmail}
                onChange={(e) =>
                  setData({
                    ...data,
                    adminAlerts: { ...data.adminAlerts, alertEmail: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1]"
              />
            </div>
            <div className="space-y-2">
              <label className="form-label fw-semibold text-dark mb-1">Operations Alert Mobile Number</label>
              <input
                type="text"
                value={data.adminAlerts.alertPhone}
                onChange={(e) =>
                  setData({
                    ...data,
                    adminAlerts: { ...data.adminAlerts, alertPhone: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1]"
              />
            </div>
          </div>
        </AdminCard>
      </form>
    </PageContainer>
  );
}
