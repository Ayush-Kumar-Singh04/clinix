"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  Clock,
  Calendar as CalendarIcon,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import SlotPicker from "@/components/SlotPicker";
import SymptomAIModal from "@/components/SymptomAIModal";
import { formatDate, formatTime } from "@/lib/utils";

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [isHoldLoading, setIsHoldLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Fetch Doctor Profile
  useEffect(() => {
    fetch(`/api/doctors/${doctorId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDoctor(data.data.doctor);
      });
  }, [doctorId]);

  // Fetch Doctor Slots for Selected Date
  const fetchSlots = async () => {
    setIsSlotsLoading(true);
    try {
      const url = `/api/doctors/${doctorId}/slots?date=${selectedDate}${holdToken ? `&holdToken=${holdToken}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSlots(data.data.slots);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [doctorId, selectedDate]);

  // Handle Slot Click (Triggers Temporary Hold)
  const handleHoldSlot = async (slot: any) => {
    setBookingError("");

    // If clicking the same slot already held by this patient, simply reopen modal
    if (selectedSlot?.startTime === slot.startTime && holdToken) {
      setIsModalOpen(true);
      return;
    }

    // Immediately reflect dark selected state in UI
    setSelectedSlot({
      ...slot,
      holdToken: holdToken || null,
      holdExpiresAt: selectedSlot?.holdExpiresAt || null,
    });
    setIsHoldLoading(true);

    try {
      const res = await fetch("/api/appointments/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          date: selectedDate,
          startTime: slot.startTime,
          holdToken: holdToken || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setBookingError(data.error?.message || "Failed to hold slot");
        fetchSlots();
        setIsHoldLoading(false);
        return;
      }

      setHoldToken(data.data.holdToken);
      setSelectedSlot({
        ...slot,
        holdToken: data.data.holdToken,
        holdExpiresAt: data.data.holdExpiresAt,
      });

      setIsModalOpen(true);
    } catch (err) {
      setBookingError("Connection error while requesting slot hold");
    } finally {
      setIsHoldLoading(false);
    }
  };

  // Confirm Concurrency-Safe Booking
  const handleConfirmBooking = async (symptoms: string, aiSummary: any) => {
    if (!selectedSlot) return;
    setIsSubmittingBooking(true);
    setBookingError("");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          date: selectedDate,
          startTime: selectedSlot.startTime,
          symptoms,
          holdToken,
          aiPreVisitSummary: aiSummary,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setBookingError(data.error?.message || "Booking failed");
        setIsSubmittingBooking(false);
        setIsModalOpen(false);
        fetchSlots();
        return;
      }

      setIsModalOpen(false);
      router.push("/patient?booking_success=true");
    } catch (err) {
      setBookingError("An unexpected error occurred during booking confirmation.");
      setIsSubmittingBooking(false);
    }
  };

  if (!doctor) {
    return <div className="py-16 text-center text-slate-400">Loading doctor schedule profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctors</span>
      </button>

      {/* Doctor Header Profile */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-500/20 shrink-0">
            {doctor.user.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Dr. {doctor.user.name}</h1>
              <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{doctor.rating.toFixed(1)}</span>
              </div>
            </div>
            <span className="inline-block text-xs font-bold text-brand-600 bg-brand-50 px-3 py-0.5 rounded-full border border-brand-200">
              {doctor.specialization}
            </span>
            <p className="text-xs text-slate-600 pt-1 max-w-xl">{doctor.bio || "Dedicated healthcare clinician."}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 shrink-0 text-xs">
          <div className="flex items-center space-x-2 text-slate-700 font-semibold">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>{doctor.slotDurationMinutes} Minute Consultation</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Concurrency-Safe Guaranteed</span>
          </div>
        </div>
      </div>

      {bookingError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{bookingError}</span>
        </div>
      )}

      {/* Date Selector & Slot Picker Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-brand-600" />
              Select Appointment Date & Time
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Slots update dynamically based on doctor working hours and holds.</p>
          </div>

          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Slot Grid Picker */}
        {isSlotsLoading ? (
          <div className="py-8 text-center text-slate-400 animate-pulse">Loading available time slots for {selectedDate}...</div>
        ) : slots.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-medium">
            Doctor is not available or on leave on {selectedDate}. Please select another date.
          </div>
        ) : (
          <SlotPicker
            doctorId={doctorId}
            date={selectedDate}
            slots={slots}
            selectedSlot={selectedSlot}
            onHoldSlot={handleHoldSlot}
            isLoadingHold={isHoldLoading}
          />
        )}
      </div>

      {/* Symptom & AI Pre-Visit Modal */}
      <SymptomAIModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirmBooking={handleConfirmBooking}
        doctorName={doctor.user.name}
        selectedSlotTime={selectedSlot ? `${formatDate(selectedDate)} at ${formatTime(selectedSlot.startTime)}` : ""}
        isSubmitting={isSubmittingBooking}
      />
    </div>
  );
}
