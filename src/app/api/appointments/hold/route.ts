import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HoldSlotSchema } from "@/lib/validations";
import { createErrorResponse, createSuccessResponse, generateTimeSlots, getDayOfWeek } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(req, ["PATIENT", "ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    const body = await req.json();
    const validated = HoldSlotSchema.parse(body);
    const { doctorId, date, startTime, holdToken: clientHoldToken } = validated;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        workingHours: true,
        leaves: { where: { leaveDate: date } },
      },
    });

    if (!doctor || !doctor.isActive) {
      return createErrorResponse("DOCTOR_NOT_FOUND", "Doctor not found or inactive", 404);
    }

    if (doctor.leaves.length > 0) {
      return createErrorResponse("DOCTOR_ON_LEAVE", "Doctor is on leave on this date", 400);
    }

    const dayOfWeek = getDayOfWeek(date);
    const workingHour = doctor.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);

    if (!workingHour) {
      return createErrorResponse("NOT_WORKING_DAY", "Doctor does not work on this day", 400);
    }

    const rawSlots = generateTimeSlots(workingHour.startTime, workingHour.endTime, doctor.slotDurationMinutes);
    const targetSlot = rawSlots.find((s) => s.startTime === startTime);
    if (!targetSlot) {
      return createErrorResponse("INVALID_SLOT", "Selected time slot is outside working hours", 400);
    }

    const now = new Date();
    const holdDurationMinutes = 5;
    const holdExpiresAt = new Date(now.getTime() + holdDurationMinutes * 60 * 1000);

    // Check existing slot in DB
    const existingSlot = await prisma.appointmentSlot.findUnique({
      where: {
        doctorId_date_startTime: { doctorId, date, startTime },
      },
    });

    if (existingSlot) {
      if (existingSlot.status === "CONFIRMED") {
        return createErrorResponse("SLOT_ALREADY_BOOKED", "This slot is already booked", 409);
      }
      // If slot is held by ANOTHER user with a different active hold token
      if (
        existingSlot.status === "HELD" &&
        existingSlot.holdExpiresAt &&
        existingSlot.holdExpiresAt > now &&
        clientHoldToken &&
        existingSlot.holdToken &&
        existingSlot.holdToken !== clientHoldToken
      ) {
        return createErrorResponse("SLOT_HELD", "This slot is currently held by another user", 409);
      }
    }

    // Reuse existing token if matching, or generate new token
    const holdToken = clientHoldToken && existingSlot?.holdToken === clientHoldToken
      ? clientHoldToken
      : crypto.randomUUID();

    // Upsert the slot to HELD
    const slot = await prisma.appointmentSlot.upsert({
      where: {
        doctorId_date_startTime: { doctorId, date, startTime },
      },
      update: {
        status: "HELD",
        holdToken,
        holdExpiresAt,
      },
      create: {
        doctorId,
        date,
        startTime,
        endTime: targetSlot.endTime,
        status: "HELD",
        holdToken,
        holdExpiresAt,
      },
    });

    return createSuccessResponse({
      holdToken: slot.holdToken,
      holdExpiresAt: slot.holdExpiresAt,
      slotId: slot.id,
      doctorId,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  } catch (error: any) {
    console.error("[Hold Slot Error]", error);
    return createErrorResponse("HOLD_ERROR", error.message || "Failed to hold appointment slot", 400);
  }
}
