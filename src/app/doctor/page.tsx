"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  Filter,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [upcomingLeaves, setUpcomingLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    Promise.all([
      fetch("/api/appointments").then((res) => res.json()),
      fetch("/api/doctor/leave").then((res) => res.json()),
    ])
      .then(([apptsData, leavesData]) => {
        if (apptsData.success) {
          setAppointments(apptsData.data.appointments);
        }
        if (leavesData.success) {
          setUpcomingLeaves(leavesData.data.leaves || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const todayAppts = appointments.filter((a) => a.date === todayStr);
  const upcomingAppts = appointments.filter((a) => a.status === "UPCOMING" || a.status === "RESCHEDULED");
  const completedAppts = appointments.filter((a) => a.status === "COMPLETED");
  const cancelledAppts = appointments.filter((a) => a.status === "CANCELLED");

  const highPriorityAppts = appointments.filter(
    (a) => a.status === "UPCOMING" && a.urgency === "HIGH"
  );

  const activeLeavesUpcoming = upcomingLeaves.filter((l) => l.leaveDate >= todayStr);

  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter === "TODAY") return a.date === todayStr;
    if (statusFilter === "UPCOMING") return a.status === "UPCOMING" || a.status === "RESCHEDULED";
    if (statusFilter === "HIGH_PRIORITY") return a.urgency === "HIGH";
    if (statusFilter === "COMPLETED") return a.status === "COMPLETED";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Doctor Header Banner with Photo */}
      <div
        className="dashboard-hero p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1400&q=80')`,
        }}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-brand-300">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinician Workflow Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight">Today&apos;s Appointments & Triage</h1>
          <p className="text-xs sm:text-sm text-warm-300">
            Review patient symptoms, pre-visit chief complaints, publish care plans, and manage scheduled leaves.
          </p>
        </div>

        {/* Quick Actions & Stats Grid */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link
            href="/doctor/leave"
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <Calendar className="w-4 h-4 text-brand-300" />
            <span>Apply for Leave ({activeLeavesUpcoming.length} active)</span>
          </Link>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/15">
              <div className="text-lg font-black text-brand-300">{todayAppts.length}</div>
              <div className="text-[10px] text-warm-300">Today</div>
            </div>
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/15">
              <div className="text-lg font-black text-rose-300">{highPriorityAppts.length}</div>
              <div className="text-[10px] text-warm-300">High Pri</div>
            </div>
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/15">
              <div className="text-lg font-black text-emerald-300">{completedAppts.length}</div>
              <div className="text-[10px] text-warm-300">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* High Priority Alert Banner */}
      {highPriorityAppts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 text-rose-900 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>Action Required: {highPriorityAppts.length} High-Priority Symptoms Triaged</h4>
            <p className="text-xs text-rose-700">
              The pre-visit screening identified high-urgency symptoms for upcoming consultations. Please review chief complaints before consultation.
            </p>
          </div>
        </div>
      )}

      {/* Main Appointments Table */}
      <div className="bg-white rounded-2xl border border-warm-200/60 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-100 pb-4">
          <h2 className="text-lg font-serif text-warm-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            Patient Appointments Queue
          </h2>

          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
            {["ALL", "TODAY", "HIGH_PRIORITY", "UPCOMING", "COMPLETED"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                  statusFilter === f
                    ? "bg-warm-700 text-white shadow-sm"
                    : "bg-warm-100 text-warm-600 hover:bg-warm-200"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-warm-400 animate-pulse">Loading appointments schedule...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-8 text-center text-warm-400 text-xs">No appointments match selected filter.</div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appt) => (
              <div
                key={appt.id}
                className="p-5 rounded-2xl border border-warm-200/60 hover:border-brand-300 hover:shadow-md transition-all bg-cream/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        appt.urgency === "HIGH"
                          ? "bg-rose-100 text-rose-700 border border-rose-300"
                          : appt.urgency === "MEDIUM"
                          ? "bg-amber-100 text-amber-700 border border-amber-300"
                          : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                      }`}
                    >
                      Urgency: {appt.urgency}
                    </span>

                    <span className={appt.status === "COMPLETED" ? "badge-completed" : appt.status === "CANCELLED" ? "badge-cancelled" : "badge-upcoming"}>
                      {appt.status}
                    </span>

                    {appt.date === todayStr && (
                      <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-2 py-0.5 rounded-md">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-warm-900" style={{ fontFamily: "'Inter', sans-serif" }}>Patient: {appt.patient.name}</h3>
                    <div className="flex items-center space-x-4 text-xs text-warm-500 font-medium mt-0.5">
                      <span>{formatDate(appt.date)} at {formatTime(appt.startTime)}</span>
                      <span>•</span>
                      <span>Phone: {appt.patient.phone || "N/A"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-warm-700 font-medium line-clamp-1">
                    <strong className="text-warm-900">Chief Complaint:</strong> {appt.chiefComplaint || appt.symptoms}
                  </p>
                </div>

                <Link
                  href={`/doctor/appointments/${appt.id}`}
                  className="btn-amber !text-xs !py-2.5 !px-5 shrink-0"
                >
                  <span>{appt.status === "COMPLETED" ? "View Visit Record" : "Start Consultation"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
