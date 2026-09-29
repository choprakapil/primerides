"use client";

import React, { useState } from "react";
import {
  updateCustomerProfileAction,
  updateCustomerPasswordAction,
} from "@/server/actions/customer-auth";

interface CustomerData {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  createdAt?: string | Date;
}

interface ProfileSecurityClientProps {
  customer: CustomerData;
}

export default function ProfileSecurityClient({ customer }: ProfileSecurityClientProps) {
  const [fullName, setFullName] = useState(customer.fullName || "");
  const [email, setEmail] = useState(customer.email || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsUpdatingProfile(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);

      const res = await updateCustomerProfileAction(formData);
      if (res.success) {
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      } else {
        setProfileMsg({ type: "error", text: res.error || "Failed to update profile." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters long." });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const formData = new FormData();
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);

      const res = await updateCustomerPasswordAction(formData);
      if (res.success) {
        setPasswordMsg({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: res.error || "Failed to change password." });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="row g-4">
      {/* Left Column: Member Overview Card */}
      <div className="col-12 col-lg-4">
        <div className="card border h-100 shadow-sm">
          <div className="card-body p-4 text-center">
            <div
              className="avatar rounded-circle bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold shadow"
              style={{ width: "72px", height: "72px", fontSize: "24px" }}
            >
              {customer.fullName ? customer.fullName.substring(0, 2).toUpperCase() : "CU"}
            </div>
            <h5 className="fw-bold text-dark mb-1">{customer.fullName || "Prime Member"}</h5>
            <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
              {customer.phone}
            </p>

            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 rounded-pill mb-4">
              <i className="fi fi-rr-check me-1"></i> Verified Account
            </span>

            <div className="p-3 rounded-3 bg-light border text-start">
              <div className="mb-2.5">
                <small className="text-muted d-block" style={{ fontSize: "11px" }}>REGISTERED PHONE</small>
                <span className="text-dark fw-medium">{customer.phone}</span>
              </div>
              <div className="mb-2.5">
                <small className="text-muted d-block" style={{ fontSize: "11px" }}>EMAIL ADDRESS</small>
                <span className="text-dark fw-medium">{customer.email || "Not Provided"}</span>
              </div>
              <div>
                <small className="text-muted d-block" style={{ fontSize: "11px" }}>MEMBER SINCE</small>
                <span className="text-dark fw-medium">
                  {customer.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
                    : "2026"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Profile & Security Forms */}
      <div className="col-12 col-lg-8 d-flex flex-column gap-4">
        {/* Personal Details Card */}
        <div className="card border shadow-sm">
          <div className="card-header py-3 px-4 bg-transparent border-bottom">
            <h5 className="card-title mb-0 fw-bold text-dark">Personal Information</h5>
            <small className="text-muted">Update your display name and email address</small>
          </div>
          <div className="card-body p-4">
            {profileMsg && (
              <div className={`alert alert-${profileMsg.type === "success" ? "success" : "danger"} py-2 px-3 mb-3 text-sm`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark text-sm">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark text-sm">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark text-sm">Registered Mobile Number</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={customer.phone}
                  disabled
                  readOnly
                />
                <small className="text-muted mt-1 d-block" style={{ fontSize: "11.5px" }}>
                  Primary identifier for OTPs and rental agreements. Contact concierge to change.
                </small>
              </div>

              <div className="text-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="btn btn-primary px-4"
                >
                  {isUpdatingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card border shadow-sm">
          <div className="card-header py-3 px-4 bg-transparent border-bottom">
            <h5 className="card-title mb-0 fw-bold text-dark">Change Password</h5>
            <small className="text-muted">Secure your account with Argon2id hardware-guarded encryption</small>
          </div>
          <div className="card-body p-4">
            {passwordMsg && (
              <div className={`alert alert-${passwordMsg.type === "success" ? "success" : "danger"} py-2 px-3 mb-3 text-sm`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark text-sm">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark text-sm">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark text-sm">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>

              <div className="text-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="btn btn-primary px-4"
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
