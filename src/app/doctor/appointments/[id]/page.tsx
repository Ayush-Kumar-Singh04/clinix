"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldAlert,
  User,
  Clock,
  Calendar,
  Pill,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

interface PrescriptionItemInput {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function DoctorConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [doctorNotesPatient, setDoctorNotesPatient] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemInput[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/appointments/${appointmentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAppointment(data.data.appointment);
          if (data.data.appointment.clinicalNotes) {
            setClinicalNotes(data.data.appointment.clinicalNotes);
          }
          if (data.data.appointment.doctorNotesPatient) {
            setDoctorNotesPatient(data.data.appointment.doctorNotesPatient);
          }
          if (data.data.appointment.prescription?.items) {
            setPrescriptionItems(data.data.appointment.prescription.items);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, [appointmentId]);

  const addPrescriptionItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicineName: "",
        dosage: "500 mg",
        frequency: "Twice daily",
        duration: "7 days",
        instructions: "Take after meals with water",
      },
    ]);
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const updatePrescriptionItem = (index: number, field: keyof PrescriptionItemInput, value: string) => {
    const updated = [...prescriptionItems];
    updated[index][field] = value;
    setPrescriptionItems(updated);
  };

  const handleCompleteVisit = async () => {
    if (!clinicalNotes.trim()) {
      setErrorMsg("Please enter your clinical evaluation notes before completing the visit.");
      return;
    }
    setErrorMsg("");
    setIsCompleting(true);

    try {
      const res = await fetch(`/api/doctor/appointments/${appointmentId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicalNotes,
          doctorNotesPatient,
          prescriptionItems,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.error?.message || "Failed to complete visit");
        setIsCompleting(false);
        return;
      }

      router.push("/doctor?visit_completed=true");
    } catch (err) {
      setErrorMsg("An error occurred while saving consultation records.");
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return <div className="py-16 text-center text-slate-400">Loading consultation record...</div>;
  }

  if (!appointment) {
    return <div className="py-16 text-center text-slate-500">Appointment record not found.</div>;
  }

  const aiPre = appointment.aiPreVisitSummary;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Consultation Queue</span>
      </button>

      {/* Patient & Appointment Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-slate-900">Patient: {appointment.patient.name}</h1>
            <span
              className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                appointment.urgency === "HIGH"
                  ? "bg-rose-100 text-rose-700 border border-rose-300"
                  : appointment.urgency === "MEDIUM"
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-emerald-100 text-emerald-700 border border-emerald-300"
              }`}
            >
              Urgency: {appointment.urgency}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Email: {appointment.patient.email} | Phone: {appointment.patient.phone || "N/A"} | Date: {formatDate(appointment.date)} at {formatTime(appointment.startTime)}
          </p>
        </div>

        <span className={appointment.status === "COMPLETED" ? "badge-completed" : "badge-upcoming"}>
          {appointment.status}
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Pre-Visit Triage Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-brand-50 via-white to-teal-50 p-6 rounded-3xl border border-brand-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Pre-Visit Workflow Summary
              </span>
              <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-2 py-0.5 rounded-full">
                Assistant Active
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">Patient Original Symptoms:</span>
              <p className="text-xs text-slate-800 p-3 bg-white/80 rounded-xl border border-slate-200">
                {appointment.symptoms}
              </p>
            </div>

            {aiPre && (
              <>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">Extracted Chief Complaint:</span>
                  <p className="text-xs font-semibold text-brand-900 p-3 bg-brand-100/50 rounded-xl border border-brand-200">
                    {aiPre.chiefComplaint}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-500">3 Suggested Clinical Questions:</span>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {aiPre.suggestedQuestions?.map((q: string, idx: number) => (
                      <li key={idx} className="p-2.5 bg-white/80 rounded-xl border border-slate-100 flex items-start space-x-2">
                        <span className="font-bold text-brand-600">{idx + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* MANDATORY AI CLINICAL DISCLAIMER */}
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex items-start space-x-2 text-[11px] text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Disclaimer:</strong> System-generated workflow clinical assistance. Not a medical diagnosis. Clinician judgement governs all care decisions.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Notes & Prescription Builder */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Clinician Notes & Consultation Entry
            </h2>

            {/* Clinical Notes (Doctor Private) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Clinical Evaluation Notes (Doctor Records) *
              </label>
              <textarea
                rows={4}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter objective clinical findings, physical exam observations, diagnosis thoughts..."
                className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Notes Intended for Patient */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Notes / Instructions Intended for Patient
              </label>
              <textarea
                rows={2}
                value={doctorNotesPatient}
                onChange={(e) => setDoctorNotesPatient(e.target.value)}
                placeholder="e.g. Rest, increase hydration, schedule follow-up blood work in 2 weeks..."
                className="w-full p-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {/* Prescription Builder */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600" />
                  Prescription Builder
                </h3>
                <button
                  type="button"
                  onClick={addPrescriptionItem}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-xl border border-teal-200 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              {prescriptionItems.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  No medications prescribed for this visit yet. Click &quot;Add Medicine&quot; above if needed.
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptionItems.map((item, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => removePrescriptionItem(index)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">Medicine Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Amoxicillin"
                            value={item.medicineName}
                            onChange={(e) => updatePrescriptionItem(index, "medicineName", e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-xl text-xs outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">Dosage</label>
                          <input
                            type="text"
                            placeholder="e.g. 500 mg"
                            value={item.dosage}
                            onChange={(e) => updatePrescriptionItem(index, "dosage", e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-xl text-xs outline-none bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">Frequency</label>
                          <select
                            value={item.frequency}
                            onChange={(e) => updatePrescriptionItem(index, "frequency", e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-xl text-xs outline-none bg-white font-medium"
                          >
                            <option>Once daily</option>
                            <option>Twice daily</option>
                            <option>Three times daily</option>
                            <option>Every 4 hours</option>
                            <option>Every 6 hours</option>
                            <option>Every 8 hours</option>
                            <option>As prescribed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">Duration</label>
                          <input
                            type="text"
                            placeholder="e.g. 7 days"
                            value={item.duration}
                            onChange={(e) => updatePrescriptionItem(index, "duration", e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-xl text-xs outline-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase">Instructions</label>
                          <input
                            type="text"
                            placeholder="e.g. Take after meals"
                            value={item.instructions}
                            onChange={(e) => updatePrescriptionItem(index, "instructions", e.target.value)}
                            className="w-full p-2 border border-slate-200 rounded-xl text-xs outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complete Visit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleCompleteVisit}
                disabled={isCompleting || !clinicalNotes.trim()}
                className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Patient Care Plan & Finalizing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Complete Visit & Generate Patient Care Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
