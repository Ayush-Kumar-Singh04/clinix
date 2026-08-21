import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DoctorLeaveSchema } from "@/lib/validations";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";
import { queueNotification } from "@/lib/email";
import { deleteGoogleCalendarEventsForAppointment } from "@/lib/calendar";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser(req, ["ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  const { id: doctorId } = params;

  try {
    const body = await req.json();
    const validated = DoctorLeaveSchema.parse(body);
    const { leaveDate, reason, confirm } = validated;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (!doctor) {
      return createErrorResponse("DOCTOR_NOT_FOUND", "Doctor not found", 404);
    }

    // Find affected appointments on that date
    const affectedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: leaveDate,
        status: { in: ["UPCOMING", "RESCHEDULED"] },
      },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { startTime: "asc" },
    });

    // Step 1: DRY RUN PREVIEW if confirm is false
    if (!confirm) {
      return createSuccessResponse({
        requiresConfirmation: true,
        doctorId,
        doctorName: doctor.user.name,
        leaveDate,
        reason: reason || "Doctor unavailable",
        affectedCount: affectedAppointments.length,
        affectedAppointments: affectedAppointments.map((a) => ({
          id: a.id,
          startTime: a.startTime,
          endTime: a.endTime,
          patientName: a.patient.name,
          patientEmail: a.patient.email,
          symptoms: a.symptoms,
        })),
      });
    }

    // Step 2: EXECUTE LEAVE & RESOLVE CONFLICTS
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or update DoctorLeave
      const leave = await tx.doctorLeave.upsert({
        where: { doctorId_leaveDate: { doctorId, leaveDate } },
        update: { reason: reason || "Admin designated leave" },
        create: {
          doctorId,
          leaveDate,
          reason: reason || "Admin designated leave",
        },
      });

      // 2. Mark appointments as CANCELLED
      for (const appt of affectedAppointments) {
        await tx.appointment.update({
          where: { id: appt.id },
          data: { status: "CANCELLED" },
        });

        if (appt.slotId) {
          await tx.appointmentSlot.update({
            where: { id: appt.slotId },
            data: { status: "CANCELLED", holdToken: null, holdExpiresAt: null },
          });
        }
      }

      return leave;
    });

    // 3. Post-transaction Non-blocking Async Tasks (Notifications & Calendar Removal)
    for (const appt of affectedAppointments) {
      await queueNotification("DOCTOR_LEAVE", appt.patient.email, {
        recipientName: appt.patient.name,
        doctorName: doctor.user.name,
        specialization: doctor.specialization,
        appointmentDate: leaveDate,
        appointmentTime: appt.startTime,
        actionReason: reason || "Doctor on emergency leave. Please rebook an available slot.",
      });

      await deleteGoogleCalendarEventsForAppointment(appt.id);
    }

    return createSuccessResponse({
      leave: result,
      affectedCount: affectedAppointments.length,
      message: `Doctor leave set for ${leaveDate}. ${affectedAppointments.length} appointments were cancelled and notified.`,
    });
  } catch (error: any) {
    console.error("[Doctor Leave Error]", error);
    return createErrorResponse("LEAVE_ERROR", error.message || "Failed to process doctor leave", 400);
  }
}
