import React from "react";
import Link from "next/link";
import { customerRequestPasswordResetAction } from "@/server/actions/customer-auth";
import { Sparkles, Phone, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft, KeyRound } from "lucide-react";

export default async function CustomerForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; identifier?: string; token?: string }>;
}) {
  const params = await searchParams;
  const isSent = params?.sent === "true";

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
            Reset Your <span className="text-amber-400">Password</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-2">
            Enter your registered mobile number or email to receive a secure recovery link.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#121216]/90 backdrop-blur-2xl border border-white/10 rounded-3 p-8 shadow-2xl">
          {params?.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {params.error}
            </div>
          )}

          {isSent ? (
            <div className="space-y-6">
              <div className="p-4 rounded-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Recovery Instructions Dispatched</p>
                  <p className="text-neutral-300 mt-1">
                    If an active account is registered with <strong className="text-amber-400">{params.identifier}</strong>, a recovery link has been generated. This link is valid for 60 minutes.
                  </p>
                </div>
              </div>

              {params.token && (
                <div className="p-4 rounded-3 bg-[#eeedfc]0/10 border border-amber-500/30 text-amber-200 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-amber-400">
                    <KeyRound className="w-4 h-4" />
                    <span>Local Simulation / Instant Access</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Local testing mode detected: You can proceed directly with the generated recovery token without checking external SMS/inbox.
                  </p>
                  <Link
                    href={`/account/reset-password?token=${params.token}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-400/20"
                  >
                    <span>Click to Set New Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href="/account/login"
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form action={customerRequestPasswordResetAction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Phone Number or Email Address
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="identifier"
                    required
                    defaultValue={params?.identifier || ""}
                    placeholder="+91 98765 43210 or email@domain.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-bold text-sm shadow-lg shadow-amber-400/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Generate Recovery Link</span>
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
          <span>Single-use SHA-256 tokens with automatic 60-minute invalidation</span>
        </div>
      </div>
    </div>
  );
}
