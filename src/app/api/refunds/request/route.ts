import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const { orderId, reason } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.buyerId !== user.id) {
      return NextResponse.json({ success: false, error: "Orden no encontrada." }, { status: 404 });
    }

    if (order.status !== "CONFIRMED") {
      return NextResponse.json({ success: false, error: "La orden no se encuentra en estado confirmado." }, { status: 400 });
    }

    // Check if within guarantee date
    const now = new Date();
    if (now > new Date(order.guaranteeReleaseDate)) {
      return NextResponse.json(
        {
          success: false,
          error: "El período de garantía de este producto ha expirado. Ya no es posible solicitar reembolso.",
        },
        { status: 400 }
      );
    }

    const refund = await prisma.refund.upsert({
      where: { orderId },
      create: {
        orderId,
        buyerId: user.id,
        amount: order.totalAmount,
        currencyCode: order.currencyCode,
        reason: reason || "Solicitud de comprador en garantía",
        status: "REQUESTED",
      },
      update: {
        reason: reason || "Solicitud de comprador en garantía",
        status: "REQUESTED",
      },
    });

    return NextResponse.json({ success: true, refund });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
