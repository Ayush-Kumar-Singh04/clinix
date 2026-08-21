"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Activity, Calendar, User, LogOut, ShieldAlert, Stethoscope, ChevronDown, Bell } from "lucide-react";

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

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-900 via-brand-700 to-teal-600 bg-clip-text text-transparent">
              Clinix
            </span>
            <span className="block text-[10px] text-slate-400 -mt-1 font-medium uppercase tracking-wider">
              Clinical Care Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          <Link
            href="/"
            className={`px-3.5 py-2 rounded-lg transition-colors ${
              pathname === "/" ? "text-brand-700 bg-brand-50 font-semibold" : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
            }`}
          >
            Home
          </Link>

          {currentUser?.role === "PATIENT" && (
            <>
              <Link
                href="/patient"
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  pathname.startsWith("/patient") && !pathname.includes("/doctors")
                    ? "text-brand-700 bg-brand-50 font-semibold"
                    : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/patient/doctors"
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  pathname.includes("/doctors") ? "text-brand-700 bg-brand-50 font-semibold" : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                }`}
              >
                Book Doctor
              </Link>
              <Link
                href="/patient/prescriptions"
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  pathname.includes("/prescriptions") ? "text-brand-700 bg-brand-50 font-semibold" : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                }`}
              >
                Medications
              </Link>
            </>
          )}

          {currentUser?.role === "DOCTOR" && (
            <Link
              href="/doctor"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                pathname.startsWith("/doctor") ? "text-teal-700 bg-teal-50 font-semibold" : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
              }`}
            >
              Doctor Portal
            </Link>
          )}

          {currentUser?.role === "ADMIN" && (
            <Link
              href="/admin"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                pathname.startsWith("/admin") ? "text-purple-700 bg-purple-50 font-semibold" : "text-slate-600 hover:text-purple-600 hover:bg-slate-50"
              }`}
            >
              Admin Portal
            </Link>
          )}
        </nav>

        {/* User Account / Auth Buttons */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                {currentUser.role}
              </span>
              <div className="flex items-center space-x-2 border-l pl-3 border-slate-200">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs border border-brand-200">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden lg:inline text-sm font-medium text-slate-700">{currentUser.name}</span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-500/20 transition-all hover:shadow-md"
              >
                Book Appointment
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
