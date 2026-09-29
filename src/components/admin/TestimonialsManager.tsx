"use client";

import React, { useState, useMemo } from "react";
import {
  Star,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  MessageSquare,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminButton,
  AdminCard,
  AdminModal,
  AdminBadge,
  AdminTextarea,
  AdminEmptyState,
} from "@/components/admin/ui";

export interface TestimonialItem {
  id: number;
  client_name: string;
  role_title?: string | null;
  rating: number;
  comment: string;
  avatar_url?: string | null;
  is_featured: boolean;
  created_at: string;
}

interface TestimonialsManagerProps {
  initialTestimonials: TestimonialItem[];
  stats: {
    total: number;
    featured: number;
    averageRating: number;
  };
}

export default function TestimonialsManager({
  initialTestimonials,
  stats: initialStats,
}: TestimonialsManagerProps) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials);
  const [stats, setStats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured" | "archived">("all");
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [formData, setFormData] = useState({
    client_name: "",
    role_title: "",
    rating: 5,
    comment: "",
    avatar_url: "/assets/img/team/1.jpg",
    is_featured: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingItem, setDeletingItem] = useState<TestimonialItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered List
  const filteredList = useMemo(() => {
    return testimonials.filter((item) => {
      if (filterFeatured === "featured" && !item.is_featured) return false;
      if (filterFeatured === "archived" && item.is_featured) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.client_name.toLowerCase().includes(q) ||
        (item.role_title && item.role_title.toLowerCase().includes(q)) ||
        item.comment.toLowerCase().includes(q)
      );
    });
  }, [testimonials, filterFeatured, searchQuery]);

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/testimonials");
      const json = await res.json();
      if (json.success && json.data) {
        setTestimonials(json.data.testimonials || []);
        if (json.data.stats) setStats(json.data.stats);
      }
    } catch (err) {
      console.error("Failed to refresh testimonials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      client_name: "",
      role_title: "",
      rating: 5,
      comment: "",
      avatar_url: "/assets/img/team/1.jpg",
      is_featured: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setEditingItem(item);
    setFormData({
      client_name: item.client_name,
      role_title: item.role_title || "",
      rating: item.rating,
      comment: item.comment,
      avatar_url: item.avatar_url || "/assets/img/team/1.jpg",
      is_featured: item.is_featured,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleToggleFeatured = async (item: TestimonialItem) => {
    try {
      const newStatus = !item.is_featured;
      const res = await fetch(`/api/v1/admin/testimonials/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, is_featured: newStatus } : t))
        );
        setStats((prev) => ({
          ...prev,
          featured: newStatus ? prev.featured + 1 : Math.max(0, prev.featured - 1),
        }));
      }
    } catch (err) {
      console.error("Failed to toggle featured status:", err);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name.trim() || !formData.comment.trim()) {
      setFormError("Client name and review comment are required.");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const url = editingItem
        ? `/api/v1/admin/testimonials/${editingItem.id}`
        : "/api/v1/admin/testimonials";
      const method = editingItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save testimonial.");
      }

      await refreshList();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/admin/testimonials/${deletingItem.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== deletingItem.id));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          featured: deletingItem.is_featured ? Math.max(0, prev.featured - 1) : prev.featured,
        }));
        setDeletingItem(null);
      } else {
        alert(json.error || "Failed to delete testimonial.");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting testimonial.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CMS & Content"
        title="Customer Testimonials & Reviews"
        description="Curate verified client impressions, star ratings, and featured endorsements displayed across the homepage showcase."
        icon={<MessageSquare className="w-5 h-5 text-[#5955D1]" />}
        actions={
          <div className="flex items-center gap-2">
            <AdminButton
              variant="secondary"
              onClick={refreshList}
              disabled={isLoading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#5955D1]" : ""}`} />}
            >
              Refresh
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={handleOpenCreate}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Review
            </AdminButton>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card h-100 border">
            <div className="card-body p-4 d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted text-uppercase fw-semibold d-block" style={{ fontSize: "11px" }}>Total Reviews</small>
                <h3 className="fw-bold text-dark mb-0 mt-1">{stats.total}</h3>
              </div>
              <div className="avatar rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: "44px", height: "44px" }}>
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 border">
            <div className="card-body p-4 d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted text-uppercase fw-semibold d-block" style={{ fontSize: "11px" }}>Featured On Homepage</small>
                <h3 className="fw-bold text-success mb-0 mt-1">{stats.featured}</h3>
              </div>
              <div className="avatar rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center" style={{ width: "44px", height: "44px" }}>
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 border">
            <div className="card-body p-4 d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted text-uppercase fw-semibold d-block" style={{ fontSize: "11px" }}>Average Rating</small>
                <h3 className="fw-bold text-warning mb-0 mt-1 d-flex align-items-center gap-1.5">
                  <span>{stats.averageRating}</span>
                  <Star className="w-4 h-4 fill-warning text-warning" />
                </h3>
              </div>
              <div className="avatar rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center" style={{ width: "44px", height: "44px" }}>
                <Star className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card border mb-4">
        <div className="card-body p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <ul className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0" role="tablist">
            <li className="nav-item">
              <button
                type="button"
                onClick={() => setFilterFeatured("all")}
                className={`nav-link rounded-pill ${filterFeatured === "all" ? "active" : ""}`}
              >
                All ({testimonials.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                onClick={() => setFilterFeatured("featured")}
                className={`nav-link rounded-pill ${filterFeatured === "featured" ? "active" : ""}`}
              >
                Featured ({stats.featured})
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                onClick={() => setFilterFeatured("archived")}
                className={`nav-link rounded-pill ${filterFeatured === "archived" ? "active" : ""}`}
              >
                Hidden ({testimonials.length - stats.featured})
              </button>
            </li>
          </ul>

          <div className="position-relative" style={{ minWidth: "240px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client or text..."
              className="form-control form-control-sm ps-5"
            />
            <Search className="w-4 h-4 text-muted position-absolute top-50 start-0 translate-middle-y ms-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Testimonials Grid / List */}
      {filteredList.length === 0 ? (
        <AdminEmptyState
          icon={<MessageSquare className="w-8 h-8 text-slate-400" />}
          title="No testimonials found"
          description={searchQuery ? "Try refining your search keyword or reset active filters." : "Create your first verified customer review using the button above."}
          action={
            <AdminButton variant="secondary" onClick={() => { setSearchQuery(""); setFilterFeatured("all"); }}>
              Reset Filters
            </AdminButton>
          }
        />
      ) : (
        <div className="row g-4">
          {filteredList.map((item) => (
            <div className="col-12 col-md-6 col-xl-4" key={item.id}>
              <div className="card h-100 border p-4 d-flex flex-column justify-content-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.avatar_url || "/assets/img/team/1.jpg"}
                      alt={item.client_name}
                      className="w-10 h-10 rounded-full object-cover border border-[#e8edf2] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#1c274c]">{item.client_name}</h4>
                      {item.role_title && (
                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]">
                          {item.role_title}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFeatured(item)}
                    title={item.is_featured ? "Featured on homepage (click to hide)" : "Hidden from homepage (click to feature)"}
                    className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full cursor-pointer transition-all ${
                      item.is_featured
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {item.is_featured ? "Featured" : "Hidden"}
                  </button>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-2.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < item.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200"
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold text-slate-600 ml-1">
                    {item.rating}.0
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-4">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{new Date(item.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-[#1c274c] hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    title="Edit review"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div></div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Customer Review" : "Add Customer Testimonial"}
        subtitle="Configure client identification, star rating, and review text for publication."
      >
        <form onSubmit={handleSaveSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Client Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="e.g. Dr. Aryan Sharma"
              className="w-full h-[40px] px-3.5 rounded-xl border border-slate-300 text-xs text-[#1c274c] focus:outline-none focus:border-[#5955D1] focus:ring-2 focus:ring-[#5955D1]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trip Context / Role (Optional)
              </label>
              <input
                type="text"
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                placeholder="e.g. Trip to Manali • Fortuner 4x4"
                className="w-full h-[40px] px-3.5 rounded-xl border border-slate-300 text-xs text-[#1c274c] focus:outline-none focus:border-[#5955D1] focus:ring-2 focus:ring-[#5955D1]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Star Rating (1–5)
              </label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) })}
                className="w-full h-[40px] px-3.5 rounded-xl border border-slate-300 text-xs text-[#1c274c] focus:outline-none focus:border-[#5955D1] focus:ring-2 focus:ring-[#5955D1]/20 bg-white"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Exceptional)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Stars - Great)</option>
                <option value={3}>⭐⭐⭐ (3 Stars - Good)</option>
                <option value={2}>⭐⭐ (2 Stars - Average)</option>
                <option value={1}>⭐ (1 Star - Poor)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Avatar Image URL
            </label>
            <input
              type="text"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="/assets/img/team/1.jpg or https://..."
              className="w-full h-[40px] px-3.5 rounded-xl border border-slate-300 text-xs text-[#1c274c] focus:outline-none focus:border-[#5955D1] focus:ring-2 focus:ring-[#5955D1]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer Feedback / Comment *
            </label>
            <AdminTextarea
              required
              rows={4}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Detail the customer rental experience, vehicle condition, and delivery punctuality..."
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded border-slate-300 text-[#5955D1] focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-[#1c274c]">
                Feature on Public Homepage Carousel
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <AdminButton variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editingItem ? "Update Review" : "Publish Review"}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Delete Testimonial"
        subtitle="Are you sure you want to remove this client review from the system?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Review by <strong>{deletingItem?.client_name}</strong> will be archived and immediately removed from the public website carousel.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <AdminButton variant="secondary" onClick={() => setDeletingItem(null)} disabled={isDeleting}>
              Cancel
            </AdminButton>
            <AdminButton variant="danger" onClick={handleDeleteSubmit} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </PageContainer>
  );
}
