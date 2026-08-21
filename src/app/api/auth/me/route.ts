import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSuccessResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) {
    return NextResponse.json({ success: true, authenticated: false, user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenUser.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      createdAt: true,
      doctor: {
        select: {
          id: true,
          specialization: true,
          bio: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ success: true, authenticated: false, user: null });
  }

  return createSuccessResponse({ authenticated: true, user });
}
