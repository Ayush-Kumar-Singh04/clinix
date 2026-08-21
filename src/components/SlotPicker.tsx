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

          let btnClass = "border-slate-200 bg-white text-slate-800 hover:border-brand-500 hover:bg-brand-50";

          if (isSelected) {
            btnClass = "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-500/20 ring-2 ring-brand-300";
          } else if (isConfirmed) {
            btnClass = "border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed";
          } else if (isHeldByOther) {
            btnClass = "border-amber-100 bg-amber-50 text-amber-600 cursor-not-allowed opacity-75";
          }

          return (
            <button
              key={slot.startTime}
              disabled={isConfirmed || isHeldByOther || isLoadingHold}
              onClick={() => onHoldSlot(slot)}
              className={`relative p-3 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center transition-all ${btnClass}`}
            >
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 opacity-80" />
                <span>{formatTime(slot.startTime)}</span>
              </div>
              <span className="text-[10px] opacity-75 font-normal">
                {isConfirmed ? "Booked" : isHeldByOther ? "Held" : isSelected ? "Held (You)" : "Available"}
              </span>

              {isConfirmed && <Lock className="absolute top-1.5 right-1.5 w-3 h-3 text-slate-400" />}
              {isSelected && <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
