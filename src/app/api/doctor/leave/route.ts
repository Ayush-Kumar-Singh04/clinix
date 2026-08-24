import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";
import { queueNotification } from "@/lib/email";
import { deleteGoogleCalendarEventsForAppointment } from "@/lib/calendar";

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(req, ["DOCTOR"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: auth.user.userId },
      include: { user: true },
    });

    if (!doctor) {
      return createErrorResponse("DOCTOR_NOT_FOUND", "Doctor profile not found", 404);
    }

    const leaves = await prisma.doctorLeave.findMany({
      where: { doctorId: doctor.id },
      orderBy: { leaveDate: "desc" },
    });

    // Enrich leaves with clash counts
    const enrichedLeaves = await Promise.all(
      leaves.map(async (leave) => {
        const clashingAppointments = await prisma.appointment.findMany({
          where: {
            doctorId: doctor.id,
            date: leave.leaveDate,
          },
          include: {
            patient: { select: { id: true, name: true, email: true, phone: true } },
          },
        });

        const activeClashes = clashingAppointments.filter(
          (a) => a.status === "UPCOMING" || a.status === "RESCHEDULED"
        );
        const resolvedClashes = clashingAppointments.filter(
          (a) => a.status === "CANCELLED"
        );

        return {
          id: leave.id,
          leaveDate: leave.leaveDate,
          reason: leave.reason,
          createdAt: leave.createdAt,
          totalBookingsOnDate: clashingAppointments.length,
          activeClashesCount: activeClashes.length,
          resolvedClashesCount: resolvedClashes.length,
          clashingAppointments: activeClashes.map((a) => ({
            id: a.id,
            startTime: a.startTime,
            endTime: a.endTime,
            patientName: a.patient.name,
            patientEmail: a.patient.email,
            patientPhone: a.patient.phone,
            symptoms: a.symptoms,
            urgency: a.urgency,
            status: a.status,
          })),
        };
      })
    );

    return createSuccessResponse({
      doctor: {
        id: doctor.id,
        name: doctor.user.name,
        specialization: doctor.specialization,
      },
      leaves: enrichedLeaves,
    });
  } catch (error: any) {
    console.error("[Doctor Leave GET Error]", error);
    return createErrorResponse("FETCH_ERROR", error.message || "Failed to fetch leaves", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(req, ["DOCTOR"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: auth.user.userId },
      include: { user: true },
    });

    if (!doctor) {
      return createErrorResponse("DOCTOR_NOT_FOUND", "Doctor profile not found", 404);
    }

    const body = await req.json();
    const { leaveDate, reason, previewOnly, autoResolveClashes } = body;

    if (!leaveDate) {
      return createErrorResponse("VALIDATION_ERROR", "Leave date is required (YYYY-MM-DD)", 400);
    }

    // 1. Audit clashing appointments on the requested leave date
    const clashingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: leaveDate,
        status: { in: ["UPCOMING", "RESCHEDULED"] },
      },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { startTime: "asc" },
    });

    // If previewOnly is true, return the audit report without saving
    if (previewOnly) {
      return createSuccessResponse({
        isClashing: clashingAppointments.length > 0,
        clashCount: clashingAppointments.length,
        leaveDate,
        reason: reason || "General Leave",
        clashingAppointments: clashingAppointments.map((a) => ({
          id: a.id,
          startTime: a.startTime,
          endTime: a.endTime,
          patientName: a.patient.name,
          patientEmail: a.patient.email,
          patientPhone: a.patient.phone,
          symptoms: a.symptoms,
          urgency: a.urgency,
        })),
      });
    }

    // 2. Execute Leave Creation
    const leaveRecord = await prisma.$transaction(async (tx) => {
      // Upsert DoctorLeave record
      const leave = await tx.doctorLeave.upsert({
        where: {
          doctorId_leaveDate: {
            doctorId: doctor.id,
            leaveDate,
          },
        },
        update: {
          reason: reason || "Leave requested by Doctor",
        },
        create: {
          doctorId: doctor.id,
          leaveDate,
          reason: reason || "Leave requested by Doctor",
        },
      });

      // If autoResolveClashes is selected by doctor/admin, cancel conflicting slots
      if (autoResolveClashes && clashingAppointments.length > 0) {
        for (const appt of clashingAppointments) {
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
      }

      return leave;
    });

    // 3. If clashing appointments were auto-resolved, send notification emails & remove calendar events
    if (autoResolveClashes && clashingAppointments.length > 0) {
      for (const appt of clashingAppointments) {
        await queueNotification("DOCTOR_LEAVE", appt.patient.email, {
          recipientName: appt.patient.name,
          doctorName: doctor.user.name,
          specialization: doctor.specialization,
          appointmentDate: leaveDate,
          appointmentTime: appt.startTime,
          actionReason: reason || `Dr. ${doctor.user.name} is on scheduled leave. Please rebook an available slot.`,
        });

        await deleteGoogleCalendarEventsForAppointment(appt.id);
      }
    }

    return createSuccessResponse({
      leave: leaveRecord,
      clashCount: clashingAppointments.length,
      autoResolved: Boolean(autoResolveClashes),
      message: autoResolveClashes && clashingAppointments.length > 0
        ? `Leave applied for ${leaveDate}. ${clashingAppointments.length} conflicting appointments were cancelled and patients notified.`
        : `Leave applied successfully for ${leaveDate}.${clashingAppointments.length > 0 ? ` Note: ${clashingAppointments.length} appointments are clashing on this date.` : ""}`,
    });
  } catch (error: any) {
    console.error("[Doctor Leave POST Error]", error);
    return createErrorResponse("LEAVE_APPLY_ERROR", error.message || "Failed to apply for leave", 500);
  }
}
