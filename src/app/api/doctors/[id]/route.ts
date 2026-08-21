import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      workingHours: {
        orderBy: { dayOfWeek: "asc" },
      },
      leaves: {
        where: {
          leaveDate: { gte: new Date().toISOString().split("T")[0] },
        },
      },
    },
  });

  if (!doctor) {
    return createErrorResponse("DOCTOR_NOT_FOUND", "Doctor profile not found", 404);
  }

  return createSuccessResponse({ doctor });
}
