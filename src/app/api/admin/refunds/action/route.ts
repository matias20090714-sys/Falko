import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { processRefundLedger } from "@/lib/ledger";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.roles.includes("ADMIN")) {
      return NextResponse.json({ success: false, error: "Acceso denegado." }, { status: 403 });
    }

    const { refundId, action, notes } = await req.json(); // action: "APPROVE" | "REJECT"

    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: { order: true },
    });

    if (!refund) {
      return NextResponse.json({ success: false, error: "Solicitud de reembolso no encontrada." }, { status: 404 });
    }

    if (action === "APPROVE") {
      // Execute strict ledger reversal
      await processRefundLedger(refund.orderId, notes || "Aprobado por administración en garantía");

      await prisma.notification.create({
        data: {
          userId: refund.buyerId,
          title: "Reembolso aprobado ✓",
          message: `Tu solicitud de reembolso para la orden #${refund.order.orderNumber} ha sido aprobada.`,
          type: "REFUND_APPROVED",
          linkUrl: "/library",
        },
      });
    } else if (action === "REJECT") {
      await prisma.refund.update({
        where: { id: refundId },
        data: {
          status: "REJECTED",
          adminNotes: notes || "Solicitud de reembolso no cumple con las condiciones de la garantía.",
          processedAt: new Date(),
        },
      });

      await prisma.notification.create({
        data: {
          userId: refund.buyerId,
          title: "Reembolso rechazado",
          message: `Tu solicitud de reembolso para la orden #${refund.order.orderNumber} no fue aprobada (${notes || "plazo expirado"}).`,
          type: "REFUND_REJECTED",
          linkUrl: "/library",
        },
      });
    }

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: `REFUND_${action}`,
        targetType: "REFUND",
        targetId: refundId,
        details: notes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
