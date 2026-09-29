"use client";

import React, { useState } from "react";
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  AtSign,
  User,
  Key,
  Check,
  X,
  Copy,
  Sliders,
  Car,
  FileText,
  CreditCard,
  Lock,
  Sparkles,
  CalendarCheck,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
} from "lucide-react";
import {
  AdminButton,
  AdminBadge,
  AdminModal,
} from "@/components/admin/ui";
import { createStaffAction } from "@/server/actions/staff";

export interface StaffUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  created_at: string;
}

export interface PermissionItem {
  key: string;
  label: string;
  description: string;
}

interface StaffManagerProps {
  staffList: StaffUser[];
  allPermissions: PermissionItem[];
  currentAdminEmail?: string;
  paramsError?: string;
  paramsSuccess?: string;
}

export default function StaffManager({
  staffList,
  allPermissions,
  currentAdminEmail,
  paramsError,
  paramsSuccess,
}: StaffManagerProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"directory" | "provision" | "matrix" | "security">("directory");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "superadmin" | "staff">("all");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Inspector Modal
  const [inspectingUser, setInspectingUser] = useState<StaffUser | null>(null);

  // Provision Form State
  const [selectedRole, setSelectedRole] = useState<"staff" | "superadmin">("staff");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({
    "fleet.manage": true,
    "bookings.manage": true,
    "documents.manage": true,
    "bookings.view": true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleTogglePermission = (key: string) => {
    setSelectedPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAllPermissions = () => {
    const all: Record<string, boolean> = {};
    allPermissions.forEach((p) => {
      all[p.key] = true;
    });
    setSelectedPermissions(all);
  };

  const handleClearPermissions = () => {
    setSelectedPermissions({});
  };

  const filteredStaff = staffList.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(q) ||
      user.username.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      (Array.isArray(user.permissions) &&
        user.permissions.some((p) => p.toLowerCase().includes(q)));

    return matchesRole && matchesSearch;
  });

  const superadminCount = staffList.filter((u) => u.role === "superadmin").length;
  const staffCount = staffList.filter((u) => u.role !== "superadmin").length;

  const getDomainIcon = (key: string) => {
    if (key.startsWith("fleet")) return <Car className="w-3.5 h-3.5 text-[#5955D1]" />;
    if (key.startsWith("bookings")) return <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />;
    if (key.startsWith("documents") || key.startsWith("kyc")) return <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />;
    if (key.startsWith("content") || key.startsWith("leads")) return <FileText className="w-3.5 h-3.5 text-indigo-600" />;
    if (key.startsWith("pricing")) return <CreditCard className="w-3.5 h-3.5 text-amber-600" />;
    return <Shield className="w-3.5 h-3.5 text-[#5955D1]" />;
  };

  const resolvePermissionMetadata = (permKey: string) => {
    const match = allPermissions.find((p) => p.key === permKey);
    if (match) {
      return { label: match.label, description: match.description };
    }

    const parts = permKey.split(".");
    const domain = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "System";
    const action = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "Access";

    const label = `${domain} ${action}`;
    const description = `Operational access and controls for ${domain.toLowerCase()} resources.`;
    return { label, description };
  };

  return (
    <div className="space-y-6">
      {/* Top Security Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div
          className="bg-white border border-[#e8edf2]/85 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
          
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Active Administrators
            </span>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-[#e8edf2] flex items-center justify-center text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading text-2xl font-black text-[#1c274c]">
              {staffList.length}
            </div>
            <div className="text-[11.5px] text-slate-500 mt-1 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>All accounts verified &amp; active</span>
            </div>
          </div>
        </div>

        <div
          className="bg-white border border-[#e8edf2]/85 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
          
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Superadmin Tier
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading text-2xl font-black text-[#1c274c]">
              {superadminCount}
            </div>
            <div className="text-[11.5px] text-slate-500 mt-1 font-medium">
              Full cluster privileges
            </div>
          </div>
        </div>

        <div
          className="bg-white border border-[#e8edf2]/85 p-5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 flex flex-col justify-between"
          
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              Scoped Staff
            </span>
            <div className="w-9 h-9 rounded-full bg-sky-50 border border-sky-200/70 flex items-center justify-center text-sky-600">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-heading text-2xl font-black text-[#1c274c]">
              {staffCount}
            </div>
            <div className="text-[11.5px] text-slate-500 mt-1 font-medium">
              Granular role boundaries
            </div>
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-[#1c274c] to-[#1e293b] text-white border border-[#5955D1]/30 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-200 flex flex-col justify-between"
          
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] uppercase tracking-wider text-[#f7d58b] font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>RBAC Governance</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-[#5955D1]/25 text-[#f7d58b] border border-[#5955D1]/40">
              Argon2id
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Zero Plaintext Passwords</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Encrypted password storage &amp; audit log tracking enforced on all mutations.
            </p>
          </div>
        </div>
      </div>

      {/* Action Banners */}
      {paramsError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{paramsError}</span>
        </div>
      )}

      {paramsSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{paramsSuccess}</span>
        </div>
      )}

      {/* Navigation Switcher Bar — Authentic Nexlink Nav Pills */}
      <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-3 pt-1">
        <ul className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0">
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("directory")}
              className={`nav-link ${activeTab === "directory" ? "active" : ""}`}
            >
              <Users className="w-3.5 h-3.5 me-1.5" />
              <span>Team Directory ({staffList.length})</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("provision")}
              className={`nav-link ${activeTab === "provision" ? "active" : ""}`}
            >
              <UserPlus className="w-3.5 h-3.5 me-1.5" />
              <span>Provision Administrator</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("matrix")}
              className={`nav-link ${activeTab === "matrix" ? "active" : ""}`}
            >
              <Layers className="w-3.5 h-3.5 me-1.5" />
              <span>Roles &amp; Permissions Matrix</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`nav-link ${activeTab === "security" ? "active" : ""}`}
            >
              <Shield className="w-3.5 h-3.5 me-1.5" />
              <span>Security &amp; Governance</span>
            </button>
          </li>
        </ul>

        {activeTab !== "provision" && (
          <AdminButton
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setActiveTab("provision")}
            className="shadow-xs self-end sm:self-auto"
          >
            Provision Administrator
          </AdminButton>
        )}
      </div>

      {/* TAB 1: TEAM DIRECTORY VIEW */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Search & Role Filter Sub-bar */}
          <div className="card border mb-4">
            <div className="card-body p-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <ul className="nav nav-pills nav-pills-custom p-1 bg-light rounded-pill mb-0" role="tablist">
                <li className="nav-item">
                  <button
                    type="button"
                    onClick={() => setRoleFilter("all")}
                    className={`nav-link rounded-pill ${roleFilter === "all" ? "active" : ""}`}
                  >
                    All ({staffList.length})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    onClick={() => setRoleFilter("superadmin")}
                    className={`nav-link rounded-pill ${roleFilter === "superadmin" ? "active" : ""}`}
                  >
                    Superadmins ({superadminCount})
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    onClick={() => setRoleFilter("staff")}
                    className={`nav-link rounded-pill ${roleFilter === "staff" ? "active" : ""}`}
                  >
                    Staff ({staffCount})
                  </button>
                </li>
              </ul>

              <div className="position-relative" style={{ minWidth: "260px" }}>
                <input
                  type="text"
                  placeholder="Search staff by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control form-control-sm ps-5"
                />
                <Search className="w-4 h-4 text-muted position-absolute top-50 start-0 translate-middle-y ms-2.5 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y p-0 me-2 text-muted"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Directory Floating Card Rows Table */}
          <div
            className="card border mb-4 overflow-hidden"
            
          >
            {filteredStaff.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-[#1c274c] font-bold text-sm">No administrators found</p>
                <p className="text-slate-500">
                  Adjust your search keyword or role filter to view existing staff accounts.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto min-w-0">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light"><tr>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[220px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Administrator</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[200px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Work Email</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[140px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Role Tier</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[210px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Granted Access Scope</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[130px] text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Enrolled Date</span>
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap min-w-[130px] text-right text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                        <span className="whitespace-nowrap inline-block">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((user) => {
                      const isSuper = user.role === "superadmin";
                      const isCurrent = currentAdminEmail === user.email;
                      const perms = isSuper
                        ? ["*"]
                        : Array.isArray(user.permissions)
                        ? (user.permissions as string[])
                        : [];

                      const initials = user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr
                          key={user.id}
                          className="align-middle"
                        >
                          {/* Admin Identity */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-black text-xs shadow-sm shrink-0 ${
                                  isSuper
                                    ? "bg-gradient-to-br from-[#5955D1] to-[#8d6910] text-white ring-2 ring-[#5955D1]/30"
                                    : "bg-slate-100 text-slate-800 border border-slate-300"
                                }`}
                              >
                                {initials}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#1c274c] text-xs">
                                    {user.name}
                                  </span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                      You
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Work Email */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-mono text-[11px] text-slate-600">
                                {user.email}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(user.email)}
                                className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                title="Copy email address"
                              >
                                {copiedText === user.email ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Role Tier */}
                          <td className="py-3 px-4">
                            {isSuper ? (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-sm"
                                
                              >
                                <Sparkles className="w-3 h-3 text-[#5955D1]" />
                                <span>Superadmin</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-sky-50 text-sky-800 border border-sky-200/80 shadow-sm"
                                
                              >
                                <Shield className="w-3 h-3 text-sky-600" />
                                <span>Staff Admin</span>
                              </span>
                            )}
                          </td>

                          {/* Granted Access Scope */}
                          <td className="py-3 px-4">
                            {isSuper ? (
                              <span className="text-[11px] font-semibold text-[#8d6910] flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#5955D1]" />
                                <span>Full Cluster Privileges (*)</span>
                              </span>
                            ) : perms.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">No scoped permissions</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-[#e8edf2]">
                                  {perms.length} {perms.length === 1 ? "Permission" : "Permissions"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setInspectingUser(user)}
                                  className="text-[11px] text-[#5955D1] hover:underline font-bold cursor-pointer"
                                >
                                  View Scope
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Enrolled Date */}
                          <td className="py-4 px-4 align-middle whitespace-nowrap min-w-[130px] text-slate-500 text-[11px] bg-white border-y border-[#e8edf2] group-hover:border-[#5955D1]/40 group-hover:bg-[#eeedfc]/40 transition-all">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 align-middle text-right whitespace-nowrap min-w-[130px] bg-white border-y border-r border-[#e8edf2] rounded-r-2xl group-hover:border-[#5955D1]/40 group-hover:bg-[#eeedfc]/40 transition-all">
                            <AdminButton
                              variant="secondary"
                              size="sm"
                              icon={<Eye className="w-3 h-3 text-[#5955D1]" />}
                              className="!h-7 !px-2.5 !text-[11px] justify-center shadow-sm"
                              onClick={() => setInspectingUser(user)}
                            >
                              Inspect Scope
                            </AdminButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROVISION ADMINISTRATOR WORKFLOW */}
      {activeTab === "provision" && (
        <div
          className="bg-white border border-[#e8edf2] shadow-[0_16px_48px_rgba(15,23,42,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-8 md:p-10 relative overflow-hidden transition-all duration-300"
          style={{ borderRadius: "24px" }}
        >
          {/* Subtle Luxury Ambient Glow & Golden Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#5955D1] to-transparent opacity-90" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-[#5955D1]/10 via-[#5955D1]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-100 relative">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-3 bg-gradient-to-br from-[#eeedfc] via-[#fbf5e6] to-[#f4e8cb] border border-[#5955D1]/40 flex items-center justify-center text-[#5955D1] shadow-[0_2px_12px_rgba(197,155,39,0.18)] shrink-0">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg sm:text-xl font-bold text-[#1c274c] tracking-tight">
                    Provision Administrator
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eeedfc] text-[#5955D1] border border-[#5955D1]/30 shadow-sm">
                    Security Console
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Issue official staff credentials, configure role authority, and scope domain boundaries.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Argon2id Enforced</span>
              </span>
            </div>
          </div>

          <form
            action={createStaffAction}
            onSubmit={() => setIsSubmitting(true)}
            className="space-y-8 relative"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT PANEL: Unified Credentials & Role Classification (6 cols) */}
              <div className="lg:col-span-6">
                <div className="bg-[#fcfdfe] border border-[#e8edf2] p-6 sm:p-7 rounded-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-7">
                  
                  {/* Sub-section 1: Official Identity & Credentials */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1c274c] text-white flex items-center justify-center text-[10.5px] font-mono font-bold">1</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1c274c]">Official Identity &amp; Credentials</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">All fields required</span>
                    </div>

                    {/* Full Name Input — Inline Flex Container (No Icon-Text Overlap) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div
                        className="flex items-center h-11 px-3.5 bg-white hover:bg-slate-50/40 focus-within:bg-white border border-[#e8edf2] focus-within:border-[#5955D1] focus-within:ring-4 focus-within:ring-[#5955D1]/10 transition-all shadow-sm"
                        style={{ borderRadius: "12px" }}
                      >
                        <User className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Vikramaditya Sharma"
                          className="w-full h-full bg-transparent border-none outline-none text-xs sm:text-[13px] font-medium text-[#1c274c] placeholder:text-slate-400"
                          style={{ padding: 0, margin: 0 }}
                        />
                      </div>
                    </div>

                    {/* Official Username Input — Inline Flex Container (No Icon-Text Overlap) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Official Username <span className="text-red-500">*</span>
                      </label>
                      <div
                        className="flex items-center h-11 px-3.5 bg-white hover:bg-slate-50/40 focus-within:bg-white border border-[#e8edf2] focus-within:border-[#5955D1] focus-within:ring-4 focus-within:ring-[#5955D1]/10 transition-all shadow-sm"
                        style={{ borderRadius: "12px" }}
                      >
                        <AtSign className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                        <input
                          type="text"
                          name="username"
                          required
                          placeholder="e.g. vikram_fleet"
                          className="w-full h-full bg-transparent border-none outline-none text-xs sm:text-[13px] font-medium text-[#1c274c] placeholder:text-slate-400"
                          style={{ padding: 0, margin: 0 }}
                        />
                      </div>
                    </div>

                    {/* Work Email Address Input — Inline Flex Container (No Icon-Text Overlap) */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Work Email Address <span className="text-red-500">*</span>
                      </label>
                      <div
                        className="flex items-center h-11 px-3.5 bg-white hover:bg-slate-50/40 focus-within:bg-white border border-[#e8edf2] focus-within:border-[#5955D1] focus-within:ring-4 focus-within:ring-[#5955D1]/10 transition-all shadow-sm"
                        style={{ borderRadius: "12px" }}
                      >
                        <Mail className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="vikram@primerides.in"
                          className="w-full h-full bg-transparent border-none outline-none text-xs sm:text-[13px] font-medium text-[#1c274c] placeholder:text-slate-400"
                          style={{ padding: 0, margin: 0 }}
                        />
                      </div>
                    </div>

                    {/* Temporary Access Password Input — Inline Flex Container with Interactive Toggle */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Temporary Access Password <span className="text-red-500">*</span>
                      </label>
                      <div
                        className="flex items-center h-11 px-3.5 bg-white hover:bg-slate-50/40 focus-within:bg-white border border-[#e8edf2] focus-within:border-[#5955D1] focus-within:ring-4 focus-within:ring-[#5955D1]/10 transition-all shadow-sm"
                        style={{ borderRadius: "12px" }}
                      >
                        <Key className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          required
                          placeholder="••••••••••••"
                          className="w-full h-full bg-transparent border-none outline-none text-xs sm:text-[13px] font-medium font-mono text-[#1c274c] placeholder:text-slate-400"
                          style={{ padding: 0, margin: 0 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-slate-600 ml-2 shrink-0 cursor-pointer transition-colors"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Hashed using Argon2id with random cryptographic salt prior to database storage.</span>
                      </p>
                    </div>
                  </div>

                  {/* Sub-section 2: Role Classification Tier (Clean Divider, No Border Collision) */}
                  <div className="pt-6 border-t border-[#e8edf2]/80 space-y-4">
                    <div className="flex items-center justify-between pb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1c274c] text-white flex items-center justify-center text-[10.5px] font-mono font-bold">2</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1c274c]">Role Classification Tier</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Select access tier</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Operational Staff Card */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole("staff")}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                          selectedRole === "staff"
                            ? "bg-[#eeedfc] border-[#5955D1] shadow-[0_4px_16px_rgba(197,155,39,0.14)] ring-1 ring-[#5955D1]/30"
                            : "bg-white border-[#e8edf2] hover:border-slate-300 text-slate-600 hover:bg-slate-50/60 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/70 flex items-center justify-center text-[#5955D1] shadow-sm">
                            <Sliders className="w-4 h-4" />
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              selectedRole === "staff"
                                ? "border-[#5955D1] bg-[#5955D1] text-white shadow-xs"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {selectedRole === "staff" && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs font-bold text-[#1c274c]">Operational Staff</div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            Scoped privileges for bookings, fleet, or customer KYC.
                          </p>
                        </div>
                      </button>

                      {/* Superadmin Card */}
                      <button
                        type="button"
                        onClick={() => setSelectedRole("superadmin")}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                          selectedRole === "superadmin"
                            ? "bg-[#1c274c] border-[#1c274c] text-white shadow-[0_6px_22px_rgba(0,0,0,0.22)] ring-1 ring-[#5955D1]/40"
                            : "bg-white border-[#e8edf2] hover:border-slate-300 text-slate-600 hover:bg-slate-50/60 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                              selectedRole === "superadmin"
                                ? "bg-white/10 text-[#f7d58b] border border-white/15"
                                : "bg-slate-100 text-slate-700 border border-[#e8edf2]"
                            }`}
                          >
                            <Sparkles className="w-4 h-4 text-[#5955D1]" />
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              selectedRole === "superadmin"
                                ? "border-[#5955D1] bg-[#5955D1] text-white shadow-xs"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {selectedRole === "superadmin" && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className={`text-xs font-bold ${selectedRole === "superadmin" ? "text-white flex items-center gap-1" : "text-[#1c274c]"}`}>
                            <span>Superadmin Tier</span>
                            {selectedRole === "superadmin" && <span className="text-[9.5px] text-[#f7d58b] font-mono font-normal">(*)</span>}
                          </div>
                          <p className={`text-[11px] mt-1 leading-snug ${selectedRole === "superadmin" ? "text-slate-300" : "text-slate-500"}`}>
                            Unrestricted authority across all cluster operations and staff.
                          </p>
                        </div>
                      </button>
                    </div>
                    <input type="hidden" name="role" value={selectedRole} />
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL: Domain Access Boundaries (Spacious, Distinct Floating Cards) */}
              <div className="lg:col-span-6">
                <div className="bg-[#fcfdfe] border border-[#e8edf2] p-6 sm:p-7 rounded-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#1c274c] text-white flex items-center justify-center text-[10.5px] font-mono font-bold">3</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#1c274c]">Domain Access Boundaries</span>
                          {selectedRole === "staff" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eeedfc] text-[#5955D1] border border-[#5955D1]/30">
                              {Object.values(selectedPermissions).filter(Boolean).length} Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedRole === "staff" && (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={handleSelectAllPermissions}
                          className="px-3 py-1 rounded-full font-bold text-xs text-[#5955D1] bg-[#eeedfc] border border-[#5955D1]/35 hover:bg-[#5955D1] hover:text-white transition-all cursor-pointer shadow-sm"
                        >
                          Grant All
                        </button>
                        <button
                          type="button"
                          onClick={handleClearPermissions}
                          className="px-3 py-1 rounded-full font-medium text-xs text-slate-500 bg-white border border-[#e8edf2] hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedRole === "superadmin" ? (
                    <div className="p-6 rounded-3 bg-[#1c274c] text-white border border-[#5955D1]/40 shadow-[0_8px_24px_rgba(0,0,0,0.2)] space-y-4 relative overflow-hidden">
                      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#5955D1]/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#5955D1]/20 border border-[#5955D1]/40 flex items-center justify-center text-[#f7d58b]">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Full Cluster Privileges Inherited</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Superadministrators automatically bypass individual permission checks and possess unrestricted rights across all operations, financial tariffs, KYC verifications, customer management, and governance controls.
                      </p>
                      <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-[#f7d58b]">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Permission Wildcard: * (All 8 Modules Active)</span>
                      </div>
                    </div>
                  ) : (
                    /* Floating Permission Cards with Generous Spacing Between Borders */
                    <div className="space-y-3.5">
                      {allPermissions.map((perm) => {
                        const isChecked = !!selectedPermissions[perm.key];
                        return (
                          <div
                            key={perm.key}
                            onClick={() => handleTogglePermission(perm.key)}
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border flex items-center justify-between gap-4 ${
                              isChecked
                                ? "bg-[#eeedfc] border-[#5955D1] shadow-[0_4px_14px_rgba(197,155,39,0.12)] ring-1 ring-[#5955D1]/30"
                                : "bg-white border-[#e8edf2] hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
                            }`}
                          >
                            <input
                              type="checkbox"
                              name={`perm_${perm.key}`}
                              checked={isChecked}
                              onChange={() => {}} // handled by parent div onClick
                              className="sr-only"
                            />
                            
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                  isChecked
                                    ? "bg-white border border-[#5955D1]/40 text-[#5955D1] shadow-xs"
                                    : "bg-slate-100 text-slate-500 border border-[#e8edf2]"
                                }`}
                              >
                                {getDomainIcon(perm.key)}
                              </div>
                              
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs sm:text-sm font-bold text-[#1c274c]">
                                    {perm.label}
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600 border border-[#e8edf2]/80">
                                    {perm.key}
                                  </span>
                                </div>
                                <p className="text-[11.5px] text-slate-500 leading-snug mt-1">
                                  {perm.description}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                isChecked
                                  ? "bg-[#5955D1] border-[#5955D1] text-white shadow-xs"
                                  : "border-slate-300 bg-slate-50 hover:border-[#5955D1]/60"
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Onboarding mutation will be recorded in <span className="font-mono text-slate-700 font-bold">tbl_audit_logs</span></span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <AdminButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setActiveTab("directory")}
                >
                  Cancel &amp; Return to Directory
                </AdminButton>

                <AdminButton
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  icon={<UserPlus className="w-4 h-4" />}
                  className="shadow-[0_4px_16px_rgba(197,155,39,0.35)] hover:shadow-[0_6px_22px_rgba(197,155,39,0.5)]"
                >
                  Provision Account &amp; Grant Access
                </AdminButton>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ROLES & PERMISSIONS MATRIX */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <div
            className="bg-white border border-[#e8edf2]/85 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)]"
            
          >
            <div className="pb-4 mb-4 border-b border-slate-100">
              <h2 className="font-heading text-base font-bold text-[#1c274c] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5955D1]" />
                <span>PrimeRides Administrative Access Control Matrix</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every API mutation and route in the system strictly validates these granular keys before execution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPermissions.map((perm) => (
                <div
                  key={perm.key}
                  className="p-4 rounded-3 border border-[#e8edf2]/80 bg-[#f8fafc]/50 hover:bg-[#eeedfc]/50 hover:border-[#5955D1]/30 transition-all flex items-start gap-3.5"
                >
                  <div className="w-9 h-9 rounded-full bg-white border border-[#e8edf2] flex items-center justify-center shrink-0 shadow-sm">
                    {getDomainIcon(perm.key)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#1c274c]">{perm.label}</h4>
                      <span className="font-mono text-[10px] text-[#5955D1] bg-[#eeedfc] px-2 py-0.5 rounded-full border border-[#5955D1]/30">
                        {perm.key}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {perm.description}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-600">Roles:</span>
                      <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded">Superadmin</span>
                      <span>•</span>
                      <span className="text-sky-800 font-semibold bg-sky-50 px-1.5 py-0.5 rounded">Staff (Optional)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & GOVERNANCE VIEW */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div
            className="bg-white border border-[#e8edf2]/85 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] space-y-6"
            
          >
            <div className="pb-4 border-b border-slate-100">
              <h2 className="font-heading text-base font-bold text-[#1c274c] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Security Governance &amp; Cryptographic Architecture</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                PrimeRides operates under strict enterprise defense-in-depth principles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Policy 1: Argon2id */}
              <div className="p-5 rounded-3 bg-[#1c274c] text-white border border-[#5955D1]/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] uppercase tracking-wider text-[#f7d58b] font-bold">
                      Password Security
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#5955D1]/25 text-[#f7d58b] border border-[#5955D1]/40">
                      Argon2id
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-2">Zero Fast Hashes</h3>
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                    Passwords are never hashed using single fast algorithms (MD5, plain SHA-256). Argon2id with memory-hard cost parameters protects administrative credentials against offline brute-force and GPU rainbow-table attacks.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Argon2id Package Enforced</span>
                </div>
              </div>

              {/* Policy 2: Ephemeral Tokens & Rotation */}
              <div className="p-5 rounded-3 bg-white border border-[#e8edf2] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">
                      Token Lifecycle
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      ≤ 15 Min JWT
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1c274c] mt-2">Short-Lived Access Tokens</h3>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    Administrative web sessions use encrypted HTTP-only, SameSite=Lax, Secure cookies. Mobile access tokens are capped at ≤ 15 minutes with rotating refresh tokens stored hashed in the database with revocation support.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-sky-600" />
                  <span>Automatic Revocation Enabled</span>
                </div>
              </div>

              {/* Policy 3: Immutable Audit Trail */}
              <div className="p-5 rounded-3 bg-white border border-[#e8edf2] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] uppercase tracking-wider text-slate-500 font-bold">
                      Audit Logging
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      tbl_audit_logs
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1c274c] mt-2">100% Mutation Recording</h3>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                    Every mutating administrative action (staff onboarding, booking status changes, fleet updates, vehicle handovers) writes an immutable AuditLog row with actor ID, entity diff, IP address, and timestamp.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Immutable DB Table</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT PERMISSIONS MODAL */}
      <AdminModal
        isOpen={Boolean(inspectingUser)}
        onClose={() => setInspectingUser(null)}
        title="Administrative Access Profile"
        subtitle={inspectingUser ? `Governance Profile for ${inspectingUser.name}` : undefined}
        size="lg"
      >
        {inspectingUser && (
          <div className="space-y-5">
            {/* Identity & Role Banner */}
            <div className="p-4.5 rounded-3 bg-gradient-to-br from-[#fcfbf9] to-slate-50 border border-[#e8edf2] shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-3 bg-[#1c274c] border border-[#5955D1]/40 flex items-center justify-center text-[#f7d58b] font-heading font-black text-base shadow-sm">
                  {inspectingUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-sm font-bold text-[#1c274c]">{inspectingUser.name}</h4>
                    <span className="font-mono text-xs text-slate-400">@{inspectingUser.username}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{inspectingUser.email}</p>
                </div>
              </div>
              <div className="text-right">
                <AdminBadge variant={inspectingUser.role === "superadmin" ? "brand" : "info"}>
                  {inspectingUser.role === "superadmin" ? "Superadmin Clearance" : "Scoped Administrator"}
                </AdminBadge>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">Account ID #{inspectingUser.id}</div>
              </div>
            </div>

            {/* Security Metadata Strip */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-[#e8edf2]/80 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Status</span>
                <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Active & Verified
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-[#e8edf2]/80 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Password Storage</span>
                <span className="text-xs font-mono font-bold text-slate-700 block mt-0.5">
                  Argon2id Salted
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-[#e8edf2]/80 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Tracking</span>
                <span className="text-xs font-bold text-[#b0871d] block mt-0.5">
                  All Mutations Logged
                </span>
              </div>
            </div>

            {/* Scope Details */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Authorized Domain Permissions
                </h5>
                <span className="text-[11px] font-semibold text-[#5955D1]">
                  {inspectingUser.role === "superadmin" ? "Full Cluster Wildcard (*)" : `${inspectingUser.permissions.length} Domains Authorized`}
                </span>
              </div>

              {inspectingUser.role === "superadmin" ? (
                <div className="p-4.5 rounded-3 bg-gradient-to-br from-[#eeedfc] to-amber-50/40 border border-[#5955D1]/35 text-xs text-[#8d6910] space-y-2 shadow-sm">
                  <div className="font-heading font-black text-sm flex items-center gap-2 text-[#b0871d]">
                    <Sparkles className="w-4 h-4 text-[#5955D1]" />
                    <span>Unrestricted Cluster Governance Privileges</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    This administrator possesses the supreme Superadmin clearance tier. They have complete, unconstrained authority across fleet inventory, customer reservations, KYC identity compliance approvals, pricing tariffs, and internal staff provisioning.
                  </p>
                </div>
              ) : inspectingUser.permissions.length === 0 ? (
                <div className="p-6 rounded-3 bg-slate-50 border border-[#e8edf2] text-center text-xs text-slate-400 italic">
                  No operational permissions currently assigned to this account.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {inspectingUser.permissions.map((permKey) => {
                    const meta = resolvePermissionMetadata(permKey);
                    return (
                      <div
                        key={permKey}
                        className="p-3 rounded-xl bg-white border border-[#e8edf2] flex items-center justify-between gap-3 shadow-sm hover:border-[#5955D1]/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-[#e8edf2]/80 flex items-center justify-center shrink-0">
                            {getDomainIcon(permKey)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1c274c] block leading-tight">
                              {meta.label}
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                              {meta.description}
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Authorized</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <AdminButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setInspectingUser(null)}
              >
                Close Profile
              </AdminButton>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
