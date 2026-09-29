"use client";

import React, { useEffect, useState } from "react";

interface IdentityDoc {
  id: number;
  type: string;
  file_name?: string | null;
  status: "pending" | "verified" | "rejected";
  rejection_reason?: string | null;
  verified_at?: string | null;
  created_at: string;
  viewUrl: string;
}

const DOCUMENT_SLOTS = [
  {
    type: "driving_license_front",
    title: "Driving License (Front)",
    shortLabel: "DL Front Side",
    iconClass: "fi-rr-id-badge",
    description: "Clear photo displaying full name, license number, photo, and expiry dates.",
    required: true,
  },
  {
    type: "driving_license_back",
    title: "Driving License (Back)",
    shortLabel: "DL Back Side",
    iconClass: "fi-rr-id-badge",
    description: "Clear photo displaying vehicle authorizations (LMV/MCWG) and address.",
    required: true,
  },
  {
    type: "aadhaar",
    title: "Aadhaar / Passport",
    shortLabel: "Government ID",
    iconClass: "fi-rr-document",
    description: "Government-issued secondary proof of identity and permanent residential address.",
    required: false,
  },
];

export default function DocumentsManagerClient() {
  const [documents, setDocuments] = useState<IdentityDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [successMap, setSuccessMap] = useState<Record<string, string>>({});

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/v1/customer/documents");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (type: string, file: File) => {
    setErrorMap((prev) => ({ ...prev, [type]: "" }));
    setSuccessMap((prev) => ({ ...prev, [type]: "" }));

    if (file.size > 5 * 1024 * 1024) {
      setErrorMap((prev) => ({ ...prev, [type]: "Image exceeds 5 MB limit." }));
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      setErrorMap((prev) => ({ ...prev, [type]: "Only JPEG, PNG, and WebP are accepted." }));
      return;
    }

    setUploadingSlot(type);

    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", file);

      const res = await fetch("/api/v1/customer/documents", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMap((prev) => ({
          ...prev,
          [type]: json.error || "Upload failed. Please try again.",
        }));
      } else {
        setSuccessMap((prev) => ({
          ...prev,
          [type]: "Document uploaded successfully! Under review.",
        }));
        await fetchDocuments();
      }
    } catch (err: any) {
      setErrorMap((prev) => ({
        ...prev,
        [type]: err.message || "Network error. Please try again.",
      }));
    } finally {
      setUploadingSlot(null);
    }
  };

  const getDocForSlot = (type: string) => {
    return documents.find((d) => d.type === type);
  };

  return (
    <div>
      {isLoading ? (
        <div className="card border text-center py-5 px-4 mb-4">
          <div className="spinner-border text-primary mx-auto mb-3" role="status"></div>
          <p className="text-muted mb-0">Loading identity documents...</p>
        </div>
      ) : (
        <div className="row g-4 mb-4">
          {DOCUMENT_SLOTS.map((slot) => {
            const doc = getDocForSlot(slot.type);
            const isUploading = uploadingSlot === slot.type;
            const slotError = errorMap[slot.type];
            const slotSuccess = successMap[slot.type];

            return (
              <div key={slot.type} className="col-12 col-md-4">
                <div className="card border h-100 shadow-sm">
                  <div className="card-header py-3 px-4 bg-transparent border-bottom d-flex align-items-center justify-content-between">
                    <div
                      className="avatar rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <i className={`fi ${slot.iconClass}`} style={{ fontSize: "18px" }}></i>
                    </div>

                    <div>
                      {doc?.status === "verified" && (
                        <span className="badge bg-success-subtle text-success">Verified</span>
                      )}
                      {doc?.status === "pending" && (
                        <span className="badge bg-warning-subtle text-warning">Under Review</span>
                      )}
                      {doc?.status === "rejected" && (
                        <span className="badge bg-danger-subtle text-danger">Declined</span>
                      )}
                      {!doc && (
                        <span className="badge bg-light text-secondary border">Not Uploaded</span>
                      )}
                    </div>
                  </div>

                  <div className="card-body p-4 d-flex flex-column justify-content-between gap-3">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">{slot.title}</h5>
                      <p className="text-muted mb-2" style={{ fontSize: "13px" }}>
                        {slot.description}
                      </p>

                      {slot.required && (
                        <span className="badge bg-primary-subtle text-primary mb-3">
                          Required for Handover
                        </span>
                      )}

                      {doc?.status === "rejected" && doc.rejection_reason && (
                        <div className="alert alert-danger py-2 px-3 mb-2" style={{ fontSize: "12px" }}>
                          <strong>Reason:</strong> {doc.rejection_reason}
                        </div>
                      )}

                      {slotError && (
                        <div className="alert alert-danger py-2 px-3 mb-2" style={{ fontSize: "12px" }}>
                          {slotError}
                        </div>
                      )}
                      {slotSuccess && (
                        <div className="alert alert-success py-2 px-3 mb-2" style={{ fontSize: "12px" }}>
                          {slotSuccess}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-top d-flex flex-column gap-2">
                      {doc && (
                        <a
                          href={doc.viewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-light btn-sm border w-100 d-flex align-items-center justify-content-center gap-1.5 shadow-sm"
                        >
                          <i className="fi fi-rr-eye"></i>
                          <span>View Current Document</span>
                        </a>
                      )}

                      {(!doc || doc.status === "rejected") && (
                        <label className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1.5 mb-0">
                          <i className="fi fi-rr-upload"></i>
                          <span>{isUploading ? "Uploading..." : "Upload Image (JPG/PNG)"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="d-none"
                            disabled={isUploading}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(slot.type, f);
                            }}
                          />
                        </label>
                      )}

                      {doc && doc.status === "verified" && (
                        <div className="text-center text-success py-1" style={{ fontSize: "12px" }}>
                          <i className="fi fi-rr-check-circle me-1"></i>
                          <span>Verified &amp; Approved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
