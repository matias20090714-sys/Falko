import { prisma } from "./db";
import { TransactionType } from "@/types";

/**
 * Get or create platform owner wallet
 */
export async function getPlatformOwnerWallet() {
  let ownerWallet = await prisma.wallet.findFirst({
    where: { isPlatformOwner: true },
  });

  if (!ownerWallet) {
    // Find first admin or create system owner
    let admin = await prisma.user.findFirst({
      where: {
        roles: {
          some: { role: "ADMIN" },
        },
      },
    });

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: "owner@falko.io",
          passwordHash: "system-owner-locked",
          firstName: "FALKO",
          lastName: "Platform Treasury",
          countryCode: "UY",
          preferredCurrency: "UYU",
          roles: {
            create: { role: "ADMIN" },
          },
        },
      });
    }

    ownerWallet = await prisma.wallet.create({
      data: {
        userId: admin.id,
        isPlatformOwner: true,
        availableBalance: 0,
        pendingBalance: 0,
        withdrawnBalance: 0,
        totalBalance: 0,
        currencyCode: "USD",
      },
    });
  }

  return ownerWallet;
}

/**
 * Get or create wallet for user
 */
export async function getUserWallet(userId: string, defaultCurrency = "USD") {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        isPlatformOwner: false,
        availableBalance: 0,
        pendingBalance: 0,
        withdrawnBalance: 0,
        totalBalance: 0,
        currencyCode: defaultCurrency,
      },
    });
  }

  return wallet;
}

/**
 * Record an order in the ledger with guarantee hold
 */
export async function processOrderLedger(params: {
  orderId: string;
  sellerId: string;
  sellerAmount: number;
  affiliateUserId?: string | null;
  affiliateAmount?: number;
  platformFeeAmount: number;
  currencyCode: string;
  guaranteeDays: number;
}) {
  const {
    orderId,
    sellerId,
    sellerAmount,
    affiliateUserId,
    affiliateAmount = 0,
    platformFeeAmount,
    currencyCode,
    guaranteeDays,
  } = params;

  const releaseDate = new Date();
  releaseDate.setDate(releaseDate.getDate() + guaranteeDays);

  return await prisma.$transaction(async (tx) => {
    // 1. Seller Earning (Held in Pending until guarantee period expires)
    if (sellerAmount > 0) {
      const sellerWallet = await getUserWallet(sellerId, currencyCode);
      const newPending = parseFloat((sellerWallet.pendingBalance + sellerAmount).toFixed(2));
      const newTotal = parseFloat((sellerWallet.totalBalance + sellerAmount).toFixed(2));

      await tx.wallet.update({
        where: { id: sellerWallet.id },
        data: {
          pendingBalance: newPending,
          totalBalance: newTotal,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: sellerWallet.id,
          orderId,
          type: "SELLER_EARNING",
          amount: sellerAmount,
          balanceAfter: newTotal,
          currencyCode,
          description: `Venta producto - Retenido por garantía (${guaranteeDays} días)`,
        },
      });

      await tx.guaranteeHold.create({
        data: {
          orderId,
          walletId: sellerWallet.id,
          amount: sellerAmount,
          currencyCode,
          status: "HELD",
          releaseDate,
        },
      });
    }

    // 2. Affiliate Commission (Held in Pending until guarantee period expires)
    if (affiliateUserId && affiliateAmount > 0) {
      const affiliateWallet = await getUserWallet(affiliateUserId, currencyCode);
      const newPending = parseFloat((affiliateWallet.pendingBalance + affiliateAmount).toFixed(2));
      const newTotal = parseFloat((affiliateWallet.totalBalance + affiliateAmount).toFixed(2));

      await tx.wallet.update({
        where: { id: affiliateWallet.id },
        data: {
          pendingBalance: newPending,
          totalBalance: newTotal,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: affiliateWallet.id,
          orderId,
          type: "AFFILIATE_COMMISSION",
          amount: affiliateAmount,
          balanceAfter: newTotal,
          currencyCode,
          description: `Comisión de afiliado - Retenida por garantía (${guaranteeDays} días)`,
        },
      });

      await tx.guaranteeHold.create({
        data: {
          orderId,
          walletId: affiliateWallet.id,
          amount: affiliateAmount,
          currencyCode,
          status: "HELD",
          releaseDate,
        },
      });
    }

    // 3. FALKO Platform Fee (Credited to Platform Owner Wallet)
    if (platformFeeAmount > 0) {
      const ownerWallet = await getPlatformOwnerWallet();
      const newAvailable = parseFloat((ownerWallet.availableBalance + platformFeeAmount).toFixed(2));
      const newTotal = parseFloat((ownerWallet.totalBalance + platformFeeAmount).toFixed(2));

      await tx.wallet.update({
        where: { id: ownerWallet.id },
        data: {
          availableBalance: newAvailable,
          totalBalance: newTotal,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: ownerWallet.id,
          orderId,
          type: "PLATFORM_COMMISSION",
          amount: platformFeeAmount,
          balanceAfter: newTotal,
          currencyCode,
          description: `Comisión fija FALKO por procesamiento de orden`,
        },
      });
    }

    return true;
  });
}

/**
 * Release guarantee holds that have matured (current date >= releaseDate)
 */
export async function releaseMaturedGuaranteeHolds() {
  const now = new Date();
  const maturedHolds = await prisma.guaranteeHold.findMany({
    where: {
      status: "HELD",
      releaseDate: { lte: now },
    },
    include: {
      wallet: true,
      order: true,
    },
  });

  const releasedResults = [];

  for (const hold of maturedHolds) {
    await prisma.$transaction(async (tx) => {
      // 1. Move from pending to available in wallet
      const newPending = Math.max(0, parseFloat((hold.wallet.pendingBalance - hold.amount).toFixed(2)));
      const newAvailable = parseFloat((hold.wallet.availableBalance + hold.amount).toFixed(2));

      await tx.wallet.update({
        where: { id: hold.walletId },
        data: {
          pendingBalance: newPending,
          availableBalance: newAvailable,
        },
      });

      // 2. Mark hold as RELEASED
      await tx.guaranteeHold.update({
        where: { id: hold.id },
        data: {
          status: "RELEASED",
          releasedAt: now,
        },
      });

      // 3. Record transaction in ledger
      await tx.walletTransaction.create({
        data: {
          walletId: hold.walletId,
          orderId: hold.orderId,
          type: "GUARANTEE_RELEASE",
          amount: hold.amount,
          balanceAfter: newAvailable,
          currencyCode: hold.currencyCode,
          description: `Liberación de garantía cumplida (${hold.order.orderNumber}) - Fondos disponibles para retiro`,
        },
      });
    });

    releasedResults.push(hold.id);
  }

  return {
    processedCount: releasedResults.length,
    releasedHoldIds: releasedResults,
  };
}

/**
 * Process order refund and reverse all ledger transactions
 */
export async function processRefundLedger(orderId: string, reason = "Solicitud de comprador dentro del plazo") {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      guaranteeHolds: {
        include: { wallet: true },
      },
      items: {
        include: { product: true },
      },
    },
  });

  if (!order || order.status === "REFUNDED") {
    throw new Error("Orden no encontrada o ya reembolsada");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Mark order as REFUNDED
    await tx.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED" },
    });

    // 2. Reverse each active guarantee hold
    for (const hold of order.guaranteeHolds) {
      if (hold.status === "HELD") {
        // Was in pending balance
        const newPending = Math.max(0, parseFloat((hold.wallet.pendingBalance - hold.amount).toFixed(2)));
        const newTotal = Math.max(0, parseFloat((hold.wallet.totalBalance - hold.amount).toFixed(2)));

        await tx.wallet.update({
          where: { id: hold.walletId },
          data: {
            pendingBalance: newPending,
            totalBalance: newTotal,
          },
        });

        await tx.guaranteeHold.update({
          where: { id: hold.id },
          data: { status: "REVERSED" },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: hold.walletId,
            orderId,
            type: "REFUND",
            amount: -hold.amount,
            balanceAfter: newTotal,
            currencyCode: hold.currencyCode,
            description: `Reembolso aprobado: Reversión de fondos en garantía (${reason})`,
          },
        });
      } else if (hold.status === "RELEASED") {
        // Was already available
        const newAvailable = Math.max(0, parseFloat((hold.wallet.availableBalance - hold.amount).toFixed(2)));
        const newTotal = Math.max(0, parseFloat((hold.wallet.totalBalance - hold.amount).toFixed(2)));

        await tx.wallet.update({
          where: { id: hold.walletId },
          data: {
            availableBalance: newAvailable,
            totalBalance: newTotal,
          },
        });

        await tx.guaranteeHold.update({
          where: { id: hold.id },
          data: { status: "REVERSED" },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: hold.walletId,
            orderId,
            type: "REFUND",
            amount: -hold.amount,
            balanceAfter: newAvailable,
            currencyCode: hold.currencyCode,
            description: `Reembolso aprobado: Reversión de fondos disponibles (${reason})`,
          },
        });
      }
    }

    // 3. Create or update Refund record
    await tx.refund.upsert({
      where: { orderId },
      create: {
        orderId,
        buyerId: order.buyerId,
        amount: order.totalAmount,
        currencyCode: order.currencyCode,
        reason,
        status: "APPROVED",
        processedAt: new Date(),
      },
      update: {
        status: "APPROVED",
        processedAt: new Date(),
      },
    });

    return true;
  });
}
