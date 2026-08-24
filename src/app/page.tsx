"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Calendar,
  BarChart3,
  Bell,
  Moon,
  Shield,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [touchFlipped, setTouchFlipped] = useState<{ [key: number]: boolean }>({});
  const touchStartX = useRef<number | null>(null);

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
  }, []);

  const getDashboardPath = () => {
    if (!currentUser) return "/register";
    if (currentUser.role === "PATIENT") return "/patient";
    if (currentUser.role === "DOCTOR") return "/doctor";
    if (currentUser.role === "ADMIN") return "/admin";
    return "/patient";
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (cardId: number, e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = Math.abs(touchEndX - touchStartX.current);
    // If swiped horizontally more than 30px or tapped
    if (diff > 30 || diff < 10) {
      setTouchFlipped((prev) => ({
        ...prev,
        [cardId]: !prev[cardId],
      }));
    }
    touchStartX.current = null;
  };

  const steps = [
    {
      id: 1,
      num: "1",
      title: "Find your doctor",
      frontDesc: "Search by medical specialization, view verified availability, and temporarily reserve a slot.",
      backTitle: "Smart Reservation",
      backDesc: "5-minute temporary slot hold with database concurrency protection so you never get double-booked.",
      bulletPoints: [
        "Specialist physician search",
        "5-minute slot lock protection",
        "Real-time calendar availability",
      ],
    },
    {
      id: 2,
      num: "2",
      title: "Describe your symptoms",
      frontDesc: "Submit symptoms beforehand for structured pre-visit triage and tailored doctor preparation.",
      backTitle: "Clinical Intake",
      backDesc: "Urgency grading (Low, Medium, High) and 3 suggested consultation questions generated for you.",
      bulletPoints: [
        "Structured chief complaint triage",
        "Clinical urgency assessment",
        "3 consultation questions prep",
      ],
    },
    {
      id: 3,
      num: "3",
      title: "Get your care plan",
      frontDesc: "Receive prescriptions, patient-friendly summaries, and automated medication schedule alerts.",
      backTitle: "Care Continuity",
      backDesc: "Direct Google Calendar sync, medication schedule cron alerts, and clear post-visit instructions.",
      bulletPoints: [
        "Clear care plan summaries",
        "Automated dosage reminders",
        "Google Calendar integration",
      ],
    },
  ];

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION — Left-aligned text, right-aligned photo
      ═══════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[90vh] flex items-center bg-cover bg-[right_center]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80')`,
        }}
      >
        {/* Solid dark warm panel on left 55% of the screen for 100% text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C1810] via-[#2C1810]/95 sm:via-[#2C1810]/85 to-transparent w-full md:w-[60%]" />
        <div className="absolute inset-0 bg-[#2C1810]/25" />

        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-start">
          <div className="max-w-lg space-y-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white leading-[1.1] tracking-tight">
              Quality healthcare,<br />
              one appointment at a time
            </h1>
            <p className="text-base sm:text-lg text-[#FAF6F1]/90 max-w-md leading-relaxed font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
              Clinix is a calm, focused healthcare platform that helps you book appointments, track prescriptions, and follow up — with zero distractions.
            </p>
            <div className="pt-2">
              {currentUser ? (
                <Link href={getDashboardPath()} className="btn-amber !text-base shadow-md">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link href="/register" className="btn-amber !text-base shadow-md">
                  <span>Get started free</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES SECTION — Minimalist Preview Card + Grid
      ═══════════════════════════════════════════════════════ */}
      <section id="features" className="bg-cream py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Product UI Preview (Matching Continuum Reference Card) */}
            <div className="bg-white rounded-3xl shadow-lg border border-warm-200/60 p-6 max-w-sm mx-auto lg:mx-0">
              <div className="flex items-center space-x-1.5 mb-5">
                <div className="w-3 h-3 rounded-full bg-warm-300" />
                <div className="w-3 h-3 rounded-full bg-warm-200" />
                <div className="w-3 h-3 rounded-full bg-warm-100" />
              </div>
              <p className="text-xs text-warm-400 font-medium">Good morning</p>
              <h4 className="text-lg font-serif font-bold text-warm-900 mt-0.5">Your daily routine</h4>
              <p className="text-xs text-warm-400 mt-0.5">Tuesday, Aug 25 · 2 of 4 completed</p>

              {/* Minimalist Progress Meter */}
              <div className="flex items-center justify-center my-6">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" stroke="#EDE4D8" strokeWidth="6" fill="none" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#E8A838"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${Math.PI * 68 * 0.5} ${Math.PI * 68}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-warm-900">50%</span>
                </div>
              </div>

              {/* Routine Checklist */}
              <div className="space-y-3">
                {[
                  { name: "Doctor consultation", color: "bg-brand-500", done: true },
                  { name: "Review care instructions", color: "bg-warm-600", done: true },
                  { name: "Take morning medication", color: "bg-amber-500", done: false },
                  { name: "Evening health log", color: "bg-warm-400", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-warm-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-sm text-warm-700">{item.name}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.done ? "border-brand-500 bg-brand-500" : "border-warm-300"}`}>
                      {item.done && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Feature Grid */}
            <div>
              <span className="section-label">Features</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-warm-900 mt-3 leading-tight">
                Everything you need,<br />nothing you don&apos;t
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {[
                  {
                    icon: Clock,
                    title: "Smart scheduling",
                    desc: "Book appointments with real-time doctor availability. Never worry about double-bookings.",
                  },
                  {
                    icon: Calendar,
                    title: "Calendar sync",
                    desc: "Sync with Google Calendar so you never miss a visit. One-click setup.",
                  },
                  {
                    icon: BarChart3,
                    title: "Health insights",
                    desc: "Pre-visit triage, symptom tracking, and urgency scoring — all the stats that matter.",
                  },
                  {
                    icon: Bell,
                    title: "Gentle reminders",
                    desc: "Automated medication schedules and appointment reminders, right on time.",
                  },
                  {
                    icon: Moon,
                    title: "Care plans",
                    desc: "Patient-friendly post-visit summaries and clear care instructions from your doctor.",
                  },
                  {
                    icon: Shield,
                    title: "Secure & private",
                    desc: "Your medical and prescription records stay safe, confidential, and protected.",
                  },
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="warm-card">
                      <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center text-warm-700 mb-3">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-warm-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {feature.title}
                      </h4>
                      <p className="text-xs text-warm-600 mt-1.5 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS — 3D Flashcards (Hover on Desktop, Swipe on Mobile)
      ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-cream-dark py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-warm-900 mt-3">
              Three steps to better healthcare
            </h2>
          </div>

          {/* 3D Flashcards Grid: Desktop Hover / Mobile Touch Swipe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const isTouchFlipped = touchFlipped[step.id] || false;

              return (
                <div
                  key={step.id}
                  onClick={() => setTouchFlipped((prev) => ({ ...prev, [step.id]: !prev[step.id] }))}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={(e) => handleTouchEnd(step.id, e)}
                  className="flashcard-container min-h-[300px] cursor-pointer select-none"
                >
                  <div className={`flashcard-inner ${isTouchFlipped ? "is-flipped" : ""}`}>
                    {/* ─── FRONT SIDE ─── */}
                    <div className="card-front bg-white rounded-3xl p-8 border border-warm-200/80 shadow-xs flex flex-col items-center text-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-warm-800 text-white flex items-center justify-center font-bold text-lg mb-5 shadow-xs">
                        {step.num}
                      </div>
                      <h4 className="text-lg font-bold text-warm-900 mb-2.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-warm-500 leading-relaxed max-w-xs">
                        {step.frontDesc}
                      </p>
                    </div>

                    {/* ─── BACK SIDE (Turned 180deg) ─── */}
                    <div className="card-back bg-warm-900 text-white rounded-3xl p-8 shadow-md border border-warm-800 flex flex-col justify-center text-left">
                      <div className="text-xs font-mono text-amber-300 uppercase tracking-wider mb-1">
                        Step {step.num} Details
                      </div>
                      <h5 className="text-base font-serif text-white mb-2">
                        {step.backTitle}
                      </h5>
                      <p className="text-xs text-warm-300 mb-4 leading-relaxed">
                        {step.backDesc}
                      </p>
                      <ul className="space-y-2 text-xs text-warm-200">
                        {step.bulletPoints.map((pt, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          REVIEWS SECTION
      ═══════════════════════════════════════════════════════ */}
      <section id="reviews" className="bg-cream py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-label">Reviews</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-warm-900 mt-3">
              Loved by our patients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote: "Finally a healthcare app that doesn't try to overwhelm you. Just me and my appointments.",
                name: "Priya Kapoor",
                role: "Regular patient",
              },
              {
                quote: "The pre-visit triage is incredible. My doctor already knew my concerns before I walked in.",
                name: "Rahul Mehta",
                role: "Software engineer",
              },
              {
                quote: "Love the medication reminders. Seeing my care plan visually keeps me on track.",
                name: "Ananya Singh",
                role: "Graduate student",
              },
              {
                quote: "Simple, clean, no ads. This is what every patient portal should be. The calendar sync is perfect too.",
                name: "Dr. Nisha Rao",
                role: "Consultant physician",
              },
            ].map((review, i) => (
              <div key={i} className="warm-card relative">
                <span className="absolute top-5 right-5 text-5xl text-warm-200 font-serif leading-none select-none">&ldquo;</span>
                <div className="star-rating mb-3">★★★★★</div>
                <p className="text-warm-700 text-sm leading-relaxed pr-8">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="flex items-center space-x-3 mt-5">
                  <div className="w-10 h-10 rounded-full bg-warm-200 flex items-center justify-center text-warm-700 font-serif text-sm font-bold">
                    {review.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-warm-900">{review.name}</p>
                    <p className="text-xs text-warm-400">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
