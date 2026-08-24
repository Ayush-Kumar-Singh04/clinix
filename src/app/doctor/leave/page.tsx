"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Trash2,
  CalendarOff,
  Stethoscope,
  Info,
  ChevronRight,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default function DoctorLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [leaveDate, setLeaveDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [leaveType, setLeaveType] = useState("Personal Leave");
  const [customNotes, setCustomNotes] = useState("");
  const [autoResolve, setAutoResolve] = useState(false);

  // Audit / Conflict State
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Status message
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/doctor/leave");
      const data = await res.json();
      if (data.success) {
        setDoctorInfo(data.data.doctor);
        setLeaves(data.data.leaves || []);
      }
    } catch (err) {
      console.error("Failed to load doctor leaves", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Whenever leaveDate changes, run a live clash check
  useEffect(() => {
    if (!leaveDate) return;
    checkDateClashes(leaveDate);
  }, [leaveDate]);

  const checkDateClashes = async (date: string) => {
    setIsAuditing(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/doctor/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveDate: date,
          previewOnly: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data.data);
      }
    } catch (err) {
      console.error("Audit error", err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    const finalReason = customNotes.trim()
      ? `${leaveType}: ${customNotes.trim()}`
      : leaveType;

    try {
      const res = await fetch("/api/doctor/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveDate,
          reason: finalReason,
          previewOnly: false,
          autoResolveClashes: autoResolve,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error?.message || "Failed to apply for leave");
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(data.data.message || "Leave successfully scheduled!");
      setCustomNotes("");
      fetchLeaves();
      checkDateClashes(leaveDate);
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLeave = async (leaveId: string, date: string) => {
    if (!confirm(`Are you sure you want to cancel your leave for ${formatDate(date)}? You will become available for bookings again.`)) {
      return;
    }

    setDeletingId(leaveId);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/doctor/leave/${leaveId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.data.message);
        fetchLeaves();
        if (leaveDate === date) {
          checkDateClashes(date);
        }
      } else {
        setErrorMsg(data.error?.message || "Failed to delete leave");
      }
    } catch (err) {
      setErrorMsg("Failed to delete leave record.");
    } finally {
      setDeletingId(null);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div
        className="dashboard-hero p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1400&q=80')`,
        }}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-brand-300">
            <CalendarOff className="w-3.5 h-3.5" />
            <span>Physician Availability & Schedule Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight">Apply for Leave & Schedule Off-Duty</h1>
          <p className="text-xs sm:text-sm text-warm-300">
            Schedule planned leaves, review real-time booking conflicts with existing patient appointments, and sync with Admin.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/doctor"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-full border border-white/20 transition-all flex items-center space-x-2"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Consultation Queue</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-rose-600 hover:text-rose-800 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Application Form (Left) & Scheduled Leaves (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Leave Application Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-warm-200/80 shadow-sm space-y-6">
            <div className="border-b border-warm-100 pb-4">
              <h2 className="text-lg font-serif text-warm-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                Submit Leave Application
              </h2>
              <p className="text-xs text-warm-500 mt-1">
                Select your intended off-duty date. Our live clash detector will audit existing patient bookings.
              </p>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="block font-bold text-warm-800 uppercase tracking-wider text-[11px]">
                  Leave Date *
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full p-3 border border-warm-200 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-brand-500 bg-warm-50/50 focus:bg-white text-warm-900 transition-all"
                />
              </div>

              {/* Leave Reason Type */}
              <div className="space-y-1.5">
                <label className="block font-bold text-warm-800 uppercase tracking-wider text-[11px]">
                  Leave Category *
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-3 border border-warm-200 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-brand-500 bg-warm-50/50 focus:bg-white text-warm-900 transition-all"
                >
                  <option value="Personal Leave">Personal Leave / Family Event</option>
                  <option value="Medical Emergency">Medical Emergency / Illness</option>
                  <option value="Academic Conference / CME">Academic Conference / CME Training</option>
                  <option value="Annual Vacation">Annual Vacation</option>
                  <option value="Hospital On-Call Duty">Hospital External On-Call Duty</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              {/* Specific Notes */}
              <div className="space-y-1.5">
                <label className="block font-bold text-warm-800 uppercase tracking-wider text-[11px]">
                  Reason Notes / Message to Admin (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Attending Cardiology Summit 2026, or family emergency..."
                  className="w-full p-3 border border-warm-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 bg-warm-50/50 focus:bg-white text-warm-900 transition-all text-xs"
                />
              </div>

              {/* Live Clash Audit Result Box */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-warm-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Date Conflict Audit</span>
                  {isAuditing && (
                    <span className="flex items-center text-brand-600 gap-1 text-[10px]">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking clashes...
                    </span>
                  )}
                </div>

                {auditResult && (
                  <div>
                    {auditResult.clashCount === 0 ? (
                      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>0 Conflicts Detected</span>
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          No existing appointments are booked on {formatDate(leaveDate)}. You can safely apply without impacting patients.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                            <span>{auditResult.clashCount} Patient Appointment(s) Clashing</span>
                          </div>
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                            Action Needed
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {auditResult.clashingAppointments.map((appt: any) => (
                            <div
                              key={appt.id}
                              className="p-2.5 bg-white rounded-xl border border-amber-200 text-[11px] flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-warm-900">{appt.patientName}</span>
                                <div className="text-warm-500 text-[10px]">{appt.patientEmail}</div>
                              </div>
                              <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                                {formatTime(appt.startTime)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <label className="flex items-start space-x-2 pt-2 border-t border-amber-200/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoResolve}
                            onChange={(e) => setAutoResolve(e.target.checked)}
                            className="mt-0.5 rounded border-amber-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="text-[11px] text-amber-900 font-medium">
                            Automatically cancel conflicting appointments and email rebooking notifications to affected patients.
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || isAuditing}
                  className="w-full btn-amber !py-3 !text-xs justify-center shadow-md flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scheduling Leave & Syncing Admin...</span>
                    </>
                  ) : (
                    <>
                      <CalendarOff className="w-4 h-4" />
                      <span>Confirm & Apply for Leave</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Scheduled Leaves & History (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-warm-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-warm-100 pb-4">
              <div>
                <h2 className="text-lg font-serif text-warm-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-600" />
                  My Scheduled Leaves & History
                </h2>
                <p className="text-xs text-warm-500 mt-1">
                  Active off-duty dates, conflict resolution status, and leave withdrawal.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-warm-100 text-warm-800 rounded-full border border-warm-200">
                {leaves.length} Recorded
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-warm-400 animate-pulse text-xs">
                Loading your leave records...
              </div>
            ) : leaves.length === 0 ? (
              <div className="p-10 text-center rounded-2xl border border-dashed border-warm-200 bg-warm-50/50 space-y-3">
                <CalendarOff className="w-10 h-10 text-warm-300 mx-auto" />
                <h3 className="text-sm font-bold text-warm-700">No Leaves Scheduled</h3>
                <p className="text-xs text-warm-500 max-w-sm mx-auto">
                  You have not scheduled any upcoming leaves. Use the application form on the left whenever you need time off.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {leaves.map((l) => {
                  const isUpcoming = l.leaveDate >= todayStr;
                  const hasActiveClashes = l.activeClashesCount > 0;

                  return (
                    <div
                      key={l.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        hasActiveClashes
                          ? "bg-amber-50/40 border-amber-200"
                          : isUpcoming
                          ? "bg-cream/60 border-warm-200 hover:border-brand-300"
                          : "bg-warm-50/60 border-warm-200/60 opacity-80"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2.5">
                            <span className="text-sm font-bold text-warm-900 font-serif">
                              {formatDate(l.leaveDate)}
                            </span>
                            {isUpcoming ? (
                              <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-2.5 py-0.5 rounded-full border border-brand-200">
                                UPCOMING
                              </span>
                            ) : (
                              <span className="text-[10px] bg-warm-200 text-warm-700 font-bold px-2.5 py-0.5 rounded-full">
                                PAST
                              </span>
                            )}

                            {hasActiveClashes ? (
                              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                {l.activeClashesCount} Clashing
                              </span>
                            ) : (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                0 Clashes
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-warm-700 font-medium">
                            <span className="font-bold text-warm-900">Reason: </span>
                            {l.reason || "Scheduled Leave"}
                          </div>

                          {/* Clashing Appointments details if any */}
                          {hasActiveClashes && (
                            <div className="mt-2 p-3 bg-white/90 rounded-xl border border-amber-200 text-xs space-y-1.5">
                              <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wider block">
                                Impacted Patient Bookings:
                              </span>
                              <div className="space-y-1">
                                {l.clashingAppointments?.map((appt: any) => (
                                  <div key={appt.id} className="flex items-center justify-between text-[11px] text-warm-800">
                                    <span>{appt.patientName} ({formatTime(appt.startTime)})</span>
                                    <span className="text-warm-500">{appt.symptoms}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {l.resolvedClashesCount > 0 && !hasActiveClashes && (
                            <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{l.resolvedClashesCount} patient appointment(s) were automatically notified & rebooked.</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {isUpcoming && (
                          <button
                            onClick={() => handleDeleteLeave(l.id, l.leaveDate)}
                            disabled={deletingId === l.id}
                            className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 font-semibold transition-colors flex items-center space-x-1 self-start shrink-0"
                            title="Cancel this leave"
                          >
                            {deletingId === l.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            <span>Cancel Leave</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
