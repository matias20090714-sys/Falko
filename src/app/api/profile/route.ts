import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword, comparePassword, signToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        phone: true,
        bio: true,
        countryCode: true,
        preferredCurrency: true,
        createdAt: true,
        roles: {
          select: { role: true },
        },
        affiliateProfile: {
          select: { affiliateCode: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        roles: user.roles.map((r) => r.role),
        affiliateCode: user.affiliateProfile?.affiliateCode,
      },
    });
  } catch (error: any) {
    console.error("Error loading profile:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      bio,
      avatarUrl,
      countryCode,
      preferredCurrency,
      currentPassword,
      newPassword,
    } = await req.json();

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { success: false, error: "El nombre y apellido son obligatorios." },
        { status: 400 }
      );
    }

    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Ingresa un correo electrónico válido." },
        { status: 400 }
      );
    }

    // Check if email is changing and if it is already taken
    if (cleanEmail !== currentUser.email) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          id: { not: currentUser.id },
        },
      });

      if (emailTaken) {
        return NextResponse.json(
          { success: false, error: "El correo electrónico ya está registrado por otra cuenta." },
          { status: 400 }
        );
      }
    }

    // Handle password change if requested
    let passwordHashUpdate: string | undefined;
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: "Debes ingresar tu contraseña actual para cambiarla." },
          { status: 400 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: currentUser.id },
      });

      const isPasswordValid = await comparePassword(currentPassword, existingUser?.passwordHash || "");
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: "La contraseña actual es incorrecta." },
          { status: 400 }
        );
      }

      passwordHashUpdate = await hashPassword(newPassword);
    }

    // Update database
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        bio: bio ? bio.trim() : null,
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
        countryCode: countryCode || currentUser.countryCode,
        preferredCurrency: preferredCurrency || currentUser.preferredCurrency,
        ...(passwordHashUpdate ? { passwordHash: passwordHashUpdate } : {}),
      },
      include: {
        roles: true,
        affiliateProfile: true,
      },
    });

    // Re-sign session cookie with updated data
    const sessionPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatarUrl: updatedUser.avatarUrl,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      countryCode: updatedUser.countryCode,
      preferredCurrency: updatedUser.preferredCurrency,
      roles: updatedUser.roles.map((r) => r.role as any),
      affiliateCode: updatedUser.affiliateProfile?.affiliateCode,
      isSuspended: updatedUser.isSuspended,
    };

    const newJwtToken = signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      message: "¡Perfil actualizado exitosamente!",
      user: {
        ...sessionPayload,
      },
    });

    // Set updated session cookie
    response.cookies.set("falko_session", newJwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
