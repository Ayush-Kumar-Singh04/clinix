import Link from "next/link";
import {
  Activity,
  Calendar,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Stethoscope,
  Bell,
  ArrowRight,
  UserCheck,
  Zap,
} from "lucide-react";
import AppointmentTimeline from "@/components/AppointmentTimeline";

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-teal-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Healthcare SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Healthcare appointments, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-400 via-sky-300 to-white bg-clip-text text-transparent">
              intelligently managed.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Book faster. Prepare better. Follow up smarter. Concurrency-safe scheduling with intelligent clinical summaries and automated care plans.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/patient/doctors"
              className="w-full sm:w-auto px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base rounded-2xl shadow-xl shadow-teal-500/20 transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Book an Appointment</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-2xl border border-white/20 transition-all flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>Explore Portals & Demo</span>
            </Link>
          </div>

          {/* Quick Stat Pill */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl font-black text-teal-400">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Double-Booking Guarded</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl font-black text-sky-400">5 Min</div>
              <div className="text-xs text-slate-400 mt-0.5">Temporary Slot Holds</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl font-black text-teal-300">Smart</div>
              <div className="text-xs text-slate-400 mt-0.5">Pre/Post Visit Summaries</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <div className="text-2xl font-black text-emerald-400">0% Risk</div>
              <div className="text-xs text-slate-400 mt-0.5">Non-blocking Failures</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How Clinix Works</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Seamless clinical workflow bridging patients, doctors, and healthcare administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-brand-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-800">Select Doctor & Hold Slot</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filter by medical specialization, view verified availability, and temporarily reserve a 30-minute slot with concurrency protection.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-teal-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-800">Smart Pre-Visit Intake</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit symptoms to generate structured clinical urgency triage, chief complaint extraction, and 3 suggested questions for your doctor.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-purple-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-800">Post-Visit Care & Reminders</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive patient-friendly care plans, structured prescriptions, Google Calendar sync, and automated medication schedule alerts.
            </p>
          </div>
        </div>
      </section>

      {/* Appointment Timeline Feature Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              <Zap className="w-3.5 h-3.5" />
              <span>End-to-End Care Lifecycle</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Complete Visual Appointment Tracking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never lose track of your healthcare journey. Clinix logs every critical milestone from initial symptom reporting to post-visit medication reminder execution.
            </p>
            <div className="pt-2">
              <Link
                href="/patient"
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center space-x-1"
              >
                <span>View Patient Timeline Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <AppointmentTimeline
              status="COMPLETED"
              hasSymptoms={true}
              hasAiSummary={true}
              hasPrescription={true}
              hasReminders={true}
            />
          </div>
        </div>
      </section>

      {/* Role Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">Designed for Every Healthcare Role</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Patient */}
          <div className="bg-gradient-to-br from-brand-50 to-white p-6 rounded-3xl border border-brand-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Patient Experience</h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Search doctors by cardiology, dermatology, etc.</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>5-minute temporary slot holding mechanism</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Google Calendar OAuth 2.0 sync</span>
              </li>
            </ul>
          </div>

          {/* Doctor */}
          <div className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-3xl border border-teal-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Doctor Portal</h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Priority-based symptom triage queue</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>3 suggested clinical questions per patient</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Structured prescription builder & care notes</span>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-3xl border border-purple-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Admin Control</h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Doctor Leave conflict audit & auto rebooking</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Recharts analytical dashboards & trends</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Notification queue monitoring with retries</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-800">How does Clinix prevent double-booking?</h4>
            <p className="text-xs text-slate-600 mt-1">
              Clinix enforces double-booking prevention at the database level with a unique constraint on <code>[doctorId, date, startTime]</code> executed inside isolation transactions.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-800">Are the clinical summaries making medical diagnoses?</h4>
            <p className="text-xs text-slate-600 mt-1">
              No. Clinical summaries are strictly workflow triage tools for healthcare professionals and patient-friendly translations of doctor instructions. They cannot alter prescriptions or make medical diagnoses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
