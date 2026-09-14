import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = process.env.AUTH_SECRET || "falko-jwt-secret-key-2026";
const COOKIE_NAME = "falko_session";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  countryCode: string;
  preferredCurrency: string;
  roles: ("BUYER" | "SELLER" | "AFFILIATE" | "ADMIN")[];
  affiliateCode?: string;
  isSuspended: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      countryCode: user.countryCode,
      preferredCurrency: user.preferredCurrency,
      roles: user.roles,
      affiliateCode: user.affiliateCode,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.id) return null;

    // Fetch fresh user record
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        roles: true,
        affiliateProfile: true,
      },
    });

    if (!user || user.isSuspended) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      countryCode: user.countryCode,
      preferredCurrency: user.preferredCurrency,
      roles: user.roles.map((r) => r.role as "BUYER" | "SELLER" | "AFFILIATE" | "ADMIN"),
      affiliateCode: user.affiliateProfile?.affiliateCode,
      isSuspended: user.isSuspended,
    };
  } catch {
    return null;
  }
}

export async function hasRole(userId: string, role: "BUYER" | "SELLER" | "AFFILIATE" | "ADMIN"): Promise<boolean> {
  const count = await prisma.userRole.count({
    where: {
      userId,
      role,
    },
  });
  return count > 0;
}
