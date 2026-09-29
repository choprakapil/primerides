"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Phone,
  User,
  MessageSquare,
  Sparkles,
  Layout,
  UploadCloud,
  Image as ImageIcon,
  RefreshCw,
  Compass,
  Link2,
  Check,
  Smartphone,
  Sliders,
  Radio,
  ArrowRight,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminButton,
  AdminBadge,
} from "@/components/admin/ui";
import TrendArrowBadge from "@/components/admin/ui/TrendArrowBadge";
import { DEFAULT_HEADER_CONFIG, HeaderConfig, HeaderMenuItem } from "@/types/siteSettings";

const QUICK_PRESET_LINKS = [
  { label: "OFFERS & PROMOS", href: "/offers" },
  { label: "TARIFF & KM PLANS", href: "/tariffs" },
  { label: "AIRPORT HUBS", href: "/locations" },
  { label: "FAQS & POLICIES", href: "/faq" },
  { label: "REVIEWS", href: "/testimonials" },
];

export default function AdminCmsHeaderPage() {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(DEFAULT_HEADER_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Sub-Tab: "menu" | "logo" | "actions"
  const [activeTab, setActiveTab] = useState<"menu" | "logo" | "actions">("menu");

  // Navbar Simulation State
  const [simScrolled, setSimScrolled] = useState(false);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // New Link State
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkHref, setNewLinkHref] = useState("");

  useEffect(() => {
    fetch("/api/v1/admin/header")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setHeaderConfig(json.data);
        }
      })
      .catch((err) => console.error("Error loading header config:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "logo");

      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to upload logo");
      }

      setHeaderConfig((prev) => ({
        ...prev,
        logoUrl: json.data.url,
      }));
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload logo");
    } finally {
      setIsUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/admin/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(headerConfig),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save header configuration");
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLink = (customLabel?: string, customHref?: string) => {
    const labelToAdd = (customLabel || newLinkLabel).trim().toUpperCase();
    const hrefToAdd = (customHref || newLinkHref).trim();
    if (!labelToAdd || !hrefToAdd) return;

    const newItem: HeaderMenuItem = {
      id: "nav-" + Date.now(),
      label: labelToAdd,
      href: hrefToAdd,
      isVisible: true,
      order: headerConfig.menuItems.length + 1,
    };

    setHeaderConfig({
      ...headerConfig,
      menuItems: [...headerConfig.menuItems, newItem],
    });

    if (!customLabel) {
      setNewLinkLabel("");
      setNewLinkHref("");
    }
  };

  const handleDeleteLink = (id: string) => {
    setHeaderConfig({
      ...headerConfig,
      menuItems: headerConfig.menuItems.filter((item) => item.id !== id),
    });
  };

  const handleToggleVisibility = (id: string) => {
    setHeaderConfig({
      ...headerConfig,
      menuItems: headerConfig.menuItems.map((item) =>
        item.id === id ? { ...item, isVisible: !item.isVisible } : item
      ),
    });
  };

  const handleMoveLink = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= headerConfig.menuItems.length) return;

    const items = [...headerConfig.menuItems];
    const temp = items[idx];
    items[idx] = items[targetIdx];
    items[targetIdx] = temp;

    setHeaderConfig({
      ...headerConfig,
      menuItems: items.map((item, i) => ({ ...item, order: i + 1 })),
    });
  };

  const handleResetLinksToDefault = () => {
    if (confirm("Reset menu navigation to default links?")) {
      setHeaderConfig({
        ...headerConfig,
        menuItems: DEFAULT_HEADER_CONFIG.menuItems,
      });
    }
  };

  const visibleLinksCount = headerConfig.menuItems.filter((m) => m.isVisible).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CMS & Navigation Management"
        title="Header & Navigation Controls"
        description="Manage live brand identity logo files, interactive menu link sorting, concierge contact hotlines, and auth triggers in real time."
        icon={<SlidersHorizontal className="w-5 h-5 text-primary" />}
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
              {isSaving ? "Publishing Header..." : "Save Header Changes"}
            </AdminButton>
          </div>
        }
      />

      {isSaved && (
        <div className="alert alert-success d-flex align-items-center gap-3 rounded-4 shadow-sm border-0 mb-4 p-3.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <div>
            <strong className="d-block fw-bold text-dark text-sm">Header Settings Successfully Published!</strong>
            <span className="text-muted text-xs">
              Your navigation menu links, brand logo dimensions, and concierge buttons are synchronized with the live website navbar.
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
                  <Compass className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Active" period="Navbar" pastelTheme="lavender" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Total Menu Links
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{headerConfig.menuItems.length}</div>
              <div className="text-[11px] text-muted mt-1">
                {visibleLinksCount} currently visible on navbar
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-mint">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-emerald-100 text-emerald-700 d-flex align-items-center justify-content-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Rendered" period="Scalable" pastelTheme="mint" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Brand Logo Height
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{headerConfig.logoHeight || 44}px</div>
              <div className="text-[11px] text-muted mt-1">
                Optimized retina display geometry
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
                <TrendArrowBadge value="24/7 Hotline" period="Live" pastelTheme="sky" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Concierge Hotline
              </div>
              <div className="h4 mb-0 fw-bold text-dark mt-1 text-truncate">
                {headerConfig.buttons.phoneButton.enabled ? "Active Call Pill" : "Disabled"}
              </div>
              <div className="text-[11px] text-muted mt-1 text-truncate">
                {headerConfig.buttons.phoneButton.label}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-peach">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-amber-100 text-amber-700 d-flex align-items-center justify-content-center">
                  <User className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Verified" period="Customer" pastelTheme="peach" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Auth & Portal Trigger
              </div>
              <div className="h4 mb-0 fw-bold text-dark mt-1 text-truncate">
                {headerConfig.buttons.authButton.enabled ? "Register / Login" : "Hidden"}
              </div>
              <div className="text-[11px] text-muted mt-1">
                Direct modal & account drawer
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Interactive Header Simulation Strip */}
      <div
        className={`card border-0 rounded-4 p-4 shadow-sm mb-4 position-relative overflow-hidden transition-all ${
          simScrolled
            ? "bg-dark text-white"
            : "bg-slate-900 text-white"
        }`}
        style={{
          background: simScrolled
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.98))"
            : "linear-gradient(135deg, rgba(9, 14, 26, 0.95), rgba(15, 23, 42, 0.95))",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-2.5 flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2 text-warning text-xs fw-bold text-uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Live Navbar Simulation Strip (WYSIWYG)</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <label className="d-flex align-items-center gap-1.5 text-xs text-light opacity-75 cursor-pointer">
              <input
                type="checkbox"
                checked={simScrolled}
                onChange={(e) => setSimScrolled(e.target.checked)}
                className="form-check-input mt-0"
              />
              <span>Simulate Sticky Scrolled Glass State</span>
            </label>
            <span className="badge bg-secondary bg-opacity-50 text-light rounded-pill px-2.5 py-1 text-[10px]">
              Desktop Simulation
            </span>
          </div>
        </div>

        <div
          className="d-flex align-items-center justify-content-between flex-wrap gap-3 py-2 px-3.5 rounded-3"
          style={{
            background: simScrolled ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Brand Logo Display */}
          <div className="d-flex align-items-center gap-2 py-1">
            <img
              src={headerConfig.logoUrl || "/assets/img/PRLogo.png"}
              alt="Logo Preview"
              style={{
                height: `${headerConfig.logoHeight || 44}px`,
                maxWidth: "180px",
                objectFit: "contain",
                transition: "all 0.2s ease",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/assets/img/PRLogo.png";
              }}
            />
          </div>

          {/* Navigation Links Simulation */}
          <div className="d-none d-lg-flex align-items-center gap-4">
            {headerConfig.menuItems
              .filter((m) => m.isVisible)
              .map((item) => (
                <span
                  key={item.id}
                  className="text-light text-xs fw-bold tracking-wider opacity-85 hover:opacity-100"
                  style={{
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {item.label}
                </span>
              ))}
          </div>

          {/* Action Buttons Simulation */}
          <div className="d-flex align-items-center gap-2.5">
            {headerConfig.buttons.phoneButton.enabled && (
              <span
                className="badge px-3 py-2 rounded-pill text-[11px] fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{
                  background: "rgba(197, 155, 39, 0.2)",
                  color: "#c59b27",
                  border: "1px solid rgba(197, 155, 39, 0.4)",
                }}
              >
                <Phone className="w-3 h-3" />
                {headerConfig.buttons.phoneButton.label}
              </span>
            )}

            {headerConfig.buttons.whatsappButton?.enabled && (
              <span
                className="badge px-3 py-2 rounded-pill text-[11px] fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #25D366, #128C7E)",
                  color: "#ffffff",
                }}
              >
                <MessageSquare className="w-3 h-3" />
                {headerConfig.buttons.whatsappButton.label}
              </span>
            )}

            {headerConfig.buttons.authButton.enabled && (
              <span className="badge bg-white text-dark px-3.5 py-2 rounded-pill text-[11px] fw-bold shadow-sm">
                <User className="w-3 h-3 me-1 text-primary" />
                {headerConfig.buttons.authButton.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Pills */}
      <div className="card border-0 shadow-sm rounded-4 p-1.5 mb-4 bg-white">
        <ul className="nav nav-pills nav-pills-custom gap-1">
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              className={`nav-link rounded-pill px-3.5 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "menu" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Navigation Menu Links ({headerConfig.menuItems.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("logo")}
              className={`nav-link rounded-pill px-3.5 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "logo" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Brand Logo & Dimensions
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("actions")}
              className={`nav-link rounded-pill px-3.5 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "actions" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Action Buttons & Concierge Triggers
            </button>
          </li>
        </ul>
      </div>

      {/* TAB 1: Menu Links Management */}
      {activeTab === "menu" && (
        <div className="space-y-4">
          <div className="card border pastel-card pastel-card-lavender mb-4">
            <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
              <div>
                <h6 className="mb-0 fw-bold text-dark">Navigation Links List</h6>
                <p className="text-muted text-xs mb-0">
                  Sort, edit labels, target routes, and toggle link visibility on the live website.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetLinksToDefault}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 text-xs"
              >
                Reset Default Menu
              </button>
            </div>

            <div className="card-body p-4">
              {/* Table */}
              <div className="table-responsive mb-4">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted text-[11px] text-uppercase fw-bold">
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th style={{ minWidth: "180px" }}>Display Label</th>
                      <th style={{ minWidth: "200px" }}>Destination Route URL</th>
                      <th style={{ width: "120px" }} className="text-center">Navbar Visibility</th>
                      <th style={{ width: "140px" }} className="text-end">Sort & Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headerConfig.menuItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td>
                          <span
                            className="badge bg-purple-100 text-purple-700 rounded-circle p-1.5 fw-bold text-[11px] d-inline-flex align-items-center justify-content-center"
                            style={{ width: "26px", height: "26px" }}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm rounded-3 text-xs fw-bold"
                            value={item.label}
                            onChange={(e) => {
                              const copy = [...headerConfig.menuItems];
                              copy[idx].label = e.target.value;
                              setHeaderConfig({ ...headerConfig, menuItems: copy });
                            }}
                          />
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light text-muted text-[11px]">
                              <Link2 className="w-3 h-3" />
                            </span>
                            <input
                              type="text"
                              className="form-control form-control-sm rounded-end-3 text-xs font-monospace"
                              value={item.href}
                              onChange={(e) => {
                                const copy = [...headerConfig.menuItems];
                                copy[idx].href = e.target.value;
                                setHeaderConfig({ ...headerConfig, menuItems: copy });
                              }}
                            />
                          </div>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(item.id)}
                            className={`btn btn-sm rounded-pill px-3 py-1 text-xs fw-semibold d-inline-flex align-items-center gap-1.5 transition-all ${
                              item.isVisible
                                ? "btn-success-subtle text-success border border-success-subtle shadow-xs"
                                : "btn-secondary-subtle text-secondary border border-secondary-subtle"
                            }`}
                            title={item.isVisible ? "Click to hide link" : "Click to publish link"}
                          >
                            {item.isVisible ? (
                              <>
                                <Eye className="w-3 h-3 text-success" />
                                <span>Visible</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-secondary" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveLink(idx, "up")}
                              className="btn btn-light p-1.5 text-secondary rounded shadow-xs"
                              title="Move Left/Up in Navbar"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === headerConfig.menuItems.length - 1}
                              onClick={() => handleMoveLink(idx, "down")}
                              className="btn btn-light p-1.5 text-secondary rounded shadow-xs"
                              title="Move Right/Down in Navbar"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLink(item.id)}
                              className="btn btn-outline-danger p-1.5 ms-1 rounded shadow-xs"
                              title="Delete Navigation Link"
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

              {/* Add Custom Link Box */}
              <div className="p-4 rounded-4 bg-white border shadow-xs">
                <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                  <div className="fw-bold text-dark text-xs d-flex align-items-center gap-1.5">
                    <Plus className="w-4 h-4 text-primary" />
                    <span>Add New Navigation Link</span>
                  </div>
                  <div className="d-flex align-items-center gap-1.5 flex-wrap">
                    <span className="text-muted text-[11px] me-1">Quick Presets:</span>
                    {QUICK_PRESET_LINKS.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleAddLink(preset.label, preset.href)}
                        className="badge bg-light text-primary border text-[10px] px-2 py-1 rounded-pill fw-semibold hover:bg-primary hover:text-white transition-all"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row g-2 align-items-center">
                  <div className="col-12 col-sm-5">
                    <input
                      type="text"
                      placeholder="Link Label (e.g. SPECIAL OFFERS)"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      className="form-control form-control-sm rounded-3 text-xs"
                    />
                  </div>
                  <div className="col-12 col-sm-5">
                    <input
                      type="text"
                      placeholder="Destination Route (e.g. /offers)"
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
        </div>
      )}

      {/* TAB 2: Brand Logo & Dimensions */}
      {activeTab === "logo" && (
        <div className="row g-4">
          {/* Logo Upload Card */}
          <div className="col-12 col-xl-7">
            <div className="card border pastel-card pastel-card-mint h-100">
              <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
                <div className="d-flex align-items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <h6 className="mb-0 fw-bold text-dark">Brand Logo File Upload</h6>
                </div>
                <span className="badge bg-emerald-100 text-emerald-700 rounded-pill px-2.5 py-1 text-xs fw-semibold">
                  Local Server Storage
                </span>
              </div>

              <div className="card-body p-4">
                {/* Upload Zone */}
                <div
                  className="border-2 border-dashed rounded-4 p-4 text-center mb-3.5 position-relative transition-all"
                  style={{
                    backgroundColor: "#f8fafc",
                    borderColor: "#cbd5e1",
                    cursor: "pointer",
                  }}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png,image/svg+xml,image/webp,image/jpeg"
                    className="d-none"
                  />

                  {isUploading ? (
                    <div className="py-4">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                      <h6 className="fw-bold text-dark text-sm mb-1">Uploading Brand Logo...</h6>
                      <span className="text-muted text-xs">Writing to local server directory /public/uploads/logo/</span>
                    </div>
                  ) : (
                    <div className="py-3">
                      <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <h6 className="fw-bold text-dark text-sm mb-1">Click to Upload New Logo File</h6>
                      <p className="text-muted text-xs mb-2">
                        Supports transparent PNG, SVG, or WebP formats (Max 8MB).
                      </p>
                      <span className="btn btn-sm btn-outline-primary rounded-pill px-3.5 text-xs fw-semibold">
                        Browse Local Files
                      </span>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <div className="alert alert-danger py-2 px-3 text-xs rounded-3 mb-3 d-flex align-items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Direct Path Input & Reset */}
                <div className="mb-3.5">
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">
                    Current Logo Path / URL
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control font-monospace text-xs"
                      value={headerConfig.logoUrl || ""}
                      onChange={(e) => setHeaderConfig({ ...headerConfig, logoUrl: e.target.value })}
                      placeholder="/assets/img/PRLogo.png or /uploads/logo/..."
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setHeaderConfig({ ...headerConfig, logoUrl: "/assets/img/PRLogo.png" })}
                      title="Reset to original PrimeRides logo"
                    >
                      Default Logo
                    </button>
                  </div>
                </div>

                {/* Height Geometry Slider */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <label className="form-label fw-bold text-dark text-xs mb-0">
                      Logo Display Height: <span className="text-primary">{headerConfig.logoHeight || 44}px</span>
                    </label>
                    <span className="text-muted text-[11px]">Recommended: 38px – 50px</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="28"
                    max="64"
                    step="1"
                    value={headerConfig.logoHeight || 44}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        logoHeight: parseInt(e.target.value, 10) || 44,
                      })
                    }
                  />
                  <div className="d-flex justify-content-between text-[10px] text-muted font-monospace mt-1">
                    <span>28px (Compact)</span>
                    <span>44px (Standard)</span>
                    <span>64px (Large)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Visual Preview Test Card */}
          <div className="col-12 col-xl-5">
            <div className="card border pastel-card pastel-card-sky h-100">
              <div className="card-header bg-transparent border-bottom p-3.5">
                <h6 className="mb-0 fw-bold text-dark">Logo Render Quality Test</h6>
              </div>
              <div className="card-body p-4 space-y-4">
                {/* Dark Background Render */}
                <div>
                  <div className="text-muted text-xs font-semibold mb-2">Dark Navigation Background (Actual Navbar)</div>
                  <div
                    className="p-4 rounded-4 text-center d-flex align-items-center justify-content-center"
                    style={{ background: "#090e1a", minHeight: "110px", border: "1px solid #1e293b" }}
                  >
                    <img
                      src={headerConfig.logoUrl || "/assets/img/PRLogo.png"}
                      alt="Logo on Dark"
                      style={{
                        height: `${headerConfig.logoHeight || 44}px`,
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>

                {/* Light Background Render */}
                <div>
                  <div className="text-muted text-xs font-semibold mb-2">Light Background (Daylight Inspection)</div>
                  <div
                    className="p-4 rounded-4 text-center d-flex align-items-center justify-content-center"
                    style={{ background: "#f8fafc", minHeight: "110px", border: "1px solid #e2e8f0" }}
                  >
                    <img
                      src={headerConfig.logoUrl || "/assets/img/PRLogo.png"}
                      alt="Logo on Light"
                      style={{
                        height: `${headerConfig.logoHeight || 44}px`,
                        objectFit: "contain",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Action Buttons & Concierge Triggers */}
      {activeTab === "actions" && (
        <div className="row g-4">
          {/* Action Button 1: Concierge Hotline */}
          <div className="col-12 col-md-4">
            <div className="card border pastel-card pastel-card-amber h-100">
              <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
                <div className="d-flex align-items-center gap-2">
                  <Phone className="w-4 h-4 text-warning" />
                  <h6 className="mb-0 fw-bold text-dark text-sm">24/7 Concierge Hotline</h6>
                </div>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={headerConfig.buttons.phoneButton.enabled}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        buttons: {
                          ...headerConfig.buttons,
                          phoneButton: {
                            ...headerConfig.buttons.phoneButton,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="card-body p-4 space-y-3">
                <p className="text-muted text-xs mb-3">
                  Displays an instant call trigger button on the top right of the navigation header.
                </p>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">Display Label</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-3"
                    value={headerConfig.buttons.phoneButton.label}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        buttons: {
                          ...headerConfig.buttons,
                          phoneButton: {
                            ...headerConfig.buttons.phoneButton,
                            label: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="+91 90453 01702"
                  />
                </div>

                <div>
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">Direct Dial Phone Link</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-3 font-monospace"
                    value={headerConfig.buttons.phoneButton.phoneNumber}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        buttons: {
                          ...headerConfig.buttons,
                          phoneButton: {
                            ...headerConfig.buttons.phoneButton,
                            phoneNumber: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="+919045301702"
                  />
                  <div className="form-text text-muted text-[11px]">
                    Triggered when customer clicks the phone button.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button 2: WhatsApp Concierge */}
          <div className="col-12 col-md-4">
            <div className="card border pastel-card pastel-card-mint h-100">
              <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
                <div className="d-flex align-items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <h6 className="mb-0 fw-bold text-dark text-sm">WhatsApp Concierge</h6>
                </div>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={headerConfig.buttons.whatsappButton?.enabled ?? false}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        buttons: {
                          ...headerConfig.buttons,
                          whatsappButton: {
                            ...headerConfig.buttons.whatsappButton,
                            enabled: e.target.checked,
                            label: headerConfig.buttons.whatsappButton?.label || "WhatsApp Us",
                            number: headerConfig.buttons.whatsappButton?.number || "+919045301702",
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="card-body p-4 space-y-3">
                <p className="text-muted text-xs mb-3">
                  Optional WhatsApp fast-booking pill for instant customer conversation.
                </p>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">Button Label</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-3"
                    value={headerConfig.buttons.whatsappButton?.label || ""}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        buttons: {
                          ...headerConfig.buttons,
                          whatsappButton: {
                            ...headerConfig.buttons.whatsappButton,
                            label: e.target.value,
                            number: headerConfig.buttons.whatsappButton?.number || "+919045301702",
                            enabled: headerConfig.buttons.whatsappButton?.enabled ?? false,
                          },
                        },
                      })
                    }
                    placeholder="WhatsApp Us"
                  />
                </div>

                <div>
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">WhatsApp Mobile Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-3 font-monospace"
                    value={headerConfig.buttons.whatsappButton?.number || ""}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        buttons: {
                          ...headerConfig.buttons,
                          whatsappButton: {
                            ...headerConfig.buttons.whatsappButton,
                            number: e.target.value,
                            label: headerConfig.buttons.whatsappButton?.label || "WhatsApp Us",
                            enabled: headerConfig.buttons.whatsappButton?.enabled ?? false,
                          },
                        },
                      })
                    }
                    placeholder="+919045301702"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button 3: User Auth / Portal Button */}
          <div className="col-12 col-md-4">
            <div className="card border pastel-card pastel-card-lavender h-100">
              <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
                <div className="d-flex align-items-center gap-2">
                  <User className="w-4 h-4 text-purple-700" />
                  <h6 className="mb-0 fw-bold text-dark text-sm">Customer Auth / Portal</h6>
                </div>
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={headerConfig.buttons.authButton.enabled}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        buttons: {
                          ...headerConfig.buttons,
                          authButton: {
                            ...headerConfig.buttons.authButton,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="card-body p-4 space-y-3">
                <p className="text-muted text-xs mb-3">
                  Controls the primary login/registration modal trigger and verified customer portal pill.
                </p>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">Button Label (Logged Out)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-3"
                    value={headerConfig.buttons.authButton.label}
                    onChange={(e) =>
                      setHeaderConfig({
                        ...headerConfig,
                        buttons: {
                          ...headerConfig.buttons,
                          authButton: {
                            ...headerConfig.buttons.authButton,
                            label: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Register / Login"
                  />
                </div>

                <div className="p-2.5 rounded-3 bg-white border text-xs text-muted">
                  <span className="fw-bold text-dark d-block mb-1">When Logged In:</span>
                  Automatically displays the logged-in customer's name with an account dropdown (Reservations, Payments, KYC, Logout).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
