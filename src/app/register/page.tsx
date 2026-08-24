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
  Sparkles,
  HeartPulse,
  CalendarCheck,
  CheckCircle2,
  Stethoscope,
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
    if (!pass) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 33, label: "Basic", color: "bg-amber-400" };
    if (score <= 4) return { score: 66, label: "Good", color: "bg-brand-500" };
    return { score: 100, label: "Strong & Secure", color: "bg-emerald-500" };
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
      {/* LEFT: Distinct Patient Onboarding & Value Proposition Showcase */}
      <div className="lg:w-5/12 bg-gradient-to-br from-teal-950 via-slate-900 to-brand-950 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Join Clinix Care Network</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight leading-tight">
              Start your journey to calm, continuous healthcare.
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
              Create your patient account in under 60 seconds to consult verified clinicians and manage care plans.
            </p>
          </div>

          {/* Value Perks List */}
          <div className="space-y-3.5 pt-4">
            <div className="flex items-start space-x-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Instant Collision-Free Booking</div>
                <div className="text-slate-300 text-[11px]">Real-time hold locking prevents double-booking across doctors.</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">AI Clinical Intake Summaries</div>
                <div className="text-slate-300 text-[11px]">Describe symptoms beforehand so your physician is prepared.</div>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">Automated Prescription Tracking</div>
                <div className="text-slate-300 text-[11px]">Get timely reminders for post-consultation medications.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>256-bit Encrypted Medical Records</span>
          </span>
          <span className="font-mono text-teal-300/80">Clinix Health v2.4</span>
        </div>
      </div>

      {/* RIGHT: Fresh, Modern Registration Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-lg space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 tracking-tight">
              Create Patient Account
            </h2>
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
                  Mobile Number (Optional)
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
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password *
                </label>
                {password && (
                  <span className="text-[10px] font-bold text-slate-500">
                    Strength: <span className="text-slate-800">{strength.label}</span>
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

              {/* Password Strength Indicator Bar */}
              {password && (
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              )}
            </div>

            {/* Terms checkbox disclaimer */}
            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              By creating an account, you agree to Clinix&apos;s healthcare service terms and clinical confidentiality standards.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <span>Setting up your account...</span>
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
