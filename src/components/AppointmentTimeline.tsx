"use client";

import { CheckCircle2, Clock, ClipboardList, FileText, Pill, Bell, CalendarCheck } from "lucide-react";

interface AppointmentTimelineProps {
  status: "UPCOMING" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  hasSymptoms: boolean;
  hasAiSummary: boolean;
  hasPrescription: boolean;
  hasReminders: boolean;
}

export default function AppointmentTimeline({
  status,
  hasSymptoms,
  hasAiSummary,
  hasPrescription,
  hasReminders,
}: AppointmentTimelineProps) {
  const steps = [
    {
      id: 1,
      title: "Appointment Booked",
      desc: "Slot reserved & confirmed",
      icon: CalendarCheck,
      completed: true,
      active: status === "UPCOMING" && !hasSymptoms,
    },
    {
      id: 2,
      title: "Symptoms Submitted",
      desc: "Patient reported chief complaints",
      icon: Clock,
      completed: hasSymptoms,
      active: hasSymptoms && !hasAiSummary,
    },
    {
      id: 3,
      title: "Pre-Visit Triage",
      desc: "Clinical workflow & urgency triage",
      icon: ClipboardList,
      completed: hasAiSummary,
      active: hasAiSummary && status !== "COMPLETED",
    },
    {
      id: 4,
      title: "Doctor Consultation",
      desc: "Clinical notes & evaluation",
      icon: FileText,
      completed: status === "COMPLETED",
      active: status === "COMPLETED" && !hasPrescription,
    },
    {
      id: 5,
      title: "Prescription & Care Plan",
      desc: "Patient-friendly instructions & medicine",
      icon: Pill,
      completed: hasPrescription,
      active: hasPrescription && !hasReminders,
    },
    {
      id: 6,
      title: "Medication Reminders Scheduled",
      desc: "Automated dosage alerts active",
      icon: Bell,
      completed: hasReminders,
      active: hasReminders,
    },
  ];

  return (
    <div className="py-4">
      <h4 className="text-xs font-bold text-warm-400 uppercase tracking-wider mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>Appointment Lifecycle Timeline</h4>
      <div className="relative border-l-2 border-warm-200 ml-4 space-y-6">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = step.completed;
          const isActive = step.active;

          return (
            <div key={step.id} className="relative pl-6 group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                  isDone
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : isActive
                    ? "bg-brand-500 text-white ring-4 ring-brand-100"
                    : "bg-warm-100 text-warm-400 border border-warm-300"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>

              {/* Step Content */}
              <div className="bg-white p-3.5 rounded-xl border border-warm-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <h5 className={`text-sm font-semibold ${isDone ? "text-warm-800" : isActive ? "text-brand-700" : "text-warm-400"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                    {step.title}
                  </h5>
                  {isDone && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-xs text-warm-500 mt-1">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
