"use client";

import { useEffect, useState } from "react";
import { Calendar, AlertTriangle, User, Clock, CheckCircle2, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

export default function DoctorLeaveManagementPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("Medical conference / Emergency leave");
  const [previewData, setPreviewData] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.doctors.length > 0) {
          setDoctors(data.data.doctors);
          setSelectedDoctorId(data.data.doctors[0].id);
        }
      });
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

  const handleConfirmLeave = async () => {
    setIsExecuting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/doctors/${selectedDoctorId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveDate,
          reason,
          confirm: true,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error?.message || "Failed to execute leave");
        setIsExecuting(false);
        return;
      }

      setSuccessMsg(data.data.message);
      setPreviewData(null);
    } catch (err) {
      setErrorMsg("An error occurred during bulk cancellation.");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Leave Conflict Resolution</h1>
        <p className="text-sm text-slate-600">
          Mark physician leave dates, audit impacted patient appointments, and trigger automated rebooking notifications.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Select Doctor & Date Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Leave Designation Form
        </h2>

        <form onSubmit={handleAuditConflicts} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase">Select Doctor *</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-purple-500 mt-1 bg-white"
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.user.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase">Leave Date *</label>
            <input
              type="date"
              required
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-2xl font-semibold outline-none focus:ring-2 focus:ring-purple-500 mt-1"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase">Reason / Audit Note</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 mt-1"
            />
          </div>

          <div className="md:col-span-3 pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isAuditing}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center space-x-2"
            >
              {isAuditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing Conflict Schedule...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Audit Impacted Appointments</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Preview & Conflict Confirmation */}
      {previewData && (
        <div className="bg-amber-50/70 border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                Doctor Leave Conflict Audit Preview
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {previewData.affectedCount} Appointments Impacted for Dr. {previewData.doctorName} on {leaveDate}
              </h3>
            </div>
            <span className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
              Confirmation Required
            </span>
          </div>

          {previewData.affectedCount === 0 ? (
            <div className="p-4 bg-white/80 rounded-2xl border border-amber-200 text-xs text-slate-700 font-medium">
              Great news! There are 0 existing patient appointments booked on {leaveDate} for this doctor. Setting leave will block new bookings with zero conflict.
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
                      {appt.startTime} - {appt.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-amber-200 flex items-center justify-between">
            <p className="text-xs text-amber-800 font-medium max-w-lg">
              Confirming will set leave, mark affected appointments as CANCELLED, release slots, delete calendar events, and queue email notification alerts to all patients.
            </p>

            <button
              onClick={handleConfirmLeave}
              disabled={isExecuting}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
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
