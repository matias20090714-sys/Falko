import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Ingresa tu correo y contraseña." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        roles: true,
        affiliateProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 401 });
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { success: false, error: `Cuenta suspendida por administración: ${user.suspensionReason || "Violación de términos"}` },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Contraseña incorrecta." }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      countryCode: user.countryCode,
      preferredCurrency: user.preferredCurrency,
      roles: user.roles.map((r) => r.role as any),
      affiliateCode: user.affiliateProfile?.affiliateCode,
      isSuspended: user.isSuspended,
    };

    const token = signToken(sessionUser);

    const response = NextResponse.json({ success: true, user: sessionUser });

    // Set secure cookie
    response.cookies.set("falko_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
