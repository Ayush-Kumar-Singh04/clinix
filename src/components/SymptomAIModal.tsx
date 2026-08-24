"use client";

import { useState } from "react";
import { ClipboardList, AlertCircle, ShieldAlert, Loader2, CheckCircle2, Activity } from "lucide-react";

interface SymptomAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (symptoms: string, aiSummary: any) => Promise<void>;
  doctorName: string;
  selectedSlotTime: string;
  isSubmitting?: boolean;
}

export default function SymptomAIModal({
  isOpen,
  onClose,
  onConfirmBooking,
  doctorName,
  selectedSlotTime,
  isSubmitting = false,
}: SymptomAIModalProps) {
  const [symptoms, setSymptoms] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      setErrorMsg("Please describe your symptoms in detail (at least 5 characters).");
      return;
    }
    setErrorMsg("");
    setIsGeneratingAI(true);

    try {
      const res = await fetch("/api/ai/pre-visit-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();

      if (data.success) {
        setAiSummary(data.data);
      } else {
        // Fallback default
        setAiSummary({
          urgency: "MEDIUM",
          chiefComplaint: symptoms,
          suggestedQuestions: [
            "When did your symptoms first begin?",
            "Have you noticed any triggers?",
            "Are you currently taking any medications?",
          ],
          disclaimer: "Structured clinical intake summary. Clinician judgement governs all care decisions.",
        });
      }
    } catch (err) {
      setAiSummary({
        urgency: "MEDIUM",
        chiefComplaint: symptoms,
        suggestedQuestions: [
          "When did your symptoms first begin?",
          "Have you noticed any triggers?",
          "Are you currently taking any medications?",
        ],
        disclaimer: "Structured clinical intake summary. Clinician judgement governs all care decisions.",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-brand-600" />
              Symptom Intake & Pre-Visit Review
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Booking with <strong className="text-slate-700">{doctorName}</strong> at <strong>{selectedSlotTime}</strong>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
            ×
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Symptom Input */}
        <div className="space-y-3 mb-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Describe Your Symptoms / Chief Complaint *
          </label>
          <textarea
            rows={4}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. Experiencing mild chest tightness, shortness of breath after light exertion for 2 days..."
            className="w-full p-3.5 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          />

          {!aiSummary && (
            <button
              onClick={handleGenerateAI}
              disabled={isGeneratingAI || !symptoms.trim()}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Intake...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Review Clinical Intake</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Output Card */}
        {aiSummary && (
          <div className="bg-brand-50/60 border border-brand-200 rounded-2xl p-4 space-y-3 mb-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-brand-600" />
                Pre-Visit Clinical Summary
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  aiSummary.urgency === "HIGH"
                    ? "bg-rose-100 text-rose-700 border border-rose-300"
                    : aiSummary.urgency === "MEDIUM"
                    ? "bg-amber-100 text-amber-700 border border-amber-300"
                    : "bg-emerald-100 text-emerald-700 border border-emerald-300"
                }`}
              >
                Urgency: {aiSummary.urgency}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500">Chief Complaint:</span>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{aiSummary.chiefComplaint}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500">Suggested Doctor Questions:</span>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 mt-1">
                {aiSummary.suggestedQuestions.map((q: string, idx: number) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>

            {/* MANDATORY AI DISCLAIMER */}
            <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200 flex items-start space-x-2 text-[11px] text-slate-600">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{aiSummary.disclaimer || "AI-generated workflow summary. Not a medical diagnosis."}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmBooking(symptoms, aiSummary)}
            disabled={isSubmitting || !symptoms.trim()}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming Booking...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Appointment Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
