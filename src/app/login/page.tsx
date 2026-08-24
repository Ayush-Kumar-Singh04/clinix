"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, UserCheck, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeRolePreset, setActiveRolePreset] = useState<string | null>(null);

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

  const handleDemoPreset = (presetEmail: string, roleName: string) => {
    setEmail(presetEmail);
    setPassword("password123");
    setActiveRolePreset(roleName);
    setErrorMsg("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#FDFBF7]">
      {/* Left: Deep Editorial Healthcare Visual Panel */}
      <div
        className="hidden lg:flex lg:w-5/12 bg-cover bg-center relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1008]/95 via-[#1C1008]/80 to-[#1C1008]/40" />

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-[#FAF6F1]">
            <KeyRound className="w-3.5 h-3.5 text-amber-300" />
            <span>Secure Portal Sign In</span>
          </div>
        </div>

        {/* Bottom Editorial Quote Box */}
        <div className="relative z-10 bg-[#2C1810]/85 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-2.5 max-w-md shadow-2xl">
          <h2 className="text-2xl lg:text-3xl font-serif text-white leading-snug">
            Welcome back to Clinix Healthcare.
          </h2>
          <p className="text-[#FAF6F1]/90 text-xs leading-relaxed font-light">
            Sign in to access your doctor appointments, clinical histories, prescription regimens, and administrative workflows.
          </p>
        </div>
      </div>

      {/* Right: Focused Authentication Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-left-4 duration-400">
          
          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              New to Clinix?{" "}
              <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2">
                Create a patient account
              </Link>
            </p>
          </div>

          {/* Quick Demo Access Switcher */}
          <div className="bg-slate-50 border-2 border-slate-200/80 p-4 rounded-3xl space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>1-Click Demo Login:</span>
              </span>
              {activeRolePreset && (
                <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
                  {activeRolePreset} Selected
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoPreset("patient@clinix.health", "Patient")}
                className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                  activeRolePreset === "Patient"
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset("dr.sharma@clinix.health", "Doctor")}
                className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                  activeRolePreset === "Doctor"
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset("admin@clinix.health", "Admin")}
                className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                  activeRolePreset === "Admin"
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="bg-white p-7 sm:p-8 rounded-3xl border-2 border-slate-200/90 shadow-sm space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-bold rounded-2xl animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. patient@clinix.health"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setActiveRolePreset(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 bg-slate-50/60 focus:bg-white focus:border-slate-900 rounded-xl text-xs sm:text-sm text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setActiveRolePreset(null);
                  }}
                  className="w-full pl-10 pr-11 py-2.5 border-2 border-slate-200 bg-slate-50/60 focus:bg-white focus:border-slate-900 rounded-xl text-xs sm:text-sm text-slate-900 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating credentials...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
