import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { queueNotification } from "@/lib/email";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "clinix-cron-secret-key-12345";

  if (authHeader !== `Bearer ${cronSecret}` && req.nextUrl.searchParams.get("secret") !== cronSecret) {
    return createErrorResponse("UNAUTHORIZED", "Invalid cron secret authorization key", 401);
  }

  try {
    const reminders = await prisma.medicationReminder.findMany({
      where: { status: "PENDING" },
      include: {
        patient: true,
        prescriptionItem: true,
      },
      take: 50,
    });

    let queuedCount = 0;
    for (const rem of reminders) {
      await queueNotification("MEDICATION_REMINDER", rem.patient.email, {
        recipientName: rem.patient.name,
        medicineName: rem.prescriptionItem.medicineName,
        dosage: rem.prescriptionItem.dosage,
        actionReason: `Frequency: ${rem.frequency} | Instructions: ${rem.prescriptionItem.instructions || "As prescribed"}`,
      });

      await prisma.medicationReminder.update({
        where: { id: rem.id },
        data: {
          status: "SENT",
          lastSentAt: new Date(),
        },
      });
      queuedCount++;
    }

    return createSuccessResponse({ processed: reminders.length, queuedCount });
  } catch (error: any) {
    console.error("[Cron Reminder Error]", error);
    return createErrorResponse("CRON_ERROR", error.message || "Failed to process medication reminders", 500);
  }
}
