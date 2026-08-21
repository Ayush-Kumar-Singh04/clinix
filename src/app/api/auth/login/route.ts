import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/lib/validations";
import { verifyPassword, signToken, TOKEN_COOKIE_NAME } from "@/lib/auth";
import { createErrorResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      include: { doctor: true },
    });

    if (!user) {
      return createErrorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      return createErrorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as "PATIENT" | "DOCTOR" | "ADMIN",
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        doctorId: user.doctor?.id || null,
      },
    });

    response.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[Login Error]", error);
    return createErrorResponse("LOGIN_ERROR", error.message || "Login failed", 400);
  }
}
