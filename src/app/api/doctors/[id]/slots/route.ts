import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse, generateTimeSlots, getDayOfWeek } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id: doctorId } = params;
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const holdToken = searchParams.get("holdToken");

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      workingHours: true,
      leaves: {
        where: { leaveDate: dateStr },
      },
    },
  });

  if (!doctor || !doctor.isActive) {
    return createErrorResponse("DOCTOR_NOT_FOUND", "Doctor not found or inactive", 404);
  }

  // 1. Doctor Leave Check
  if (doctor.leaves.length > 0) {
    return createSuccessResponse({
      doctorId,
      date: dateStr,
      isLeave: true,
      leaveReason: doctor.leaves[0].reason || "Doctor is on leave",
      slots: [],
    });
  }

  // 2. Working Hours Check
  const dayOfWeek = getDayOfWeek(dateStr); // 0 = Sunday, 1 = Monday ... 6 = Saturday

  const workingHour = doctor.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
  if (!workingHour) {
    return createSuccessResponse({
      doctorId,
      date: dateStr,
      isWorkingDay: false,
      slots: [],
    });
  }

  // 3. Cleanup expired holds for this doctor & date
  const now = new Date();
  await prisma.appointmentSlot.updateMany({
    where: {
      doctorId,
      date: dateStr,
      status: "HELD",
      holdExpiresAt: { lt: now },
    },
    data: {
      status: "AVAILABLE",
      holdToken: null,
      holdExpiresAt: null,
    },
  });

  // 4. Fetch existing DB slots & booked appointments
  const existingDbSlots = await prisma.appointmentSlot.findMany({
    where: { doctorId, date: dateStr },
  });

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: dateStr,
      status: { in: ["UPCOMING", "COMPLETED"] },
    },
  });

  // 5. Generate theoretical time slots based on working hours
  const rawTimeSlots = generateTimeSlots(workingHour.startTime, workingHour.endTime, doctor.slotDurationMinutes);

  const slotMap = new Map<string, any>();
  for (const s of existingDbSlots) {
    slotMap.set(s.startTime, s);
  }

  const bookedStartTimes = new Set(bookedAppointments.map((a) => a.startTime));

  const slots = rawTimeSlots.map((ts) => {
    const dbSlot = slotMap.get(ts.startTime);
    let status = "AVAILABLE";
    let holdExpiresAt: string | null = null;
    let isCurrentHold = false;

    if (bookedStartTimes.has(ts.startTime)) {
      status = "CONFIRMED";
    } else if (dbSlot) {
      if (dbSlot.status === "CONFIRMED") {
        status = "CONFIRMED";
      } else if (dbSlot.status === "HELD" && dbSlot.holdExpiresAt && dbSlot.holdExpiresAt > now) {
        status = "HELD";
        holdExpiresAt = dbSlot.holdExpiresAt.toISOString();
        if (holdToken && dbSlot.holdToken === holdToken) {
          isCurrentHold = true;
        }
      }
    }

    return {
      startTime: ts.startTime,
      endTime: ts.endTime,
      status,
      holdExpiresAt,
      isCurrentHold,
      dbSlotId: dbSlot?.id || null,
    };
  });

  return createSuccessResponse({
    doctorId,
    date: dateStr,
    isLeave: false,
    isWorkingDay: true,
    slots,
  });
}
