const { PrismaClient } = require('@prisma/client');

// Use production Supabase URL if provided in environment, or default to production string
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:57823562PMXL@db.qyzhlmfcndkmkeosnjzf.supabase.co:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

async function main() {
  console.log("Iniciando la limpieza de datos de prueba en la base de datos...");
  console.log("Conectando a DB:", dbUrl.replace(/:[^:@]+@/, ":****@"));

  // 1. Borrar registros transaccionales
  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`- Borrados ${deletedPayments.count} pagos de prueba.`);

  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  console.log(`- Borrados ${deletedOrderItems.count} items de orden.`);

  const deletedGuaranteeHolds = await prisma.guaranteeHold.deleteMany({});
  console.log(`- Borrados ${deletedGuaranteeHolds.count} retenciones de garantía.`);

  const deletedWalletTxns = await prisma.walletTransaction.deleteMany({});
  console.log(`- Borrados ${deletedWalletTxns.count} movimientos de billetera.`);

  const deletedRefunds = await prisma.refund.deleteMany({});
  console.log(`- Borrados ${deletedRefunds.count} solicitudes de reembolso.`);

  const deletedReviews = await prisma.review.deleteMany({});
  console.log(`- Borrados ${deletedReviews.count} opiniones/reseñas.`);

  const deletedSubs = await prisma.subscription.deleteMany({});
  console.log(`- Borradas ${deletedSubs.count} suscripciones.`);

  const deletedCarts = await prisma.abandonedCart.deleteMany({});
  console.log(`- Borrados ${deletedCarts.count} carritos abandonados.`);

  const deletedNotifs = await prisma.notification.deleteMany({});
  console.log(`- Borradas ${deletedNotifs.count} notificaciones.`);

  const deletedRankings = await prisma.rankingRecord.deleteMany({});
  console.log(`- Borrados ${deletedRankings.count} registros de ranking.`);

  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`- Borradas ${deletedOrders.count} órdenes de compra/venta.`);

  // 2. Reiniciar contadores en Productos
  const updatedProducts = await prisma.product.updateMany({
    data: {
      salesCount: 0,
      reviewsCount: 0,
    },
  });
  console.log(`- Reiniciados contadores de ${updatedProducts.count} productos.`);

  // 3. Reiniciar contadores en Productos Afiliados
  const updatedAffiliates = await prisma.affiliateProduct.updateMany({
    data: {
      conversionsCount: 0,
      clicksCount: 0,
    },
  });
  console.log(`- Reiniciados contadores de ${updatedAffiliates.count} enlaces de afiliado.`);

  // 4. Reiniciar saldos de Billeteras
  const updatedWallets = await prisma.wallet.updateMany({
    data: {
      availableBalance: 0,
      pendingBalance: 0,
      withdrawnBalance: 0,
      totalBalance: 0,
    },
  });
  console.log(`- Reiniciadas ${updatedWallets.count} billeteras a $0.00 USD.`);

  console.log("✅ ¡Limpieza de datos de prueba completada exitosamente!");
}

main()
  .catch((e) => {
    console.error("Error durante la limpieza de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
