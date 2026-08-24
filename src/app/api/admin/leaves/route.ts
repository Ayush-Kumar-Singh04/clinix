import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(req, ["ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    const leaves = await prisma.doctorLeave.findMany({
      include: {
        doctor: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
      },
      orderBy: { leaveDate: "desc" },
    });

    const enrichedLeaves = await Promise.all(
      leaves.map(async (leave) => {
        const clashingAppointments = await prisma.appointment.findMany({
          where: {
            doctorId: leave.doctorId,
            date: leave.leaveDate,
          },
          include: {
            patient: { select: { id: true, name: true, email: true, phone: true } },
          },
          orderBy: { startTime: "asc" },
        });

        const activeClashes = clashingAppointments.filter(
          (a) => a.status === "UPCOMING" || a.status === "RESCHEDULED"
        );
        const resolvedClashes = clashingAppointments.filter(
          (a) => a.status === "CANCELLED"
        );

        return {
          id: leave.id,
          doctorId: leave.doctorId,
          doctorName: leave.doctor.user.name,
          doctorEmail: leave.doctor.user.email,
          doctorPhone: leave.doctor.user.phone,
          specialization: leave.doctor.specialization,
          avatarUrl: leave.doctor.avatarUrl,
          leaveDate: leave.leaveDate,
          reason: leave.reason,
          createdAt: leave.createdAt,
          totalAppointmentsOnDate: clashingAppointments.length,
          activeClashesCount: activeClashes.length,
          resolvedClashesCount: resolvedClashes.length,
          activeClashes: activeClashes.map((a) => ({
            id: a.id,
            startTime: a.startTime,
            endTime: a.endTime,
            patientName: a.patient.name,
            patientEmail: a.patient.email,
            patientPhone: a.patient.phone,
            symptoms: a.symptoms,
            urgency: a.urgency,
          })),
        };
      })
    );

    return createSuccessResponse({
      leaves: enrichedLeaves,
      totalCount: enrichedLeaves.length,
      clashingCount: enrichedLeaves.filter((l) => l.activeClashesCount > 0).length,
    });
  } catch (error: any) {
    console.error("[Admin Leaves GET Error]", error);
    return createErrorResponse("FETCH_ERROR", error.message || "Failed to fetch leaves", 500);
  }
}
