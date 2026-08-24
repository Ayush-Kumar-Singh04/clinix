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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-2 border-slate-300 ring-4 ring-black/10 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-serif">
                Symptom Intake & Consultation
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Booking with <strong className="text-slate-800">{doctorName}</strong> on <strong>{selectedSlotTime}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 font-bold text-lg flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border-2 border-rose-300 text-rose-700 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Symptom Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Describe Your Symptoms / Chief Complaint *
          </label>
          <textarea
            rows={4}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. Experiencing mild chest tightness, shortness of breath after light exertion for 2 days..."
            className="w-full p-3.5 border-2 border-slate-300 bg-slate-50/70 hover:border-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/10 text-slate-900 text-sm font-semibold rounded-2xl outline-none transition-all shadow-xs"
          />

          {!aiSummary && (
            <button
              onClick={handleGenerateAI}
              disabled={isGeneratingAI || !symptoms.trim()}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 border border-slate-300 transition-all disabled:opacity-50"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                  <span>Analyzing Intake Symptoms...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 text-brand-600" />
                  <span>Preview AI Clinical Summary (Optional)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Output Card */}
        {aiSummary && (
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
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
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{aiSummary.chiefComplaint}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500">Suggested Doctor Questions:</span>
              <ul className="list-disc list-inside text-xs text-slate-800 font-medium space-y-1 mt-1">
                {aiSummary.suggestedQuestions.map((q: string, idx: number) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>

            {/* MANDATORY AI DISCLAIMER */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-start space-x-2 text-[11px] text-slate-600">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{aiSummary.disclaimer || "AI-generated workflow summary. Not a medical diagnosis."}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t-2 border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-3 font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmBooking(symptoms, aiSummary)}
            disabled={isSubmitting || !symptoms.trim()}
            className="px-7 py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Confirming Booking...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Complete Appointment Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
