import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { verifyVerificationToken } from "@/lib/verification";

export async function POST(req: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      countryCode,
      preferredCurrency,
      verificationCode,
      verificationToken,
    } = await req.json();

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son obligatorios (Nombre, Apellido, Correo, Teléfono, País y Contraseña)." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    // 1. Validar Token y Código de Verificación OTP
    if (!verificationCode || !verificationToken) {
      return NextResponse.json(
        { success: false, error: "Se requiere ingresar el código de verificación de 6 dígitos para completar el registro." },
        { status: 400 }
      );
    }

    const verificationResult = verifyVerificationToken(verificationToken);
    if (!verificationResult.valid || !verificationResult.payload) {
      return NextResponse.json(
        { success: false, error: "El código de verificación ha expirado o es inválido. Por favor solicita uno nuevo." },
        { status: 400 }
      );
    }

    const { email: tokenEmail, phone: tokenPhone, code: expectedCode } = verificationResult.payload;

    if (tokenEmail !== cleanEmail || tokenPhone !== cleanPhone) {
      return NextResponse.json(
        { success: false, error: "Los datos de verificación no coinciden con la cuenta que intentas registrar." },
        { status: 400 }
      );
    }

    if (verificationCode.trim() !== expectedCode.trim()) {
      return NextResponse.json(
        { success: false, error: "El código de 6 dígitos ingresado es incorrecto. Verifica el código e inténtalo nuevamente." },
        { status: 400 }
      );
    }

    // 2. Comprobar unicidad final de correo
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "El correo electrónico ya se encuentra registrado con otra cuenta en FALKO." },
        { status: 400 }
      );
    }

    // 3. Comprobar unicidad final de teléfono
    const existingPhone = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: "El número de teléfono ya se encuentra registrado con otra cuenta en FALKO." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // 4. Crear usuario con rol BUYER y billetera limpia
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
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
      phone: newUser.phone,
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
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, error: error.message || "Error al registrar la cuenta." }, { status: 500 });
  }
}
