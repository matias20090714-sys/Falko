import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.roles.includes("ADMIN")) {
      return NextResponse.json({ success: false, error: "Acceso denegado. Se requieren permisos de ADMIN." }, { status: 403 });
    }

    const { userId, action, reason, newRole } = await req.json();

    if (action === "SUSPEND") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isSuspended: true,
          suspensionReason: reason || "Suspensión administrativa por infracción de políticas.",
        },
      });
    } else if (action === "UNSUSPEND") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isSuspended: false,
          suspensionReason: null,
        },
      });
    } else if (action === "ADD_ROLE" && newRole) {
      await prisma.userRole.upsert({
        where: { userId_role: { userId, role: newRole } },
        create: { userId, role: newRole },
        update: {},
      });
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: `USER_${action}`,
        targetType: "USER",
        targetId: userId,
        details: reason || `Role: ${newRole}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
