import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorizeUser(req, ["DOCTOR", "ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    const leaveId = params.id;

    const leave = await prisma.doctorLeave.findUnique({
      where: { id: leaveId },
      include: { doctor: true },
    });

    if (!leave) {
      return createErrorResponse("NOT_FOUND", "Leave record not found", 404);
    }

    // If doctor, verify ownership
    if (auth.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: auth.user.userId },
      });
      if (!doctor || doctor.id !== leave.doctorId) {
        return createErrorResponse("FORBIDDEN", "You cannot delete another doctor's leave", 403);
      }
    }

    await prisma.doctorLeave.delete({
      where: { id: leaveId },
    });

    return createSuccessResponse({
      message: `Leave for date ${leave.leaveDate} has been removed. You are now marked as available on this date.`,
    });
  } catch (error: any) {
    console.error("[Doctor Leave DELETE Error]", error);
    return createErrorResponse("DELETE_ERROR", error.message || "Failed to delete leave", 500);
  }
}
