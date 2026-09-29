"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "register";
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  initialMode = "login",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Invalid credentials. Please verify phone/email and password.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg(`Welcome back, ${data.data?.customer?.fullName || "Member"}!`);
      setIsLoading(false);

      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName,
          phone: regPhone,
          email: regEmail || undefined,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Registration failed. Please check your details.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg("Account created successfully! Logging you in...");
      setIsLoading(false);

      setTimeout(() => {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ background: "rgba(9, 14, 26, 0.78)", backdropFilter: "blur(6px)", zIndex: 1060 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
        <div
          className="modal-content shadow-2xl"
          style={{
            borderRadius: "26px",
            overflow: "hidden",
            border: "1px solid rgba(197, 155, 39, 0.3)",
            background: "#ffffff",
          }}
        >
          {/* Header */}
          <div
            className="modal-header relative"
            style={{
              background: "linear-gradient(135deg, #090e1a 0%, #172033 100%)",
              borderBottom: "1px solid rgba(197, 155, 39, 0.25)",
              padding: "20px 24px",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <img src="/assets/img/PRLogo.png" alt="Primerides" style={{ height: "36px", width: "auto" }} />
              <div>
                <h5 className="modal-title text-white font-bold mb-0 text-base tracking-wide uppercase">
                  PRIME<span style={{ color: "#c59b27" }}>RIDES</span>
                </h5>
                <small className="text-[11px] font-medium" style={{ color: "#c59b27" }}>
                  Customer Portal &amp; Self-Drive Booking
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4 p-sm-5" style={{ background: "#ffffff" }}>
            {/* Tab Switcher */}
            <div
              className="d-flex p-1 rounded-pill mb-4"
              style={{ background: "#f1f5f9", border: "1px solid #e2e8f0" }}
            >
              <button
                type="button"
                className="w-50 py-2 rounded-pill font-bold text-xs transition-all border-0"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  cursor: "pointer",
                  background: mode === "login" ? "linear-gradient(135deg, #d8a834, #c59b27)" : "transparent",
                  color: mode === "login" ? "#ffffff" : "#475569",
                  boxShadow: mode === "login" ? "0 2px 8px rgba(197,155,39,0.3)" : "none",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="w-50 py-2 rounded-pill font-bold text-xs transition-all border-0"
                onClick={() => {
                  setMode("register");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  cursor: "pointer",
                  background: mode === "register" ? "linear-gradient(135deg, #d8a834, #c59b27)" : "transparent",
                  color: mode === "register" ? "#ffffff" : "#475569",
                  boxShadow: mode === "register" ? "0 2px 8px rgba(197,155,39,0.3)" : "none",
                }}
              >
                Create Account
              </button>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div
                className="p-3 rounded-2xl mb-4 text-xs font-medium d-flex items-center gap-2"
                style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                className="p-3 rounded-2xl mb-4 text-xs font-medium d-flex items-center gap-2"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number or Email
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-slate-50 border-slate-200">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="+91 98765 43210 or name@email.com"
                      className="form-control text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Security Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-slate-50 border-slate-200">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="form-control text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-100 py-3 rounded-xl text-white text-xs font-bold uppercase tracking-wider d-flex align-items-center justify-center gap-2 border-0 shadow-md transition-all"
                    style={{
                      background: "linear-gradient(135deg, #d8a834 0%, #c59b27 100%)",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/account/login"
                    onClick={onClose}
                    className="text-[11px] text-slate-500 hover:text-[#c59b27] font-medium inline-flex items-center gap-1"
                  >
                    <span>Need full login page with password reset?</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === "register" && (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name (As on Driving License)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-slate-50 border-slate-200">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="form-control text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number (Primary Verification)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-slate-50 border-slate-200">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="form-control text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-slate-50 border-slate-200">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="form-control text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Create Password (Min. 6 Characters)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-slate-50 border-slate-200">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="form-control text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-100 py-3 rounded-xl text-white text-xs font-bold uppercase tracking-wider d-flex align-items-center justify-center gap-2 border-0 shadow-md transition-all"
                    style={{
                      background: "linear-gradient(135deg, #d8a834 0%, #c59b27 100%)",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Your Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/account/register"
                    onClick={onClose}
                    className="text-[11px] text-slate-500 hover:text-[#c59b27] font-medium inline-flex items-center gap-1"
                  >
                    <span>Open dedicated full registration screen</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
