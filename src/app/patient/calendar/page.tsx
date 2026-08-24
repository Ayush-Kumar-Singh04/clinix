"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";

function CalendarSyncContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Card */}
      <div className="bg-white rounded-3xl border border-warm-200/80 p-8 sm:p-12 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl text-xs font-semibold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Calendar Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-warm-900 tracking-tight">
            Calendar Synchronization Active
          </h1>
          <p className="text-xs sm:text-sm text-warm-600">
            Your Google account is successfully linked. All upcoming medical consultations, doctor notes, and appointment reminders will now sync directly to your Google Calendar.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-4">
          <div className="p-4 rounded-2xl bg-warm-50/70 border border-warm-200/60 space-y-1.5">
            <Clock className="w-5 h-5 text-brand-600" />
            <h4 className="text-xs font-bold text-warm-900 font-serif">Instant Schedule Sync</h4>
            <p className="text-[11px] text-warm-600">
              New bookings immediately appear on your personal Google Calendar.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-warm-50/70 border border-warm-200/60 space-y-1.5">
            <CalendarCheck className="w-5 h-5 text-amber-600" />
            <h4 className="text-xs font-bold text-warm-900 font-serif">Smart Notifications</h4>
            <p className="text-[11px] text-warm-600">
              Receive Google Calendar push alerts 30 minutes before your consultation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-warm-50/70 border border-warm-200/60 space-y-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="text-xs font-bold text-warm-900 font-serif">Automatic Cleanups</h4>
            <p className="text-[11px] text-warm-600">
              Rescheduled or cancelled appointments automatically update without manual work.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-warm-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/patient"
            className="btn-amber !py-3 !px-8 !text-xs shadow-md flex items-center space-x-2"
          >
            <span>Return to Patient Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/patient/doctors"
            className="px-6 py-3 bg-warm-100 hover:bg-warm-200 text-warm-800 rounded-full font-bold text-xs transition-colors"
          >
            Book New Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PatientCalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-warm-400 text-sm animate-pulse">
          Connecting to Google Calendar...
        </div>
      }
    >
      <CalendarSyncContent />
    </Suspense>
  );
}
