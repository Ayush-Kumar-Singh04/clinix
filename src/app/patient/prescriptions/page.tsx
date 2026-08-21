"use client";

import { useEffect, useState } from "react";
import { Pill, Bell, CheckCircle2, Clock, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PatientPrescriptionsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/appointments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Filter completed appointments with prescriptions
          const completedWithPrescription = data.data.appointments.filter(
            (a: any) => a.status === "COMPLETED" && a.prescription
          );
          setAppointments(completedWithPrescription);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Prescriptions & Medication Reminders</h1>
        <p className="text-sm text-slate-600">
          Review clinician prescribed dosage schedules and automated reminder alerts.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse">Loading prescription records...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Pill className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Active Prescriptions</h3>
          <p className="text-xs text-slate-500">When your doctor prescribes medications during visits, they will appear here with active reminder schedules.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Dr. {appt.doctor.user.name}</h3>
                  <span className="text-xs text-brand-600 font-semibold">{appt.doctor.specialization} — Prescribed on {formatDate(appt.date)}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold self-start sm:self-auto">
                  <Bell className="w-3.5 h-3.5" />
                  <span>Active Reminders Scheduled</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appt.prescription?.items?.map((item: any) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-brand-600" />
                        {item.medicineName}
                      </span>
                      <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md">
                        {item.dosage}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p><strong>Frequency:</strong> {item.frequency}</p>
                      <p><strong>Duration:</strong> {item.duration}</p>
                      {item.instructions && <p><strong>Doctor Instructions:</strong> {item.instructions}</p>}
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Daily Alert: 08:00 AM</span>
                      <span className="text-emerald-600 font-medium">Synced with Queue</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
