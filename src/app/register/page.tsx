"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Calendar,
  FileText,
  Clock,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-200", labelColor: "text-slate-400" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 33, label: "Basic", color: "bg-amber-400", labelColor: "text-amber-600" };
    if (score <= 4) return { score: 66, label: "Good", color: "bg-brand-500", labelColor: "text-brand-600" };
    return { score: 100, label: "Strong & Secure", color: "bg-emerald-500", labelColor: "text-emerald-600" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role: "PATIENT" }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error?.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      router.push("/patient");
    } catch (err: any) {
      setErrorMsg("An error occurred during registration.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#FDFBF7]">
      {/* LEFT: Authentic Real-Life Healthcare Editorial Visual Panel */}
      <div
        className="hidden lg:flex lg:w-5/12 bg-cover bg-center relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&q=80')`,
        }}
      >
        {/* Soft, warm contrast scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C140E]/95 via-[#1C140E]/70 to-[#1C140E]/30" />

        {/* Top Branding / Category */}
        <div className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#FAF6F1]/80">
            Patient Care Network
          </span>
        </div>

        {/* Bottom Editorial Content & Quote Box */}
        <div className="relative z-10 space-y-6">
          <div className="bg-[#241710]/90 backdrop-blur-md p-7 rounded-3xl border border-white/15 space-y-4 shadow-2xl">
            <blockquote className="text-xl lg:text-2xl font-serif text-white leading-relaxed italic">
              &ldquo;The care you receive should feel human, coordinated, and unhurried at every appointment.&rdquo;
            </blockquote>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#FAF6F1]/80">
              <span className="font-semibold text-white">Dr. Eleanor Vance</span>
              <span className="text-[#FAF6F1]/60">Chief of Outpatient Medicine</span>
            </div>
          </div>

          {/* Core Patient Services */}
          <div className="grid grid-cols-3 gap-3 text-white text-xs pt-1">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-medium text-[11px]">Direct Specialist Booking</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-teal-300 shrink-0" />
              <span className="font-medium text-[11px]">Guaranteed Slot Locking</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-300 shrink-0" />
              <span className="font-medium text-[11px]">Digital Care Summaries</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Fresh, Modern Registration Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-lg space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 tracking-tight">
              Create Patient Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2">
                Sign in here
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-7 sm:p-8 rounded-3xl border-2 border-slate-200/90 shadow-sm space-y-4">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-bold rounded-2xl animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {/* Grid for Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 bg-slate-50/60 focus:bg-white focus:border-slate-900 rounded-xl text-xs sm:text-sm text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 bg-slate-50/60 focus:bg-white focus:border-slate-900 rounded-xl text-xs sm:text-sm text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 bg-slate-50/60 focus:bg-white focus:border-slate-900 rounded-xl text-xs sm:text-sm text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password *
                </label>
                {password && (
                  <span className="text-[11px] font-bold">
                    <span className="text-slate-400">Strength: </span>
                    <span className={strength.labelColor}>{strength.label}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Password Strength Progress Bar (Always visible & responsive) */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full ${password ? strength.color : "bg-slate-200"} transition-all duration-300`}
                  style={{ width: `${password ? strength.score : 0}%` }}
                />
              </div>
              {password && (
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>Min. 6 characters</span>
                  <span>{strength.score >= 66 ? "✓ Good complexity" : "Tip: Add letters & numbers"}</span>
                </div>
              )}
            </div>

            {/* Terms disclaimer */}
            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              By creating an account, you agree to Clinix&apos;s healthcare terms and verified outpatient privacy standards.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <span>Creating your account...</span>
              ) : (
                <>
                  <span>Create Patient Account</span>
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
