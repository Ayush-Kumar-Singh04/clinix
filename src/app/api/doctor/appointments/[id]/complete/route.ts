import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClinicalNotesSchema } from "@/lib/validations";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";
import { generatePostVisitSummary } from "@/lib/ai";
import { queueNotification } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser(req, ["DOCTOR", "ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  const { id: appointmentId } = params;

  try {
    const body = await req.json();
    const validated = ClinicalNotesSchema.parse(body);
    const { clinicalNotes, doctorNotesPatient, prescriptionItems = [] } = validated;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: { include: { user: true } },
      },
    });

    if (!appointment) {
      return createErrorResponse("APPOINTMENT_NOT_FOUND", "Appointment not found", 404);
    }

    if (auth.user.role === "DOCTOR" && appointment.doctor.userId !== auth.user.userId) {
      return createErrorResponse("FORBIDDEN", "You are not the assigned doctor for this appointment", 403);
    }

    // 1. Generate Patient-Friendly AI Post-Visit Summary
    const aiPostVisitSummary = await generatePostVisitSummary(
      clinicalNotes,
      prescriptionItems,
      doctorNotesPatient
    );

    // 2. Execute Complete Visit Transaction
    const updatedAppointment = await prisma.$transaction(async (tx) => {
      // Update Appointment status & notes
      const appt = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "COMPLETED",
          clinicalNotes,
          doctorNotesPatient,
          aiPostVisitSummary: typeof aiPostVisitSummary === "string" ? aiPostVisitSummary : JSON.stringify(aiPostVisitSummary),
        },
      });

      // Clean up any existing prescription for this appointment (prevents unique constraint error on re-submission)
      await tx.prescription.deleteMany({
        where: { appointmentId },
      });

      // Create Prescription if items provided
      if (prescriptionItems.length > 0) {
        const prescription = await tx.prescription.create({
          data: {
            appointmentId,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            items: {
              create: prescriptionItems.map((item) => ({
                medicineName: item.medicineName,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instructions: item.instructions || null,
              })),
            },
          },
          include: { items: true },
        });

        // Automatically create Medication Reminders for each prescription item
        for (const item of prescription.items) {
          await tx.medicationReminder.create({
            data: {
              prescriptionItemId: item.id,
              patientId: appointment.patientId,
              reminderTime: "08:00",
              frequency: item.frequency,
              status: "PENDING",
            },
          });
        }
      }

      return appt;
    });

    // 3. NON-BLOCKING POST-VISIT EMAIL QUEUE
    await queueNotification("POST_VISIT", appointment.patient.email, {
      recipientName: appointment.patient.name,
      doctorName: appointment.doctor.user.name,
      specialization: appointment.doctor.specialization,
      appointmentDate: appointment.date,
      summaryText: aiPostVisitSummary.summary,
    });

    return createSuccessResponse({
      appointment: updatedAppointment,
      aiPostVisitSummary,
      message: "Appointment visit completed successfully",
    });
  } catch (error: any) {
    console.error("[Complete Appointment Error]", error);
    return createErrorResponse("COMPLETE_VISIT_ERROR", error.message || "Failed to complete appointment", 400);
  }
}
