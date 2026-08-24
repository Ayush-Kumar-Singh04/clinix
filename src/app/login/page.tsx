"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, UserCheck, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-[calc(100vh-4rem)] flex bg-cream">
      {/* Left: Atmospheric Healthcare Photo Panel with Solid Dark Contrast Scrim */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative flex-col justify-end p-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80')`,
        }}
      >
        {/* Rich dark gradient overlay for 100% font legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-warm-950/95 via-warm-950/75 to-warm-900/40" />

        {/* Bottom Editorial Content inside a high-contrast dark callout */}
        <div className="relative z-10 bg-[#2C1810]/85 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-2.5 max-w-md shadow-2xl">
          <h2 className="text-2xl lg:text-3xl font-serif text-white leading-snug">
            Your health journey,<br />calm and continuous
          </h2>
          <p className="text-[#FAF6F1]/90 text-xs leading-relaxed font-light">
            Sign in to access real-time physician consultations, automated dosage alerts, and your complete medical continuum.
          </p>
        </div>
      </div>

      {/* Right: Distinct Auth Card Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-warm-900">Welcome back</h2>
            <p className="text-sm text-warm-500">Sign in to your Clinix healthcare portal</p>
          </div>

          {/* Demo Quick Access Switcher */}
          <div className="bg-warm-100/70 border border-warm-200/80 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-warm-700">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                Quick Demo Presets:
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleDemoPreset("patient@clinix.health")}
                className="px-2.5 py-1.5 bg-white hover:bg-brand-50 text-warm-800 border border-warm-200/80 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95"
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset("dr.sharma@clinix.health")}
                className="px-2.5 py-1.5 bg-white hover:bg-brand-50 text-warm-800 border border-warm-200/80 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95"
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset("admin@clinix.health")}
                className="px-2.5 py-1.5 bg-white hover:bg-brand-50 text-warm-800 border border-warm-200/80 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="bg-white p-7 sm:p-8 rounded-3xl border border-warm-200/80 shadow-md space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5 input-popout-group">
              <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. patient@clinix.health"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-warm-200 rounded-xl text-sm bg-warm-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none text-warm-900 placeholder:text-warm-400 transition-all"
                />
              </div>
            </div>

            {/* Password with Eye Visibility Toggle */}
            <div className="space-y-1.5 input-popout-group">
              <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 border border-warm-200 rounded-xl text-sm bg-warm-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none text-warm-900 placeholder:text-warm-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-warm-400 hover:text-warm-700 transition-colors focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-amber btn-popout !justify-center !py-3 shadow-md"
            >
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 border-t border-warm-100">
              <span className="text-xs text-warm-500">Don&apos;t have a patient account? </span>
              <Link href="/register" className="text-xs font-bold text-brand-700 hover:underline">
                Register now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
