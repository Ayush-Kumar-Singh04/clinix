import { NextRequest } from "next/server";
import { authorizeUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DoctorCreateSchema } from "@/lib/validations";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(req, ["ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    const body = await req.json();
    const validated = DoctorCreateSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email: validated.email } });
    if (existingUser) {
      return createErrorResponse("EMAIL_EXISTS", "A user with this email already exists.", 400);
    }

    const passwordHash = await hashPassword(validated.password);

    // Default working hours Monday-Friday 09:00 - 17:00 if not provided
    const defaultWorkingHours = [1, 2, 3, 4, 5].map((day) => ({
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
    }));

    const workingHoursToCreate = validated.workingHours || defaultWorkingHours;

    const doctor = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: validated.email,
          name: validated.name,
          passwordHash,
          role: "DOCTOR",
          phone: validated.phone || null,
        },
      });

      const doc = await tx.doctor.create({
        data: {
          userId: user.id,
          specialization: validated.specialization,
          bio: validated.bio || null,
          slotDurationMinutes: validated.slotDurationMinutes || 30,
          avatarUrl: validated.avatarUrl || null,
          workingHours: {
            create: workingHoursToCreate,
          },
        },
        include: {
          user: true,
          workingHours: true,
        },
      });

      return doc;
    });

    return createSuccessResponse({ doctor }, 201);
  } catch (error: any) {
    console.error("[Admin Create Doctor Error]", error);
    return createErrorResponse("CREATE_DOCTOR_ERROR", error.message || "Failed to create doctor", 400);
  }
}

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(req, ["ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  const doctors = await prisma.doctor.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      workingHours: true,
      leaves: true,
      _count: { select: { doctorAppointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return createSuccessResponse({ doctors });
}
