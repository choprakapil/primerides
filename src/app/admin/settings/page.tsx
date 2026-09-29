"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Building,
  Phone,
  Mail,
  Clock,
  FileText,
  MapPin,
  Share2,
  Save,
  Check,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Globe,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminButton,
  AdminModal,
} from "@/components/admin/ui";
import TrendArrowBadge from "@/components/admin/ui/TrendArrowBadge";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "PrimeRides Luxury Car Rentals",
    tagline: "Ultra-Luxury & Self-Drive Fleet in Delhi NCR & Lucknow",
    phone: "+91 99999 99999",
    email: "concierge@primerides.in",
    supportEmail: "reservations@primerides.in",
    businessHours: "24 Hours / 7 Days Concierge Service",
    gstNumber: "07AAAAA0000A1Z5",
    addresses: {
      delhi: "Indira Gandhi International Airport (IGI T3), VIP Valet Station, New Delhi 110037",
      gurgaon: "DLF Cyber City, Building 10, Ground Floor Executive Hub, Gurugram 122002",
      lucknow: "Chaudhary Charan Singh International Airport (CCS), Terminal 2 & Gomti Nagar Hub, Lucknow 226009",
    },
    socialLinks: {
      instagram: "https://instagram.com/primerides",
      facebook: "https://facebook.com/primerides",
      twitter: "https://x.com/primerides",
      youtube: "https://youtube.com/@primerides",
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/v1/admin/settings");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSettings((prev) => ({ ...prev, ...json.data }));
          }
        }
      } catch {
        // Use default fallback settings
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update configuration settings.");
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Configuration & Governance"
        title="Global Platform Settings"
        description="Configure luxury fleet concierge contact numbers, tax compliance, regional pickup desks, and brand profiles."
        icon={<SettingsIcon className="w-5 h-5 text-purple-600" />}
        actions={
          <div className="d-flex align-items-center gap-2">
            {saveSuccess && (
              <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 font-bold text-xs animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Changes Saved Successfully</span>
              </span>
            )}
            <AdminButton
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </AdminButton>
          </div>
        }
      />

      {saveError && (
        <div className="alert alert-danger rounded-4 d-flex align-items-center justify-content-between mb-4 shadow-2xs">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="small font-medium">{saveError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="btn-close"
            aria-label="Close"
          />
        </div>
      )}

      <form onSubmit={handleSave} className="d-flex flex-column gap-4">
        {/* Section 1: General Brand Identity & Support Lines */}
        <div className="card border pastel-card pastel-card-lavender rounded-4 shadow-2xs overflow-hidden">
          <div className="card-header py-3 px-4 bg-white border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2.5">
              <div className="avatar avatar-sm rounded-circle bg-purple-100 text-purple-700 d-flex align-items-center justify-content-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h6 className="card-title mb-0 fw-bold text-dark">Brand Identity &amp; Concierge Desks</h6>
                <small className="text-muted">Public-facing company titles and central dispatch contacts</small>
              </div>
            </div>
            <TrendArrowBadge value="Verified Entity" period="brand" pastelTheme="lavender" />
          </div>

          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  Platform Name *
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Globe className="w-3.5 h-3.5 text-muted" />
                  </span>
                  <input
                    type="text"
                    required
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="form-control"
                    placeholder="PrimeRides"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="form-control form-control-sm"
                  placeholder="Ultra-Luxury & Self-Drive Fleet"
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-bold small text-dark mb-1">
                  Primary Concierge Helpline *
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Phone className="w-3.5 h-3.5 text-muted" />
                  </span>
                  <input
                    type="text"
                    required
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="form-control"
                    placeholder="+91 99999 99999"
                  />
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-bold small text-dark mb-1">
                  Concierge Support Email *
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Mail className="w-3.5 h-3.5 text-muted" />
                  </span>
                  <input
                    type="email"
                    required
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="form-control"
                    placeholder="concierge@primerides.in"
                  />
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-bold small text-dark mb-1">
                  Reservations &amp; Billing Email
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Mail className="w-3.5 h-3.5 text-muted" />
                  </span>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="form-control"
                    placeholder="reservations@primerides.in"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Operating Hours & Tax Compliance */}
        <div className="card border pastel-card pastel-card-mint rounded-4 shadow-2xs overflow-hidden">
          <div className="card-header py-3 px-4 bg-white border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2.5">
              <div className="avatar avatar-sm rounded-circle bg-emerald-100 text-emerald-700 d-flex align-items-center justify-content-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h6 className="card-title mb-0 fw-bold text-dark">Operating Hours &amp; Tax Compliance</h6>
                <small className="text-muted">GST invoicing requirements and valet dispatch operational windows</small>
              </div>
            </div>
            <TrendArrowBadge value="GST Active" period="compliant" pastelTheme="mint" />
          </div>

          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  Concierge Operating Hours *
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Clock className="w-3.5 h-3.5 text-muted" />
                  </span>
                  <input
                    type="text"
                    required
                    value={settings.businessHours}
                    onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                    className="form-control"
                    placeholder="24 Hours / 7 Days"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  GST Registration Number (GSTIN) *
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <FileText className="w-3.5 h-3.5 text-muted" />
                  </span>
                  <input
                    type="text"
                    required
                    value={settings.gstNumber}
                    onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                    className="form-control font-monospace"
                    placeholder="07AAAAA0000A1Z5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Physical Pickup Hub Desks */}
        <div className="card border pastel-card pastel-card-sky rounded-4 shadow-2xs overflow-hidden">
          <div className="card-header py-3 px-4 bg-white border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2.5">
              <div className="avatar avatar-sm rounded-circle bg-sky-100 text-sky-700 d-flex align-items-center justify-content-center">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h6 className="card-title mb-0 fw-bold text-dark">Airport VIP &amp; Physical Hub Addresses</h6>
                <small className="text-muted">Exact street landmarks printed on customer rental agreements &amp; invoices</small>
              </div>
            </div>
            <TrendArrowBadge value="3 Desks" period="regional" pastelTheme="sky" />
          </div>

          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-bold small text-dark mb-1">
                  Delhi NCR Terminal 3 Desk *
                </label>
                <textarea
                  rows={3}
                  required
                  value={settings.addresses.delhi}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      addresses: { ...settings.addresses, delhi: e.target.value },
                    })
                  }
                  className="form-control form-control-sm"
                  placeholder="Terminal 3 Curbside Valet..."
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-bold small text-dark mb-1">
                  Gurugram DLF Cyber Hub *
                </label>
                <textarea
                  rows={3}
                  required
                  value={settings.addresses.gurgaon}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      addresses: { ...settings.addresses, gurgaon: e.target.value },
                    })
                  }
                  className="form-control form-control-sm"
                  placeholder="DLF Cyber City Building 10..."
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-bold small text-dark mb-1">
                  Lucknow CCS Airport Desk *
                </label>
                <textarea
                  rows={3}
                  required
                  value={settings.addresses.lucknow}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      addresses: { ...settings.addresses, lucknow: e.target.value },
                    })
                  }
                  className="form-control form-control-sm"
                  placeholder="CCS Airport Terminal 2..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Social Media & Public Presence */}
        <div className="card border pastel-card pastel-card-peach rounded-4 shadow-2xs overflow-hidden">
          <div className="card-header py-3 px-4 bg-white border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2.5">
              <div className="avatar avatar-sm rounded-circle bg-amber-100 text-amber-700 d-flex align-items-center justify-content-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h6 className="card-title mb-0 fw-bold text-dark">Social Media &amp; Public Presence</h6>
                <small className="text-muted">Official channels linked in marketing footers and confirmation emails</small>
              </div>
            </div>
            <TrendArrowBadge value="Verified Channels" period="links" pastelTheme="peach" />
          </div>

          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  Instagram Profile URL
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Share2 className="w-3.5 h-3.5 text-danger" />
                  </span>
                  <input
                    type="url"
                    value={settings.socialLinks.instagram}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                      })
                    }
                    className="form-control"
                    placeholder="https://instagram.com/primerides"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  Facebook Page URL
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                  </span>
                  <input
                    type="url"
                    value={settings.socialLinks.facebook}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                      })
                    }
                    className="form-control"
                    placeholder="https://facebook.com/primerides"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  X (formerly Twitter) URL
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Share2 className="w-3.5 h-3.5 text-dark" />
                  </span>
                  <input
                    type="url"
                    value={settings.socialLinks.twitter}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                      })
                    }
                    className="form-control"
                    placeholder="https://x.com/primerides"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  YouTube Channel URL
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Globe className="w-3.5 h-3.5 text-danger" />
                  </span>
                  <input
                    type="url"
                    value={settings.socialLinks.youtube}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: { ...settings.socialLinks, youtube: e.target.value },
                      })
                    }
                    className="form-control"
                    placeholder="https://youtube.com/@primerides"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="p-3 bg-white border rounded-4 shadow-2xs d-flex align-items-center justify-content-between">
          <div className="text-xs text-muted">
            All updates synchronize instantly with customer booking receipts and email templates.
          </div>
          <AdminButton
            type="submit"
            variant="primary"
            disabled={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            {isSaving ? "Saving Configuration..." : "Save All Changes"}
          </AdminButton>
        </div>
      </form>
    </PageContainer>
  );
}
