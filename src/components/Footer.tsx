"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const pathname = usePathname();
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

  // Get dashboard path based on role
  const getDashboardPath = () => {
    if (!currentUser) return "/register";
    if (currentUser.role === "PATIENT") return "/patient";
    if (currentUser.role === "DOCTOR") return "/doctor";
    if (currentUser.role === "ADMIN") return "/admin";
    return "/";
  };

  // Use full paths (with /) so anchor links work from any page
  const isLanding = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const featuresHref = isLanding ? "#features" : "/#features";
  const howItWorksHref = isLanding ? "#how-it-works" : "/#how-it-works";
  const reviewsHref = isLanding ? "#reviews" : "/#reviews";

  return (
    <footer>
      {/* CTA Section with Background Image - Hidden on auth pages to avoid collision */}
      {!isAuthPage && (
        <section
          className="relative bg-cover bg-center py-24 sm:py-32"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-warm-900/75" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 text-center space-y-6">
            {currentUser ? (
              <>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white leading-tight">
                  Welcome back, {currentUser.name.split(" ")[0]}!
                </h2>
                <p className="text-base text-warm-300 max-w-lg mx-auto">
                  Continue managing your healthcare appointments and care plans.
                </p>
                <div className="pt-2">
                  <Link href={getDashboardPath()} className="btn-amber !text-base">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white leading-tight">
                  Ready to take care of your health?
                </h2>
                <p className="text-base text-warm-300 max-w-lg mx-auto">
                  Join thousands of patients using Clinix for smarter healthcare, one appointment at a time.
                </p>
                <div className="pt-2">
                  <Link href="/register" className="btn-amber !text-base">
                    <span>Get started free</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Cream Footer Bar */}
      <div className="bg-cream border-t border-warm-200/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="group inline-flex items-center">
            <Logo size={28} wordmarkClassName="!text-xl" />
          </Link>

          {/* Nav Links */}
          <nav className="flex flex-wrap items-center gap-6 text-sm text-warm-500 font-medium">
            <Link href={featuresHref} className="hover:text-warm-900 transition-colors">Features</Link>
            <Link href={howItWorksHref} className="hover:text-warm-900 transition-colors">How it works</Link>
            <Link href={reviewsHref} className="hover:text-warm-900 transition-colors">Reviews</Link>
            {currentUser ? (
              <Link href={getDashboardPath()} className="hover:text-warm-900 transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-warm-900 transition-colors">Sign in</Link>
                <Link href="/register" className="hover:text-warm-900 transition-colors">Get started</Link>
              </>
            )}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-warm-400">
            © 2026 Clinix
          </p>
        </div>
      </div>
    </footer>
  );
}
