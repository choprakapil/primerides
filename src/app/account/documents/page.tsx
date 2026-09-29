import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/server/auth/customer";
import DocumentsManagerClient from "@/components/account/DocumentsManagerClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function CustomerDocumentsPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/account/login?callbackUrl=/account/documents");
  }

  return (
    <div className="py-2">
      {/* Page Header */}
      <div className="app-page-head d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill mb-2 fw-semibold" style={{ fontSize: "11px" }}>
            IDENTITY &amp; COMPLIANCE
          </span>
          <h4 className="fw-bold text-dark mb-1">
            KYC &amp; Driving License Verification
          </h4>
          <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
            Upload government-mandated documents for instantaneous curbside vehicle handover.
          </p>
        </div>

        <div className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2">
          <i className="fi fi-rr-shield-check"></i>
          <span className="fw-semibold" style={{ fontSize: "12px" }}>256-Bit Encrypted Storage</span>
        </div>
      </div>

      <DocumentsManagerClient />
    </div>
  );
}
