import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DoctorUpdateSchema } from "@/lib/validations";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";
import { sendDirectEmail, getDoctorOffboardingEmailHtml } from "@/lib/email";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser(req, ["ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    const body = await req.json();
    const validated = DoctorUpdateSchema.parse(body);

    const doc = await prisma.doctor.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!doc) {
      return createErrorResponse("DOCTOR_NOT_FOUND", "Doctor not found", 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (validated.name) {
        await tx.user.update({
          where: { id: doc.userId },
          data: { name: validated.name },
        });
      }

      return await tx.doctor.update({
        where: { id: params.id },
        data: {
          specialization: validated.specialization ?? doc.specialization,
          bio: validated.bio ?? doc.bio,
          slotDurationMinutes: validated.slotDurationMinutes ?? doc.slotDurationMinutes,
          isActive: validated.isActive ?? doc.isActive,
          avatarUrl: validated.avatarUrl ?? doc.avatarUrl,
        },
        include: { user: true },
      });
    });

    return createSuccessResponse({ doctor: updated });
  } catch (error: any) {
    console.error("[Update Doctor Error]", error);
    return createErrorResponse("UPDATE_DOCTOR_ERROR", error.message || "Failed to update doctor", 400);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser(req, ["ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const reason = body.reason || "Administrative Separation / Staff Offboarding";
    const customNote = body.customNote || "";
    const actionType = body.actionType || "TERMINATION";

    const doc = await prisma.doctor.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!doc) {
      return createErrorResponse("DOCTOR_NOT_FOUND", "Doctor not found", 404);
    }

    const doctorEmail = doc.user.email;
    const doctorName = doc.user.name;
    const doctorSpecialization = doc.specialization;
    const userId = doc.userId;

    // Send the official offboarding / retirement email notice immediately
    sendDirectEmail({
      to: doctorEmail,
      subject: actionType === "RETIREMENT"
        ? "Clinix Healthcare — Retirement & Service Appreciation Notice"
        : `Clinix Healthcare — Notice of Account Separation (${reason})`,
      html: getDoctorOffboardingEmailHtml({
        name: doctorName,
        email: doctorEmail,
        specialization: doctorSpecialization,
        reason,
        customNote,
        actionType,
      }),
    }).catch((err) => console.error("[Offboarding Email Notice Error]", err));

    // Cancel all upcoming appointments for this doctor and remove records
    await prisma.$transaction(async (tx) => {
      // Cancel upcoming appointments
      await tx.appointment.updateMany({
        where: {
          doctorId: params.id,
          status: "UPCOMING",
        },
        data: {
          status: "CANCELLED",
          clinicalNotes: `Physician departed / offboarded from Clinix (${reason})`,
        },
      });

      // Delete the Doctor record
      await tx.doctor.delete({
        where: { id: params.id },
      });

      // Delete the User login record to clean up and free email
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return createSuccessResponse({
      message: `Dr. ${doctorName} has been successfully offboarded and notice has been emailed to ${doctorEmail}.`,
    });
  } catch (error: any) {
    console.error("[Delete Doctor Error]", error);
    return createErrorResponse("DELETE_DOCTOR_ERROR", error.message || "Failed to offboard doctor", 400);
  }
}
