"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Plus,
  FileText,
  Pill,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  CalendarPlus,
  RefreshCw,
  XCircle,
  ArrowRight,
  Mail,
  Send,
  X,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import AppointmentTimeline from "@/components/AppointmentTimeline";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

  // Email Doctor Modal State
  const [isEmailDoctorModalOpen, setIsEmailDoctorModalOpen] = useState(false);
  const [patientEmailSubject, setPatientEmailSubject] = useState("");
  const [patientEmailMsg, setPatientEmailMsg] = useState("");
  const [isSendingPatientEmail, setIsSendingPatientEmail] = useState(false);
  const [patientEmailSuccess, setPatientEmailSuccess] = useState("");

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data.appointments);
        if (data.data.appointments.length > 0) {
          setSelectedAppt(data.data.appointments[0]);
        }
      } else {
        setErrorMsg(data.error?.message || "Failed to load appointments");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to API");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAppointments();
      } else {
        alert(data.error?.message || "Cancellation failed");
      }
    } catch (err) {
      alert("Error cancelling appointment");
    }
  };

  const upcomingAppts = appointments.filter((a) => a.status === "UPCOMING" || a.status === "RESCHEDULED");
  const pastAppts = appointments.filter((a) => a.status === "COMPLETED" || a.status === "CANCELLED");

  const handleSendEmailToDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientEmailMsg.trim() || !selectedAppt) return;
    setIsSendingPatientEmail(true);
    setPatientEmailSuccess("");

    try {
      const res = await fetch("/api/notifications/send-direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppt.id,
          recipientType: "DOCTOR",
          recipientEmail: selectedAppt.doctor.user.email,
          recipientName: `Dr. ${selectedAppt.doctor.user.name}`,
          subject: patientEmailSubject || `Patient Inquiry from ${selectedAppt.patient.name}`,
          message: patientEmailMsg,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPatientEmailSuccess("Your message has been sent to your doctor!");
        setPatientEmailMsg("");
        setTimeout(() => {
          setIsEmailDoctorModalOpen(false);
          setPatientEmailSuccess("");
        }, 2000);
      } else {
        alert(data.error?.message || "Failed to send email");
      }
    } catch (err) {
      alert("An error occurred while sending email.");
    } finally {
      setIsSendingPatientEmail(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Scattered Header Banner */}
      <div
        className="dashboard-hero p-6 sm:p-10 text-white shadow-xl space-y-8"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551076805-e1869033e561?w=1400&q=80')`,
        }}
      >
        {/* Top Row: Status left, Actions right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-warm-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono uppercase tracking-widest text-[11px]">Patient Care Record</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/patient/doctors"
              className="btn-amber !text-xs !py-2.5 !px-5 shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
            <a
              href="/api/calendar/connect"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-full border border-white/20 backdrop-blur-md transition-all flex items-center space-x-2 shrink-0"
            >
              <CalendarPlus className="w-4 h-4 text-amber-300" />
              <span>Sync Calendar</span>
            </a>
          </div>
        </div>

        {/* Center: Expressive Scattered Serif Phrasing */}
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight text-white leading-tight">
            Your Health Care,<br />
            <span className="text-amber-200/90 font-normal italic">Appointments & Prescriptions</span>
          </h1>
          <p className="text-xs sm:text-sm text-warm-200 max-w-lg leading-relaxed font-light">
            Review your consultations, active medications, and structured doctor follow-ups.
          </p>
        </div>

        {/* Bottom: Scattered Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-warm-300 tracking-wider">Scheduled Visits</span>
            <div className="text-2xl font-serif text-white mt-0.5">{upcomingAppts.length} Active</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-warm-300 tracking-wider">Completed Care Plans</span>
            <div className="text-2xl font-serif text-emerald-300 mt-0.5">{pastAppts.filter((a) => a.status === "COMPLETED").length} Completed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
            <span className="text-[10px] uppercase font-mono text-warm-300 tracking-wider">Next Consult</span>
            <div className="text-sm font-semibold text-amber-200 mt-1 truncate">
              {upcomingAppts[0] ? `${formatDate(upcomingAppts[0].date)} at ${formatTime(upcomingAppts[0].startTime)}` : "None scheduled"}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-warm-400 animate-pulse">Loading patient appointment record...</div>
      ) : errorMsg ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">{errorMsg}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Appointments List Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upcoming Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-warm-800 uppercase tracking-wider flex items-center justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>
                <span>Upcoming Appointments ({upcomingAppts.length})</span>
                <button onClick={fetchAppointments} className="text-warm-400 hover:text-brand-600">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </h3>

              {upcomingAppts.length === 0 ? (
                <div className="warm-card text-center space-y-3">
                  <Calendar className="w-8 h-8 text-warm-300 mx-auto" />
                  <p className="text-xs text-warm-500">No upcoming appointments scheduled.</p>
                  <Link
                    href="/patient/doctors"
                    className="inline-block px-4 py-2 bg-brand-50 text-brand-700 text-xs font-bold rounded-xl border border-brand-200"
                  >
                    Find a Doctor & Book
                  </Link>
                </div>
              ) : (
                upcomingAppts.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => setSelectedAppt(appt)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedAppt?.id === appt.id
                        ? "bg-brand-50/70 border-brand-400 shadow-md ring-2 ring-brand-200"
                        : "bg-white border-warm-200/60 hover:border-brand-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-warm-900" style={{ fontFamily: "'Inter', sans-serif" }}>Dr. {appt.doctor.user.name}</h4>
                        <span className="text-xs font-medium text-brand-600">{appt.doctor.specialization}</span>
                      </div>
                      <span className="badge-upcoming">
                        {appt.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center space-x-4 text-xs text-warm-500 font-medium">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-warm-400" />
                        <span>{formatDate(appt.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-warm-400" />
                        <span>{formatTime(appt.startTime)}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-warm-100 flex items-center justify-between text-xs">
                      <span className="text-warm-500 truncate max-w-[200px]">Symptoms: {appt.symptoms}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(appt.id);
                        }}
                        className="text-rose-600 hover:text-rose-800 font-semibold text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Past Visits */}
            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-extrabold text-warm-800 uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>
                Past Appointments ({pastAppts.length})
              </h3>
              {pastAppts.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => setSelectedAppt(appt)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedAppt?.id === appt.id
                      ? "bg-warm-100 border-warm-400 shadow-sm"
                      : "bg-white border-warm-200/60 hover:bg-warm-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-warm-800" style={{ fontFamily: "'Inter', sans-serif" }}>Dr. {appt.doctor.user.name}</h4>
                      <span className="text-xs text-warm-500">{appt.doctor.specialization}</span>
                    </div>
                    <span className={appt.status === "COMPLETED" ? "badge-completed" : "badge-cancelled"}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-warm-500">{formatDate(appt.date)} at {formatTime(appt.startTime)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Appointment Detail & Timeline */}
          <div className="lg:col-span-7 space-y-6">
            {selectedAppt ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200/60 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-warm-100 pb-4 gap-3">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider" style={{ fontFamily: "'Inter', sans-serif" }}>Selected Appointment Detail</span>
                    <h2 className="text-xl font-serif text-warm-900 mt-1">Dr. {selectedAppt.doctor.user.name}</h2>
                    <p className="text-xs text-warm-500">{selectedAppt.doctor.specialization} — {formatDate(selectedAppt.date)} at {formatTime(selectedAppt.startTime)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsEmailDoctorModalOpen(true)}
                      className="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 font-semibold text-xs rounded-full border border-brand-200 transition-all flex items-center space-x-1.5 shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-brand-600" />
                      <span>Email Doctor</span>
                    </button>
                    <span className={selectedAppt.status === "COMPLETED" ? "badge-completed" : selectedAppt.status === "CANCELLED" ? "badge-cancelled" : "badge-upcoming"}>
                      {selectedAppt.status}
                    </span>
                  </div>
                </div>

                {/* Email Doctor Modal */}
                {isEmailDoctorModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-5 h-5 text-brand-600" />
                          <h3 className="text-lg font-bold text-slate-900">Email Dr. {selectedAppt.doctor.user.name}</h3>
                        </div>
                        <button onClick={() => setIsEmailDoctorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500">
                        Sending direct medical inquiry to <strong className="text-slate-800">Dr. {selectedAppt.doctor.user.name}</strong> ({selectedAppt.doctor.user.email})
                      </p>

                      {patientEmailSuccess ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{patientEmailSuccess}</span>
                        </div>
                      ) : (
                        <form onSubmit={handleSendEmailToDoctor} className="space-y-4">
                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Subject</label>
                            <input
                              type="text"
                              value={patientEmailSubject}
                              onChange={(e) => setPatientEmailSubject(e.target.value)}
                              placeholder={`Question regarding consultation on ${formatDate(selectedAppt.date)}`}
                              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Your Message *</label>
                            <textarea
                              rows={4}
                              required
                              value={patientEmailMsg}
                              onChange={(e) => setPatientEmailMsg(e.target.value)}
                              placeholder="Describe your question, medication clarification, or update for your doctor..."
                              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                          </div>

                          <div className="flex items-center justify-end space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsEmailDoctorModalOpen(false)}
                              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSendingPatientEmail || !patientEmailMsg.trim()}
                              className="btn-amber !text-xs !py-2.5 shadow-md flex items-center space-x-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isSendingPatientEmail ? "Sending..." : "Send to Doctor"}</span>
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* Clinical Pre-Visit Intake Card */}
                {selectedAppt.aiPreVisitSummary && (
                  <div className="bg-brand-50/60 p-4 rounded-2xl border border-brand-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-warm-900">
                      <span className="flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-brand-600" />
                        Pre-Visit Assessment
                      </span>
                      <span className={`px-2 py-0.5 rounded-full uppercase text-[10px] ${
                        selectedAppt.urgency === "HIGH" ? "bg-rose-100 text-rose-700" : selectedAppt.urgency === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        Urgency: {selectedAppt.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-warm-700 font-medium">
                      <strong>Chief Complaint:</strong> {selectedAppt.chiefComplaint || selectedAppt.symptoms}
                    </p>
                  </div>
                )}

                {/* Doctor Patient-Intended Notes & Post-Visit Summary */}
                {selectedAppt.status === "COMPLETED" && (
                  <div className="space-y-4">
                    {selectedAppt.doctorNotesPatient && (
                      <div className="bg-warm-50 p-4 rounded-2xl border border-warm-200">
                        <h4 className="text-xs font-bold text-warm-700 uppercase tracking-wider mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>Doctor Notes for You</h4>
                        <p className="text-xs text-warm-800">{selectedAppt.doctorNotesPatient}</p>
                      </div>
                    )}

                    {(() => {
                      const postSummary = typeof selectedAppt.aiPostVisitSummary === "string"
                        ? (function() { try { return JSON.parse(selectedAppt.aiPostVisitSummary) } catch { return null } })()
                        : selectedAppt.aiPostVisitSummary;
                      if (!postSummary) return null;
                      return (
                        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
                          <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                            <FileText className="w-4 h-4 text-emerald-600" />
                            Post-Visit Summary & Care Plan
                          </h4>
                          <p className="text-xs text-warm-800 leading-relaxed">
                            {postSummary.summary}
                          </p>
                          {postSummary.medicationSchedule && (
                            <div className="pt-2">
                              <span className="text-xs font-semibold text-emerald-800">Medication Schedule:</span>
                              <p className="text-xs text-warm-700">{postSummary.medicationSchedule}</p>
                            </div>
                          )}
                          <p className="text-[11px] text-warm-500 italic pt-2">
                            * {postSummary.disclaimer || "Clinical Care Summary. Follow your clinician's instructions."}
                          </p>
                        </div>
                      );
                    })()}

                    {selectedAppt.prescription && (
                      <div className="bg-white p-4 rounded-2xl border border-warm-200 space-y-2">
                        <h4 className="text-xs font-bold text-warm-800 uppercase tracking-wider flex items-center gap-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                          <Pill className="w-4 h-4 text-brand-600" />
                          Prescriptions & Dosages
                        </h4>
                        <div className="space-y-2">
                          {selectedAppt.prescription.items?.map((item: any) => (
                            <div key={item.id} className="p-2.5 bg-warm-50 rounded-xl text-xs flex justify-between items-center">
                              <div>
                                <span className="font-bold text-warm-900">{item.medicineName}</span> — {item.dosage}
                                <div className="text-warm-500">{item.frequency} for {item.duration}</div>
                              </div>
                              <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md font-medium border border-brand-200">
                                Active Reminder
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div className="pt-4 border-t border-warm-100">
                  <AppointmentTimeline
                    status={selectedAppt.status}
                    hasSymptoms={Boolean(selectedAppt.symptoms)}
                    hasAiSummary={Boolean(selectedAppt.aiPreVisitSummary)}
                    hasPrescription={Boolean(selectedAppt.prescription)}
                    hasReminders={Boolean(selectedAppt.prescription?.items?.length)}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-warm-200/60 text-center text-warm-400">
                Select an appointment from the list to view complete details & care timeline.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
