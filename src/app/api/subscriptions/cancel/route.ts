import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ success: false, error: "ID de suscripción requerido" }, { status: 400 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== user.id) {
      return NextResponse.json({ success: false, error: "Suscripción no encontrada o no pertenece al usuario" }, { status: 404 });
    }

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tu membresía ha sido cancelada exitosamente. No se realizarán más cobros.",
      subscription: updated,
    });
  } catch (err: any) {
    console.error("POST /api/subscriptions/cancel error:", err);
    return NextResponse.json({ success: false, error: "Error al cancelar membresía" }, { status: 500 });
  }
}
