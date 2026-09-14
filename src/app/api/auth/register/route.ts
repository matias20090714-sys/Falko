import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, countryCode, preferredCurrency } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, error: "Todos los campos son obligatorios." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "El correo ya se encuentra registrado en FALKO." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Create user with default BUYER role and initial wallet
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        firstName,
        lastName,
        countryCode: countryCode || "US",
        preferredCurrency: preferredCurrency || "USD",
        roles: {
          create: [{ role: "BUYER" }],
        },
        wallet: {
          create: {
            currencyCode: preferredCurrency || "USD",
          },
        },
      },
      include: {
        roles: true,
      },
    });

    const sessionUser = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      countryCode: newUser.countryCode,
      preferredCurrency: newUser.preferredCurrency,
      roles: newUser.roles.map((r) => r.role as any),
      isSuspended: false,
    };

    const token = signToken(sessionUser);

    const response = NextResponse.json({ success: true, user: sessionUser });

    response.cookies.set("falko_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
