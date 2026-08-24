"use client";

import { useState, useEffect } from "react";
import { Clock, Lock, Check, Timer } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface Slot {
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "HELD" | "CONFIRMED";
  holdExpiresAt?: string | null;
  isCurrentHold?: boolean;
}

interface SlotPickerProps {
  doctorId: string;
  date: string;
  slots: Slot[];
  selectedSlot: Slot | null;
  onHoldSlot: (slot: Slot) => Promise<void>;
  isLoadingHold?: boolean;
}

export default function SlotPicker({
  slots,
  selectedSlot,
  onHoldSlot,
  isLoadingHold = false,
}: SlotPickerProps) {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedSlot?.holdExpiresAt) {
      setTimeLeftSeconds(null);
      return;
    }

    const expiresAt = new Date(selectedSlot.holdExpiresAt).getTime();

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [selectedSlot]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Active Hold Banner */}
      {selectedSlot && timeLeftSeconds !== null && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2 text-amber-800 text-sm font-medium">
            <Timer className="w-5 h-5 text-amber-600" />
            <span>
              Slot <strong>{formatTime(selectedSlot.startTime)}</strong> reserved temporarily!
            </span>
          </div>
          <div className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
            <span>Hold expires in:</span>
            <span className="font-mono text-sm">{formatCountdown(timeLeftSeconds)}</span>
          </div>
        </div>
      )}

      {/* Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.startTime === slot.startTime;
          const isConfirmed = slot.status === "CONFIRMED";
          const isHeldByOther = slot.status === "HELD" && !slot.isCurrentHold && !isSelected;

          let btnClass = "border-slate-200 bg-white text-slate-800 hover:border-slate-900 hover:bg-slate-50";

          if (isSelected) {
            btnClass = "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/30 ring-2 ring-slate-900/40 scale-[1.03]";
          } else if (isConfirmed) {
            btnClass = "border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed";
          } else if (isHeldByOther) {
            btnClass = "border-amber-100 bg-amber-50 text-amber-600 cursor-not-allowed opacity-75";
          }

          return (
            <button
              key={slot.startTime}
              disabled={isConfirmed || isHeldByOther || (isLoadingHold && !isSelected)}
              onClick={() => onHoldSlot(slot)}
              className={`relative p-3.5 rounded-2xl border text-sm font-semibold flex flex-col items-center justify-center transition-all duration-200 ${btnClass}`}
            >
              <div className="flex items-center space-x-1.5">
                <Clock className={`w-3.5 h-3.5 ${isSelected ? "text-amber-300" : "opacity-70"}`} />
                <span className="font-mono tracking-tight">{formatTime(slot.startTime)}</span>
              </div>
              <span className={`text-[10px] font-medium mt-0.5 ${isSelected ? "text-amber-200" : "opacity-70"}`}>
                {isConfirmed ? "Booked" : isHeldByOther ? "Held" : isSelected ? "Selected" : "Available"}
              </span>

              {isConfirmed && <Lock className="absolute top-2 right-2 w-3 h-3 text-slate-400" />}
              {isSelected && <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-amber-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
