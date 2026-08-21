import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(req, ["ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  const jobs = await prisma.notificationJob.findMany({
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });

  const pending = await prisma.notificationJob.count({ where: { status: "PENDING" } });
  const sent = await prisma.notificationJob.count({ where: { status: "SENT" } });
  const failed = await prisma.notificationJob.count({ where: { status: "FAILED" } });

  return createSuccessResponse({
    stats: { pending, sent, failed, total: jobs.length },
    jobs,
  });
}
