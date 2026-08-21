import { NextRequest, NextResponse } from "next/server";
import { authorizeUser } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/calendar";
import { createErrorResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(req);
  if ("error" in auth) {
    return createErrorResponse("UNAUTHORIZED", auth.error.message, auth.error.status);
  }

  const url = getGoogleAuthUrl(auth.user.userId);
  return NextResponse.redirect(url);
}
