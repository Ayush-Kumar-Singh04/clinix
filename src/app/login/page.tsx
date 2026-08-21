"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("patient@clinix.health");
  const [password, setPassword] = useState("password123");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error?.message || "Login failed");
        setIsLoading(false);
        return;
      }

      const role = data.data.role;
      if (role === "PATIENT") router.push("/patient");
      else if (role === "DOCTOR") router.push("/doctor");
      else if (role === "ADMIN") router.push("/admin");
      else router.push("/");
    } catch (err: any) {
      setErrorMsg("An error occurred during login.");
      setIsLoading(false);
    }
  };

  const handleDemoPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-teal-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to Clinix</h2>
          <p className="text-xs text-slate-500">Access your healthcare dashboard & care records</p>
        </div>

        {/* Demo Quick Switcher Box */}
        <div className="bg-gradient-to-r from-brand-50 to-teal-50 border border-brand-200/80 p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-brand-900">
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-brand-600" />
              Quick Access Presets:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoPreset("patient@clinix.health")}
              className="px-2.5 py-1.5 bg-white hover:bg-brand-100 text-brand-800 border border-brand-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset("dr.sharma@clinix.health")}
              className="px-2.5 py-1.5 bg-white hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset("admin@clinix.health")}
              className="px-2.5 py-1.5 bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? "Signing in..." : "Sign In to Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">Don&apos;t have a patient account? </span>
            <Link href="/register" className="text-xs font-bold text-brand-600 hover:underline">
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
