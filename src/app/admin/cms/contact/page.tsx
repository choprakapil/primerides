"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PhoneCall,
  ExternalLink,
  Save,
  CheckCircle2,
  MapPin,
  Clock,
  Mail,
  MessageSquareText,
  AlertCircle,
} from "lucide-react";
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  PageContainer,
  PageHeader,
} from "@/components/admin/ui";
import { ContactConfig, DEFAULT_CONTACT_CONFIG } from "@/types/siteSettings";

export default function AdminCmsContactPage() {
  const [contactData, setContactData] = useState<ContactConfig>(DEFAULT_CONTACT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load persisted contact config
  useEffect(() => {
    fetch("/api/v1/admin/cms/contact")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) {
          setContactData(json.data);
        }
      })
      .catch((err) => console.error("Failed to load contact config:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/admin/cms/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save contact configuration");

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save contact details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CMS & Content"
        title="Contact Us Page Management"
        description="Configure contact telephone numbers, WhatsApp concierge details, hub desk addresses, and support hours displayed at /contact."
        icon={<PhoneCall className="w-5 h-5 text-[#c59b27]" />}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border border-[#e8edf2] text-slate-700 bg-white hover:bg-slate-50 hover:text-[#c59b27] transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview /contact</span>
            </Link>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border border-orange-200/80 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all shadow-xs"
            >
              <MessageSquareText className="w-3.5 h-3.5 text-orange-600" />
              <span>View Customer Inquiries</span>
            </Link>
            <AdminButton
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[#c59b27] hover:bg-[#b0871e] text-white px-4 py-2 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving to Storage..." : "Save Contact Config"}</span>
            </AdminButton>
          </div>
        }
      />

      {isSaved && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm">
            <strong>Contact Page Saved!</strong> Details persisted to storage and site settings successfully.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-sm">{errorMsg}</div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header Copy */}
        <AdminCard className="p-6 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Page Headline & Narrative</h2>
            <p className="text-xs text-slate-500">Eyebrow, title, and descriptive text displayed on /contact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Eyebrow Pill</label>
              <input
                type="text"
                value={contactData.eyebrow}
                onChange={(e) => setContactData({ ...contactData, eyebrow: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#c59b27]"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Headline</label>
              <input
                type="text"
                value={contactData.title}
                onChange={(e) => setContactData({ ...contactData, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#c59b27]"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Subtitle</label>
              <textarea
                rows={3}
                value={contactData.subtitle}
                onChange={(e) => setContactData({ ...contactData, subtitle: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#c59b27]"
              />
            </div>
          </div>
        </AdminCard>

        {/* Telephone & WhatsApp */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdminCard className="p-5 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <PhoneCall className="w-4 h-4 text-[#c59b27]" />
              <h3 className="font-bold text-sm text-slate-900">Direct Concierge Dial Numbers</h3>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Primary Phone</label>
              <input
                type="text"
                value={contactData.phone}
                onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">WhatsApp Support Number</label>
              <input
                type="text"
                value={contactData.whatsapp}
                onChange={(e) => setContactData({ ...contactData, whatsapp: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
          </AdminCard>

          <AdminCard className="p-5 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="w-4 h-4 text-[#c59b27]" />
              <h3 className="font-bold text-sm text-slate-900">Official Inbound Email Addresses</h3>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">General Support Email</label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Bookings Concierge Email</label>
              <input
                type="email"
                value={contactData.supportEmail}
                onChange={(e) => setContactData({ ...contactData, supportEmail: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
          </AdminCard>
        </div>

        {/* Physical Office / Hub Locations */}
        <AdminCard className="p-6 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#c59b27]" />
              <h3 className="font-bold text-sm text-slate-900">Hub & Airport Desk Physical Addresses</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Delhi NCR Airport Hub</label>
              <textarea
                rows={3}
                value={contactData.addressDelhi}
                onChange={(e) => setContactData({ ...contactData, addressDelhi: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Gurugram Cyber Hub</label>
              <textarea
                rows={3}
                value={contactData.addressGurgaon}
                onChange={(e) => setContactData({ ...contactData, addressGurgaon: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Lucknow CCS Airport Hub</label>
              <textarea
                rows={3}
                value={contactData.addressLucknow}
                onChange={(e) => setContactData({ ...contactData, addressLucknow: e.target.value })}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-[#c59b27]"
              />
            </div>
          </div>
        </AdminCard>
      </div>
    </PageContainer>
  );
}
