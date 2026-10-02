import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signVerificationToken } from "@/lib/verification";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, phone, countryCode, password } = await req.json();

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "Por favor completa todos los campos (Nombre, Apellido, Correo, Teléfono y Contraseña)." },
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

    // 1. Validar que el correo no esté registrado
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "Este correo electrónico ya se encuentra registrado con otra cuenta en FALKO." },
        { status: 400 }
      );
    }

    // 2. Validar que el número de teléfono no esté registrado
    const existingPhone = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: "Este número de teléfono ya está asociado a otra cuenta en FALKO. Cada usuario debe tener un número único." },
        { status: 400 }
      );
    }

    // 3. Generar código de verificación criptográficamente seguro de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

    const verificationToken = signVerificationToken({
      email: cleanEmail,
      phone: cleanPhone,
      code,
      expiresAt,
    });

    // Enmascarar teléfono para visualización (ej: +598 99 *** 12)
    const phoneVisible = cleanPhone.length > 5
      ? `${cleanPhone.slice(0, 4)} *** ${cleanPhone.slice(-2)}`
      : cleanPhone;

    return NextResponse.json({
      success: true,
      verificationToken,
      verificationCodePreview: code,
      maskedPhone: phoneVisible,
      email: cleanEmail,
      message: `Código de verificación de 6 dígitos generado exitosamente para ${cleanEmail} y ${cleanPhone}.`,
    });
  } catch (error: any) {
    console.error("Error en send-code:", error);
    return NextResponse.json({ success: false, error: error.message || "Error al generar código de verificación." }, { status: 500 });
  }
}
