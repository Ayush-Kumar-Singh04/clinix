import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse, generateTimeSlots, getDayOfWeek } from "@/lib/utils";
import { queueNotification } from "@/lib/email";
import { deleteGoogleCalendarEventsForAppointment } from "@/lib/calendar";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser(req);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: {
      patient: { select: { id: true, name: true, email: true, phone: true } },
      doctor: { include: { user: { select: { id: true, name: true, email: true } } } },
      prescription: { include: { items: { include: { medicationReminders: true } } } },
    },
  });

  if (!appointment) {
    return createErrorResponse("APPOINTMENT_NOT_FOUND", "Appointment not found", 404);
  }

  // Authorization check
  const { role, userId } = auth.user;
  if (role === "PATIENT" && appointment.patientId !== userId) {
    return createErrorResponse("FORBIDDEN", "Access denied to this appointment", 403);
  }
  if (role === "DOCTOR" && appointment.doctor.userId !== userId) {
    return createErrorResponse("FORBIDDEN", "Access denied to this appointment", 403);
  }

  return createSuccessResponse({ appointment });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser(req);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    const body = await req.json();
    const { action, date: newDate, startTime: newStartTime } = body; // action: 'CANCEL' | 'RESCHEDULE'

    const appt = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        slot: true,
        patient: true,
        doctor: { include: { user: true, workingHours: true } },
      },
    });

    if (!appt) {
      return createErrorResponse("APPOINTMENT_NOT_FOUND", "Appointment not found", 404);
    }

    if (action === "CANCEL") {
      // 1. Mark appointment as CANCELLED
      const updated = await prisma.appointment.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
      });

      // 2. Release slot
      if (appt.slotId) {
        await prisma.appointmentSlot.update({
          where: { id: appt.slotId },
          data: { status: "AVAILABLE", holdToken: null, holdExpiresAt: null },
        });
      }

      // 3. Queue Email & Delete Calendar Events
      await queueNotification("CANCELLATION", appt.patient.email, {
        recipientName: appt.patient.name,
        doctorName: appt.doctor.user.name,
        specialization: appt.doctor.specialization,
        appointmentDate: appt.date,
        appointmentTime: appt.startTime,
        actionReason: body.reason || "Cancelled by patient",
      });

      await deleteGoogleCalendarEventsForAppointment(appt.id);

      return createSuccessResponse({ appointment: updated, message: "Appointment cancelled successfully" });
    }

    if (action === "RESCHEDULE") {
      if (!newDate || !newStartTime) {
        return createErrorResponse("INVALID_INPUT", "New date and start time are required for rescheduling", 400);
      }

      // Check leave & working hours
      const leave = await prisma.doctorLeave.findFirst({
        where: { doctorId: appt.doctorId, leaveDate: newDate },
      });
      if (leave) {
        return createErrorResponse("DOCTOR_ON_LEAVE", "Doctor is on leave on the selected reschedule date", 400);
      }

      const dayOfWeek = getDayOfWeek(newDate);
      const workingHour = appt.doctor.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);

      if (!workingHour) {
        return createErrorResponse("NOT_WORKING_DAY", "Doctor does not work on the selected day", 400);
      }

      const rawSlots = generateTimeSlots(workingHour.startTime, workingHour.endTime, appt.doctor.slotDurationMinutes);
      const targetSlot = rawSlots.find((s) => s.startTime === newStartTime);
      if (!targetSlot) {
        return createErrorResponse("INVALID_SLOT", "Selected reschedule time slot is invalid", 400);
      }

      // Execute Reschedule Transaction
      const updatedAppt = await prisma.$transaction(async (tx) => {
        // Release old slot
        if (appt.slotId) {
          await tx.appointmentSlot.update({
            where: { id: appt.slotId },
            data: { status: "AVAILABLE", holdToken: null, holdExpiresAt: null },
          });
        }

        // Lock & upsert new slot
        const newSlot = await tx.appointmentSlot.upsert({
          where: {
            doctorId_date_startTime: { doctorId: appt.doctorId, date: newDate, startTime: newStartTime },
          },
          update: { status: "CONFIRMED", holdToken: null, holdExpiresAt: null },
          create: {
            doctorId: appt.doctorId,
            date: newDate,
            startTime: newStartTime,
            endTime: targetSlot.endTime,
            status: "CONFIRMED",
          },
        });

        // Update Appointment
        return await tx.appointment.update({
          where: { id: params.id },
          data: {
            slotId: newSlot.id,
            date: newDate,
            startTime: newStartTime,
            endTime: targetSlot.endTime,
            status: "RESCHEDULED",
          },
        });
      });

      // Queue Reschedule Notification
      await queueNotification("RESCHEDULE", appt.patient.email, {
        recipientName: appt.patient.name,
        doctorName: appt.doctor.user.name,
        specialization: appt.doctor.specialization,
        appointmentDate: newDate,
        appointmentTime: newStartTime,
      });

      return createSuccessResponse({ appointment: updatedAppt, message: "Appointment rescheduled successfully" });
    }

    return createErrorResponse("INVALID_ACTION", "Action must be CANCEL or RESCHEDULE", 400);
  } catch (error: any) {
    console.error("[Appointment Update Error]", error);
    return createErrorResponse("UPDATE_ERROR", error.message || "Failed to update appointment", 400);
  }
}
