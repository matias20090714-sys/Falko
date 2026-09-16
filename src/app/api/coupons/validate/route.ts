import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code, productId } = await req.json();

    if (!code) {
      return NextResponse.json({ success: false, error: "Ingresa un código de cupón." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check database coupon
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: cleanCode,
        isActive: true,
        OR: [
          { productId: null },
          { productId: productId || undefined },
        ],
      },
    });

    if (coupon) {
      if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
        return NextResponse.json({ success: false, error: "El cupón ha expirado." }, { status: 400 });
      }

      if (coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ success: false, error: "El cupón ha alcanzado el límite de usos." }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        coupon: {
          code: coupon.code,
          discountPct: coupon.discountPct,
        },
      });
    }

    // Default built-in global promo codes
    const GLOBAL_PROMOS: Record<string, number> = {
      FALKO10: 10,
      FALKO20: 20,
      LANZAMIENTO50: 50,
      VIPCREADOR: 25,
      HALCON30: 30,
    };

    if (GLOBAL_PROMOS[cleanCode]) {
      return NextResponse.json({
        success: true,
        coupon: {
          code: cleanCode,
          discountPct: GLOBAL_PROMOS[cleanCode],
        },
      });
    }

    return NextResponse.json({ success: false, error: "Cupón no válido o inactivo." }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Error al validar cupón." }, { status: 500 });
  }
}
