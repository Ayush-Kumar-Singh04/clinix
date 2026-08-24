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

  // Helper to get the dashboard path for the current user
  const getDashboardPath = () => {
    if (!currentUser) return "/register";
    if (currentUser.role === "PATIENT") return "/patient";
    if (currentUser.role === "DOCTOR") return "/doctor";
    if (currentUser.role === "ADMIN") return "/admin";
    return "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6F1]/95 backdrop-blur-md border-b border-warm-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo (Aligned Left) */}
        <div className="flex-1 flex items-center justify-start">
          <Link href="/" className="group inline-flex items-center">
            <Logo size={32} />
          </Link>
        </div>

        {/* Center: Navigation Links (Strictly Centered) */}
        <nav className="hidden md:flex items-center justify-center space-x-1.5 text-sm font-medium">
          {isLanding && !currentUser && (
            <>
              <a
                href="#features"
                className="px-4 py-2 rounded-xl transition-colors text-warm-700 hover:text-brand-600 hover:bg-warm-100/60"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="px-4 py-2 rounded-xl transition-colors text-warm-700 hover:text-brand-600 hover:bg-warm-100/60"
              >
                How it works
              </a>
              <a
                href="#reviews"
                className="px-4 py-2 rounded-xl transition-colors text-warm-700 hover:text-brand-600 hover:bg-warm-100/60"
              >
                Reviews
              </a>
            </>
          )}

          {!isLanding && (
            <Link
              href="/"
              className="px-4 py-2 rounded-xl transition-colors text-warm-700 hover:text-warm-900 hover:bg-warm-100/60"
            >
              Home
            </Link>
          )}

          {currentUser?.role === "PATIENT" && (
            <>
              <Link
                href="/patient"
                className={`px-4 py-2 rounded-xl transition-colors ${
                  pathname.startsWith("/patient") && !pathname.includes("/doctors") && !pathname.includes("/prescriptions")
                    ? "text-brand-800 bg-brand-100 font-semibold"
                    : "text-warm-700 hover:text-warm-900 hover:bg-warm-100/60"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/patient/doctors"
                className={`px-4 py-2 rounded-xl transition-colors ${
                  pathname.includes("/doctors")
                    ? "text-brand-800 bg-brand-100 font-semibold"
                    : "text-warm-700 hover:text-warm-900 hover:bg-warm-100/60"
                }`}
              >
                Book Doctor
              </Link>
              <Link
                href="/patient/prescriptions"
                className={`px-4 py-2 rounded-xl transition-colors ${
                  pathname.includes("/prescriptions")
                    ? "text-brand-800 bg-brand-100 font-semibold"
                    : "text-warm-700 hover:text-warm-900 hover:bg-warm-100/60"
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
                className={`px-4 py-2 rounded-xl transition-colors ${
                  pathname === "/doctor"
                    ? "text-brand-800 bg-brand-100 font-semibold"
                    : "text-warm-700 hover:text-warm-900 hover:bg-warm-100/60"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/doctor/leave"
                className={`px-4 py-2 rounded-xl transition-colors ${
                  pathname.startsWith("/doctor/leave")
                    ? "text-brand-800 bg-brand-100 font-semibold"
                    : "text-warm-700 hover:text-warm-900 hover:bg-warm-100/60"
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
                className={`px-4 py-2 rounded-xl transition-colors ${
                  pathname === "/admin"
                    ? "text-brand-800 bg-brand-100 font-semibold"
                    : "text-warm-700 hover:text-warm-900 hover:bg-warm-100/60"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/leave"
                className={`px-4 py-2 rounded-xl transition-colors ${
                  pathname.startsWith("/admin/leave")
                    ? "text-brand-800 bg-brand-100 font-semibold"
                    : "text-warm-700 hover:text-warm-900 hover:bg-warm-100/60"
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
              <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-warm-100 text-warm-700 border border-warm-200 uppercase tracking-wide">
                {currentUser.role}
              </span>
              <div className="flex items-center space-x-2.5 border-l pl-3 border-warm-200">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200 shadow-2xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden lg:inline text-sm font-medium text-warm-800">
                  {currentUser.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-warm-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
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
                className="px-4 py-2 text-sm font-medium transition-colors text-warm-700 hover:text-brand-600"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-amber !py-2 !px-5 !text-sm"
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
