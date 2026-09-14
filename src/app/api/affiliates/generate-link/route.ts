import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const { productId } = await req.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.affiliateEnabled) {
      return NextResponse.json({ success: false, error: "Este producto no tiene programa de afiliados activo." }, { status: 400 });
    }

    // Auto-activate AFFILIATE profile if not existing
    let affiliateProfile = await prisma.affiliateProfile.findUnique({
      where: { userId: user.id },
    });

    if (!affiliateProfile) {
      const count = await prisma.affiliateProfile.count();
      const affiliateCode = `AFF-${String(count + 1).padStart(6, "0")}`;

      affiliateProfile = await prisma.affiliateProfile.create({
        data: {
          userId: user.id,
          affiliateCode,
        },
      });

      // Add role
      await prisma.userRole.upsert({
        where: { userId_role: { userId: user.id, role: "AFFILIATE" } },
        create: { userId: user.id, role: "AFFILIATE" },
        update: {},
      });
    }

    // Determine initial status based on product approval mode
    const initialStatus = product.affiliateApprovalMode === "AUTO" ? "APPROVED" : "PENDING";
    const uniqueRefCode = `${affiliateProfile.affiliateCode}_${product.slug.substring(0, 10)}`;

    const affiliateProduct = await prisma.affiliateProduct.upsert({
      where: {
        affiliateProfileId_productId: {
          affiliateProfileId: affiliateProfile.id,
          productId: product.id,
        },
      },
      create: {
        affiliateProfileId: affiliateProfile.id,
        productId: product.id,
        status: initialStatus,
        uniqueRefCode,
      },
      update: {},
    });

    const message =
      initialStatus === "APPROVED"
        ? "¡Enlace de afiliado generado con éxito!"
        : "Solicitud enviada al creador para revisión manual.";

    return NextResponse.json({
      success: true,
      affiliateProduct,
      message,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
