"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  AlertTriangle,
  User,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Stethoscope,
  Trash2,
  Mail,
  ChevronRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export default function AdminDoctorLeaveManagementPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [leavesList, setLeavesList] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [leaveDate, setLeaveDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [reason, setReason] = useState("Medical conference / Emergency leave");
  const [previewData, setPreviewData] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFetchingLeaves, setIsFetchingLeaves] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = () => {
    setIsFetchingLeaves(true);
    // 1. Fetch doctors list
    fetch("/api/admin/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.doctors.length > 0) {
          setDoctors(data.data.doctors);
          if (!selectedDoctorId) {
            setSelectedDoctorId(data.data.doctors[0].id);
          }
        }
      });

    // 2. Fetch all doctor leaves
    fetch("/api/admin/leaves")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLeavesList(data.data.leaves || []);
        }
      })
      .finally(() => setIsFetchingLeaves(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAuditConflicts = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setPreviewData(null);
    setIsAuditing(true);

    try {
      const res = await fetch(`/api/admin/doctors/${selectedDoctorId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveDate,
          reason,
          confirm: false,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error?.message || "Audit failed");
        setIsAuditing(false);
        return;
      }

      setPreviewData(data.data);
    } catch (err) {
      setErrorMsg("Failed to connect to leave audit API.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleConfirmLeave = async (docId?: string, targetDate?: string, targetReason?: string) => {
    setIsExecuting(true);
    setErrorMsg("");

    const effectiveDoctorId = docId || selectedDoctorId;
    const effectiveDate = targetDate || leaveDate;
    const effectiveReason = targetReason || reason;

    try {
      const res = await fetch(`/api/admin/doctors/${effectiveDoctorId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveDate: effectiveDate,
          reason: effectiveReason,
          confirm: true,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error?.message || "Failed to execute leave resolution");
        setIsExecuting(false);
        return;
      }

      setSuccessMsg(data.data.message);
      setPreviewData(null);
      loadData();
    } catch (err) {
      setErrorMsg("An error occurred during conflict resolution.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDeleteLeave = async (leaveId: string, doctorName: string, date: string) => {
    if (!confirm(`Cancel leave record for Dr. ${doctorName} on ${formatDate(date)}?`)) {
      return;
    }
    setDeletingId(leaveId);
    try {
      const res = await fetch(`/api/doctor/leave/${leaveId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.data.message);
        loadData();
      } else {
        setErrorMsg(data.error?.message || "Failed to delete leave");
      }
    } catch (err) {
      setErrorMsg("Failed to delete leave");
    } finally {
      setDeletingId(null);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const clashingLeaves = leavesList.filter((l) => l.activeClashesCount > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div
        className="dashboard-hero p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1400&q=80')`,
        }}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-brand-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Operational Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight">Doctor Leave & Clash Conflict Resolution</h1>
          <p className="text-xs sm:text-sm text-warm-300">
            Monitor physician leave requests, audit clashing patient appointments, and execute batch cancellations with automatic rebooking notices.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={loadData}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-full border border-white/20 transition-all flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Clashes</span>
          </button>
          <Link
            href="/admin"
            className="btn-amber !text-xs !py-2.5 shrink-0"
          >
            <span>Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Status Notifications */}
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

      {/* Clashing Leaves Alert Banner */}
      {clashingLeaves.length > 0 && (
        <div className="p-5 bg-amber-50 border border-amber-300 rounded-3xl text-amber-900 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {clashingLeaves.length} Doctor Leave Request(s) Have Clashing Patient Bookings
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Review the clashing dates below and execute automated rebooking notices to free up physician schedules.
                </p>
              </div>
            </div>
            <span className="text-xs font-extrabold bg-amber-200 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
              Admin Action Required
            </span>
          </div>
        </div>
      )}

      {/* Live Clashing & Submitted Doctor Leaves Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-100 pb-4">
          <div>
            <h2 className="text-lg font-serif text-warm-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              Active Physician Leave Requests & Clashing Schedule
            </h2>
            <p className="text-xs text-warm-500 mt-0.5">
              Overview of all doctor leave dates submitted via the Doctor Portal or designated by Admin.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1.5 bg-warm-100 text-warm-800 rounded-full border border-warm-200">
            {leavesList.length} Total Leave Dates
          </span>
        </div>

        {isFetchingLeaves ? (
          <div className="py-12 text-center text-warm-400 animate-pulse text-xs">
            Loading physician leave applications...
          </div>
        ) : leavesList.length === 0 ? (
          <div className="p-8 text-center text-warm-400 text-xs bg-warm-50/50 rounded-2xl border border-dashed border-warm-200">
            No doctor leaves currently recorded in the system.
          </div>
        ) : (
          <div className="space-y-4">
            {leavesList.map((leave) => {
              const isUpcoming = leave.leaveDate >= todayStr;
              const hasClashes = leave.activeClashesCount > 0;

              return (
                <div
                  key={leave.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    hasClashes
                      ? "bg-amber-50/50 border-amber-300 shadow-sm"
                      : isUpcoming
                      ? "bg-cream/50 border-warm-200"
                      : "bg-warm-50/40 border-warm-200/60 opacity-80"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs border border-brand-200">
                          {leave.doctorName?.charAt(0) || "D"}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-warm-900">
                            Dr. {leave.doctorName}{" "}
                            <span className="text-xs font-normal text-warm-500">
                              ({leave.specialization})
                            </span>
                          </div>
                          <div className="text-[11px] text-warm-400">{leave.doctorEmail}</div>
                        </div>

                        <span className="font-mono font-bold text-xs bg-warm-100 text-warm-800 px-3 py-1 rounded-xl border border-warm-200">
                          {formatDate(leave.leaveDate)}
                        </span>

                        {hasClashes ? (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            {leave.activeClashesCount} Patient Clashes
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            0 Active Clashes
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-warm-700">
                        <span className="font-bold text-warm-900">Reason: </span>
                        {leave.reason || "Physician Leave"}
                      </div>

                      {/* Expandable Clashing Appointment Details */}
                      {hasClashes && (
                        <div className="mt-3 p-3.5 bg-white/95 rounded-xl border border-amber-200 text-xs space-y-2">
                          <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wider block">
                            Clashing Patient Appointments on {formatDate(leave.leaveDate)}:
                          </span>
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {leave.activeClashes.map((appt: any) => (
                              <div
                                key={appt.id}
                                className="p-2 bg-amber-50/50 rounded-lg border border-amber-100 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-900">{appt.patientName}</span>{" "}
                                  <span className="text-slate-500 text-[11px]">({appt.patientEmail})</span>
                                  <div className="text-[11px] text-slate-500">Symptoms: {appt.symptoms}</div>
                                </div>
                                <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                                  {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Admin Actions */}
                    <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                      {hasClashes && (
                        <button
                          onClick={() => handleConfirmLeave(leave.doctorId, leave.leaveDate, leave.reason)}
                          disabled={isExecuting}
                          className="btn-amber !text-xs !py-2 !px-4 shadow-sm flex items-center space-x-1.5"
                        >
                          {isExecuting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Resolve Clashes & Notify Patients</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteLeave(leave.id, leave.doctorName, leave.leaveDate)}
                        disabled={deletingId === leave.id}
                        className="px-3 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 font-semibold transition-colors flex items-center space-x-1"
                        title="Delete leave"
                      >
                        {deletingId === leave.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Cancel Leave</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Admin Leave Designation Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-200/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-serif text-warm-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-brand-600" />
            Designate Leave on Behalf of a Physician
          </h2>
          <p className="text-xs text-warm-500 mt-0.5">
            Admins can designate scheduled or emergency leave for any doctor, audit conflicts, and automatically release booked slots.
          </p>
        </div>

        <form onSubmit={handleAuditConflicts} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-warm-800 uppercase tracking-wider text-[11px]">Select Doctor *</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full p-3 border border-warm-200 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-brand-500 mt-1 bg-warm-50/50 focus:bg-white text-warm-900"
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.user.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-warm-800 uppercase tracking-wider text-[11px]">Leave Date *</label>
            <input
              type="date"
              required
              min={todayStr}
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="w-full p-3 border border-warm-200 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-brand-500 mt-1 bg-warm-50/50 focus:bg-white text-warm-900"
            />
          </div>

          <div>
            <label className="block font-bold text-warm-800 uppercase tracking-wider text-[11px]">Reason / Admin Audit Note</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-warm-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500 mt-1 bg-warm-50/50 focus:bg-white text-warm-900"
            />
          </div>

          <div className="md:col-span-3 pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isAuditing}
              className="btn-amber !text-xs !py-3 !px-6 shadow-md flex items-center space-x-2"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing Conflict Schedule...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Audit Impacted Appointments for Doctor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Preview Modal / Alert */}
      {previewData && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                Doctor Leave Conflict Audit Preview
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {previewData.affectedCount} Appointments Impacted for Dr. {previewData.doctorName} on {formatDate(leaveDate)}
              </h3>
            </div>
            <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
              Confirmation Required
            </span>
          </div>

          {previewData.affectedCount === 0 ? (
            <div className="p-4 bg-white/80 rounded-2xl border border-amber-200 text-xs text-slate-700 font-medium">
              Great news! There are 0 existing patient appointments booked on {formatDate(leaveDate)} for this doctor. Setting leave will block new bookings with zero conflict.
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Affected Patients & Times:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {previewData.affectedAppointments.map((appt: any) => (
                  <div key={appt.id} className="p-3 bg-white/90 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{appt.patientName}</span> ({appt.patientEmail})
                      <div className="text-slate-500 mt-0.5">Symptoms: {appt.symptoms}</div>
                    </div>
                    <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                      {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-amber-800 font-medium max-w-lg">
              Confirming will mark appointments as CANCELLED, release calendar slots, and queue email notification alerts to all patients with rebooking guidance.
            </p>

            <button
              onClick={() => handleConfirmLeave()}
              disabled={isExecuting}
              className="btn-amber !text-xs !py-3 !px-8 shadow-lg flex items-center space-x-2 shrink-0 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Bulk Cancellation & Notifications...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Doctor Leave & Notify Patients</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
