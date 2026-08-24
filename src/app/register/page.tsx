"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-[calc(100vh-4rem)] flex bg-cream">
      {/* Left: Atmospheric Healthcare Photo Panel with Solid Dark Contrast Scrim */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative flex-col justify-end p-12 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80')`,
        }}
      >
        {/* Rich dark gradient overlay for 100% font legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-warm-950/95 via-warm-950/75 to-warm-900/40" />

        {/* Bottom Editorial Content inside a high-contrast dark callout */}
        <div className="relative z-10 bg-[#2C1810]/85 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-2.5 max-w-md shadow-2xl">
          <h2 className="text-2xl lg:text-3xl font-serif text-white leading-snug">
            Start your path to<br />thoughtful healthcare
          </h2>
          <p className="text-[#FAF6F1]/90 text-xs leading-relaxed font-light">
            Create your account to consult verified specialists, receive clear clinical care plans, and keep your health journey on schedule.
          </p>
        </div>
      </div>

      {/* Right: Distinct Auth Card Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-warm-900">Create your account</h2>
            <p className="text-sm text-warm-500">Book consultations & track your care plans</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-7 sm:p-8 rounded-3xl border border-warm-200/80 shadow-md space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1 input-popout-group">
              <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-warm-200 rounded-xl text-sm bg-warm-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none text-warm-900 placeholder:text-warm-400 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1 input-popout-group">
              <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="aarav.sharma@example.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-warm-200 rounded-xl text-sm bg-warm-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none text-warm-900 placeholder:text-warm-400 transition-all"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1 input-popout-group">
              <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-warm-200 rounded-xl text-sm bg-warm-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 outline-none text-warm-900 placeholder:text-warm-400 transition-all"
                />
              </div>
            </div>

            {/* Password with Eye Visibility Toggle */}
            <div className="space-y-1 input-popout-group">
              <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
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
              <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 border-t border-warm-100">
              <span className="text-xs text-warm-500">Already registered? </span>
              <Link href="/login" className="text-xs font-bold text-brand-700 hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
