import React from "react";
import Link from "next/link";
import { customerRegisterAction } from "@/server/actions/customer-auth";
import { Sparkles, Phone, Mail, User, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div
      className="min-h-screen text-[#1c274c] flex items-center justify-center p-4 font-dashboard"
      style={{
        paddingTop: "160px",
        paddingBottom: "80px",
        backgroundColor: "#f4f6fa",
      }}
    >
      <div className="w-full max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4 group">
            <div
              className="w-12 h-12 rounded-3 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform"
              style={{
                background: "linear-gradient(135deg, #5955D1 0%, #5955D1 100%)",
                boxShadow: "0 4px 14px rgba(197, 155, 39, 0.35)",
              }}
            >
              <Sparkles className="w-6 h-6 text-white font-bold" />
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1c274c] uppercase">
            Create Your <span className="text-[#5955D1]">PrimeRides</span> Account
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Unlock seamless luxury self-drive reservations, instant confirmations, and VIP trip support.
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-white border border-[#e8edf2] rounded-3 p-8"
          style={{
            boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(226, 232, 240, 0.8)",
          }}
        >
          {params?.error && (
            <div className="mb-6 p-4 rounded-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <span>{params.error}</span>
            </div>
          )}

          <form action={customerRegisterAction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-[#5955D1]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full bg-slate-50 border border-[#e8edf2] rounded-xl pl-11 pr-4 py-3 text-sm text-[#1c274c] placeholder-slate-400 focus:outline-none focus:border-[#5955D1] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number (WhatsApp Preferred) <span className="text-[#5955D1]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-[#e8edf2] rounded-xl pl-11 pr-4 py-3 text-sm text-[#1c274c] placeholder-slate-400 focus:outline-none focus:border-[#5955D1] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-slate-400 text-[10px] font-normal">(Optional for invoice & trip receipt)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  placeholder="vikram@example.com"
                  className="w-full bg-slate-50 border border-[#e8edf2] rounded-xl pl-11 pr-4 py-3 text-sm text-[#1c274c] placeholder-slate-400 focus:outline-none focus:border-[#5955D1] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Create Password <span className="text-[#5955D1]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 border border-[#e8edf2] rounded-xl pl-11 pr-4 py-3 text-sm text-[#1c274c] placeholder-slate-400 focus:outline-none focus:border-[#5955D1] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-full text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #5955D1 0%, #5955D1 100%)",
                  boxShadow: "0 4px 14px rgba(197, 155, 39, 0.35)",
                }}
              >
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/account/login" className="text-[#5955D1] hover:underline font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted with Argon2id & Hardware Security Policies</span>
        </div>
      </div>
    </div>
  );
}
