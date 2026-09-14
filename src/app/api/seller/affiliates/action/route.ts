import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const { affiliateProductId, action } = await req.json(); // action: "APPROVE" | "REJECT"

    const affiliateProduct = await prisma.affiliateProduct.findUnique({
      where: { id: affiliateProductId },
      include: {
        product: true,
        affiliateProfile: { include: { user: true } },
      },
    });

    if (!affiliateProduct || affiliateProduct.product.sellerId !== user.id) {
      return NextResponse.json({ success: false, error: "No tienes permiso sobre este producto." }, { status: 403 });
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

    await prisma.affiliateProduct.update({
      where: { id: affiliateProductId },
      data: { status: newStatus },
    });

    // Notify affiliate user
    await prisma.notification.create({
      data: {
        userId: affiliateProduct.affiliateProfile.userId,
        title: action === "APPROVE" ? "¡Solicitud de afiliado aprobada! 🚀" : "Solicitud de afiliado rechazada",
        message: `El creador ha ${action === "APPROVE" ? "aprobado" : "rechazado"} tu solicitud para promocionar "${affiliateProduct.product.title}".`,
        type: action === "APPROVE" ? "AFFILIATE_APPROVED" : "AFFILIATE_REJECTED",
        linkUrl: "/affiliate",
      },
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
