import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DoctorUpdateSchema } from "@/lib/validations";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

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
