import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.roles.includes("ADMIN")) {
      return NextResponse.json({ success: false, error: "Acceso denegado." }, { status: 403 });
    }

    const { productId, action, reason } = await req.json(); // action: "APPROVE" | "REJECT" | "SUSPEND"

    let status = "APPROVED";
    if (action === "REJECT") status = "REJECTED";
    if (action === "SUSPEND") status = "SUSPENDED";

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        status,
        rejectionReason: reason || null,
      },
      include: { seller: true },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        title: `Estado de producto actualizado: ${status}`,
        message: `Tu producto "${product.title}" ha sido marcado como ${status}. ${reason ? `Motivo: ${reason}` : ""}`,
        type: "PRODUCT_STATUS",
        linkUrl: `/seller`,
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: `PRODUCT_${action}`,
        targetType: "PRODUCT",
        targetId: productId,
        details: reason,
      },
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
