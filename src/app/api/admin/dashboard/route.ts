import { NextRequest } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createErrorResponse, createSuccessResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(req, ["ADMIN"]);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  const totalPatients = await prisma.user.count({ where: { role: "PATIENT" } });
  const totalDoctors = await prisma.doctor.count();
  const totalAppointments = await prisma.appointment.count();

  const upcomingCount = await prisma.appointment.count({ where: { status: "UPCOMING" } });
  const completedCount = await prisma.appointment.count({ where: { status: "COMPLETED" } });
  const cancelledCount = await prisma.appointment.count({ where: { status: "CANCELLED" } });

  // Urgency distribution
  const lowUrgency = await prisma.appointment.count({ where: { urgency: "LOW" } });
  const medUrgency = await prisma.appointment.count({ where: { urgency: "MEDIUM" } });
  const highUrgency = await prisma.appointment.count({ where: { urgency: "HIGH" } });

  // Specialization breakdown
  const doctorsBySpec = await prisma.doctor.groupBy({
    by: ["specialization"],
    _count: { id: true },
  });

  const specDistribution = doctorsBySpec.map((item) => ({
    specialization: item.specialization,
    count: item._count.id,
  }));

  // Appointments trend (grouped by date)
  const recentAppointments = await prisma.appointment.findMany({
    select: { date: true, status: true },
    orderBy: { date: "asc" },
    take: 100,
  });

  const trendMap = new Map<string, { date: string; total: number; completed: number; cancelled: number }>();
  for (const appt of recentAppointments) {
    const existing = trendMap.get(appt.date) || { date: appt.date, total: 0, completed: 0, cancelled: 0 };
    existing.total += 1;
    if (appt.status === "COMPLETED") existing.completed += 1;
    if (appt.status === "CANCELLED") existing.cancelled += 1;
    trendMap.set(appt.date, existing);
  }

  const trends = Array.from(trendMap.values()).slice(-7); // Last 7 active dates

  return createSuccessResponse({
    stats: {
      totalPatients,
      totalDoctors,
      totalAppointments,
      upcomingCount,
      completedCount,
      cancelledCount,
    },
    urgencyDistribution: [
      { name: "Low Urgency", value: lowUrgency, color: "#10b981" },
      { name: "Medium Urgency", value: medUrgency, color: "#f59e0b" },
      { name: "High Urgency", value: highUrgency, color: "#ef4444" },
    ],
    specDistribution,
    trends,
  });
}
