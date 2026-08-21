import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthClient } from "@/lib/calendar";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  if (!code || !userId) {
    return NextResponse.redirect(new URL("/patient?calendar_error=missing_code", req.url));
  }

  try {
    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.access_token) {
      await prisma.calendarConnection.upsert({
        where: { userId },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || undefined,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        },
        create: {
          userId,
          provider: "GOOGLE",
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || null,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });
    }

    return NextResponse.redirect(new URL("/patient/calendar?status=connected", req.url));
  } catch (error) {
    console.error("[Calendar Callback Error]", error);
    return NextResponse.redirect(new URL("/patient?calendar_error=failed", req.url));
  }
}
