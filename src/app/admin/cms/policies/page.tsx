"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Save,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Car,
  RotateCcw,
} from "lucide-react";
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  PageContainer,
  PageHeader,
} from "@/components/admin/ui";
import { PoliciesConfig, PolicyClause, DEFAULT_POLICIES_CONFIG } from "@/types/siteSettings";

export default function AdminCmsPoliciesPage() {
  const [policies, setPolicies] = useState<PoliciesConfig>(DEFAULT_POLICIES_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>("rental-terms");

  useEffect(() => {
    fetch("/api/v1/admin/cms/policies")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setPolicies(json.data);
        }
      })
      .catch((err) => console.error("Failed to load policies:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setIsSaved(false);
    try {
      const res = await fetch("/api/v1/admin/cms/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policies),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save policies");

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      alert("Error saving policies: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const updateClause = (id: string, updates: Partial<PolicyClause>) => {
    setPolicies({
      ...policies,
      clauses: policies.clauses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const addPointToClause = (clauseId: string) => {
    setPolicies({
      ...policies,
      clauses: policies.clauses.map((c) => {
        if (c.id === clauseId) {
          return {
            ...c,
            points: [...c.points, "New policy clause specification point..."],
          };
        }
        return c;
      }),
    });
  };

  const updatePoint = (clauseId: string, pointIndex: number, text: string) => {
    setPolicies({
      ...policies,
      clauses: policies.clauses.map((c) => {
        if (c.id === clauseId) {
          const newPoints = [...c.points];
          newPoints[pointIndex] = text;
          return { ...c, points: newPoints };
        }
        return c;
      }),
    });
  };

  const removePoint = (clauseId: string, pointIndex: number) => {
    setPolicies({
      ...policies,
      clauses: policies.clauses.map((c) => {
        if (c.id === clauseId) {
          return {
            ...c,
            points: c.points.filter((_, i) => i !== pointIndex),
          };
        }
        return c;
      }),
    });
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Compliance & Legal"
        title="Rental Policies & Terms Management"
        description="Configure mandatory self-drive agreements, security deposit refund terms, cancellation windows, and FASTag rules."
        icon={<Shield className="w-5 h-5 text-[#5955D1]" />}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/faq"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border border-[#e8edf2] text-slate-700 bg-white hover:bg-slate-50 hover:text-[#5955D1] transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Customer FAQs &amp; Policies</span>
            </Link>
            <AdminButton
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-[#5955D1] hover:bg-[#b0871e] text-white px-4 py-2 text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving to Storage..." : "Save Policies & Disclosures"}</span>
            </AdminButton>
          </div>
        }
      />

      {isSaved && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm">
            <strong>Policies Persisted Successfully!</strong> Legal terms have been synchronized with persisted server storage and live customer disclosures.
          </div>
        </div>
      )}

      {/* Global Metadata Card */}
      <AdminCard className="p-6 bg-white border border-[#e8edf2] rounded-3 shadow-xs space-y-4 mb-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Legal Agreement Header &amp; Preamble</h2>
          <p className="text-xs text-slate-500">Seen at the top of the customer terms &amp; conditions modal.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Page Eyebrow</label>
            <input
              type="text"
              value={policies.eyebrow}
              onChange={(e) => setPolicies({ ...policies, eyebrow: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Page Title</label>
            <input
              type="text"
              value={policies.title}
              onChange={(e) => setPolicies({ ...policies, title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700">General Disclosure Description</label>
            <textarea
              rows={2}
              value={policies.description}
              onChange={(e) => setPolicies({ ...policies, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
            />
          </div>
        </div>
      </AdminCard>

      {/* Policy Clauses Registry */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Registered Policy Clauses ({policies.clauses.length})</h3>
            <p className="text-xs text-slate-500">Edit clause text, revisions, active status, and itemized binding points.</p>
          </div>
          <AdminBadge variant="success">Legal Sync Active</AdminBadge>
        </div>

        {policies.clauses.map((clause, cIdx) => {
          const isExpanded = expandedId === clause.id;

          return (
            <AdminCard
              key={clause.id}
              className={`border transition-all rounded-3 overflow-hidden bg-white shadow-xs ${
                isExpanded ? "border-[#5955D1] ring-1 ring-[#5955D1]/20" : "border-[#e8edf2] hover:border-slate-300"
              }`}
            >
              {/* Clause Header / Summary Bar */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : clause.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#5955D1] border border-amber-200/80 flex items-center justify-center font-bold text-xs shrink-0">
                    {cIdx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{clause.title}</h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-[#e8edf2]">
                        {clause.revision}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        {clause.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{clause.content}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    {clause.points.length} specifications
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Clause Expanded Editor */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Clause Heading</label>
                      <input
                        type="text"
                        value={clause.title}
                        onChange={(e) => updateClause(clause.id, { title: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Revision Identifier</label>
                      <input
                        type="text"
                        value={clause.revision}
                        onChange={(e) => updateClause(clause.id, { revision: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-3">
                      <label className="text-xs font-bold text-slate-700">Summary Preamble</label>
                      <textarea
                        rows={2}
                        value={clause.content}
                        onChange={(e) => updateClause(clause.id, { content: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
                      />
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Binding Specifications &amp; Rules</label>
                      <button
                        type="button"
                        onClick={() => addPointToClause(clause.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5955D1] hover:text-[#b0871e]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Specification Point</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {clause.points.map((point, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400 w-6 text-right shrink-0">
                            {pIdx + 1}.
                          </span>
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => updatePoint(clause.id, pIdx, e.target.value)}
                            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#5955D1]"
                          />
                          <button
                            type="button"
                            onClick={() => removePoint(clause.id, pIdx)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                            title="Remove Point"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Last audited: {clause.lastUpdated}</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={clause.isActive}
                        onChange={(e) => updateClause(clause.id, { isActive: e.target.checked })}
                        className="w-4 h-4 text-[#5955D1] rounded accent-[#5955D1]"
                      />
                      <span>Active in Customer Disclosures</span>
                    </label>
                  </div>
                </div>
              )}
            </AdminCard>
          );
        })}
      </div>
    </PageContainer>
  );
}
