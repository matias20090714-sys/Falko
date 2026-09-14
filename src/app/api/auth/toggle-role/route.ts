import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, signToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const { role } = await req.json();

    if (!["SELLER", "AFFILIATE"].includes(role)) {
      return NextResponse.json({ success: false, error: "Rol no permitido para auto-activación." }, { status: 400 });
    }

    // Check if user already has role
    const existingRole = await prisma.userRole.findUnique({
      where: {
        userId_role: {
          userId: user.id,
          role,
        },
      },
    });

    if (existingRole) {
      return NextResponse.json({ success: true, message: `El modo ${role} ya está activo.` });
    }

    // Add role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        role,
      },
    });

    // If activating AFFILIATE, generate unique affiliate code if not exists
    if (role === "AFFILIATE") {
      const existingProfile = await prisma.affiliateProfile.findUnique({
        where: { userId: user.id },
      });

      if (!existingProfile) {
        const count = await prisma.affiliateProfile.count();
        const affiliateCode = `AFF-${String(count + 1).padStart(6, "0")}`;

        await prisma.affiliateProfile.create({
          data: {
            userId: user.id,
            affiliateCode,
          },
        });
      }
    }

    // Refresh user session token
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { roles: true, affiliateProfile: true },
    });

    if (!freshUser) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 404 });
    }

    const sessionUser = {
      id: freshUser.id,
      email: freshUser.email,
      firstName: freshUser.firstName,
      lastName: freshUser.lastName,
      countryCode: freshUser.countryCode,
      preferredCurrency: freshUser.preferredCurrency,
      roles: freshUser.roles.map((r) => r.role as any),
      affiliateCode: freshUser.affiliateProfile?.affiliateCode,
      isSuspended: freshUser.isSuspended,
    };

    const token = signToken(sessionUser);
    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      message: `¡Modo ${role} activado exitosamente!`,
    });

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
