import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.roles.includes("ADMIN")) {
      return NextResponse.json({ success: false, error: "Acceso denegado." }, { status: 403 });
    }

    const { key, value } = await req.json();

    const setting = await prisma.platformSettings.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
