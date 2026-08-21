import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSuccessResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialization = searchParams.get("specialization");
  const query = searchParams.get("query");

  const whereClause: any = {
    isActive: true,
  };

  if (specialization && specialization !== "ALL") {
    whereClause.specialization = specialization;
  }

  if (query) {
    whereClause.OR = [
      { user: { name: { contains: query, mode: "insensitive" } } },
      { specialization: { contains: query, mode: "insensitive" } },
      { bio: { contains: query, mode: "insensitive" } },
    ];
  }

  const doctors = await prisma.doctor.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      workingHours: true,
    },
    orderBy: { rating: "desc" },
  });

  return createSuccessResponse({ doctors });
}
