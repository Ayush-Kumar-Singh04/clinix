import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookAppointmentSchema } from "@/lib/validations";
import { createErrorResponse, createSuccessResponse, generateTimeSlots, getDayOfWeek } from "@/lib/utils";
import { generatePreVisitSummary } from "@/lib/ai";
import { queueNotification } from "@/lib/email";
import { createGoogleCalendarEvent } from "@/lib/calendar";

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(req, ["PATIENT", "ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  const patientId = auth.user.userId;

  try {
    const body = await req.json();
    const validated = BookAppointmentSchema.parse(body);
    const { doctorId, date, startTime, symptoms, holdToken } = validated;

    // 1. Doctor & Availability Pre-validation
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: { select: { name: true, email: true } },
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
      return createErrorResponse("INVALID_SLOT", "Selected time slot is invalid", 400);
    }

    // 2. AI Pre-visit summary generation (server-side, error-resilient)
    let aiSummary = validated.aiPreVisitSummary;
    if (!aiSummary) {
      const generated = await generatePreVisitSummary(symptoms);
      aiSummary = {
        urgency: generated.urgency,
        chiefComplaint: generated.chiefComplaint,
        suggestedQuestions: generated.suggestedQuestions,
      };
    }

    const now = new Date();

    // 3. CONCURRENCY-SAFE TRANSACTION & DATABASE UNIQUE CONSTRAINT GUARD
    let appointment;
    try {
      appointment = await prisma.$transaction(async (tx) => {
        // Find existing slot with lock/isolation
        const existingSlot = await tx.appointmentSlot.findUnique({
          where: { doctorId_date_startTime: { doctorId, date, startTime } },
        });

        if (existingSlot) {
          if (existingSlot.status === "CONFIRMED") {
            throw new Error("SLOT_ALREADY_BOOKED");
          }
          if (
            existingSlot.status === "HELD" &&
            existingSlot.holdExpiresAt &&
            existingSlot.holdExpiresAt > now &&
            holdToken &&
            existingSlot.holdToken !== holdToken
          ) {
            throw new Error("SLOT_HELD_BY_OTHER");
          }
        }

        // Upsert slot to CONFIRMED
        const slot = await tx.appointmentSlot.upsert({
          where: { doctorId_date_startTime: { doctorId, date, startTime } },
          update: {
            status: "CONFIRMED",
            holdToken: null,
            holdExpiresAt: null,
          },
          create: {
            doctorId,
            date,
            startTime,
            endTime: targetSlot.endTime,
            status: "CONFIRMED",
          },
        });

        // Create Appointment
        const newAppt = await tx.appointment.create({
          data: {
            slotId: slot.id,
            patientId,
            doctorId,
            date,
            startTime,
            endTime: targetSlot.endTime,
            symptoms,
            urgency: aiSummary.urgency as "LOW" | "MEDIUM" | "HIGH",
            chiefComplaint: aiSummary.chiefComplaint,
            aiPreVisitSummary: typeof aiSummary === "string" ? aiSummary : JSON.stringify(aiSummary),
            status: "UPCOMING",
          },
          include: {
            doctor: { include: { user: true } },
            patient: true,
          },
        });

        return newAppt;
      });
    } catch (txError: any) {
      if (
        txError.code === "P2002" ||
        txError.message === "SLOT_ALREADY_BOOKED" ||
        txError.message === "SLOT_HELD_BY_OTHER"
      ) {
        return createErrorResponse(
          "SLOT_ALREADY_BOOKED",
          "This appointment slot was just booked by another patient. Please select another slot.",
          409
        );
      }
      throw txError;
    }

    // 4. NON-BLOCKING ASYNC EMAIL NOTIFICATION
    await queueNotification("BOOKING_CONFIRMATION", appointment.patient.email, {
      recipientName: appointment.patient.name,
      doctorName: appointment.doctor.user.name,
      specialization: appointment.doctor.specialization,
      appointmentDate: date,
      appointmentTime: startTime,
    });

    // 5. NON-BLOCKING GOOGLE CALENDAR EVENT CREATION
    await createGoogleCalendarEvent(patientId, appointment.id, {
      summary: `Clinix Appointment with Dr. ${appointment.doctor.user.name}`,
      description: `Specialization: ${appointment.doctor.specialization}\nSymptoms: ${symptoms}`,
      date,
      startTime,
      endTime: targetSlot.endTime,
    });

    return createSuccessResponse({ appointment }, 201);
  } catch (error: any) {
    console.error("[Book Appointment Error]", error);
    return createErrorResponse("BOOKING_ERROR", error.message || "Failed to book appointment", 400);
  }
}

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(req);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  const { role, userId } = auth.user;
  let whereClause: any = {};

  if (role === "PATIENT") {
    whereClause.patientId = userId;
  } else if (role === "DOCTOR") {
    const doctorProfile = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctorProfile) {
      return createSuccessResponse({ appointments: [] });
    }
    whereClause.doctorId = doctorProfile.id;
  }
  // ADMIN can view all

  const appointments = await prisma.appointment.findMany({
    where: whereClause,
    include: {
      patient: {
        select: { id: true, name: true, email: true, phone: true },
      },
      doctor: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      prescription: {
        include: { items: true },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const parsedAppointments = appointments.map((a: any) => {
    let pre = a.aiPreVisitSummary;
    let post = a.aiPostVisitSummary;
    if (typeof pre === "string") {
      try { pre = JSON.parse(pre); } catch {}
    }
    if (typeof post === "string") {
      try { post = JSON.parse(post); } catch {}
    }
    return { ...a, aiPreVisitSummary: pre, aiPostVisitSummary: post };
  });

  return createSuccessResponse({ appointments: parsedAppointments });
}
