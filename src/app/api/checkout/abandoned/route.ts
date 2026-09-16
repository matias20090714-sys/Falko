import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { triggerWebhooksForSeller } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  try {
    const { email, name, productSlug, refCode, currencyCode = "USD", amount } = await req.json();

    if (!email || !productSlug) {
      return NextResponse.json({ success: false, error: "Datos incompletos." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Fetch product to know seller
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
    });

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
        amount: parseFloat(amount) || (product?.price || 0),
        recoveryCode: "RESCATE10",
      },
    });

    // Dispatch real-time cart.abandoned webhook
    if (product) {
      triggerWebhooksForSeller({
        sellerId: product.sellerId,
        productId: product.id,
        event: "cart.abandoned",
        payload: {
          event: "cart.abandoned",
          timestamp: new Date().toISOString(),
          data: {
            cart_id: newCart.id,
            product: {
              id: product.id,
              title: product.title,
              slug: product.slug,
              price: product.price,
            },
            buyer: {
              name: name || "Visitante",
              email: cleanEmail,
            },
            recovery_coupon: "RESCATE10",
            discount_percentage: 10,
            currency: currencyCode,
            amount: newCart.amount,
            created_at: newCart.createdAt.toISOString(),
          },
        },
      }).catch((e) => console.error("Error triggering cart.abandoned webhook:", e));
    }

    return NextResponse.json({ success: true, cartId: newCart.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
