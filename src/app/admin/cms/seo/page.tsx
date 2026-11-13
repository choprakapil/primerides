"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Save,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
  Share2,
  Eye,
  ShieldCheck,
  AlertCircle,
  FileCode,
  Tag,
} from "lucide-react";
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  PageContainer,
  PageHeader,
} from "@/components/admin/ui";

interface PageMetaItem {
  id?: number;
  route_path: string;
  meta_title: string;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
}

const PRESET_ROUTES = [
  { path: "/", label: "Home Page (Root)", defaultTitle: "PrimeRides™ | Premium Self-Drive Car Rental Delhi NCR & Lucknow" },
  { path: "/cars", label: "Fleet Search & Inventory (/cars)", defaultTitle: "Self Drive Luxury Cars & SUVs Delhi NCR & Lucknow - PrimeRides" },
  { path: "/about", label: "About PrimeRides (/about)", defaultTitle: "About Primerides - Self-Drive Car Rental Company in Delhi NCR" },
  { path: "/contact", label: "Contact & Concierge (/contact)", defaultTitle: "Contact Primerides - 24/7 Delhi NCR Concierge & Booking Desk" },
  { path: "/blogs", label: "Road Trip Journal (/blogs)", defaultTitle: "Road Trip Blogs, Highway Guides & Itineraries - PrimeRides Delhi NCR" },
  { path: "/faq", label: "FAQs & Rental Policies (/faq)", defaultTitle: "Rental FAQs & Policies - Primerides Self Drive Delhi NCR" },
  { path: "/locations", label: "Strategic Rental Hubs (/locations)", defaultTitle: "PrimeRides Mobility Hubs - Delhi NCR & Lucknow Airport Desks" },
  { path: "/terms", label: "Terms & Conditions (/terms)", defaultTitle: "Terms & Conditions — PrimeRides Self Drive" },
  { path: "/privacy", label: "Privacy Policy (/privacy)", defaultTitle: "Privacy Policy — PrimeRides Self Drive" },
];

export default function AdminCmsSeoPage() {
  const [selectedRoute, setSelectedRoute] = useState<string>("/");
  const [allMetas, setAllMetas] = useState<Record<string, PageMetaItem>>({});
  const [formData, setFormData] = useState<PageMetaItem>({
    route_path: "/",
    meta_title: PRESET_ROUTES[0].defaultTitle,
    meta_description: "Rent 50+ luxury sedans, 4x4 SUVs (Fortuner 4x4, Thar, Innova Crysta, Creta) with unlimited kilometers, zero hidden fees, and instant doorstep & IGI Airport delivery.",
    meta_keywords: "Self Drive Car Rental Delhi, Innova Crysta Rental, Fortuner 4x4 Self Drive, IGI Airport Car Handover",
    og_title: PRESET_ROUTES[0].defaultTitle,
    og_description: "Explore 50+ self-drive luxury cars & 4x4 SUVs. Unlimited KMs • Zero Hidden Charges • 15-min Curbside Airport Delivery.",
    og_image: "/og-image.jpg",
    canonical_url: "https://primerides.in/",
    robots: "index, follow",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load all metadata from API
  useEffect(() => {
    fetch("/api/v1/admin/seo")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) {
          const map: Record<string, PageMetaItem> = {};
          json.data.forEach((m: PageMetaItem) => {
            map[m.route_path] = m;
          });
          setAllMetas(map);

          if (map["/"]) {
            setFormData(map["/"]);
          }
        }
      })
      .catch((err) => console.error("Error loading SEO configurations:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Handle route change
  const handleRouteChange = (route: string) => {
    setSelectedRoute(route);
    setIsSaved(false);
    setErrorMsg(null);

    const preset = PRESET_ROUTES.find((r) => r.path === route);
    if (allMetas[route]) {
      setFormData(allMetas[route]);
    } else {
      setFormData({
        route_path: route,
        meta_title: preset?.defaultTitle || "PrimeRides Luxury Self Drive",
        meta_description: "Premium company-owned self-drive car rentals across Delhi NCR and Lucknow with unlimited kilometers.",
        meta_keywords: "Self Drive Car Rental, Luxury SUVs, PrimeRides",
        og_title: preset?.defaultTitle || "PrimeRides Luxury Self Drive",
        og_description: "Premium company-owned self-drive car rentals across Delhi NCR and Lucknow with unlimited kilometers.",
        og_image: "/og-image.jpg",
        canonical_url: `https://primerides.in${route === "/" ? "" : route}`,
        robots: "index, follow",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save SEO metadata");

      setAllMetas((prev) => ({
        ...prev,
        [formData.route_path]: json.data,
      }));

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save SEO metadata.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CMS & Organic Discovery"
        title="Page SEO & OpenGraph Management"
        description="Configure target meta titles, SERP descriptions, social OpenGraph banners, and robot crawling directives for each public route."
        icon={<Globe className="w-5 h-5 text-[#c59b27]" />}
        actions={
          <div className="d-flex align-items-center gap-2">
            <Link
              href={selectedRoute}
              target="_blank"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live Page</span>
            </Link>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              icon={<Save className="w-4 h-4 me-1" />}
            >
              {isSaving ? "Saving to Database..." : "Publish SEO Meta"}
            </AdminButton>
          </div>
        }
      />

      {isSaved && (
        <div className="alert alert-success d-flex align-items-center gap-2 rounded-4 shadow-sm mb-4">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <div>
            <strong>SEO Settings Published!</strong> Route <code>{selectedRoute}</code> metadata updated in database.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center gap-2 rounded-4 shadow-sm mb-4">
          <AlertCircle className="w-5 h-5 text-danger shrink-0" />
          <div>{errorMsg}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Route Selector & Meta Form */}
        <div className="col-lg-8">
          <AdminCard title="Target Route & Metadata Configuration" className="mb-4">
            <div className="mb-4">
              <label className="form-label fw-bold small text-muted text-uppercase">
                Select Website Page
              </label>
              <select
                className="form-select"
                value={selectedRoute}
                onChange={(e) => handleRouteChange(e.target.value)}
                style={{ borderRadius: "10px", borderColor: "#cbd5e1" }}
              >
                {PRESET_ROUTES.map((p) => (
                  <option key={p.path} value={p.path}>
                    {p.label} {allMetas[p.path] ? "✓ (Configured in DB)" : "• (Default Fallback)"}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSave}>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold small text-muted text-uppercase mb-0">
                    HTML Meta Title
                  </label>
                  <span className={`small ${formData.meta_title.length > 60 ? "text-danger" : "text-muted"}`}>
                    {formData.meta_title.length} / 60 chars recommended
                  </span>
                </div>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="e.g. PrimeRides | Self-Drive Luxury Car Rental Delhi NCR"
                />
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-bold small text-muted text-uppercase mb-0">
                    Meta Description
                  </label>
                  <span className={`small ${Number(formData.meta_description?.length || 0) > 160 ? "text-danger" : "text-muted"}`}>
                    {formData.meta_description?.length || 0} / 160 chars recommended
                  </span>
                </div>
                <textarea
                  rows={3}
                  className="form-control"
                  value={formData.meta_description || ""}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Compelling description summarizing the fleet, airport delivery, and unlimited KM policies..."
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-muted text-uppercase">
                  Meta Keywords (Comma-Separated)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.meta_keywords || ""}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  placeholder="Self Drive Car Delhi, Fortuner 4x4 Rental, Innova Crysta, IGI Airport Handover"
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-muted text-uppercase">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.canonical_url || ""}
                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                    placeholder="https://primerides.in/about"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-muted text-uppercase">
                    Robots Crawl Directives
                  </label>
                  <select
                    className="form-select"
                    value={formData.robots || "index, follow"}
                    onChange={(e) => setFormData({ ...formData, robots: e.target.value })}
                  >
                    <option value="index, follow">index, follow (Standard Public Indexing)</option>
                    <option value="noindex, follow">noindex, follow (Exclude from Search, Follow Links)</option>
                    <option value="noindex, nofollow">noindex, nofollow (Strictly Private)</option>
                  </select>
                </div>
              </div>

              <div className="border-top pt-3 mt-4">
                <h6 className="fw-bold text-dark d-flex align-items-center gap-1.5 mb-3">
                  <Share2 className="w-4 h-4 text-[#c59b27]" />
                  <span>OpenGraph Social Sharing Protocol (WhatsApp, Facebook, Twitter)</span>
                </h6>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted text-uppercase">
                    OG Social Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.og_title || ""}
                    onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                    placeholder="Preview title when shared on WhatsApp or LinkedIn..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted text-uppercase">
                    OG Social Description
                  </label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={formData.og_description || ""}
                    onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                    placeholder="Brief 1-2 sentence preview text for social media cards..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted text-uppercase">
                    OG Social Banner Image Path / URL
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.og_image || ""}
                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                    placeholder="/og-image.jpg or https://primerides.in/assets/img/slider/1.jpg"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary px-4 fw-semibold shadow-sm"
                  style={{ background: "var(--primary-color, #c59b27)", borderColor: "var(--primary-color, #c59b27)" }}
                >
                  {isSaving ? "Saving..." : "Save SEO Metadata"}
                </button>
              </div>
            </form>
          </AdminCard>
        </div>

        {/* Right Column: Google SERP Snippet Preview */}
        <div className="col-lg-4">
          <div className="card border rounded-4 shadow-sm mb-4 overflow-hidden">
            <div className="card-header bg-light py-3 px-4 border-bottom">
              <span className="fw-bold small text-dark d-flex align-items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#c59b27]" /> Google SERP Snippet Preview
              </span>
            </div>
            <div className="card-body p-4 bg-white font-sans">
              <div className="d-flex align-items-center gap-2 mb-1">
                <div
                  className="avatar avatar-xs rounded-circle bg-light d-flex align-items-center justify-content-center text-muted fw-bold"
                  style={{ width: "24px", height: "24px", fontSize: "11px" }}
                >
                  PR
                </div>
                <div>
                  <span className="d-block small text-dark fw-medium" style={{ fontSize: "12px", lineHeight: "1" }}>
                    PrimeRides
                  </span>
                  <span className="text-muted" style={{ fontSize: "11px" }}>
                    {formData.canonical_url || `https://primerides.in${selectedRoute}`}
                  </span>
                </div>
              </div>

              <h5
                className="mb-1 text-primary fw-medium text-decoration-none"
                style={{ fontSize: "18px", color: "#1a0dab", cursor: "pointer", lineHeight: "1.3" }}
              >
                {formData.meta_title || "PrimeRides Luxury Self-Drive Cars"}
              </h5>
              <p className="text-muted mb-0" style={{ fontSize: "13px", lineHeight: "1.4" }}>
                {formData.meta_description || "Book top-tier self-drive vehicles across Delhi NCR with unlimited kilometers and curbside delivery."}
              </p>
            </div>
            <div className="card-footer bg-light p-3 border-top text-center">
              <small className="text-muted" style={{ fontSize: "11px" }}>
                Real-time preview of how Google renders this route in search results.
              </small>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="p-3.5 rounded-4 border bg-light text-dark">
            <h6 className="fw-bold text-dark d-flex align-items-center gap-1.5 mb-2" style={{ fontSize: "13px" }}>
              <Sparkles className="w-4 h-4 text-[#c59b27]" /> SEO Best Practices
            </h6>
            <ul className="list-unstyled mb-0 small text-muted space-y-1" style={{ fontSize: "12px" }}>
              <li className="mb-1.5">• Keep titles between 50-60 characters for best Google desktop & mobile display.</li>
              <li className="mb-1.5">• Include high-intent terms like <em>Self Drive</em>, <em>Delhi NCR</em>, and <em>Unlimited KM</em>.</li>
              <li className="mb-1.5">• Descriptions should feature a clear value proposition and call to action.</li>
              <li>• OpenGraph images must be at least 1200x630px for WhatsApp rich previews.</li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
