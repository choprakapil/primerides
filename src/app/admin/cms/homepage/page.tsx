"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Star,
  UploadCloud,
  Image as ImageIcon,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  RefreshCw,
  Eye,
  ShieldCheck,
  Tag,
  Car,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminButton,
  AdminCard,
  AdminBadge,
} from "@/components/admin/ui";
import { HomepageConfig, DEFAULT_HOMEPAGE_CONFIG } from "@/types/siteSettings";

const AVAILABLE_ICONS = [
  { name: "Gauge", label: "Speed / Gauge" },
  { name: "MapPin", label: "Location / Pin" },
  { name: "ShieldCheck", label: "Security / Shield" },
  { name: "Headphones", label: "Support / Headset" },
  { name: "Award", label: "Premium / Award" },
  { name: "Sparkles", label: "Luxury / Sparkles" },
  { name: "Clock", label: "24/7 / Clock" },
  { name: "Zap", label: "Instant / Zap" },
  { name: "Car", label: "Automobile" },
];

export default function AdminCmsHomepage() {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"hero" | "trust" | "hubs" | "offers" | "reviews">("hero");

  // Form States
  const [heroData, setHeroData] = useState(DEFAULT_HOMEPAGE_CONFIG.heroData);
  const [hubs, setHubs] = useState(DEFAULT_HOMEPAGE_CONFIG.hubs);
  const [trustHighlights, setTrustHighlights] = useState(
    DEFAULT_HOMEPAGE_CONFIG.trustHighlights || [
      {
        iconName: "Gauge",
        animation: "pulse",
        title: "Unlimited Kilometers",
        desc: "No per-km limits or hidden penalties",
      },
      {
        iconName: "MapPin",
        animation: "pulse",
        title: "Doorstep Delivery",
        desc: "To any home, office, or airport terminal in NCR",
      },
      {
        iconName: "ShieldCheck",
        animation: "pulse",
        title: "Zero Hidden Fees",
        desc: "100% transparent pricing & minimal security deposit",
      },
      {
        iconName: "Headphones",
        animation: "pulse",
        title: "24/7 Roadside Assistance",
        desc: "Round-the-clock emergency support across India",
      },
    ]
  );
  const [offers, setOffers] = useState<any[]>(DEFAULT_HOMEPAGE_CONFIG.offers);
  const [reviews, setReviews] = useState<any[]>(DEFAULT_HOMEPAGE_CONFIG.reviews);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/v1/admin/cms/homepage")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          const cfg = json.data as HomepageConfig;
          if (cfg.heroData) setHeroData(cfg.heroData);
          if (cfg.hubs) setHubs(cfg.hubs);
          if (cfg.trustHighlights && cfg.trustHighlights.length > 0) {
            setTrustHighlights(cfg.trustHighlights);
          }
          if (cfg.offers) setOffers(cfg.offers);
          if (cfg.reviews) setReviews(cfg.reviews);
        }
      })
      .catch((err) => console.error("Failed to load homepage config:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "hero");

      const res = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to upload image");
      }

      setHeroData((prev) => ({
        ...prev,
        bgImage: json.data.url,
      }));
    } catch (err: any) {
      setUploadError(err.message || "Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const payload: HomepageConfig = {
        heroData,
        hubs,
        trustHighlights,
        offers,
        reviews,
      };

      const res = await fetch("/api/v1/admin/cms/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save homepage config");

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err: any) {
      alert("Error saving homepage content: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  // Trust CRUD helpers
  const handleAddTrustHighlight = () => {
    setTrustHighlights((prev: any) => [
      ...prev,
      {
        iconName: "Sparkles",
        animation: "pulse",
        title: "New Trust Feature",
        desc: "Describe this customer benefit clearly",
      },
    ]);
  };

  const handleUpdateTrustHighlight = (idx: number, field: string, value: string) => {
    setTrustHighlights((prev: any) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleDeleteTrustHighlight = (idx: number) => {
    setTrustHighlights((prev: any) => prev.filter((_: any, i: number) => i !== idx));
  };

  const handleMoveTrustHighlight = (idx: number, direction: "up" | "down") => {
    setTrustHighlights((prev: any) => {
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleResetTrustToDefaults = () => {
    if (confirm("Reset Trust Highlights to default 4 items?")) {
      setTrustHighlights([
        {
          iconName: "Gauge",
          animation: "pulse",
          title: "Unlimited Kilometers",
          desc: "No per-km limits or hidden penalties",
        },
        {
          iconName: "MapPin",
          animation: "pulse",
          title: "Doorstep Delivery",
          desc: "To any home, office, or airport terminal in NCR",
        },
        {
          iconName: "ShieldCheck",
          animation: "pulse",
          title: "Zero Hidden Fees",
          desc: "100% transparent pricing & minimal security deposit",
        },
        {
          iconName: "Headphones",
          animation: "pulse",
          title: "24/7 Roadside Assistance",
          desc: "Round-the-clock emergency support across India",
        },
      ]);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CMS & Content Management"
        title="Homepage & Hero Management"
        description="Manage live hero value propositions, uploaded banner backdrops, trust highlights, delivery hubs, and homepage copy in real-time."
        icon={<Sparkles className="w-5 h-5 text-warning" />}
        actions={
          <div className="d-flex align-items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="btn btn-sm btn-outline-secondary rounded-pill d-inline-flex align-items-center gap-1.5 px-3"
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
              {isSaving ? "Saving to Server..." : "Save All Changes"}
            </AdminButton>
          </div>
        }
      />

      {isSaved && (
        <div className="alert alert-success d-flex align-items-center gap-3 rounded-4 shadow-sm border-0 mb-4 p-3">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <div>
            <strong className="d-block">Homepage Content Published!</strong>
            <span className="text-muted text-xs">
              Your modifications are saved to the persistent engine and instantly reflect on the public website.
            </span>
          </div>
        </div>
      )}

      {/* Pastel Navigation Pills */}
      <div className="card border-0 shadow-sm rounded-4 p-1.5 mb-4 bg-white">
        <ul className="nav nav-pills nav-pills-custom gap-1">
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("hero")}
              className={`nav-link rounded-pill px-3 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "hero" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Hero Banner & USPs
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("trust")}
              className={`nav-link rounded-pill px-3 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "trust" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Trust Bar Highlights ({trustHighlights.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("hubs")}
              className={`nav-link rounded-pill px-3 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "hubs" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              City Hubs Spotlight
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("offers")}
              className={`nav-link rounded-pill px-3 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "offers" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              Promos & Deals ({offers.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`nav-link rounded-pill px-3 py-2 text-xs fw-bold d-flex align-items-center gap-2 ${
                activeTab === "reviews" ? "active bg-primary text-white shadow-sm" : "text-secondary"
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              Customer Reviews ({reviews.length})
            </button>
          </li>
        </ul>
      </div>

      {/* Tab 1: Hero Banner & USPs */}
      {activeTab === "hero" && (
        <div className="row g-4">
          {/* Left Column: Editor Controls */}
          <div className="col-12 col-xl-7">
            <div className="card border pastel-card pastel-card-lavender h-100">
              <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Hero Headline & Value Proposition</h6>
                  <p className="text-muted text-xs mb-0">
                    Controls the primary headline, golden accents, and USP badges on the live homepage.
                  </p>
                </div>
                <span className="badge bg-purple-100 text-purple-700 rounded-pill px-2.5 py-1 text-xs fw-semibold">
                  Live Section 1
                </span>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {/* Eyebrow Pill */}
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark text-xs mb-1.5">
                      Top Eyebrow Pill Badge
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={heroData.badgeText || ""}
                      onChange={(e) => setHeroData({ ...heroData, badgeText: e.target.value })}
                      placeholder="e.g. Luxury Self-Drive Redefined"
                    />
                    <div className="form-text text-muted text-[11px]">
                      Appears in the small gold pill above the main headline.
                    </div>
                  </div>

                  {/* Title Line 1 */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark text-xs mb-1.5">
                      Main Title - Line 1 (White Text)
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={heroData.titleLine1 || ""}
                      onChange={(e) => setHeroData({ ...heroData, titleLine1: e.target.value })}
                      placeholder="e.g. Self-Drive Luxury Car"
                    />
                  </div>

                  {/* Title Line 2 */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold text-dark text-xs mb-1.5">
                      Main Title - Line 2 (Gold Highlight)
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3 border-warning"
                      value={heroData.titleLine2 || ""}
                      onChange={(e) => setHeroData({ ...heroData, titleLine2: e.target.value })}
                      placeholder="e.g. Rental in Delhi NCR & Lucknow"
                    />
                  </div>

                  {/* Hero Subtext */}
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark text-xs mb-1.5">
                      Hero Subtitle / Description
                    </label>
                    <textarea
                      rows={3}
                      className="form-control form-control-sm rounded-3"
                      value={heroData.subtext || ""}
                      onChange={(e) => setHeroData({ ...heroData, subtext: e.target.value })}
                      placeholder="Describe key customer benefits, fleet quality, or zero-deposit highlights..."
                    />
                  </div>

                  {/* Feature USPs */}
                  <div className="col-12 col-md-4">
                    <label className="form-label fw-bold text-dark text-xs mb-1.5">
                      USP Pill 1
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={heroData.usp1 || ""}
                      onChange={(e) => setHeroData({ ...heroData, usp1: e.target.value })}
                      placeholder="e.g. Zero Security Deposit"
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label fw-bold text-dark text-xs mb-1.5">
                      USP Pill 2
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={heroData.usp2 || ""}
                      onChange={(e) => setHeroData({ ...heroData, usp2: e.target.value })}
                      placeholder="e.g. Doorstep Delivery in 60 Mins"
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label fw-bold text-dark text-xs mb-1.5">
                      USP Pill 3
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={heroData.usp3 || ""}
                      onChange={(e) => setHeroData({ ...heroData, usp3: e.target.value })}
                      placeholder="e.g. 100% Insured & Clean Fleet"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Background Image Upload & Real-Time Preview */}
          <div className="col-12 col-xl-5">
            <div className="card border pastel-card pastel-card-mint h-100">
              <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
                <div className="d-flex align-items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <h6 className="mb-0 fw-bold text-dark">Hero Background Image</h6>
                </div>
                <span className="badge bg-emerald-100 text-emerald-700 rounded-pill px-2.5 py-1 text-xs fw-semibold">
                  Local Storage
                </span>
              </div>
              <div className="card-body p-4">
                {/* Upload Box */}
                <div
                  className="border-2 border-dashed rounded-4 p-4 text-center mb-3 position-relative"
                  style={{
                    backgroundColor: "#f8fafc",
                    borderColor: "#cbd5e1",
                    cursor: "pointer",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="d-none"
                  />

                  {isUploading ? (
                    <div className="py-4">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                      <p className="fw-bold text-sm text-dark mb-0">Uploading image to server...</p>
                      <span className="text-muted text-xs">Saving to local /uploads/hero/</span>
                    </div>
                  ) : (
                    <div className="py-2">
                      <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <h6 className="fw-bold text-dark text-sm mb-1">
                        Click to Upload New Background Image
                      </h6>
                      <p className="text-muted text-xs mb-2">
                        Supports PNG, JPG, WebP (Max 8MB). Stored locally on the server.
                      </p>
                      <span className="btn btn-sm btn-outline-primary rounded-pill px-3 text-xs fw-semibold">
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

                {/* Direct Path Input */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark text-xs mb-1">
                    Active Background Image Path / URL
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      value={heroData.bgImage || ""}
                      onChange={(e) => setHeroData({ ...heroData, bgImage: e.target.value })}
                      placeholder="/assets/img/banner_1.png or /uploads/hero/..."
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setHeroData({ ...heroData, bgImage: "/assets/img/banner_1.png" })}
                      title="Reset to default luxury banner"
                    >
                      Reset Default
                    </button>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div>
                  <label className="form-label fw-bold text-dark text-xs mb-2 d-flex align-items-center justify-content-between">
                    <span>Live Hero Composite Preview</span>
                    <span className="text-muted text-[11px]">16:9 Aspect Simulation</span>
                  </label>
                  <div
                    className="rounded-4 p-3 position-relative overflow-hidden text-white"
                    style={{
                      minHeight: "210px",
                      backgroundImage: `linear-gradient(rgba(10, 15, 29, 0.78), rgba(10, 15, 29, 0.88)), url('${
                        heroData.bgImage || "/assets/img/banner_1.png"
                      }')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "1px solid #334155",
                    }}
                  >
                    {heroData.badgeText && (
                      <span
                        className="badge rounded-pill text-[10px] px-2.5 py-1 mb-2 fw-semibold"
                        style={{ background: "rgba(197, 155, 39, 0.25)", color: "#c59b27" }}
                      >
                        {heroData.badgeText}
                      </span>
                    )}
                    <h5 className="fw-bold text-white mb-1" style={{ fontSize: "15px" }}>
                      {heroData.titleLine1 || "Self-Drive Luxury Car"}{" "}
                      <span style={{ color: "#c59b27" }}>
                        {heroData.titleLine2 || "Rental in Delhi NCR & Lucknow"}
                      </span>
                    </h5>
                    <p
                      className="text-light opacity-75 mb-3 text-[11px]"
                      style={{ lineHeight: 1.3, maxWidth: "90%" }}
                    >
                      {heroData.subtext || "Experience freedom on your own terms with PrimeRides fleet."}
                    </p>
                    <div className="d-flex flex-wrap gap-1.5">
                      {[heroData.usp1, heroData.usp2, heroData.usp3]
                        .filter(Boolean)
                        .map((usp, i) => (
                          <span
                            key={i}
                            className="badge bg-dark bg-opacity-75 text-light text-[9px] px-2 py-0.5 rounded-pill border border-secondary border-opacity-25"
                          >
                            ✓ {usp}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Trust Bar Highlights (FULL CRUD) */}
      {activeTab === "trust" && (
        <div>
          <div className="card border pastel-card pastel-card-amber mb-4">
            <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
              <div>
                <h6 className="mb-0 fw-bold text-dark">Trust Bar Highlights CRUD</h6>
                <p className="text-muted text-xs mb-0">
                  Manage the luxury trust features displayed across the entire homepage trustbar.
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetTrustToDefaults}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 text-xs"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleAddTrustHighlight}
                  className="btn btn-sm btn-primary rounded-pill px-3 text-xs d-flex align-items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Highlight Item</span>
                </button>
              </div>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                {trustHighlights.map((item: any, idx: number) => (
                  <div key={idx} className="col-12 col-md-6">
                    <div className="card border rounded-4 shadow-xs h-100 bg-white">
                      <div className="card-header bg-light bg-opacity-50 border-bottom p-3 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-warning bg-opacity-25 text-warning-emphasis rounded-circle p-1.5 fw-bold text-xs d-inline-flex align-items-center justify-content-center" style={{ width: "26px", height: "26px" }}>
                            {idx + 1}
                          </span>
                          <span className="fw-bold text-dark text-xs">
                            {item.title || "Untitled Highlight"}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveTrustHighlight(idx, "up")}
                            className="btn btn-sm btn-light p-1 text-secondary rounded"
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === trustHighlights.length - 1}
                            onClick={() => handleMoveTrustHighlight(idx, "down")}
                            className="btn btn-sm btn-light p-1 text-secondary rounded"
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTrustHighlight(idx)}
                            className="btn btn-sm btn-outline-danger p-1 rounded ms-1"
                            title="Remove Highlight"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="card-body p-3">
                        <div className="row g-2">
                          <div className="col-12 col-sm-6">
                            <label className="form-label fw-bold text-dark text-[11px] mb-1">
                              Icon Glyph
                            </label>
                            <select
                              className="form-select form-select-sm rounded-3"
                              value={item.iconName || "ShieldCheck"}
                              onChange={(e) => handleUpdateTrustHighlight(idx, "iconName", e.target.value)}
                            >
                              {AVAILABLE_ICONS.map((ico) => (
                                <option key={ico.name} value={ico.name}>
                                  {ico.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-12 col-sm-6">
                            <label className="form-label fw-bold text-dark text-[11px] mb-1">
                              Animation Style
                            </label>
                            <select
                              className="form-select form-select-sm rounded-3"
                              value={item.animation || "pulse"}
                              onChange={(e) => handleUpdateTrustHighlight(idx, "animation", e.target.value)}
                            >
                              <option value="pulse">Pulse Motion</option>
                              <option value="spin">Spin Motion</option>
                              <option value="bounce">Bounce Motion</option>
                            </select>
                          </div>
                          <div className="col-12">
                            <label className="form-label fw-bold text-dark text-[11px] mb-1">
                              Highlight Headline
                            </label>
                            <input
                              type="text"
                              className="form-control form-control-sm rounded-3"
                              value={item.title || ""}
                              onChange={(e) => handleUpdateTrustHighlight(idx, "title", e.target.value)}
                              placeholder="e.g. Unlimited Kilometers"
                            />
                          </div>
                          <div className="col-12">
                            <label className="form-label fw-bold text-dark text-[11px] mb-1">
                              Short Explanation
                            </label>
                            <textarea
                              rows={2}
                              className="form-control form-control-sm rounded-3"
                              value={item.desc || ""}
                              onChange={(e) => handleUpdateTrustHighlight(idx, "desc", e.target.value)}
                              placeholder="e.g. No per-km limits or hidden penalties"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live TrustBar Strip Simulation */}
          <div className="card border rounded-4 p-4 shadow-sm bg-white">
            <h6 className="fw-bold text-dark text-xs mb-3 d-flex align-items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Live TrustBar Presentation Simulation
            </h6>
            <div className="p-3 rounded-4 bg-light border">
              <div className="row g-3">
                {trustHighlights.map((t: any, i: number) => (
                  <div key={i} className="col-12 col-sm-6 col-lg-3">
                    <div className="d-flex align-items-center gap-2.5 p-2.5 rounded-3 bg-white border h-100">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center shrink-0"
                        style={{
                          width: "38px",
                          height: "38px",
                          background: "rgba(197, 155, 39, 0.12)",
                          color: "#c59b27",
                        }}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="fw-bold text-dark text-xs leading-tight">
                          {t.title || "Untitled"}
                        </div>
                        <div className="text-muted text-[11px] mt-0.5 leading-snug">
                          {t.desc || "No description entered"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: City Hubs Spotlight */}
      {activeTab === "hubs" && (
        <div className="row g-4">
          {hubs.map((hub, idx) => (
            <div key={hub.id} className="col-12 col-md-6">
              <div className="card border pastel-card pastel-card-blue h-100">
                <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between p-3.5">
                  <div className="d-flex align-items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h6 className="mb-0 fw-bold text-dark">{hub.city} Regional Hub</h6>
                  </div>
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 text-xs fw-semibold">
                    {hub.tag}
                  </span>
                </div>
                <div className="card-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark text-xs mb-1.5">
                      Display Tagline / Fleet Count
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={hub.fleetCount}
                      onChange={(e) => {
                        const updated = [...hubs];
                        updated[idx].fleetCount = e.target.value;
                        setHubs(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="form-label fw-bold text-dark text-xs mb-1.5">
                      Coverage & Logistics Description
                    </label>
                    <textarea
                      rows={4}
                      className="form-control form-control-sm rounded-3"
                      value={hub.desc}
                      onChange={(e) => {
                        const updated = [...hubs];
                        updated[idx].desc = e.target.value;
                        setHubs(updated);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Offers */}
      {activeTab === "offers" && (
        <div className="row g-3">
          {offers.map((offer) => (
            <div key={offer.id} className="col-12 col-md-4">
              <div className="card border pastel-card pastel-card-rose h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-danger-subtle text-danger text-[10px] px-2 py-0.5 rounded-pill fw-bold text-uppercase">
                      {offer.tag}
                    </span>
                    <span className="badge bg-dark text-white font-monospace text-xs px-2.5 py-1 rounded">
                      {offer.code}
                    </span>
                  </div>
                  <h6 className="fw-bold text-dark text-sm mb-1">{offer.title}</h6>
                  <div className="fw-bold text-primary text-xs mb-2">{offer.discount}</div>
                  <p className="text-muted text-xs mb-3">{offer.subtext}</p>
                  <div className="text-muted text-[11px] d-flex align-items-center gap-1 border-top pt-2">
                    <Clock className="w-3 h-3" />
                    <span>Valid until: {offer.validUntil || "Ongoing"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Reviews */}
      {activeTab === "reviews" && (
        <div className="row g-3">
          {reviews.map((rev, idx) => (
            <div key={rev.id || idx} className="col-12 col-md-6">
              <div className="card border pastel-card pastel-card-mint h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar avatar-sm rounded-circle bg-emerald-100 text-emerald-800 d-flex align-items-center justify-content-center fw-bold text-xs" style={{ width: "32px", height: "32px" }}>
                        {rev.name.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-bold text-dark text-xs">{rev.name}</div>
                        <div className="text-muted text-[10px]">{rev.trip}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-0.5 text-warning">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-secondary text-xs fst-italic mb-3">\"{rev.text}\"</p>
                  <div className="d-flex align-items-center justify-content-between text-[11px] border-top pt-2">
                    <span className="text-muted">Car: {rev.car}</span>
                    <span className="text-emerald-600 fw-semibold d-flex align-items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Rental
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
