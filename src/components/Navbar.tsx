"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LogOut, ArrowRight } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        const u = data.data?.user || data.user;
        if (data.success && u) {
          setCurrentUser(u);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    router.push("/login");
  };

  const isLanding = pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-[#F5EFEB]/95 backdrop-blur-md border-b-2 border-warm-300/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo (Aligned Left) */}
        <div className="flex-1 flex items-center justify-start">
          <Link href="/" className="group inline-flex items-center">
            <Logo size={32} />
          </Link>
        </div>

        {/* Center: Navigation Links (Strictly Centered) */}
        <nav className="hidden md:flex items-center justify-center space-x-1.5 text-sm font-semibold">
          {isLanding && !currentUser && (
            <>
              <a
                href="#features"
                className="px-3.5 py-1.5 rounded-xl transition-colors text-warm-700 hover:text-slate-900 hover:bg-white/80"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="px-3.5 py-1.5 rounded-xl transition-colors text-warm-700 hover:text-slate-900 hover:bg-white/80"
              >
                How it works
              </a>
              <a
                href="#reviews"
                className="px-3.5 py-1.5 rounded-xl transition-colors text-warm-700 hover:text-slate-900 hover:bg-white/80"
              >
                Reviews
              </a>
            </>
          )}

          {!isLanding && (
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl transition-colors text-warm-700 hover:text-slate-900 hover:bg-white/80"
            >
              Home
            </Link>
          )}

          {currentUser?.role === "PATIENT" && (
            <>
              <Link
                href="/patient"
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith("/patient") && !pathname.includes("/doctors") && !pathname.includes("/prescriptions")
                    ? "text-slate-900 bg-white border border-warm-300 shadow-xs font-bold"
                    : "text-warm-700 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/patient/doctors"
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  pathname.includes("/doctors")
                    ? "text-slate-900 bg-white border border-warm-300 shadow-xs font-bold"
                    : "text-warm-700 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                Book Doctor
              </Link>
              <Link
                href="/patient/prescriptions"
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  pathname.includes("/prescriptions")
                    ? "text-slate-900 bg-white border border-warm-300 shadow-xs font-bold"
                    : "text-warm-700 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                Medications
              </Link>
            </>
          )}

          {currentUser?.role === "DOCTOR" && (
            <>
              <Link
                href="/doctor"
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  pathname === "/doctor"
                    ? "text-slate-900 bg-white border border-warm-300 shadow-xs font-bold"
                    : "text-warm-700 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/doctor/leave"
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith("/doctor/leave")
                    ? "text-slate-900 bg-white border border-warm-300 shadow-xs font-bold"
                    : "text-warm-700 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                Apply Leave
              </Link>
            </>
          )}

          {currentUser?.role === "ADMIN" && (
            <>
              <Link
                href="/admin"
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  pathname === "/admin"
                    ? "text-slate-900 bg-white border border-warm-300 shadow-xs font-bold"
                    : "text-warm-700 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/doctors"
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  pathname === "/admin/doctors"
                    ? "text-slate-900 bg-white border border-warm-300 shadow-xs font-bold"
                    : "text-warm-700 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                Doctor Staff
              </Link>
              <Link
                href="/admin/leave"
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith("/admin/leave")
                    ? "text-slate-900 bg-white border border-warm-300 shadow-xs font-bold"
                    : "text-warm-700 hover:text-slate-900 hover:bg-white/80"
                }`}
              >
                Doctor Leaves & Conflicts
              </Link>
            </>
          )}
        </nav>

        {/* Right Side: Auth / User Info (Aligned Right) */}
        <div className="flex-1 flex items-center justify-end space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900 text-amber-300 border border-slate-800 uppercase tracking-wider shadow-xs">
                {currentUser.role}
              </span>
              <div className="flex items-center space-x-2.5 border-l-2 pl-3 border-warm-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs border border-white shadow-sm overflow-hidden shrink-0">
                  {currentUser.doctor?.avatarUrl || currentUser.avatarUrl ? (
                    <img
                      src={currentUser.doctor?.avatarUrl || currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.name.charAt(0)}</span>
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-bold text-slate-800">
                  {currentUser.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-warm-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold transition-colors text-warm-800 hover:text-slate-900"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-amber !py-2 !px-5 !text-xs shadow-sm font-bold"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
