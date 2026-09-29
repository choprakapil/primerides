import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenCard({
  permissionRequired,
  moduleName,
}: {
  permissionRequired: string;
  moduleName: string;
}) {
  return (
    <div className="py-5 maxw-450px mx-auto">
      <div className="card border text-center p-4 p-sm-5 shadow-sm">
        <div
          className="avatar avatar-lg rounded-circle bg-danger-subtle text-danger mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{ width: "56px", height: "56px" }}
        >
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="mb-4">
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2.5 py-1 text-uppercase">
            403 Access Denied
          </span>
          <h5 className="fw-bold text-dark mt-3 mb-2">
            Access Restricted: {moduleName}
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: "13px", lineHeight: "1.6" }}>
            Your administrator account does not possess the required permission{" "}
            <code className="px-1.5 py-0.5 rounded bg-light text-primary font-mono fw-bold">
              {permissionRequired}
            </code>{" "}
            to access this workspace.
          </p>
        </div>

        <div>
          <Link
            href="/admin"
            className="btn btn-light border btn-sm d-inline-flex align-items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
