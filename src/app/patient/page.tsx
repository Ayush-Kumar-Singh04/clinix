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
  Sparkles,
  AlertCircle,
  CheckCircle2,
  CalendarPlus,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import AppointmentTimeline from "@/components/AppointmentTimeline";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedAppt, setSelectedAppt] = useState<any>(null);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-teal-300">
            <Calendar className="w-3.5 h-3.5" />
            <span>Patient Care Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Health Appointments & Care Plans</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage upcoming consultations, review doctor notes, and sync with Google Calendar.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/patient/doctors"
            className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center space-x-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
          <a
            href="/api/calendar/connect"
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-2xl border border-white/20 transition-all flex items-center space-x-2 shrink-0"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Sync Google Calendar</span>
          </a>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">Loading patient appointment record...</div>
      ) : errorMsg ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">{errorMsg}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Appointments List Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upcoming Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Upcoming Appointments ({upcomingAppts.length})</span>
                <button onClick={fetchAppointments} className="text-slate-400 hover:text-brand-600">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </h3>

              {upcomingAppts.length === 0 ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">No upcoming appointments scheduled.</p>
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
                        : "bg-white border-slate-200 hover:border-brand-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Dr. {appt.doctor.user.name}</h4>
                        <span className="text-xs font-medium text-brand-600">{appt.doctor.specialization}</span>
                      </div>
                      <span className="badge-upcoming">
                        {appt.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500 font-medium">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(appt.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatTime(appt.startTime)}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 truncate max-w-[200px]">Symptoms: {appt.symptoms}</span>
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
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Past Appointments ({pastAppts.length})
              </h3>
              {pastAppts.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => setSelectedAppt(appt)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedAppt?.id === appt.id
                      ? "bg-slate-100 border-slate-400 shadow-sm"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Dr. {appt.doctor.user.name}</h4>
                      <span className="text-xs text-slate-500">{appt.doctor.specialization}</span>
                    </div>
                    <span className={appt.status === "COMPLETED" ? "badge-completed" : "badge-cancelled"}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">{formatDate(appt.date)} at {formatTime(appt.startTime)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Appointment Detail & Timeline */}
          <div className="lg:col-span-7 space-y-6">
            {selectedAppt ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Selected Appointment Detail</span>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">Dr. {selectedAppt.doctor.user.name}</h2>
                    <p className="text-xs text-slate-500">{selectedAppt.doctor.specialization} — {formatDate(selectedAppt.date)} at {formatTime(selectedAppt.startTime)}</p>
                  </div>
                  <span className={selectedAppt.status === "COMPLETED" ? "badge-completed" : selectedAppt.status === "CANCELLED" ? "badge-cancelled" : "badge-upcoming"}>
                    {selectedAppt.status}
                  </span>
                </div>

                {/* AI Pre-Visit Triage Card */}
                {selectedAppt.aiPreVisitSummary && (
                  <div className="bg-brand-50/60 p-4 rounded-2xl border border-brand-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-brand-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-brand-600" />
                        Pre-Visit Assessment
                      </span>
                      <span className={`px-2 py-0.5 rounded-full uppercase text-[10px] ${
                        selectedAppt.urgency === "HIGH" ? "bg-rose-100 text-rose-700" : selectedAppt.urgency === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        Urgency: {selectedAppt.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      <strong>Chief Complaint:</strong> {selectedAppt.chiefComplaint || selectedAppt.symptoms}
                    </p>
                  </div>
                )}

                {/* Doctor Patient-Intended Notes & AI Post-Visit Summary */}
                {selectedAppt.status === "COMPLETED" && (
                  <div className="space-y-4">
                    {selectedAppt.doctorNotesPatient && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Doctor Notes for You</h4>
                        <p className="text-xs text-slate-800">{selectedAppt.doctorNotesPatient}</p>
                      </div>
                    )}

                    {selectedAppt.aiPostVisitSummary && (
                      <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3">
                        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          Post-Visit Summary & Care Plan
                        </h4>
                        <p className="text-xs text-slate-800 leading-relaxed">
                          {selectedAppt.aiPostVisitSummary.summary}
                        </p>
                        {selectedAppt.aiPostVisitSummary.medicationSchedule && (
                          <div className="pt-2">
                            <span className="text-xs font-semibold text-emerald-800">Medication Schedule:</span>
                            <p className="text-xs text-slate-700">{selectedAppt.aiPostVisitSummary.medicationSchedule}</p>
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 italic pt-2">
                          * {selectedAppt.aiPostVisitSummary.disclaimer || "AI-generated patient-friendly summary. Follow your clinician's instructions."}
                        </p>
                      </div>
                    )}

                    {selectedAppt.prescription && (
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Pill className="w-4 h-4 text-brand-600" />
                          Prescriptions & Dosages
                        </h4>
                        <div className="space-y-2">
                          {selectedAppt.prescription.items?.map((item: any) => (
                            <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl text-xs flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-900">{item.medicineName}</span> — {item.dosage}
                                <div className="text-slate-500">{item.frequency} for {item.duration}</div>
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
                <div className="pt-4 border-t border-slate-100">
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
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                Select an appointment from the list to view complete details & care timeline.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
