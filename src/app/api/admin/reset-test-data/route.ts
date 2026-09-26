import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // 1. Delete transactional records
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

    // 2. Reset counters on Product
    await prisma.product.updateMany({
      data: {
        salesCount: 0,
        reviewsCount: 0,
      },
    });

    // 3. Reset counters on AffiliateProduct
    await prisma.affiliateProduct.updateMany({
      data: {
        conversionsCount: 0,
        clicksCount: 0,
      },
    });

    // 4. Reset Wallet balances
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
      message: "Todas las compras, ventas, billeteras y estadísticas de prueba fueron borradas con éxito.",
    });
  } catch (error: any) {
    console.error("Reset test data error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
