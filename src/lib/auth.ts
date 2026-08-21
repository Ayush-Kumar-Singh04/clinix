import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "clinix-super-secret-jwt-key-2026";
export const TOKEN_COOKIE_NAME = "clinix_auth_token";

export interface TokenPayload {
  userId: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getUserFromRequest(req: NextRequest): Promise<TokenPayload | null> {
  const tokenFromCookie = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const authHeader = req.headers.get("authorization");
  let token = tokenFromCookie;

  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function authorizeUser(
  req: NextRequest,
  allowedRoles?: ("PATIENT" | "DOCTOR" | "ADMIN")[]
): Promise<{ user: TokenPayload } | { error: { message: string; status: number } }> {
  const user = await getUserFromRequest(req);
  if (!user) {
    return { error: { message: "Unauthorized - Login required", status: 401 } };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      error: {
        message: `Forbidden - Insufficient permissions for role ${user.role}`,
        status: 403,
      },
    };
  }

  return { user };
}
