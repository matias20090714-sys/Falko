import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
    }

    const { orderId, productId, rating, title, comment } = await req.json();

    // Verify verified purchase
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        reviews: true,
      },
    });

    if (!order || order.buyerId !== user.id || order.status !== "CONFIRMED") {
      return NextResponse.json({ success: false, error: "Solo compradores verificados pueden calificar este producto." }, { status: 403 });
    }

    const hasPurchasedProduct = order.items.some((i) => i.productId === productId);
    if (!hasPurchasedProduct) {
      return NextResponse.json({ success: false, error: "El producto no coincide con tu orden." }, { status: 400 });
    }

    // Check duplicate review
    const existing = await prisma.review.findUnique({
      where: {
        buyerId_orderId_productId: {
          buyerId: user.id,
          orderId,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Ya has calificado esta compra." }, { status: 400 });
    }

    const validRating = Math.max(1, Math.min(5, parseInt(rating) || 5));

    const review = await prisma.review.create({
      data: {
        productId,
        buyerId: user.id,
        orderId,
        rating: validRating,
        title: title || "Opinión de compra",
        comment: comment || "",
      },
    });

    // Recompute product rating average
    const allReviews = await prisma.review.findMany({
      where: { productId, isModerated: false },
    });

    const avg = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAvg: parseFloat(avg.toFixed(1)),
        reviewsCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
