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
  Smartphone,
  Info,
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
    gstNumber: "07AABCP1234F1Z5",
    legalCorporateName: "PrimeRides Mobility Solutions Private Limited",
    sacCode: "996601",
    gstRatePercentage: 18,
    cgstRatePercentage: 9,
    sgstRatePercentage: 9,
    igstRatePercentage: 18,
    taxInvoiceAddress: "Indira Gandhi International Airport, Terminal 3 VIP Valet, New Delhi 110037",
    taxInvoiceState: "07 - Delhi",
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
    mobileApps: {
      iosMinVersion: "1.0.0",
      androidMinVersion: "1.0.0",
      appStoreUrl: "https://apps.apple.com/app/primerides",
      playStoreUrl: "https://play.google.com/store/apps/details?id=in.primerides.app",
      maintenanceMode: false,
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

        {/* Section 2: Operating Hours & Tax Compliance (Issue #15) */}
        <div className="card border pastel-card pastel-card-mint rounded-4 shadow-2xs overflow-hidden">
          <div className="card-header py-3 px-4 bg-white border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2.5">
              <div className="avatar avatar-sm rounded-circle bg-emerald-100 text-emerald-700 d-flex align-items-center justify-content-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h6 className="card-title mb-0 fw-bold text-dark">Operating Hours &amp; Tax Compliance (GST / SAC 996601)</h6>
                <small className="text-muted">Configure GSTIN, legal corporate entity, tax rates, and registered invoice address</small>
              </div>
            </div>
            <TrendArrowBadge value="GST Active" period="compliant" pastelTheme="mint" />
          </div>

          <div className="card-body p-4">
            {/* Tax Management Explainer Card */}
            <div className="p-3 mb-4 rounded-3 border border-emerald-200 bg-emerald-50/50 d-flex gap-3 align-items-start">
              <div className="avatar avatar-xs rounded-circle bg-emerald-100 text-emerald-700 d-flex align-items-center justify-content-center shrink-0 mt-0.5">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="small text-dark">
                <div className="fw-bold mb-1 text-emerald-900">How Tax Management Works in PrimeRides:</div>
                <div className="text-muted d-flex flex-column gap-1">
                  <span>&bull; <strong>Fully Dynamic:</strong> Changes saved here instantly take effect on all upcoming customer bookings and checkouts without requiring server restarts.</span>
                  <span>&bull; <strong>Auto-Split GST:</strong> Entering a Standard GST Rate automatically calculates equal CGST and SGST for intra-state bookings (e.g. Delhi to Delhi) and IGST for inter-state supply.</span>
                  <span>&bull; <strong>Statutory Rule 46 Compliance:</strong> Your Legal Entity Name, 15-digit GSTIN, SAC 996601, and Tax Address are automatically printed on official downloadable PDF customer invoices.</span>
                  <span>&bull; <strong>Deposit Exemption:</strong> Refundable security deposits are legally excluded from GST taxable turnover as per Indian tax laws.</span>
                </div>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  Legal Corporate Entity Name *
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <Building className="w-3.5 h-3.5 text-muted" />
                  </span>
                  <input
                    type="text"
                    required
                    value={settings.legalCorporateName || ""}
                    onChange={(e) => setSettings({ ...settings, legalCorporateName: e.target.value })}
                    className="form-control"
                    placeholder="PrimeRides Mobility Solutions Private Limited"
                  />
                </div>
                <div className="form-text text-xs text-muted">Legal registered name printed on customer tax invoices and receipts.</div>
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
                    onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value.toUpperCase() })}
                    className="form-control font-monospace"
                    placeholder="07AABCP1234F1Z5"
                  />
                </div>
                <div className="form-text text-xs text-muted">15-digit statutory GSTIN identifier for invoice compliance.</div>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label fw-bold small text-dark mb-1">
                  SAC Classification Code *
                </label>
                <input
                  type="text"
                  required
                  value={settings.sacCode || "996601"}
                  onChange={(e) => setSettings({ ...settings, sacCode: e.target.value })}
                  className="form-control form-control-sm font-monospace"
                  placeholder="996601"
                />
                <div className="form-text text-xs text-muted">996601: Motor vehicle passenger rental service</div>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label fw-bold small text-dark mb-1">
                  Standard GST Rate (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={settings.gstRatePercentage ?? 18}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    const half = Math.round((rate / 2) * 100) / 100;
                    setSettings({
                      ...settings,
                      gstRatePercentage: rate,
                      cgstRatePercentage: half,
                      sgstRatePercentage: half,
                      igstRatePercentage: rate,
                    });
                  }}
                  className="form-control form-control-sm"
                  placeholder="18"
                />
                <div className="form-text text-xs text-muted">Applied to base rental fees across all bookings</div>
              </div>

              <div className="col-12 col-md-2">
                <label className="form-label fw-bold small text-dark mb-1">
                  CGST Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.cgstRatePercentage ?? 9}
                  onChange={(e) => setSettings({ ...settings, cgstRatePercentage: parseFloat(e.target.value) || 0 })}
                  className="form-control form-control-sm bg-light"
                  placeholder="9"
                />
                <div className="form-text text-xs text-muted">Intra-state Central</div>
              </div>

              <div className="col-12 col-md-2">
                <label className="form-label fw-bold small text-dark mb-1">
                  SGST Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.sgstRatePercentage ?? 9}
                  onChange={(e) => setSettings({ ...settings, sgstRatePercentage: parseFloat(e.target.value) || 0 })}
                  className="form-control form-control-sm bg-light"
                  placeholder="9"
                />
                <div className="form-text text-xs text-muted">Intra-state State</div>
              </div>

              <div className="col-12 col-md-2">
                <label className="form-label fw-bold small text-dark mb-1">
                  IGST Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.igstRatePercentage ?? 18}
                  onChange={(e) => setSettings({ ...settings, igstRatePercentage: parseFloat(e.target.value) || 0 })}
                  className="form-control form-control-sm bg-light"
                  placeholder="18"
                />
                <div className="form-text text-xs text-muted">Inter-state Integrated</div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  Registered Tax Invoice Address *
                </label>
                <input
                  type="text"
                  required
                  value={settings.taxInvoiceAddress || ""}
                  onChange={(e) => setSettings({ ...settings, taxInvoiceAddress: e.target.value })}
                  className="form-control form-control-sm"
                  placeholder="Indira Gandhi International Airport, Terminal 3 VIP Valet, New Delhi 110037"
                />
                <div className="form-text text-xs text-muted">Statutory billing place of supply printed on invoices.</div>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label fw-bold small text-dark mb-1">
                  State / State Code *
                </label>
                <input
                  type="text"
                  required
                  value={settings.taxInvoiceState || ""}
                  onChange={(e) => setSettings({ ...settings, taxInvoiceState: e.target.value })}
                  className="form-control form-control-sm"
                  placeholder="07 - Delhi"
                />
                <div className="form-text text-xs text-muted">E.g., 07 - Delhi or 09 - Uttar Pradesh</div>
              </div>

              <div className="col-12 col-md-3">
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
                <div className="form-text text-xs text-muted">Customer concierge dispatch window</div>
              </div>

              {/* Dynamic Live Tax Invoicing Preview & Explainer (Issue #15 Enhancement) */}
              <div className="col-12 mt-3">
                <div className="p-3.5 rounded-3 border bg-white shadow-2xs">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="fw-bold small text-dark">Live Tax Simulation &amp; Invoicing Preview</span>
                      <span className="badge bg-purple-50 text-purple-700 border border-purple-200 rounded-pill px-2 py-0.5 text-2xs fw-bold">
                        Real-Time Dynamic
                      </span>
                    </div>
                    <small className="text-muted">Calculates live based on your inputs above</small>
                  </div>

                  <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-4">
                      <div className="p-2.5 rounded-3 bg-light border text-center">
                        <small className="text-muted d-block mb-1">Sample Rental Base Amount</small>
                        <div className="fs-5 fw-bold text-dark font-monospace">₹5,000.00</div>
                        <span className="text-2xs text-muted">Taxable Base (Excl. Deposit)</span>
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="p-2.5 rounded-3 bg-light border text-center">
                        <small className="text-muted d-block mb-1">
                          Calculated GST ({settings.gstRatePercentage ?? 18}%)
                        </small>
                        <div className="fs-5 fw-bold text-emerald-700 font-monospace">
                          +₹{(((5000 * (settings.gstRatePercentage ?? 18)) / 100)).toFixed(2)}
                        </div>
                        <span className="text-2xs text-emerald-600 fw-medium">
                          CGST ({(settings.cgstRatePercentage ?? 9)}%): ₹{(((5000 * (settings.cgstRatePercentage ?? 9)) / 100)).toFixed(2)} | SGST ({(settings.sgstRatePercentage ?? 9)}%): ₹{(((5000 * (settings.sgstRatePercentage ?? 9)) / 100)).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="p-2.5 rounded-3 bg-light border text-center">
                        <small className="text-muted d-block mb-1">Final Customer Invoice</small>
                        <div className="fs-5 fw-bold text-purple-700 font-monospace">
                          ₹{(5000 + ((5000 * (settings.gstRatePercentage ?? 18)) / 100)).toFixed(2)}
                        </div>
                        <span className="text-2xs text-muted">+ Security Deposit (Tax Exempt)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-top d-flex flex-wrap align-items-center justify-content-between gap-2 text-2xs text-muted">
                    <div className="d-flex align-items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Printed on Invoice: <strong>{settings.legalCorporateName || "Legal Entity Not Configured"}</strong></span>
                    </div>
                    <div>
                      GSTIN: <span className="font-monospace fw-bold text-dark">{settings.gstNumber || "NOT SET"}</span> &bull; SAC: <span className="font-monospace fw-bold text-dark">{settings.sacCode || "996601"}</span>
                    </div>
                  </div>
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

        {/* Section 5: Mobile Apps & Store Distribution */}
        <div className="card border pastel-card pastel-card-peach rounded-4 shadow-2xs overflow-hidden">
          <div className="card-header py-3 px-4 bg-white border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2.5">
              <div className="avatar avatar-sm rounded-circle bg-amber-100 text-amber-700 d-flex align-items-center justify-content-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h6 className="card-title mb-0 fw-bold text-dark">Mobile Apps &amp; Store Distribution</h6>
                <small className="text-muted">iOS &amp; Android version governance, store links, and emergency maintenance toggle</small>
              </div>
            </div>
            <TrendArrowBadge value="iOS &amp; Android" period="v1.0.0" pastelTheme="peach" />
          </div>

          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  iOS Minimum Supported Version
                </label>
                <input
                  type="text"
                  value={settings.mobileApps?.iosMinVersion || "1.0.0"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mobileApps: {
                        ...(settings.mobileApps || {}),
                        iosMinVersion: e.target.value,
                        androidMinVersion: settings.mobileApps?.androidMinVersion || "1.0.0",
                        appStoreUrl: settings.mobileApps?.appStoreUrl || "",
                        playStoreUrl: settings.mobileApps?.playStoreUrl || "",
                        maintenanceMode: !!settings.mobileApps?.maintenanceMode,
                      },
                    })
                  }
                  className="form-control form-control-sm"
                  placeholder="1.0.0"
                />
                <div className="form-text text-xs text-muted">Older iOS builds will prompt user to update from the App Store.</div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  Android Minimum Supported Version
                </label>
                <input
                  type="text"
                  value={settings.mobileApps?.androidMinVersion || "1.0.0"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mobileApps: {
                        ...(settings.mobileApps || {}),
                        androidMinVersion: e.target.value,
                        iosMinVersion: settings.mobileApps?.iosMinVersion || "1.0.0",
                        appStoreUrl: settings.mobileApps?.appStoreUrl || "",
                        playStoreUrl: settings.mobileApps?.playStoreUrl || "",
                        maintenanceMode: !!settings.mobileApps?.maintenanceMode,
                      },
                    })
                  }
                  className="form-control form-control-sm"
                  placeholder="1.0.0"
                />
                <div className="form-text text-xs text-muted">Older Android builds will prompt user to update from Google Play.</div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  Apple App Store URL
                </label>
                <input
                  type="url"
                  value={settings.mobileApps?.appStoreUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mobileApps: {
                        ...(settings.mobileApps || {}),
                        appStoreUrl: e.target.value,
                        iosMinVersion: settings.mobileApps?.iosMinVersion || "1.0.0",
                        androidMinVersion: settings.mobileApps?.androidMinVersion || "1.0.0",
                        playStoreUrl: settings.mobileApps?.playStoreUrl || "",
                        maintenanceMode: !!settings.mobileApps?.maintenanceMode,
                      },
                    })
                  }
                  className="form-control form-control-sm"
                  placeholder="https://apps.apple.com/app/primerides"
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-bold small text-dark mb-1">
                  Google Play Store URL
                </label>
                <input
                  type="url"
                  value={settings.mobileApps?.playStoreUrl || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      mobileApps: {
                        ...(settings.mobileApps || {}),
                        playStoreUrl: e.target.value,
                        iosMinVersion: settings.mobileApps?.iosMinVersion || "1.0.0",
                        androidMinVersion: settings.mobileApps?.androidMinVersion || "1.0.0",
                        appStoreUrl: settings.mobileApps?.appStoreUrl || "",
                        maintenanceMode: !!settings.mobileApps?.maintenanceMode,
                      },
                    })
                  }
                  className="form-control form-control-sm"
                  placeholder="https://play.google.com/store/apps/details?id=in.primerides.app"
                />
              </div>

              <div className="col-12">
                <div className="form-check form-switch pt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="mobileMaintenanceMode"
                    checked={!!settings.mobileApps?.maintenanceMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        mobileApps: {
                          ...(settings.mobileApps || {}),
                          maintenanceMode: e.target.checked,
                          iosMinVersion: settings.mobileApps?.iosMinVersion || "1.0.0",
                          androidMinVersion: settings.mobileApps?.androidMinVersion || "1.0.0",
                          appStoreUrl: settings.mobileApps?.appStoreUrl || "",
                          playStoreUrl: settings.mobileApps?.playStoreUrl || "",
                        },
                      })
                    }
                  />
                  <label className="form-check-label fw-bold small text-dark ms-2" htmlFor="mobileMaintenanceMode">
                    Enable Mobile App Maintenance Mode
                  </label>
                  <div className="form-text text-xs text-muted">
                    When active, mobile apps display an emergency maintenance banner and temporarily suspend vehicle reservations.
                  </div>
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
