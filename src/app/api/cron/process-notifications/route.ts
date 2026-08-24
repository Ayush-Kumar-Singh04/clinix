import { NextRequest } from "next/server";
import { processNotificationQueue } from "@/lib/email";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "clinix-cron-secret-key-12345";

  // Vercel Cron automatically sends Authorization: Bearer <CRON_SECRET>
  if (authHeader !== `Bearer ${cronSecret}` && req.nextUrl.searchParams.get("secret") !== cronSecret) {
    return createErrorResponse("UNAUTHORIZED", "Invalid cron secret authorization key", 401);
  }

  try {
    const result = await processNotificationQueue(20);
    return createSuccessResponse(result);
  } catch (error: any) {
    console.error("[Cron Notification Error]", error);
    return createErrorResponse("CRON_ERROR", error.message || "Failed to process notification queue", 500);
  }
}
