import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, name, productSlug, refCode, currencyCode = "USD", amount } = await req.json();

    if (!email || !productSlug) {
      return NextResponse.json({ success: false, error: "Datos incompletos." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Upsert recent abandoned cart
    const existing = await prisma.abandonedCart.findFirst({
      where: {
        email: cleanEmail,
        productSlug,
        recovered: false,
      },
    });

    if (existing) {
      const updated = await prisma.abandonedCart.update({
        where: { id: existing.id },
        data: {
          name: name || existing.name,
          amount: parseFloat(amount) || existing.amount,
          refCode: refCode || existing.refCode,
          currencyCode,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, cartId: updated.id });
    }

    const newCart = await prisma.abandonedCart.create({
      data: {
        email: cleanEmail,
        name: name || null,
        productSlug,
        refCode: refCode || null,
        currencyCode,
        amount: parseFloat(amount) || 0,
        recoveryCode: "RESCATE10",
      },
    });

    return NextResponse.json({ success: true, cartId: newCart.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
