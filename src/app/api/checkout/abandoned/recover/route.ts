import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { cartId } = await req.json();

    const cart = await prisma.abandonedCart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      return NextResponse.json({ success: false, error: "Carrito no encontrado." }, { status: 404 });
    }

    // Mark as reminded
    await prisma.abandonedCart.update({
      where: { id: cart.id },
      data: {
        remindedAt: new Date(),
      },
    });

    const recoveryCheckoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://falko.io"}/checkout?product=${cart.productSlug}&coupon=${cart.recoveryCode}${cart.refCode ? `&ref=${cart.refCode}` : ""}`;

    return NextResponse.json({
      success: true,
      message: `Email de recuperación programado para ${cart.email}`,
      recoveryCoupon: cart.recoveryCode,
      recoveryUrl: recoveryCheckoutUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
