"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  User,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  X,
  FileText
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
  AdminLoadingState,
} from "@/components/admin/ui";

const QUICK_DECLINE_REASONS = [
  "Blurred or unreadable photo",
  "Expired driving license",
  "Name mismatch with account",
  "Margins / edges cut off",
  "Aadhaar back page missing",
  "Document illegible or invalid",
];

interface AdminDoc {
  id: number;
  customer_id: number;
  type: string;
  file_name?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  status: "pending" | "verified" | "rejected";
  rejection_reason?: string | null;
  verified_at?: string | null;
  verified_by?: number | null;
  created_at: string;
  viewUrl: string;
  customer?: {
    id: number;
    full_name: string;
    phone: string;
    email?: string | null;
  };
}

export default function AdminDocumentsReviewPage() {
  const [documents, setDocuments] = useState<AdminDoc[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Reject Modal State
  const [rejectingDoc, setRejectingDoc] = useState<AdminDoc | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<AdminDoc | null>(null);
  const [customerDocs, setCustomerDocs] = useState<AdminDoc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [isLoadingCustomerDocs, setIsLoadingCustomerDocs] = useState(false);

  const openCustomerInspection = async (doc: AdminDoc) => {
    setPreviewDoc(doc);
    setSelectedDocId(doc.id);
    setIsLoadingCustomerDocs(true);
    try {
      const res = await fetch(`/api/v1/admin/documents?customerId=${doc.customer_id}&status=all`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setCustomerDocs(data.data);
      } else {
        setCustomerDocs([doc]);
      }
    } catch (err) {
      console.error("Failed to load customer documents:", err);
      setCustomerDocs([doc]);
    } finally {
      setIsLoadingCustomerDocs(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/v1/admin/documents?status=${filter}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchDocuments();
  }, [filter]);

  const handleApprove = async (doc: AdminDoc) => {
    setActionLoadingId(doc.id);
    try {
      const res = await fetch(`/api/v1/admin/documents/${doc.id}/approve`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setCustomerDocs((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, status: "verified", verified_at: new Date().toISOString() } : d))
        );
        await fetchDocuments();
      } else {
        alert(json.error || "Approval failed");
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingDoc) return;
    if (!rejectionReason.trim()) {
      setRejectError("Rejection reason is required.");
      return;
    }

    setActionLoadingId(rejectingDoc.id);
    setRejectError(null);

    try {
      const res = await fetch(`/api/v1/admin/documents/${rejectingDoc.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setCustomerDocs((prev) =>
          prev.map((d) => (d.id === rejectingDoc.id ? { ...d, status: "rejected", rejection_reason: rejectionReason.trim() } : d))
        );
        setRejectingDoc(null);
        setRejectionReason("");
        await fetchDocuments();
      } else {
        setRejectError(json.error || "Rejection failed");
      }
    } catch (err: any) {
      setRejectError(err.message || "Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case "driving_license_front":
        return "Driving License (Front)";
      case "driving_license_back":
        return "Driving License (Back)";
      case "aadhaar":
        return "Aadhaar Card";
      case "passport":
        return "Passport";
      default:
        return type.replace(/_/g, " ").toUpperCase();
    }
  };

  return (
    <PageContainer>
      {/* Canonical Page Header */}
      <PageHeader
        eyebrow="Compliance"
        title="KYC Documents"
        description="Review customer Driving Licenses & Aadhaar before vehicle handover authorization."
        icon={<ShieldAlert className="w-5 h-5" />}
        actions={
          <ul className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0" role="tablist">
            {["all", "pending", "verified", "rejected"].map((tab) => (
              <li className="nav-item" key={tab}>
                <button
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`nav-link rounded-pill text-capitalize ${filter === tab ? "active" : ""}`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        }
      />

      {/* Documents Table / Grid */}
      {isLoading ? (
        <AdminLoadingState message="Loading identity documents..." />
      ) : documents.length === 0 ? (
        <AdminEmptyState
          title="No Documents in this Category"
          description="Customer document submissions will appear here for verification and compliance approval."
          action={
            filter !== "all" ? (
              <AdminButton variant="secondary" size="sm" onClick={() => setFilter("all")}>
                View All Documents
              </AdminButton>
            ) : undefined
          }
        />
      ) : (
        <div className="row g-4">
          {documents.map((doc) => {
            const isProcessing = actionLoadingId === doc.id;
            return (
              <div className="col-12 col-md-6 col-xl-4" key={doc.id}>
                <div className="card h-100 border overflow-hidden d-flex flex-column justify-content-between"
                
              >
                {/* Visual Document Header Preview */}
                <div className="relative h-44 w-full bg-[#0f172a]/5 p-3.5 pb-0 overflow-hidden">
                  {doc.viewUrl ? (
                    <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-slate-100 group/img">
                      <img
                        src={doc.viewUrl}
                        alt={getDocTypeLabel(doc.type)}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 ease-out cursor-pointer"
                        onClick={() => openCustomerInspection(doc)}
                      />
                      <button
                        type="button"
                        onClick={() => openCustomerInspection(doc)}
                        className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-xs cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-[#f7d58b]" />
                        <span>Quick View</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-[14px] bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                      <FileText className="w-8 h-8 text-[#5955D1]" />
                      <span className="text-[11px] font-semibold">Document File Uploaded</span>
                    </div>
                  )}

                  {/* Top Floating Glass Badges */}
                  <div className="absolute top-5 left-5 max-w-[65%]">
                    <span
                      className="px-3 py-1 text-[10.5px] font-bold bg-[#0f172a]/85 text-[#f7d58b] border border-white/10 backdrop-blur-md shadow-xs flex items-center gap-1 tracking-wide truncate"
                      
                      title={getDocTypeLabel(doc.type)}
                    >
                      <ShieldCheck className="w-3 h-3 text-[#f7d58b] shrink-0" />
                      <span className="truncate">{getDocTypeLabel(doc.type)}</span>
                    </span>
                  </div>

                  <div className="absolute top-5 right-5">
                    {doc.status === "verified" && (
                      <span
                        className="px-3 py-1 text-[10.5px] font-bold bg-emerald-600/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1"
                        
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {doc.status === "pending" && (
                      <span
                        className="px-3 py-1 text-[10.5px] font-bold bg-amber-500/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1"
                        
                      >
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {doc.status === "rejected" && (
                      <span
                        className="px-3 py-1 text-[10.5px] font-bold bg-red-600/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1"
                        
                      >
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Customer Meta */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-full bg-[#eeedfc] border border-[#5955D1] flex items-center justify-center text-[#5955D1] font-bold text-xs shrink-0"
                          
                        >
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-heading text-sm font-extrabold text-[#1c274c]">
                            {doc.customer?.full_name || `Customer #${doc.customer_id}`}
                          </h4>
                          <p className="text-[11px] text-[#5955D1] font-mono mt-0.5 font-semibold">
                            {doc.customer?.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {doc.customer?.email && (
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] pl-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.customer.email}</span>
                      </div>
                    )}

                    {/* Uniform Timestamp & Meta Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Uploaded {new Date(doc.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                      {doc.status === "verified" && doc.verified_at ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : doc.status === "rejected" ? (
                        <span className="text-red-600 font-bold">Declined</span>
                      ) : (
                        <span className="text-amber-600 font-bold">Review Needed</span>
                      )}
                    </div>

                    {/* Rejection Note if any */}
                    {doc.status === "rejected" && doc.rejection_reason && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 leading-snug">
                        <strong>Reason:</strong> {doc.rejection_reason}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      className="w-full justify-center shadow-sm"
                      icon={<Eye className="w-3.5 h-3.5 text-[#5955D1]" />}
                      onClick={() => openCustomerInspection(doc)}
                    >
                      Inspect Full Document
                    </AdminButton>

                    <div className="grid grid-cols-2 gap-2">
                      <AdminButton
                        variant="success"
                        size="sm"
                        className="w-full justify-center"
                        disabled={isProcessing || doc.status === "verified"}
                        isLoading={isProcessing}
                        onClick={() => handleApprove(doc)}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        {doc.status === "verified" ? "Verified" : "Approve"}
                      </AdminButton>

                      <AdminButton
                        variant="danger"
                        size="sm"
                        className="w-full justify-center"
                        disabled={isProcessing}
                        onClick={() => {
                          setRejectingDoc(doc);
                          setRejectionReason(doc.rejection_reason || "");
                          setRejectError(null);
                        }}
                        icon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Reject
                      </AdminButton>
                    </div>
                  </div>
                </div>
              </div></div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      <AdminModal
        isOpen={Boolean(rejectingDoc)}
        onClose={() => setRejectingDoc(null)}
        title="Reject Identity Document"
        subtitle={
          rejectingDoc
            ? `Customer: ${rejectingDoc.customer?.full_name || "Customer"} • ${getDocTypeLabel(rejectingDoc.type)}`
            : undefined
        }
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please select or specify a reason for declining this identity document. The customer will be prompted to re-upload.
          </p>

          {rejectError && (
            <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {rejectError}
            </p>
          )}

          {/* Quick Decline Reason Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Common Decline Reasons (Click to Apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_DECLINE_REASONS.map((reason) => {
                const isSelected = rejectionReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectionReason(reason)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#eeedfc] text-[#b0871d] border-[#5955D1]/60 font-semibold shadow-sm"
                        : "bg-slate-50 text-slate-600 border-[#e8edf2] hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleRejectSubmit} className="space-y-4 pt-1">
            <AdminTextarea
              label="Rejection Reason (Required)"
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Document image is blurred and license number is illegible. Please re-upload a clear photo."
              helperText="This reason is recorded in the compliance audit trail and shown to the customer."
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <AdminButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRejectingDoc(null)}
              >
                Cancel
              </AdminButton>
              <AdminButton
                type="submit"
                variant="danger"
                size="sm"
                isLoading={rejectingDoc ? actionLoadingId === rejectingDoc.id : false}
              >
                Confirm Rejection
              </AdminButton>
            </div>
          </form>
        </div>
      </AdminModal>

      {/* Unified Customer Documents Inspection Modal */}
      <AdminModal
        isOpen={Boolean(previewDoc)}
        onClose={() => {
          setPreviewDoc(null);
          setCustomerDocs([]);
          setSelectedDocId(null);
        }}
        title="Customer Identity & KYC Verification"
        subtitle={previewDoc ? `${previewDoc.customer?.full_name} • Phone: ${previewDoc.customer?.phone}` : undefined}
        size="xl"
      >
        {previewDoc && (() => {
          const effectiveDocs = customerDocs.length > 0 ? customerDocs : [previewDoc];
          const activeDoc = effectiveDocs.find((d) => d.id === selectedDocId) || effectiveDocs[0];
          const activeIndex = effectiveDocs.findIndex((d) => d.id === activeDoc.id);

          return (
            <div className="space-y-4">
              {/* Customer Profile & Verification Context Strip */}
              <div className="p-3.5 rounded-3 bg-slate-50 border border-[#e8edf2] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e8edf2] flex items-center justify-center text-[#5955D1] font-bold text-sm shadow-sm">
                    {activeDoc.customer?.full_name?.substring(0, 2).toUpperCase() || "ID"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1c274c]">
                      {activeDoc.customer?.full_name || "Customer"}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>{activeDoc.customer?.phone}</span>
                      {activeDoc.customer?.email && (
                        <>
                          <span>•</span>
                          <span>{activeDoc.customer.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">
                    Shared Documents:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eeedfc] text-[#b0871d] border border-[#5955D1]/30">
                    {isLoadingCustomerDocs ? "Loading..." : `${effectiveDocs.length} Total`}
                  </span>
                </div>
              </div>

              {/* Document Tab Gallery Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    All Shared Documents ({activeIndex + 1} of {effectiveDocs.length}):
                  </label>
                  {isLoadingCustomerDocs && (
                    <span className="text-[10.5px] text-[#5955D1] font-semibold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Syncing customer records...
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {effectiveDocs.map((doc) => {
                    const isSelected = doc.id === activeDoc.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? "bg-[#eeedfc] border-[#5955D1] shadow-xs ring-2 ring-[#5955D1]/20"
                            : "bg-white border-[#e8edf2] hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-[#e8edf2] flex items-center justify-center shrink-0 overflow-hidden">
                          {doc.viewUrl ? (
                            <img
                              src={doc.viewUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#1c274c] truncate">
                            {getDocTypeLabel(doc.type)}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full ${
                                doc.status === "verified"
                                  ? "bg-emerald-500"
                                  : doc.status === "rejected"
                                  ? "bg-red-500"
                                  : "bg-amber-500 animate-pulse"
                              }`}
                            />
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              {doc.status}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Document Inspection Canvas */}
              <div className="relative w-full h-[400px] bg-[#1c274c] rounded-3 overflow-hidden flex items-center justify-center border border-[#e8edf2] shadow-inner">
                {activeDoc.viewUrl ? (
                  <img
                    src={activeDoc.viewUrl}
                    alt={activeDoc.type}
                    className="max-w-full max-h-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <FileText className="w-12 h-12 text-[#5955D1]" />
                    <span className="text-xs font-semibold">No Image Preview Available</span>
                  </div>
                )}

                {/* Top Overlay Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 border border-[#e8edf2] shadow-md">
                    {getDocTypeLabel(activeDoc.type)}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${
                      activeDoc.status === "verified"
                        ? "bg-emerald-600 text-white"
                        : activeDoc.status === "rejected"
                        ? "bg-red-600 text-white"
                        : "bg-amber-500 text-white animate-pulse"
                    }`}
                  >
                    {activeDoc.status.toUpperCase()}
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/80 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <span>
                    Uploaded: {new Date(activeDoc.created_at).toLocaleString("en-IN")}
                  </span>
                  {activeDoc.viewUrl && (
                    <a
                      href={activeDoc.viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#f7d58b] hover:underline font-semibold"
                    >
                      Open Original Full Size ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Moderation Controls Footer */}
              <div className="p-3 bg-slate-50 rounded-3 border border-[#e8edf2] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Previous / Next Document Navigation */}
                  <button
                    type="button"
                    disabled={activeIndex <= 0}
                    onClick={() => setSelectedDocId(effectiveDocs[activeIndex - 1].id)}
                    className="px-2.5 py-1 rounded-lg border border-[#e8edf2] bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    ← Previous Doc
                  </button>
                  <button
                    type="button"
                    disabled={activeIndex >= effectiveDocs.length - 1}
                    onClick={() => setSelectedDocId(effectiveDocs[activeIndex + 1].id)}
                    className="px-2.5 py-1 rounded-lg border border-[#e8edf2] bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Next Doc →
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {activeDoc.status !== "verified" && (
                    <AdminButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(activeDoc)}
                      isLoading={actionLoadingId === activeDoc.id}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Approve This Document
                    </AdminButton>
                  )}

                  {activeDoc.status !== "rejected" && (
                    <AdminButton
                      variant="danger"
                      size="sm"
                      onClick={() => setRejectingDoc(activeDoc)}
                      icon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Decline / Re-upload
                    </AdminButton>
                  )}

                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setPreviewDoc(null);
                      setCustomerDocs([]);
                      setSelectedDocId(null);
                    }}
                  >
                    Close Inspection
                  </AdminButton>
                </div>
              </div>
            </div>
          );
        })()}
      </AdminModal>
    </PageContainer>
  );
}
