import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetEmail = searchParams.get("email")?.trim().toLowerCase();

    if (targetEmail) {
      // User-specific reset
      const targetUser = await prisma.user.findUnique({
        where: { email: targetEmail },
        include: { wallet: true },
      });

      if (!targetUser) {
        return NextResponse.json({ success: false, error: `No se encontró el usuario ${targetEmail}` }, { status: 404 });
      }

      // Delete orders and related items/payments for this user
      const userOrders = await prisma.order.findMany({
        where: { buyerId: targetUser.id },
        select: { id: true },
      });
      const orderIds = userOrders.map((o) => o.id);

      if (orderIds.length > 0) {
        await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.guaranteeHold.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
      }

      await prisma.subscription.deleteMany({ where: { userId: targetUser.id } });
      await prisma.abandonedCart.deleteMany({ where: { email: targetUser.email } });

      if (targetUser.wallet) {
        await prisma.walletTransaction.deleteMany({ where: { walletId: targetUser.wallet.id } });
        await prisma.wallet.update({
          where: { id: targetUser.wallet.id },
          data: {
            availableBalance: 0,
            pendingBalance: 0,
            withdrawnBalance: 0,
            totalBalance: 0,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Se borraron con éxito todas las compras y transacciones de prueba del usuario: ${targetEmail}`,
      });
    }

    // Full system reset (All test data)
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.guaranteeHold.deleteMany({});
    await prisma.walletTransaction.deleteMany({});
    await prisma.refund.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.abandonedCart.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.rankingRecord.deleteMany({});
    await prisma.order.deleteMany({});

    await prisma.product.updateMany({
      data: {
        salesCount: 0,
        reviewsCount: 0,
      },
    });

    await prisma.affiliateProduct.updateMany({
      data: {
        conversionsCount: 0,
        clicksCount: 0,
      },
    });

    await prisma.wallet.updateMany({
      data: {
        availableBalance: 0,
        pendingBalance: 0,
        withdrawnBalance: 0,
        totalBalance: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Todas las compras, ventas, billeteras y estadísticas de prueba fueron borradas con éxito en todo el sistema.",
    });
  } catch (error: any) {
    console.error("Reset test data error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
