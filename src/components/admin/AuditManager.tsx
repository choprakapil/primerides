"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  ShieldCheck,
  Activity,
  Users,
  Search,
  RefreshCw,
  Eye,
  Clock,
  Terminal,
} from "lucide-react";
import {
  PageContainer,
  PageHeader,
  AdminButton,
  AdminModal,
  AdminEmptyState,
} from "@/components/admin/ui";
import TrendArrowBadge from "./ui/TrendArrowBadge";

export interface AuditLogItem {
  id: number;
  actorId: number | null;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  actorType: string;
  action: string;
  entity: string;
  entityId: number | null;
  beforeState: any;
  afterState: any;
  ipAddress: string;
  userAgent?: string | null;
  createdAt: string;
}

interface AuditManagerProps {
  initialLogs: AuditLogItem[];
  initialStats: {
    totalAllTime: number;
    recent24h: number;
    distinctActorsCount: number;
    integrity: string;
  };
}

export default function AuditManager({ initialLogs, initialStats }: AuditManagerProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [stats, setStats] = useState(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Forensic Inspection Modal State
  const [inspectingItem, setInspectingItem] = useState<AuditLogItem | null>(null);

  // Filter entities list
  const availableEntities = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.entity) set.add(l.entity);
    });
    return Array.from(set).sort();
  }, [logs]);

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedEntity !== "all") params.set("entity", selectedEntity);
      if (selectedAction !== "all") params.set("action", selectedAction);
      params.set("limit", "100");

      const res = await fetch(`/api/v1/admin/audit?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLogs(json.data.logs);
        if (json.data.stats) setStats(json.data.stats);
      }
    } catch (err) {
      console.error("Failed to refresh audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refreshList();
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (action.includes("DELETE")) return "bg-rose-100 text-rose-800 border-rose-200";
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (action.includes("PAYMENT") || action.includes("CAPTURED")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (action.includes("STATUS")) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  // Filtered in memory
  const displayLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(l.entityId).includes(searchQuery);

      const matchesEntity = selectedEntity === "all" || l.entity === selectedEntity;
      const matchesAction = selectedAction === "all" || l.action.includes(selectedAction);

      return matchesSearch && matchesEntity && matchesAction;
    });
  }, [logs, searchQuery, selectedEntity, selectedAction]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Security, Compliance & Governance"
        title="System Audit Activity"
        description="Immutable regulatory activity trail logging every administrative mutation, entity diff, operator transaction, and system security event."
        icon={<History className="w-5 h-5 text-orange-600" />}
        actions={
          <div className="d-flex align-items-center gap-2">
            <AdminButton
              variant="secondary"
              onClick={refreshList}
              disabled={isLoading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />}
            >
              Refresh Activity
            </AdminButton>
          </div>
        }
      />

      {/* 4 Luxury Pastel KPI Cards */}
      <div className="row g-3 mb-4">
        {/* Total Audit Events */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-lavender">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-purple-100 text-purple-700 d-flex align-items-center justify-content-center">
                  <History className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Recorded" period="All-Time" pastelTheme="lavender" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Total Audit Events
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.totalAllTime}</div>
              <div className="text-[11px] text-muted mt-1">
                System mutations stored in database
              </div>
            </div>
          </div>
        </div>

        {/* 24h Recent Activity */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-mint">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-emerald-100 text-emerald-700 d-flex align-items-center justify-content-center">
                  <Activity className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Active" period="24 Hours" pastelTheme="mint" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                24H Recent Activity
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.recent24h}</div>
              <div className="text-[11px] text-muted mt-1">
                Recent administrative mutations
              </div>
            </div>
          </div>
        </div>

        {/* Authorized Actors */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-blue">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-blue-100 text-blue-700 d-flex align-items-center justify-content-center">
                  <Users className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Operators" period="Active" pastelTheme="sky" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Authorized Actors
              </div>
              <div className="h3 mb-0 fw-bold text-dark mt-0.5">{stats.distinctActorsCount}</div>
              <div className="text-[11px] text-muted mt-1">
                Unique administrative actors logged
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Integrity */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card h-100 border pastel-card pastel-card-amber">
            <div className="card-body p-3.5">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="avatar avatar-md rounded-circle bg-amber-100 text-amber-700 d-flex align-items-center justify-content-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <TrendArrowBadge value="Verified" period="Immutable" pastelTheme="peach" />
              </div>
              <div className="text-muted text-xs font-semibold text-uppercase tracking-wider">
                Ledger Security
              </div>
              <div className="h4 mb-0 fw-bold text-dark mt-1 text-truncate">100% Immutable</div>
              <div className="text-[11px] text-muted mt-1">
                Append-only forensic database table
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border rounded-4 shadow-sm bg-white p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search className="w-4 h-4 text-muted" />
              </span>
              <input
                type="text"
                className="form-control form-control-sm border-start-0 ps-0"
                placeholder="Search action, entity, actor name, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Entity Filter */}
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm rounded-3"
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
            >
              <option value="all">All Entities ({availableEntities.length})</option>
              {availableEntities.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm rounded-3"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Creation (CREATE)</option>
              <option value="UPDATE">Modification (UPDATE)</option>
              <option value="DELETE">Deletion (DELETE)</option>
              <option value="CAPTURED">Payment (CAPTURED)</option>
              <option value="STATUS">Status Changes</option>
            </select>
          </div>

          {/* Submit */}
          <div className="col-12 col-md-1">
            <button type="submit" className="btn btn-sm btn-primary w-100 rounded-3 text-xs fw-semibold">
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="card border rounded-4 shadow-sm bg-white overflow-hidden">
        <div className="card-header bg-light bg-opacity-50 border-bottom p-3.5 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h6 className="mb-0 fw-bold text-dark text-sm">
              Recorded Activity Ledger ({displayLogs.length} events)
            </h6>
          </div>
          <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 py-1 text-[11px]">
            Source: tbl_audit_logs
          </span>
        </div>

        {displayLogs.length === 0 ? (
          <div className="p-5 text-center">
            <AdminEmptyState
              icon={<History className="w-10 h-10 text-muted mx-auto mb-2" />}
              title="No matching audit activity found"
              description="Try refining your search keyword or clearing the entity/action filters."
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted text-[11px] text-uppercase fw-bold">
                <tr>
                  <th style={{ width: "60px" }}>Log ID</th>
                  <th style={{ width: "175px" }}>Timestamp</th>
                  <th>Actor / Operator</th>
                  <th>Action</th>
                  <th>Target Entity</th>
                  <th>IP Address</th>
                  <th style={{ width: "110px" }} className="text-end">Forensics</th>
                </tr>
              </thead>
              <tbody>
                {displayLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="font-monospace text-xs text-muted fw-bold">
                        #{log.id}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5 text-xs text-dark">
                        <Clock className="w-3 h-3 text-muted shrink-0" />
                        <span>{formatDateTime(log.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar avatar-xs rounded-circle bg-purple-100 text-purple-800 d-flex align-items-center justify-content-center fw-bold text-[10px]" style={{ width: "26px", height: "26px" }}>
                          {log.actorName.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark text-xs leading-tight">
                            {log.actorName}
                          </div>
                          <span className="badge bg-light text-muted border text-[9px] px-1.5 py-0.5 rounded">
                            {log.actorRole}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge border text-[10px] font-monospace px-2 py-1 rounded-pill fw-bold ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5">
                        <span className="badge bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                          {log.entity}
                        </span>
                        {log.entityId !== null && (
                          <span className="badge bg-dark bg-opacity-75 text-white font-monospace text-[10px] px-1.5 py-0.5 rounded">
                            #{log.entityId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="font-monospace text-muted text-[11px]">
                        {log.ipAddress}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        onClick={() => setInspectingItem(log)}
                        className="btn btn-sm btn-outline-primary rounded-pill px-2.5 py-1 text-xs d-inline-flex align-items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Forensic State Diff Modal */}
      {inspectingItem && (
        <AdminModal
          isOpen={true}
          onClose={() => setInspectingItem(null)}
          title={`Forensic Audit Log Dossier #${inspectingItem.id}`}
          size="xl"
        >
          <div className="space-y-4">
            {/* Header Telemetry Pill Box */}
            <div className="p-3.5 rounded-4 bg-light border mb-3">
              <div className="row g-2 text-xs">
                <div className="col-6 col-md-3">
                  <span className="text-muted text-[11px] d-block">Action:</span>
                  <span className={`badge border text-[11px] font-monospace px-2 py-0.5 rounded-pill fw-bold ${getActionBadgeColor(inspectingItem.action)}`}>
                    {inspectingItem.action}
                  </span>
                </div>
                <div className="col-6 col-md-3">
                  <span className="text-muted text-[11px] d-block">Target Entity:</span>
                  <strong className="text-dark">
                    {inspectingItem.entity} {inspectingItem.entityId ? `(ID: #${inspectingItem.entityId})` : ""}
                  </strong>
                </div>
                <div className="col-6 col-md-3">
                  <span className="text-muted text-[11px] d-block">Actor / Operator:</span>
                  <strong className="text-dark">{inspectingItem.actorName}</strong>
                  <span className="text-muted text-[10px] d-block">{inspectingItem.actorEmail} ({inspectingItem.actorRole})</span>
                </div>
                <div className="col-6 col-md-3">
                  <span className="text-muted text-[11px] d-block">Timestamp:</span>
                  <strong className="text-dark">{formatDateTime(inspectingItem.createdAt)}</strong>
                </div>
              </div>
            </div>

            {/* Before vs After State Comparison */}
            <div className="row g-3">
              {/* Before State */}
              <div className="col-12 col-md-6">
                <div className="card border rounded-4 h-100 overflow-hidden">
                  <div className="card-header bg-danger-subtle text-danger-emphasis border-bottom p-2.5 d-flex align-items-center justify-content-between text-xs fw-bold">
                    <span>Before State Snapshot</span>
                    <span className="badge bg-danger text-white rounded-pill px-2 py-0.5 text-[10px]">
                      Previous
                    </span>
                  </div>
                  <div className="card-body p-3 bg-dark text-light font-monospace text-xs overflow-auto" style={{ maxHeight: "320px" }}>
                    <pre className="mb-0 text-success-emphasis text-white" style={{ fontSize: "11px" }}>
                      {inspectingItem.beforeState
                        ? JSON.stringify(inspectingItem.beforeState, null, 2)
                        : "// No previous state recorded (Initial Record / Creation)"}
                    </pre>
                  </div>
                </div>
              </div>

              {/* After State */}
              <div className="col-12 col-md-6">
                <div className="card border rounded-4 h-100 overflow-hidden">
                  <div className="card-header bg-success-subtle text-success-emphasis border-bottom p-2.5 d-flex align-items-center justify-content-between text-xs fw-bold">
                    <span>After State Snapshot (Mutated)</span>
                    <span className="badge bg-success text-white rounded-pill px-2 py-0.5 text-[10px]">
                      Current
                    </span>
                  </div>
                  <div className="card-body p-3 bg-dark text-light font-monospace text-xs overflow-auto" style={{ maxHeight: "320px" }}>
                    <pre className="mb-0 text-warning" style={{ fontSize: "11px" }}>
                      {inspectingItem.afterState
                        ? JSON.stringify(inspectingItem.afterState, null, 2)
                        : "// Entity deleted or state emptied"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Telemetry */}
            <div className="p-3 rounded-4 bg-light border mt-3 text-xs text-muted d-flex align-items-center justify-content-between">
              <div>
                <span>IP Address: </span>
                <strong className="text-dark font-monospace">{inspectingItem.ipAddress}</strong>
              </div>
              <div>
                <span>Append-Only ID: </span>
                <strong className="text-dark font-monospace">LOG_ROW_{inspectingItem.id}</strong>
              </div>
            </div>
          </div>
        </AdminModal>
      )}
    </PageContainer>
  );
}
