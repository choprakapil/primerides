"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Phone,
  Mail,
  Clock,
  MapPin,
  Sparkles,
  Link2,
  Building,
  Shield,
  Layers,
  Tag,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminButton,
} from "@/components/admin/ui";
import TrendArrowBadge from "@/components/admin/ui/TrendArrowBadge";
import { DEFAULT_FOOTER_CONFIG, FooterConfig } from "@/types/siteSettings";

const QUICK_LINK_PRESETS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Fleet", href: "/cars" },
  { label: "Travel Blogs", href: "/blogs" },
  { label: "FAQs & Policies", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
  { label: "Terms & Agreement", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export default function AdminCmsFooterPage() {
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Tab: "content" | "links" | "hubs"
  const [activeTab, setActiveTab] = useState<"content" | "links" | "hubs">("content");

  // New Link & New Hub State
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkHref, setNewLinkHref] = useState("");
  const [newHubName, setNewHubName] = useState("");
  const [newHubTag, setNewHubTag] = useState("Express Hub");

  useEffect(() => {
    fetch("/api/v1/admin/cms/footer")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setFooterConfig(json.data);
        }
      })
      .catch((err) => console.error("Error loading footer config:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/admin/cms/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footerConfig),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save footer configuration");
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving footer settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Links CRUD
  const handleAddLink = (customLabel?: string, customHref?: string) => {
    const label = (customLabel || newLinkLabel).trim();
    const href = (customHref || newLinkHref).trim();
    if (!label || !href) return;

    setFooterConfig((prev) => ({
      ...prev,
      quickLinks: [...prev.quickLinks, { label, href }],
    }));

    if (!customLabel) {
      setNewLinkLabel("");
      setNewLinkHref("");
    }
  };

  const handleDeleteLink = (index: number) => {
    setFooterConfig((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.filter((_, idx) => idx !== index),
    }));
  };

  const handleMoveLink = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= footerConfig.quickLinks.length) return;

    const list = [...footerConfig.quickLinks];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    setFooterConfig((prev) => ({ ...prev, quickLinks: list }));
  };

  // City Hubs CRUD
  const handleAddHub = () => {
    if (!newHubName.trim()) return;
    setFooterConfig((prev) => ({
      ...prev,
      cityHubs: [...prev.cityHubs, { name: newHubName.trim(), tag: newHubTag.trim() }],
    }));
    setNewHubName("");
  };

  const handleDeleteHub = (index: number) => {
    setFooterConfig((prev) => ({
      ...prev,
      cityHubs: prev.cityHubs.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CMS & Brand Identity"
        title="Footer & Legal Navigation"
        description="Configure global website footer branding, quick navigation links, regional airport pickup desks, and legal copyright notices."
        icon={<FileText className="w-5 h-5 text-indigo-600" />}
        actions={
          <div className="d-flex align-items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="btn btn-sm btn-outline-secondary rounded-pill d-inline-flex align-items-center gap-1.5 px-3 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </Link>
            <AdminButton
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              {isSaving ? "Publishing Footer..." : "Save Footer Changes"}
            </AdminButton>
          </div>
        }
      />

      {isSaved && (
        <div className="alert alert-success d-flex align-items-center gap-3 rounded-4 shadow-sm border-0 mb-4 p-3.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <div>
            <strong className="d-block fw-bold text-dark text-sm">Footer Settings Published!</strong>
            <span className="text-muted text-xs">
              Your footer content, quick links, and airport hub addresses are now synchronized across the entire website.
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-3 rounded-4 shadow-sm border-0 mb-4 p-3.5">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <div>
            <strong className="d-block fw-bold text-danger text-sm">Save Failed</strong>
            <span className="text-muted text-xs">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* 4 Luxury Pastel KPI Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-lavender">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-purple-100 text-purple-700 d-flex align-items-center justify-content-center">
                  <Link2 className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Published" period="Footer" pastelTheme="lavender" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Quick Navigation Links
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{footerConfig.quickLinks.length}</div>
              <div className="text-[11px] text-muted mt-1">
                Direct footer navigation targets
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-mint">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-emerald-100 text-emerald-700 d-flex align-items-center justify-content-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="NCR & UP" period="Operational" pastelTheme="mint" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Operating Hub Desks
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{footerConfig.cityHubs.length}</div>
              <div className="text-[11px] text-muted mt-1">
                Prominently featured handover hubs
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-sky">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-blue-100 text-blue-700 d-flex align-items-center justify-content-center">
                  <Phone className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="24/7 Shield" period="Live" pastelTheme="sky" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Customer Support Hotline
              </div>
              <div className="h4 mb-0 fw-bold text-dark mt-1 text-truncate">
                {footerConfig.supportPhone}
              </div>
              <div className="text-[11px] text-muted mt-1 text-truncate">
                {footerConfig.supportEmail}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-peach">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-amber-100 text-amber-700 d-flex align-items-center justify-content-center">
                  <Shield className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Protected" period="Legal" pastelTheme="peach" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Copyright & Compliance
              </div>
              <div className="h4 mb-0 fw-bold text-dark mt-1 text-truncate">
                © 2026 PrimeRides
              </div>
              <div className="text-[11px] text-muted mt-1">
                Terms, Privacy & Refund policy wired
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live WYSIWYG Footer Simulation Strip */}
      <div
        className="card border-0 rounded-4 p-4 shadow-sm mb-4 text-white"
        style={{
          background: "linear-gradient(135deg, #090e1a 0%, #1a2234 100%)",
          border: "1px solid #334155",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2.5 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 text-warning text-xs fw-bold text-uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Live Website Footer Presentation Preview</span>
          </div>
          <span className="badge bg-secondary bg-opacity-50 text-light rounded-pill px-2.5 py-1 text-[10px]">
            Client Responsive View
          </span>
        </div>

        <div className="row g-3 py-2">
          {/* Brand Bio */}
          <div className="col-12 col-lg-4">
            <img
              src="/assets/img/PRLogo.png"
              alt="Logo"
              style={{ maxHeight: "36px", filter: "brightness(0) invert(1)" }}
              className="mb-2.5"
            />
            <p className="text-light opacity-75 text-xs mb-3" style={{ lineHeight: 1.5, maxWidth: "320px" }}>
              {footerConfig.aboutText}
            </p>
          </div>

          {/* Quick Links Preview */}
          <div className="col-6 col-lg-4">
            <h6 className="text-uppercase text-light text-[11px] fw-bold mb-2 tracking-wider" style={{ color: "#c59b27" }}>
              Quick Links ({footerConfig.quickLinks.length})
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {footerConfig.quickLinks.map((l, i) => (
                <span
                  key={i}
                  className="badge bg-secondary bg-opacity-25 text-light text-[11px] px-2.5 py-1 rounded"
                >
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* Hubs & Contact */}
          <div className="col-6 col-lg-4">
            <h6 className="text-uppercase text-light text-[11px] fw-bold mb-2 tracking-wider" style={{ color: "#c59b27" }}>
              Operating Hubs & Support
            </h6>
            <div className="text-xs text-light opacity-75 space-y-1 mb-2">
              {footerConfig.cityHubs.map((h, i) => (
                <div key={i} className="d-flex align-items-center gap-1.5 mb-1">
                  <MapPin className="w-3 h-3 text-warning shrink-0" />
                  <span>{h.name}</span>
                </div>
              ))}
            </div>
            <div className="text-xs font-semibold text-warning">
              Phone: {footerConfig.supportPhone} • {footerConfig.supportEmail}
            </div>
          </div>
        </div>

        {/* Bottom Bar Simulation */}
        <div className="border-top border-secondary border-opacity-25 pt-2.5 mt-2 d-flex justify-content-between align-items-center text-[11px] text-light opacity-60 flex-wrap gap-2">
          <div>{footerConfig.copyrightText}</div>
          <div className="d-flex gap-3">
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Pills */}
      <div className="card border-0 shadow-sm rounded-4 p-1.5 mb-4 bg-white">
        <ul className="nav nav-pills nav-pills-custom gap-1">
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`nav-link rounded-pill px-3.5 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "content" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Company Bio & Support Hotline
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("links")}
              className={`nav-link rounded-pill px-3.5 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "links" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              Quick Navigation Links ({footerConfig.quickLinks.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("hubs")}
              className={`nav-link rounded-pill px-3.5 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "hubs" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Operating Airport Hubs ({footerConfig.cityHubs.length})
            </button>
          </li>
        </ul>
      </div>

      {/* TAB 1: Company Bio & Support */}
      {activeTab === "content" && (
        <div className="row g-4">
          <div className="col-12 col-xl-7">
            <div className="card border pastel-card pastel-card-lavender h-100">
              <div className="card-header bg-transparent border-bottom p-3.5">
                <h6 className="mb-0 fw-bold text-dark">About Bio & Copyright Notice</h6>
              </div>
              <div className="card-body p-4 space-y-3">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">
                    Footer Brand Bio / Summary
                  </label>
                  <textarea
                    rows={4}
                    className="form-control form-control-sm rounded-3"
                    value={footerConfig.aboutText}
                    onChange={(e) => setFooterConfig({ ...footerConfig, aboutText: e.target.value })}
                    placeholder="Describe PrimeRides luxury service summary..."
                  />
                  <div className="form-text text-muted text-[11px]">
                    Displayed beneath the inverted logo on the left footer column.
                  </div>
                </div>

                <div>
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">
                    Legal Copyright Notice
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-3"
                    value={footerConfig.copyrightText}
                    onChange={(e) => setFooterConfig({ ...footerConfig, copyrightText: e.target.value })}
                    placeholder="© 2026 PrimeRides Mobility Private Limited. All rights reserved."
                  />
                  <div className="form-text text-muted text-[11px]">
                    Rendered on the bottom-most legal bar.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="card border pastel-card pastel-card-mint h-100">
              <div className="card-header bg-transparent border-bottom p-3.5">
                <h6 className="mb-0 fw-bold text-dark">Support Hotline & Hours</h6>
              </div>
              <div className="card-body p-4 space-y-3">
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">Support Phone Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-3"
                    value={footerConfig.supportPhone}
                    onChange={(e) => setFooterConfig({ ...footerConfig, supportPhone: e.target.value })}
                    placeholder="+91 90453 01702"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">Support Email Address</label>
                  <input
                    type="email"
                    className="form-control form-control-sm rounded-3"
                    value={footerConfig.supportEmail}
                    onChange={(e) => setFooterConfig({ ...footerConfig, supportEmail: e.target.value })}
                    placeholder="support@primerides.in"
                  />
                </div>

                <div>
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">Operating Dispatch Hours</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-3"
                    value={footerConfig.hours}
                    onChange={(e) => setFooterConfig({ ...footerConfig, hours: e.target.value })}
                    placeholder="24 Hours / 7 Days (Doorstep Airport Delivery)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Quick Links CRUD */}
      {activeTab === "links" && (
        <div className="card border pastel-card pastel-card-sky">
          <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
            <div>
              <h6 className="mb-0 fw-bold text-dark">Quick Navigation Links ({footerConfig.quickLinks.length})</h6>
              <p className="text-muted text-xs mb-0">
                Manage customer links rendered in the Quick Links footer column.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFooterConfig({ ...footerConfig, quickLinks: DEFAULT_FOOTER_CONFIG.quickLinks })}
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 text-xs"
            >
              Reset Defaults
            </button>
          </div>

          <div className="card-body p-4">
            <div className="table-responsive mb-4">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted text-[11px] text-uppercase fw-bold">
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Link Label</th>
                    <th>Target Route URL</th>
                    <th style={{ width: "130px" }} className="text-end">Sort & Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {footerConfig.quickLinks.map((link, idx) => (
                    <tr key={idx}>
                      <td>
                        <span
                          className="badge bg-blue-100 text-blue-700 rounded-circle p-1.5 fw-bold text-[11px] d-inline-flex align-items-center justify-content-center"
                          style={{ width: "26px", height: "26px" }}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm rounded-3 text-xs fw-bold"
                          value={link.label}
                          onChange={(e) => {
                            const copy = [...footerConfig.quickLinks];
                            copy[idx].label = e.target.value;
                            setFooterConfig({ ...footerConfig, quickLinks: copy });
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm rounded-3 text-xs font-monospace"
                          value={link.href}
                          onChange={(e) => {
                            const copy = [...footerConfig.quickLinks];
                            copy[idx].href = e.target.value;
                            setFooterConfig({ ...footerConfig, quickLinks: copy });
                          }}
                        />
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveLink(idx, "up")}
                            className="btn btn-light p-1.5 text-secondary rounded shadow-xs"
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === footerConfig.quickLinks.length - 1}
                            onClick={() => handleMoveLink(idx, "down")}
                            className="btn btn-light p-1.5 text-secondary rounded shadow-xs"
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(idx)}
                            className="btn btn-outline-danger p-1.5 ms-1 rounded shadow-xs"
                            title="Remove Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Link */}
            <div className="p-3.5 rounded-4 bg-white border shadow-xs">
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div className="fw-bold text-dark text-xs d-flex align-items-center gap-1.5">
                  <Plus className="w-4 h-4 text-primary" />
                  <span>Add Quick Link</span>
                </div>
                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                  <span className="text-muted text-[11px] me-1">Presets:</span>
                  {QUICK_LINK_PRESETS.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleAddLink(p.label, p.href)}
                      className="badge bg-light text-primary border text-[10px] px-2 py-1 rounded-pill fw-semibold hover:bg-primary hover:text-white transition-all"
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="row g-2 align-items-center">
                <div className="col-12 col-sm-5">
                  <input
                    type="text"
                    placeholder="Link Label (e.g. Terms & Conditions)"
                    value={newLinkLabel}
                    onChange={(e) => setNewLinkLabel(e.target.value)}
                    className="form-control form-control-sm rounded-3 text-xs"
                  />
                </div>
                <div className="col-12 col-sm-5">
                  <input
                    type="text"
                    placeholder="Target Route (e.g. /terms)"
                    value={newLinkHref}
                    onChange={(e) => setNewLinkHref(e.target.value)}
                    className="form-control form-control-sm rounded-3 text-xs font-monospace"
                  />
                </div>
                <div className="col-12 col-sm-2">
                  <button
                    type="button"
                    onClick={() => handleAddLink()}
                    className="btn btn-sm btn-primary w-100 rounded-3 text-xs fw-semibold"
                  >
                    Add Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Operating Hubs CRUD */}
      {activeTab === "hubs" && (
        <div className="card border pastel-card pastel-card-mint">
          <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
            <div>
              <h6 className="mb-0 fw-bold text-dark">Featured Operating Hubs ({footerConfig.cityHubs.length})</h6>
              <p className="text-muted text-xs mb-0">
                City hubs and airport terminal valet points displayed in the NCR Operating Hubs section.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFooterConfig({ ...footerConfig, cityHubs: DEFAULT_FOOTER_CONFIG.cityHubs })}
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 text-xs"
            >
              Reset Default Hubs
            </button>
          </div>

          <div className="card-body p-4">
            <div className="row g-3 mb-4">
              {footerConfig.cityHubs.map((hub, idx) => (
                <div key={idx} className="col-12 col-md-6">
                  <div className="card border rounded-4 shadow-xs bg-white p-3.5 d-flex flex-row align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2.5 min-w-0">
                      <div className="avatar avatar-sm rounded-circle bg-emerald-100 text-emerald-800 d-flex align-items-center justify-content-center shrink-0" style={{ width: "32px", height: "32px" }}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="fw-bold text-dark text-xs text-truncate mb-1">
                          {hub.name}
                        </div>
                        <span className="badge bg-light text-primary border text-[10px] px-2 py-0.5 rounded-pill">
                          {hub.tag}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHub(idx)}
                      className="btn btn-sm btn-outline-danger p-1.5 rounded shadow-xs ms-2 shrink-0"
                      title="Remove Hub"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Hub */}
            <div className="p-3.5 rounded-4 bg-white border shadow-xs">
              <div className="fw-bold text-dark text-xs mb-3 d-flex align-items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" />
                <span>Add Featured Hub Desk</span>
              </div>
              <div className="row g-2 align-items-center">
                <div className="col-12 col-sm-6">
                  <input
                    type="text"
                    placeholder="Hub Title (e.g. Noida - Sector 18 Commercial Hub)"
                    value={newHubName}
                    onChange={(e) => setNewHubName(e.target.value)}
                    className="form-control form-control-sm rounded-3 text-xs"
                  />
                </div>
                <div className="col-12 col-sm-4">
                  <input
                    type="text"
                    placeholder="Hub Badge Tag (e.g. Express Desk)"
                    value={newHubTag}
                    onChange={(e) => setNewHubTag(e.target.value)}
                    className="form-control form-control-sm rounded-3 text-xs"
                  />
                </div>
                <div className="col-12 col-sm-2">
                  <button
                    type="button"
                    onClick={handleAddHub}
                    className="btn btn-sm btn-primary w-100 rounded-3 text-xs fw-semibold"
                  >
                    Add Hub
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
