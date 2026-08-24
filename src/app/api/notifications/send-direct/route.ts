import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { queueNotification } from "@/lib/email";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(req, ["PATIENT", "DOCTOR", "ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  try {
    const body = await req.json();
    const { appointmentId, recipientType, recipientEmail, subject, message } = body;

    if (!recipientEmail || !message?.trim()) {
      return createErrorResponse("VALIDATION_ERROR", "Recipient email and message content are required.", 400);
    }

    let appointmentInfo: any = null;
    if (appointmentId) {
      appointmentInfo = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: { include: { user: true } },
        },
      });
    }

    // Identify sender
    const sender = await prisma.user.findUnique({
      where: { id: auth.user.userId },
    });

    const senderRole = auth.user.role;
    const senderName = sender?.name || "Clinix Member";

    // Queue notification job
    const job = await queueNotification(
      "BOOKING_CONFIRMATION", // Or custom type
      recipientEmail,
      {
        recipientName: body.recipientName || "Valued Member",
        doctorName: appointmentInfo?.doctor?.user?.name || (senderRole === "DOCTOR" ? senderName : undefined),
        specialization: appointmentInfo?.doctor?.specialization,
        appointmentDate: appointmentInfo?.date,
        appointmentTime: appointmentInfo?.startTime,
        actionReason: message,
        summaryText: `Direct communication from ${senderRole}: ${senderName} (${sender?.email})`,
      }
    );

    return createSuccessResponse({
      jobId: job?.id,
      recipientEmail,
      message: `Email successfully queued and dispatched to ${recipientEmail}`,
    });
  } catch (error: any) {
    console.error("[Send Direct Email Error]", error);
    return createErrorResponse("SEND_EMAIL_ERROR", error.message || "Failed to send email", 500);
  }
}
