"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquareText,
  Search,
  Filter,
  Phone,
  Calendar,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Clock,
  Car,
  User,
  RefreshCw,
} from "lucide-react";
import {
  AdminCard,
  AdminButton,
  AdminBadge,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  PageContainer,
  PageHeader,
} from "@/components/admin/ui";

interface ContactLead {
  id: number;
  name: string;
  phone: string;
  car_type: string | null;
  pickup_city: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/leads");
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setLeads(json.data);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    setUpdatingId(leadId);
    try {
      const res = await fetch("/api/v1/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      console.error("Failed to update lead status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      (l.car_type && l.car_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.pickup_city && l.pickup_city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" || l.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const countNew = leads.filter((l) => l.status === "new").length;
  const countContacted = leads.filter((l) => l.status === "contacted").length;
  const countConverted = leads.filter((l) => l.status === "converted").length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CRM Operations"
        title="Customer Inquiries & Leads"
        description="Review inbound website booking inquiries, callback requests, and outstation inquiries submitted from /contact and vehicle spotlight."
        icon={<MessageSquareText className="w-5 h-5 text-orange-600" />}
        actions={
          <AdminButton
            onClick={fetchLeads}
            disabled={isLoading}
            variant="secondary"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Leads</span>
          </AdminButton>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <AdminCard className="p-4 bg-white border border-[#e8edf2] rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Inquiries</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{leads.length}</span>
        </AdminCard>

        <AdminCard className="p-4 bg-white border border-amber-200 rounded-xl bg-amber-50/30">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">New / Uncontacted</span>
          <span className="text-2xl font-extrabold text-amber-900 mt-1 block">{countNew}</span>
        </AdminCard>

        <AdminCard className="p-4 bg-white border border-sky-200 rounded-xl bg-sky-50/30">
          <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">In Discussion</span>
          <span className="text-2xl font-extrabold text-sky-900 mt-1 block">{countContacted}</span>
        </AdminCard>

        <AdminCard className="p-4 bg-white border border-emerald-200 rounded-xl bg-emerald-50/30">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Converted to Booking</span>
          <span className="text-2xl font-extrabold text-emerald-900 mt-1 block">{countConverted}</span>
        </AdminCard>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, car..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#e8edf2] rounded-lg outline-none focus:ring-1 focus:ring-[#5955D1] bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-[#e8edf2] rounded-lg px-3 py-2 bg-white outline-none focus:ring-1 focus:ring-[#5955D1]"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <TableContainer>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell>Requested Vehicle</TableHeaderCell>
            <TableHeaderCell>Hub Location</TableHeaderCell>
            <TableHeaderCell>Message / Note</TableHeaderCell>
            <TableHeaderCell>Date Received</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Action</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredLeads.length === 0 ? (
            <TableRow>
              <td colSpan={7} className="text-center py-12 text-xs text-slate-400">
                {isLoading ? "Loading customer inquiries..." : "No customer inquiries found matching your filters."}
              </td>
            </TableRow>
          ) : (
            filteredLeads.map((lead) => {
              const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
              const waText = encodeURIComponent(
                `Hi ${lead.name}, thank you for reaching out to PrimeRides regarding ${lead.car_type || "a self-drive car rental"}. How may we assist you today?`
              );
              const waUrl = `https://wa.me/${cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone}?text=${waText}`;

              return (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-[#e8edf2] flex items-center justify-center text-xs font-bold text-slate-700">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{lead.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead.car_type || "General Inquiry"}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead.pickup_city || "Delhi NCR"}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="text-xs text-slate-600 max-w-xs truncate" title={lead.message || ""}>
                      {lead.message || "—"}
                    </p>
                  </TableCell>

                  <TableCell>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(lead.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TableCell>

                  <TableCell>
                    <select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-md border outline-none cursor-pointer ${
                        lead.status === "new"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : lead.status === "contacted"
                          ? "bg-sky-50 text-sky-800 border-sky-200"
                          : lead.status === "converted"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-700 border-[#e8edf2]"
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </TableCell>

                  <TableCell className="text-right">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"
                      title="Open WhatsApp chat with customer"
                    >
                      <MessageSquareText className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </TableContainer>
    </PageContainer>
  );
}
