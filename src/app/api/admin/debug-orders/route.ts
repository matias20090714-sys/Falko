import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        buyer: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, title: true, slug: true, sellerId: true },
            },
          },
        },
      },
    });

    const products = await prisma.product.findMany({
      select: { id: true, title: true, slug: true, sellerId: true },
    });

    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, roles: true },
    });

    const subscriptions = await prisma.subscription.findMany({
      select: { id: true, userId: true, productId: true, status: true },
    });

    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      totalSubscriptions: subscriptions.length,
      orders,
      subscriptions,
      products,
      users,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
