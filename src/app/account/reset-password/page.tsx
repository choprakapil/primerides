import React from "react";
import Link from "next/link";
import { customerResetPasswordAction } from "@/server/actions/customer-auth";
import { validatePasswordResetToken } from "@/server/auth/password-reset";
import { Sparkles, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";

export default async function CustomerResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token?.trim();

  let tokenValidation = token
    ? await validatePasswordResetToken(token)
    : { valid: false, error: "No recovery token was provided." };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-4 py-16 relative overflow-hidden font-dashboard">
      {/* Ambient Luxury Lighting */}
      <div className="absolute w-[500px] h-[500px] bg-[#eeedfc]0/10 rounded-full blur-[140px] pointer-events-none -top-32 -left-32" />
      <div className="absolute w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none -bottom-32 -right-32" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4 group">
            <div className="w-12 h-12 rounded-3 bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-black font-bold" />
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider text-white uppercase">
            Set New <span className="text-amber-400">Password</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-2">
            Create a robust password to safeguard your bookings and account privileges.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121216]/90 backdrop-blur-2xl border border-white/10 rounded-3 p-8 shadow-2xl">
          {params?.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{params.error}</span>
            </div>
          )}

          {!tokenValidation.valid ? (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-3 bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Invalid or Expired Link</h2>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  {tokenValidation.error || "This recovery link is invalid or has expired for security reasons."}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/account/forgot-password"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-bold text-sm shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Request a New Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form action={customerResetPasswordAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                  {tokenValidation.customerName?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">{tokenValidation.customerName}</p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {tokenValidation.customerEmail || tokenValidation.customerPhone}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  New Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Confirm New Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={6}
                    placeholder="Repeat your new password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-bold text-sm shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Update Password & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-neutral-400">
              Remember your password?{" "}
              <Link href="/account/login" className="text-amber-400 hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-neutral-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted with Argon2id & Active Session Invalidation</span>
        </div>
      </div>
    </div>
  );
}
