"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  HelpCircle,
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  Search,
  FolderOpen,
  Layout,
  Globe,
  Sliders,
  Shield,
  Sparkles,
  MapPin,
  Car,
  Star,
  Layers,
  ArrowRight,
  Check,
  X,
  Eye,
  Info,
} from "lucide-react";
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminModal,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminImageUpload,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@/components/admin/ui";

interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

interface BlogItem {
  id: number;
  title: string;
  slug: string;
  category: { name: string };
  author_name: string;
  read_time: string | null;
  published_at: string | null;
  is_published: boolean;
}

interface CmsManagerProps {
  initialFaqs: FaqItem[];
  blogs: BlogItem[];
  leadCount: number;
  defaultTab?: "faqs" | "blogs" | "website" | "policies";
}

export default function CmsManager({
  initialFaqs,
  blogs,
  leadCount,
  defaultTab = "faqs",
}: CmsManagerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"faqs" | "blogs" | "website" | "policies">(
    urlTab && ["faqs", "blogs", "website", "policies"].includes(urlTab)
      ? (urlTab as "faqs" | "blogs" | "website" | "policies")
      : defaultTab
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["faqs", "blogs", "website", "policies"].includes(tabParam)) {
      setActiveTab(tabParam as "faqs" | "blogs" | "website" | "policies");
    }
  }, [searchParams]);

  const handleTabChange = (tab: "faqs" | "blogs" | "website" | "policies") => {
    setActiveTab(tab);
    if (tab === "faqs") {
      router.push("/admin/cms/faqs");
    } else if (tab === "blogs") {
      router.push("/admin/cms/blogs");
    } else if (tab === "website") {
      router.push("/admin/cms/website");
    } else if (tab === "policies") {
      router.push("/admin/cms/policies");
    }
  };
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state for new FAQ
  const [newFaq, setNewFaq] = useState({
    question: "",
    answer: "",
    category: "General",
    sort_order: 1,
  });

  // Blog Management State
  const [blogList, setBlogList] = useState<BlogItem[]>(blogs);
  const [isAddBlogModalOpen, setIsAddBlogModalOpen] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: "",
    slug: "",
    category_name: "Travel Guides",
    author_name: "PrimeRides Editorial",
    read_time: "5 min read",
    featured_image: "/assets/img/blog/1.jpg",
    summary: "",
    content: "",
    is_published: true,
  });

  // Website CMS v2 Config State
  const [heroTitle, setHeroTitle] = useState(
    "Drive Exceptional. Luxury Self-Drive Rentals in Delhi NCR & Lucknow."
  );
  const [heroBannerText, setHeroBannerText] = useState(
    "Experience Unmatched Luxury Mobility Across Delhi NCR & Lucknow. Doorstep White-Glove Handover."
  );
  const [promoBarActive, setPromoBarActive] = useState(true);
  const [promoBarText, setPromoBarText] = useState(
    "Complimentary Doorstep Handover for rentals above 3 days • Use code LUXPRIME"
  );
  const [isWebsiteSaving, setIsWebsiteSaving] = useState(false);

  useEffect(() => {
    fetch("/api/v1/admin/cms/website")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json.data) {
          if (json.data.heroTitle) setHeroTitle(json.data.heroTitle);
          if (json.data.heroSubtitle) setHeroBannerText(json.data.heroSubtitle);
          if (json.data.promoBarText) setPromoBarText(json.data.promoBarText);
          if (json.data.promoBarActive !== undefined) setPromoBarActive(json.data.promoBarActive);
        }
      })
      .catch((err) => console.error("Failed to load website CMS settings:", err));
  }, []);

  // Extract unique categories from FAQs
  const availableCategories = Array.from(new Set(faqs.map((f) => f.category))).filter(Boolean);

  const filteredFaqs = faqs.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || f.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleToggleFaq = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/v1/admin/faqs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update FAQ status.");
      }

      setFaqs((prev) =>
        prev.map((f) => (f.id === id ? { ...f, is_active: !currentStatus } : f))
      );
      setSuccessMsg(`FAQ status toggled to ${!currentStatus ? "Active" : "Inactive"}.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to toggle FAQ.");
      setTimeout(() => setErrorMsg(null), 3500);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm("Are you sure you want to permanently remove this FAQ item?")) return;

    try {
      const res = await fetch(`/api/v1/admin/faqs?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete FAQ.");
      }

      setFaqs((prev) => prev.filter((f) => f.id !== id));
      setSuccessMsg("FAQ deleted successfully from website knowledge base.");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete FAQ.");
      setTimeout(() => setErrorMsg(null), 3500);
    }
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/v1/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create FAQ.");
      }

      setFaqs((prev) => [...prev, data.data]);
      setIsAddModalOpen(false);
      setNewFaq({ question: "", answer: "", category: "General", sort_order: 1 });
      setSuccessMsg("New FAQ item created and published to live website!");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlog),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create blog article.");
      }

      const created = data.data;
      setBlogList((prev) => [
        {
          id: created.id,
          title: created.title,
          slug: created.slug,
          category: { name: created.category?.name || newBlog.category_name },
          author_name: created.author_name,
          read_time: created.read_time,
          published_at: created.published_at ? new Date(created.published_at).toISOString() : new Date().toISOString(),
          is_published: created.is_published,
        },
        ...prev,
      ]);

      setIsAddBlogModalOpen(false);
      setNewBlog({
        title: "",
        slug: "",
        category_name: "Travel Guides",
        author_name: "PrimeRides Editorial",
        read_time: "5 min read",
        featured_image: "/assets/img/blog/1.jpg",
        summary: "",
        content: "",
        is_published: true,
      });
      setSuccessMsg("New blog article published successfully!");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveWebsiteCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWebsiteSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/v1/admin/cms/website", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoBarActive,
          promoBarText,
          heroTitle,
          heroSubtitle: heroBannerText,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save website configuration.");
      }

      setSuccessMsg("Website promotional banners and hero settings saved successfully!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while saving website content.");
    } finally {
      setIsWebsiteSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats — Equal 4-sided padding & luxury gold elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div
          className="bg-white border border-[#e8edf2]/85 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
          style={{ borderRadius: "20px" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Active Knowledge FAQs
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading text-2xl font-black text-[#1c274c]">
              {faqs.filter((f) => f.is_active).length}{" "}
              <span className="text-xs font-semibold text-slate-400">/ {faqs.length} total</span>
            </div>
            <div className="text-[11.5px] text-slate-500 mt-1 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Live on /faq &amp; booking widget</span>
            </div>
          </div>
        </div>

        <div
          className="bg-white border border-[#e8edf2]/85 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
          style={{ borderRadius: "20px" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Travel Journal Articles
            </span>
            <div className="w-9 h-9 rounded-full bg-sky-50 border border-sky-200/70 flex items-center justify-center text-sky-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading text-2xl font-black text-[#1c274c]">
              {blogs.length}
            </div>
            <div className="text-[11.5px] text-slate-500 mt-1 font-medium flex items-center gap-1.5">
              <Link href="/blogs" target="_blank" className="text-[#5955D1] font-bold hover:underline flex items-center gap-1">
                <span>View live articles</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <div
          className="bg-white border border-[#e8edf2]/85 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
          style={{ borderRadius: "20px" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Inbound Contact Leads
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading text-2xl font-black text-[#1c274c]">
              {leadCount}
            </div>
            <div className="text-[11.5px] text-slate-500 mt-1 font-medium">
              <Link href="/admin/bookings" className="text-[#5955D1] font-bold hover:underline flex items-center gap-1">
                <span>Manage inquiries in Bookings</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-[#1c274c] to-[#1e293b] text-white border border-[#5955D1]/30 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-200 flex flex-col justify-between"
          style={{ borderRadius: "20px" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] uppercase tracking-wider text-[#f7d58b] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CMS Architecture</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-[#5955D1]/25 text-[#f7d58b] border border-[#5955D1]/40">
              v2.4 Ready
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Full Website Engine</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Homepage, Banners, Hub Guides &amp; Policy modules synchronized.
            </p>
          </div>
        </div>
      </div>

      {/* Action Messages */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Pill Bar & Controls — Authentic Nexlink Nav Pills */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 border-bottom pb-4">
        <ul className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0">
          <li className="nav-item">
            <button
              type="button"
              onClick={() => handleTabChange("faqs")}
              className={`nav-link ${activeTab === "faqs" ? "active" : ""}`}
            >
              <HelpCircle className="w-3.5 h-3.5 me-1.5 text-primary" />
              <span>FAQs &amp; Knowledge Base</span>
              <span className="badge rounded-pill bg-warning text-dark ms-2">
                {faqs.length}
              </span>
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              onClick={() => handleTabChange("blogs")}
              className={`nav-link ${activeTab === "blogs" ? "active" : ""}`}
            >
              <FileText className="w-3.5 h-3.5 me-1.5 text-primary" />
              <span>Articles &amp; Journal</span>
              <span className="badge rounded-pill bg-info text-dark ms-2">
                {blogs.length}
              </span>
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              onClick={() => handleTabChange("website")}
              className={`nav-link ${activeTab === "website" ? "active" : ""}`}
            >
              <Layout className="w-3.5 h-3.5 me-1.5 text-primary" />
              <span>Website Sections &amp; Banners</span>
              <span className="badge rounded-pill bg-light border text-muted ms-2">
                CMS v2
              </span>
            </button>
          </li>

          <li className="nav-item">
            <button
              type="button"
              onClick={() => handleTabChange("policies")}
              className={`nav-link ${activeTab === "policies" ? "active" : ""}`}
            >
              <Shield className="w-3.5 h-3.5 me-1.5 text-primary" />
              <span>Policies &amp; Legal</span>
            </button>
          </li>
        </ul>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === "faqs" && (
            <AdminButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add New FAQ
            </AdminButton>
          )}

          {activeTab === "blogs" && (
            <AdminButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddBlogModalOpen(true)}
            >
              Add New Article
            </AdminButton>
          )}

          <AdminButton
            href="/faq"
            target="_blank"
            variant="secondary"
            size="sm"
            icon={<ExternalLink className="w-3.5 h-3.5 text-slate-500" />}
          >
            View /faq
          </AdminButton>

          <AdminButton
            href="/blogs"
            target="_blank"
            variant="secondary"
            size="sm"
            icon={<ExternalLink className="w-3.5 h-3.5 text-slate-500" />}
          >
            View /blogs
          </AdminButton>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: FAQS & KNOWLEDGE BASE
          ========================================================================= */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          {/* Search & Category Filter Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search FAQs by question, category, or answer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control form-control-sm ps-5 rounded-pill"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Total Filtered Count */}
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-[#1c274c]">{filteredFaqs.length}</span> of {faqs.length} FAQs
            </div>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Category:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#1c274c] text-[#f7d58b] shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              All ({faqs.length})
            </button>
            {availableCategories.map((cat) => {
              const count = faqs.filter((f) => f.category === cat).length;
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-[#1c274c] text-[#f7d58b] shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* FAQ Items Cards */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div
                className="text-center py-16 bg-white border border-[#e8edf2]/80 p-6 text-slate-500"
                style={{ borderRadius: "20px" }}
              >
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-[#1c274c]">No matching FAQs found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query or clear the selected category filter to view all questions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 px-4 py-1.5 rounded-full text-xs font-bold bg-[#5955D1] text-white hover:bg-[#a68019] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-[#e8edf2]/85 p-5 shadow-[0_3px_14px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06),0_0_0_1px_rgba(197,155,39,0.3)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  style={{ borderRadius: "18px" }}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminBadge variant="brand">{faq.category}</AdminBadge>
                      <span className="text-[11px] text-slate-400 font-mono font-semibold">
                        Order #{faq.sort_order}
                      </span>
                      <AdminBadge variant={faq.is_active ? "success" : "neutral"}>
                        {faq.is_active ? "Live / Active" : "Inactive"}
                      </AdminBadge>
                    </div>

                    <h4 className="text-[13.5px] font-bold text-[#1c274c] pt-1 leading-snug">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFaq(faq.id, faq.is_active)}
                      className={`px-3 py-1.5 text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
                        faq.is_active
                          ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                      }`}
                      
                      title={faq.is_active ? "Deactivate from website" : "Make live on website"}
                    >
                      {faq.is_active ? (
                        <>
                          <X className="w-3.5 h-3.5 text-slate-500" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Publish Live</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: ARTICLES & JOURNAL
          ========================================================================= */}
      {activeTab === "blogs" && (
        <TableContainer>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Article Title &amp; Slug</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Author</TableHeaderCell>
              <TableHeaderCell>Read Time</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Published Date</TableHeaderCell>
              <TableHeaderCell align="right">Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogList.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-semibold text-[#1c274c] max-w-sm">
                  <div className="font-bold text-sm text-[#1c274c] line-clamp-1">{b.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">/blogs/{b.slug}</div>
                </TableCell>
                <TableCell>
                  <AdminBadge variant="info">{b.category?.name || "Travel"}</AdminBadge>
                </TableCell>
                <TableCell className="text-slate-700 font-semibold">{b.author_name}</TableCell>
                <TableCell className="text-slate-600 font-medium">{b.read_time || "5 min read"}</TableCell>
                <TableCell>
                  <AdminBadge variant={b.is_published ? "success" : "neutral"}>
                    {b.is_published ? "Published" : "Draft"}
                  </AdminBadge>
                </TableCell>
                <TableCell className="text-slate-600 font-medium">
                  {b.published_at ? new Date(b.published_at).toLocaleDateString("en-IN") : "Pending"}
                </TableCell>
                <TableCell align="right">
                  <Link
                    href={`/blogs/${b.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#5955D1] bg-[#5955D1]/10 hover:bg-[#5955D1]/20 transition-colors"
                    
                  >
                    <span>Read Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      )}

      {/* =========================================================================
          TAB 3: WEBSITE SECTIONS & BANNERS (CMS v2 Architecture Ready)
          ========================================================================= */}
      {activeTab === "website" && (
        <div className="space-y-6">
          {/* CMS v2 Architecture Notification */}
          <div
            className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-[#5955D1]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            style={{ borderRadius: "20px" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1c274c] text-[#f7d58b] flex items-center justify-center shrink-0 shadow-xs">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1c274c] flex items-center gap-2">
                  <span>PrimeRides Global Website Content Suite</span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-full">
                    Modular CMS v2
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Configure live announcement banners, homepage hero headlines, regional hub copy, and customer value propositions. These controls will power all public website pages.
                </p>
              </div>
            </div>

            <AdminButton
              href="/"
              target="_blank"
              variant="secondary"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5 text-slate-500" />}
            >
              Preview Live Site
            </AdminButton>
          </div>

          <form onSubmit={handleSaveWebsiteCms} className="space-y-6">
            {/* Module 1: Top Announcement / Promo Bar */}
            <div
              className="bg-white border border-[#e8edf2]/85 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4"
              style={{ borderRadius: "20px" }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1c274c]">Top Announcement &amp; Promo Bar</h3>
                    <p className="text-[11.5px] text-slate-500">
                      Renders across the very top of all customer-facing pages
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promoBarActive}
                    onChange={(e) => setPromoBarActive(e.target.checked)}
                    className="rounded border-slate-300 text-[#5955D1] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-[#1c274c]">
                    {promoBarActive ? "Active / Visible" : "Hidden"}
                  </span>
                </label>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Announcement Message Content
                </label>
                <input
                  type="text"
                  value={promoBarText}
                  onChange={(e) => setPromoBarText(e.target.value)}
                  placeholder="e.g. Free White-Glove Handover on bookings above 3 days..."
                  className="w-full h-[40px] px-4 rounded-xl border border-slate-300 text-xs text-[#1c274c] focus:outline-none focus:border-[#5955D1] focus:ring-2 focus:ring-[#5955D1]/20"
                />

                {/* Live Preview Box */}
                <div className="mt-3 p-3 rounded-xl bg-[#1c274c] text-center text-xs text-[#f7d58b] font-medium border border-white/10 shadow-xs flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#f7d58b]" />
                  <span>Preview: &ldquo;{promoBarText}&rdquo;</span>
                </div>
              </div>
            </div>

            {/* Module 2: Homepage Hero Showcase */}
            <div
              className="bg-white border border-[#e8edf2]/85 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4"
              style={{ borderRadius: "20px" }}
            >
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Layout className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c274c]">Homepage Hero Showcase</h3>
                  <p className="text-[11.5px] text-slate-500">
                    Primary luxury headline and value proposition above the booking widget
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Hero Headline
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    placeholder="Drive Exceptional. Luxury Self-Drive Rentals in Delhi NCR & Lucknow."
                    className="w-full h-[40px] px-4 rounded-xl border border-slate-300 text-xs text-[#1c274c] focus:outline-none focus:border-[#5955D1] focus:ring-2 focus:ring-[#5955D1]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hero Supporting Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={heroBannerText}
                    onChange={(e) => setHeroBannerText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs text-[#1c274c] focus:outline-none focus:border-[#5955D1] focus:ring-2 focus:ring-[#5955D1]/20 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Module 3: City Hub Overviews & Delivery Zones */}
            <div
              className="bg-white border border-[#e8edf2]/85 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4"
              style={{ borderRadius: "20px" }}
            >
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c274c]">Regional Hub Operations &amp; Delivery Radius</h3>
                  <p className="text-[11.5px] text-slate-500">
                    Delhi NCR &amp; Lucknow Hub public information and showroom hours
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-[#e8edf2]/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1c274c]">Delhi NCR Hub</span>
                    <AdminBadge variant="brand">Active Hub</AdminBadge>
                  </div>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    Aerocity, Gurgaon Cyber Hub &amp; Noida Express zones. 24/7 doorstep airport handovers available.
                  </p>
                  <div className="text-[10.5px] font-mono text-slate-400">Inventory: Maruti Suzuki Baleno &amp; Luxury Fleet</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-[#e8edf2]/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1c274c]">Lucknow Hub</span>
                    <AdminBadge variant="brand">Active Hub</AdminBadge>
                  </div>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    Gomti Nagar &amp; Amausi Airport pickup centers. White-glove concierge dispatch within 45 minutes.
                  </p>
                  <div className="text-[10.5px] font-mono text-slate-400">Inventory: Toyota Glanza &amp; Premium Fleet</div>
                </div>
              </div>
            </div>

            {/* Save Controls */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <AdminButton
                type="button"
                variant="secondary"
                onClick={() => {
                  setHeroBannerText("Experience Unmatched Luxury Mobility Across Delhi NCR & Lucknow. Doorstep White-Glove Handover.");
                  setPromoBarText("Complimentary Doorstep Handover for rentals above 3 days • Use code LUXPRIME");
                }}
              >
                Reset Defaults
              </AdminButton>
              <AdminButton
                type="submit"
                variant="primary"
                disabled={isWebsiteSaving}
                icon={<Check className="w-4 h-4" />}
              >
                {isWebsiteSaving ? "Saving..." : "Save Website Configuration"}
              </AdminButton>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 4: POLICIES & LEGAL
          ========================================================================= */}
      {activeTab === "policies" && (
        <div className="space-y-4">
          <div
            className="bg-white border border-[#e8edf2]/85 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-4"
            style={{ borderRadius: "20px" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1c274c]">Legal &amp; Rental Policies Registry</h3>
                  <p className="text-[11.5px] text-slate-500">
                    Mandatory customer rental agreements and compliance disclosures
                  </p>
                </div>
              </div>

              <AdminBadge variant="success">All Policies Live</AdminBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#e8edf2] bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1c274c]">Rental Terms &amp; Conditions</h4>
                  <span className="text-[10px] font-mono text-slate-400">Rev 3.2</span>
                </div>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Governs self-drive age criteria (21+), valid commercial DL requirement, fuel policies, and traffic violation obligations.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#e8edf2] bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1c274c]">Cancellation &amp; Refund Policy</h4>
                  <span className="text-[10px] font-mono text-slate-400">Rev 2.0</span>
                </div>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Full refund if cancelled &gt; 24h before trip start. 50% refund within 12-24h window. Automatic release of security deposits within 48h of vehicle return.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#e8edf2] bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1c274c]">Security Deposit &amp; Damage Liability</h4>
                  <span className="text-[10px] font-mono text-slate-400">Rev 1.8</span>
                </div>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Zero liability with PrimeShield protection. Standard pre-authorization hold protocol and Fastag toll deductions.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#e8edf2] bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1c274c]">Interstate Travel &amp; Fastag Guidelines</h4>
                  <span className="text-[10px] font-mono text-slate-400">Rev 2.1</span>
                </div>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  Permitted cross-border movement across Haryana, UP, Rajasthan, and Uttarakhand with active state commercial permits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW FAQ
      {/* =========================================================================
          ADD FAQ MODAL WITH LIVE PREVIEW & CATEGORY PILLS
          ========================================================================= */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create &amp; Publish New FAQ"
        subtitle="This entry will be immediately indexed and published live to the PrimeRides customer knowledge base."
        size="lg"
      >
        <form onSubmit={handleCreateFaq} className="space-y-4">
          <AdminInput
            label="Question *"
            required
            placeholder="e.g. Can I take the car outside Delhi NCR?"
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
            helperText="Write clear, customer-friendly questions as travelers would ask."
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Category *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                "Booking & Eligibility",
                "Kilometer Limit & Fuel",
                "Delivery & Pickup",
                "Security Deposit & Refunds",
                "Emergency & Roadside Assistance",
                "Interstate Permits & Fastag",
                "General",
              ].map((cat) => {
                const isSelected = newFaq.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewFaq({ ...newFaq, category: cat })}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#eeedfc] text-[#b0871d] border-[#5955D1]/60 font-semibold shadow-sm"
                        : "bg-slate-50 text-slate-600 border-[#e8edf2] hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <AdminSelect
              value={newFaq.category}
              onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
            >
              <option value="Booking & Eligibility">Booking &amp; Eligibility</option>
              <option value="Kilometer Limit & Fuel">Kilometer Limit &amp; Fuel</option>
              <option value="Delivery & Pickup">Delivery &amp; Pickup</option>
              <option value="Security Deposit & Refunds">Security Deposit &amp; Refunds</option>
              <option value="Emergency & Roadside Assistance">Emergency &amp; Roadside Assistance</option>
              <option value="Interstate Permits & Fastag">Interstate Permits &amp; Fastag</option>
              <option value="General">General</option>
            </AdminSelect>
          </div>

          <AdminTextarea
            label="Comprehensive Answer *"
            required
            rows={4}
            placeholder="Provide a clear, reassuring answer for travelers..."
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
            helperText="Supports multi-paragraph explanations and policy terms."
          />

          <AdminInput
            label="Display Sort Order"
            type="number"
            value={newFaq.sort_order}
            onChange={(e) => setNewFaq({ ...newFaq, sort_order: parseInt(e.target.value || "0", 10) })}
            helperText="Lower numbers appear first within the category."
          />

          {/* Live Customer Preview Card */}
          {(newFaq.question || newFaq.answer) && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5955D1]" />
                Live Customer Card Preview
              </label>
              <div className="p-4 rounded-xl bg-slate-50 border border-[#e8edf2] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#eeedfc] text-[#b0871d] border border-[#5955D1]/30">
                    {newFaq.category}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live on Save
                  </span>
                </div>
                <p className="font-bold text-[#1c274c] text-sm">
                  {newFaq.question || "Your question will appear here..."}
                </p>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {newFaq.answer || "Your answer will appear here..."}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e8edf2]">
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Create &amp; Publish Live
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* ADD BLOG ARTICLE MODAL */}
      <AdminModal
        isOpen={isAddBlogModalOpen}
        onClose={() => setIsAddBlogModalOpen(false)}
        title="Publish New Article / Journal Story"
        subtitle="Create luxury editorial content, driving guides, and destination stories."
        size="lg"
      >
        <form onSubmit={handleCreateBlog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="Article Title"
              required
              placeholder="e.g. Scenic Drives from Delhi to Spiti Valley"
              value={newBlog.title}
              onChange={(e) => {
                const title = e.target.value;
                const slug = title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)+/g, "");
                setNewBlog((prev) => ({ ...prev, title, slug }));
              }}
            />
            <AdminInput
              label="URL Slug"
              required
              placeholder="scenic-drives-delhi-to-spiti"
              value={newBlog.slug}
              onChange={(e) => setNewBlog((prev) => ({ ...prev, slug: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminSelect
              label="Category"
              value={newBlog.category_name}
              onChange={(e) => setNewBlog((prev) => ({ ...prev, category_name: e.target.value }))}
            >
              <option value="Travel Guides">Travel Guides</option>
              <option value="Road Trip Itineraries">Road Trip Itineraries</option>
              <option value="Supercar Chronicles">Supercar Chronicles</option>
              <option value="Luxury Lifestyle">Luxury Lifestyle</option>
              <option value="Fleet Highlights">Fleet Highlights</option>
            </AdminSelect>

            <AdminInput
              label="Author Name"
              placeholder="PrimeRides Editorial"
              value={newBlog.author_name}
              onChange={(e) => setNewBlog((prev) => ({ ...prev, author_name: e.target.value }))}
            />

            <AdminInput
              label="Read Time"
              placeholder="5 min read"
              value={newBlog.read_time}
              onChange={(e) => setNewBlog((prev) => ({ ...prev, read_time: e.target.value }))}
            />
          </div>

          {/* Direct Image Upload for Cover Image */}
          <AdminImageUpload
            label="Featured Cover Image"
            required
            value={newBlog.featured_image}
            onChange={(url) => setNewBlog((prev) => ({ ...prev, featured_image: url }))}
            folder="blogs"
            helperText="Upload 1200x800 high-res landscape cover photo for article banner."
          />

          <AdminTextarea
            label="Summary / Excerpt"
            rows={2}
            placeholder="Brief 1-2 sentence lead paragraph shown on journal catalog cards..."
            value={newBlog.summary}
            onChange={(e) => setNewBlog((prev) => ({ ...prev, summary: e.target.value }))}
          />

          <AdminTextarea
            label="Full Article Content"
            rows={5}
            required
            placeholder="Write the full travel guide or luxury car story here..."
            value={newBlog.content}
            onChange={(e) => setNewBlog((prev) => ({ ...prev, content: e.target.value }))}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e8edf2]">
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => setIsAddBlogModalOpen(false)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Publish Article
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
