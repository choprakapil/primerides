"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Tag,
  Ticket,
  Percent,
  Plus,
  Search,
  Check,
  Copy,
  Calendar,
  AlertCircle,
  Clock,
  TrendingDown,
  Sparkles,
  Users,
  Eye,
  Trash2,
  Edit2,
  ExternalLink,
  DollarSign,
  ShieldCheck,
  Power,
  Layers,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
  AdminModal,
  AdminEmptyState,
} from "@/components/admin/ui";

export interface SerializedCoupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_booking_amount: number;
  max_discount_amount: number | null;
  valid_from: string | null;
  valid_until: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  redemption_count: number;
  total_discount_given: number;
  recent_redemptions: {
    id: number;
    booking_code: string;
    full_name: string;
    phone: string;
    car_name: string | null;
    discount_amount: number;
    base_amount: number;
    total_amount: number;
    status: string;
    created_at: string;
  }[];
}

interface CouponsManagerProps {
  initialCoupons: SerializedCoupon[];
  canManage: boolean;
}

export default function CouponsManager({ initialCoupons, canManage }: CouponsManagerProps) {
  const [coupons, setCoupons] = useState<SerializedCoupon[]>(initialCoupons);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "percentage" | "fixed">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCouponForDossier, setSelectedCouponForDossier] = useState<SerializedCoupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form State for New Coupon
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 10,
    min_booking_amount: 3000,
    max_discount_amount: 1500,
    usage_limit: 100,
    valid_until: "",
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const activeCoupons = coupons.filter((c) => c.is_active);
    const totalRedemptions = coupons.reduce((sum, c) => sum + c.used_count, 0);
    const totalSavingsGiven = coupons.reduce((sum, c) => sum + c.total_discount_given, 0);

    // Most popular coupon
    const sortedByUse = [...coupons].sort((a, b) => b.used_count - a.used_count);
    const mostPopular = sortedByUse.length > 0 && sortedByUse[0].used_count > 0 ? sortedByUse[0] : null;

    return {
      activeCount: activeCoupons.length,
      totalRedemptions,
      totalSavingsGiven,
      mostPopularCode: mostPopular ? mostPopular.code : "None yet",
      mostPopularCount: mostPopular ? mostPopular.used_count : 0,
    };
  }, [coupons]);

  // Filtered List
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (statusFilter === "active" && !c.is_active) return false;
      if (statusFilter === "inactive" && c.is_active) return false;
      if (typeFilter !== "all" && c.discount_type !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const codeMatch = c.code.toLowerCase().includes(q);
        const descMatch = (c.description || "").toLowerCase().includes(q);
        if (!codeMatch && !descMatch) return false;
      }
      return true;
    });
  }, [coupons, statusFilter, typeFilter, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Toggle Active / Inactive
  const handleToggleStatus = async (coupon: SerializedCoupon) => {
    if (!canManage) return;
    try {
      const res = await fetch("/api/v1/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coupon.id,
          is_active: !coupon.is_active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !coupon.is_active } : c))
        );
      } else {
        alert(data.error || "Failed to update coupon status");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  };

  // Soft Delete Coupon
  const handleDeleteCoupon = async (coupon: SerializedCoupon) => {
    if (!canManage) return;
    if (!confirm(`Are you sure you want to retire coupon '${coupon.code}'? Customers will no longer be able to use it.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/coupons?id=${coupon.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      } else {
        alert(data.error || "Failed to delete coupon");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  };

  // Create Coupon Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    setActionError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        // Add to local state
        const created = data.data;
        setCoupons((prev) => [
          {
            id: created.id,
            code: created.code,
            description: created.description,
            discount_type: created.discount_type,
            discount_value: Number(created.discount_value),
            min_booking_amount: created.min_booking_amount ? Number(created.min_booking_amount) : 0,
            max_discount_amount: created.max_discount_amount ? Number(created.max_discount_amount) : null,
            valid_from: created.valid_from,
            valid_until: created.valid_until,
            usage_limit: created.usage_limit,
            used_count: 0,
            is_active: created.is_active,
            created_at: created.created_at,
            updated_at: created.updated_at,
            redemption_count: 0,
            total_discount_given: 0,
            recent_redemptions: [],
          },
          ...prev,
        ]);
        setIsCreateModalOpen(false);
        setFormData({
          code: "",
          description: "",
          discount_type: "percentage",
          discount_value: 10,
          min_booking_amount: 3000,
          max_discount_amount: 1500,
          usage_limit: 100,
          valid_until: "",
        });
      } else {
        setActionError(data.error || "Failed to create promo code");
      }
    } catch (err: any) {
      setActionError(err.message || "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      {/* Top Header */}
      <PageHeader
        eyebrow="Marketing & Discounts"
        title="Promotional Coupons & Discounts"
        description="Manage promotional discount codes, enforce minimum booking thresholds, and view customer redemptions."
        icon={<Tag className="w-5 h-5" />}
        actions={
          canManage ? (
            <AdminButton
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setActionError(null);
                setIsCreateModalOpen(true);
              }}
            >
              Create Promo Coupon
            </AdminButton>
          ) : undefined
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminCard className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Active Promo Codes
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.activeCount}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">Live on customer booking</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Total Redemptions
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.totalRedemptions.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-indigo-600 font-medium mt-0.5">Times applied by clients</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Total Discount Granted
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ₹{metrics.totalSavingsGiven.toLocaleString("en-IN")}
              </h3>
              <p className="text-xs text-amber-600 font-medium mt-0.5">Deducted from gross bills</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Top Performing Coupon
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1 truncate">
                {metrics.mostPopularCode}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {metrics.mostPopularCount} successful bookings
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Filter Toolbar */}
      <AdminCard className="p-4 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search coupon code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C5A880]/50"
            />
          </div>

          {/* Status Tabs & Type Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 bg-gray-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "active" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-600"
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setStatusFilter("inactive")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "inactive" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                }`}
              >
                Inactive / Expired
              </button>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#C5A880]/50"
            >
              <option value="all">All Discount Types</option>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Flat Cash Off (₹)</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* Coupons Table */}
      {filteredCoupons.length === 0 ? (
        <AdminEmptyState
          title="No Coupons Found"
          description="No promotional coupons match your current filters or search query."
          action={
            canManage ? (
              <AdminButton
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create First Promo Code
              </AdminButton>
            ) : undefined
          }
        />
      ) : (
        <AdminCard className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Thresholds & Expiry</th>
                  <th className="py-3 px-4">Redemption Quota</th>
                  <th className="py-3 px-4">Total Client Savings</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCoupons.map((coupon) => {
                  const isLimitReached = coupon.usage_limit && coupon.used_count >= coupon.usage_limit;
                  const isExpired = coupon.valid_until && new Date() > new Date(coupon.valid_until);

                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Code & Description */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm tracking-wide px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/70 rounded-md">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {coupon.description}
                          </p>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          {coupon.discount_type === "percentage" ? (
                            <>
                              <Percent className="w-4 h-4 text-indigo-500" />
                              <span>{coupon.discount_value}% OFF</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 text-emerald-500" />
                              <span>₹{coupon.discount_value.toLocaleString("en-IN")} FLAT OFF</span>
                            </>
                          )}
                        </div>
                        {coupon.discount_type === "percentage" && coupon.max_discount_amount && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Capped at ₹{coupon.max_discount_amount.toLocaleString("en-IN")}
                          </p>
                        )}
                      </td>

                      {/* Thresholds & Expiry */}
                      <td className="py-4 px-4">
                        <p className="text-xs text-gray-600 font-medium">
                          Min: ₹{coupon.min_booking_amount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {coupon.valid_until
                            ? new Date(coupon.valid_until).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "No expiry"}
                        </p>
                      </td>

                      {/* Quota / Used */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">
                            {coupon.used_count}
                          </span>
                          <span className="text-xs text-gray-400">
                            / {coupon.usage_limit ? coupon.usage_limit : "∞"}
                          </span>
                        </div>
                        {coupon.usage_limit && (
                          <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                isLimitReached ? "bg-red-500" : "bg-emerald-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((coupon.used_count / coupon.usage_limit) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Total Savings Granted */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900">
                          ₹{coupon.total_discount_given.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          across {coupon.redemption_count} bookings
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {isExpired ? (
                          <AdminBadge variant="danger">Expired</AdminBadge>
                        ) : isLimitReached ? (
                          <AdminBadge variant="warning">Limit Reached</AdminBadge>
                        ) : coupon.is_active ? (
                          <AdminBadge variant="success">Active</AdminBadge>
                        ) : (
                          <AdminBadge variant="neutral">Inactive</AdminBadge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Dossier Button */}
                          <button
                            onClick={() => setSelectedCouponForDossier(coupon)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Redemptions Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle Active Switch */}
                          {canManage && (
                            <button
                              onClick={() => handleToggleStatus(coupon)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                coupon.is_active
                                  ? "text-emerald-600 hover:bg-emerald-50"
                                  : "text-gray-400 hover:bg-gray-100"
                              }`}
                              title={coupon.is_active ? "Deactivate promo" : "Activate promo"}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete / Retire Button */}
                          {canManage && (
                            <button
                              onClick={() => handleDeleteCoupon(coupon)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Retire promo code"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* CREATE NEW COUPON MODAL */}
      <AdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Promotional Coupon"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {actionError && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Coupon Code & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PRIME2026"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, "") })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-[#C5A880]/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Discount Type *
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#C5A880]/50 focus:outline-none"
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="fixed">Flat Amount Off (₹)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description / Public Offer Label
            </label>
            <input
              type="text"
              placeholder="e.g. Special 10% Monsoon Discount on Luxury Sedans"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A880]/50 focus:outline-none"
            />
          </div>

          {/* Value & Cap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                {formData.discount_type === "percentage" ? "Percentage Value (%) *" : "Flat Discount (₹) *"}
              </label>
              <input
                type="number"
                required
                min={1}
                max={formData.discount_type === "percentage" ? 100 : 100000}
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A880]/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Max Discount Cap (₹)
              </label>
              <input
                type="number"
                placeholder={formData.discount_type === "percentage" ? "e.g. 2500" : "N/A for flat"}
                disabled={formData.discount_type === "fixed"}
                value={formData.max_discount_amount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_discount_amount: e.target.value ? Number(e.target.value) : 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 focus:ring-2 focus:ring-[#C5A880]/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Minimum Spend & Usage Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Min Booking Amount (₹)
              </label>
              <input
                type="number"
                min={0}
                value={formData.min_booking_amount}
                onChange={(e) => setFormData({ ...formData, min_booking_amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A880]/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Total Redemptions Cap
              </label>
              <input
                type="number"
                placeholder="Leave blank for unlimited"
                value={formData.usage_limit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usage_limit: e.target.value ? Number(e.target.value) : 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A880]/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Validity Expiration Date (Optional)
            </label>
            <input
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A880]/50 focus:outline-none"
            />
          </div>

          {/* Live Preview Pill */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/50 rounded-xl">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-900 mb-1">
              Customer Live Offer Preview
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-amber-200 text-gray-900">
                {formData.code || "ENTER_CODE"}
              </span>
              <span className="font-semibold text-amber-900">
                {formData.discount_type === "percentage"
                  ? `${formData.discount_value}% OFF ${
                      formData.max_discount_amount ? `(up to ₹${formData.max_discount_amount})` : ""
                    }`
                  : `₹${formData.discount_value} FLAT OFF`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <AdminButton variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton variant="primary" type="submit" isLoading={isSubmitting}>
              Launch Coupon
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* REDEMPTION DOSSIER MODAL */}
      {selectedCouponForDossier && (
        <AdminModal
          isOpen={!!selectedCouponForDossier}
          onClose={() => setSelectedCouponForDossier(null)}
          title={`Coupon Dossier: ${selectedCouponForDossier.code}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Header summary */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl text-xs">
              <div>
                <span className="text-gray-400 block">Offer Structure</span>
                <span className="font-bold text-gray-800">
                  {selectedCouponForDossier.discount_type === "percentage"
                    ? `${selectedCouponForDossier.discount_value}% OFF`
                    : `₹${selectedCouponForDossier.discount_value} Flat`}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Total Redemptions</span>
                <span className="font-bold text-gray-800">
                  {selectedCouponForDossier.used_count} bookings
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Total Client Savings</span>
                <span className="font-bold text-emerald-600">
                  ₹{selectedCouponForDossier.total_discount_given.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Redemptions Table */}
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Customer Bookings Applying this Code ({selectedCouponForDossier.recent_redemptions.length})
            </h4>

            {selectedCouponForDossier.recent_redemptions.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                No customer bookings have applied this coupon yet.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Booking Code</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Vehicle</th>
                      <th className="py-2.5 px-3">Discount Given</th>
                      <th className="py-2.5 px-3">Net Bill</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedCouponForDossier.recent_redemptions.map((redemption) => (
                      <tr key={redemption.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600">
                          <Link
                            href={`/admin/bookings?search=${redemption.booking_code}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            {redemption.booking_code}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-800">
                          {redemption.full_name}
                          <span className="block text-[10px] text-gray-400">{redemption.phone}</span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {redemption.car_name || "Luxury Fleet"}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600">
                          -₹{redemption.discount_amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">
                          ₹{redemption.total_amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-gray-400">
                          {new Date(redemption.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </AdminModal>
      )}
    </PageContainer>
  );
}
