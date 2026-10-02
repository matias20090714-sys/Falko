const { PrismaClient } = require('@prisma/client');
const dbUrl = "postgresql://postgres:57823562PMXL@db.qyzhlmfcndkmkeosnjzf.supabase.co:5432/postgres";

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

async function inspect() {
  const products = await prisma.product.findMany({
    include: {
      seller: true,
      orderItems: {
        include: {
          order: {
            include: { buyer: true }
          }
        }
      }
    }
  });

  console.log("=== PRODUCTS IN PRODUCTION DB ===");
  for (const p of products) {
    console.log(`Product ID: ${p.id}`);
    console.log(`Title: ${p.title}`);
    console.log(`Slug: ${p.slug}`);
    console.log(`Seller Email: ${p.seller?.email}`);
    console.log(`Seller Name: ${p.seller?.firstName} ${p.seller?.lastName}`);
    console.log(`OrderItems count: ${p.orderItems.length}`);
    for (const item of p.orderItems) {
      console.log(`  - OrderNumber: ${item.order.orderNumber}, Buyer: ${item.order.buyer.email}, Status: ${item.order.status}`);
    }
    console.log("-----------------------------------");
  }

  const allOrders = await prisma.order.findMany({
    include: { buyer: true, items: { include: { product: true } } }
  });
  console.log("=== ALL ORDERS IN DB ===");
  console.log("Total orders:", allOrders.length);
  for (const o of allOrders) {
    console.log(`Order ${o.orderNumber}: Buyer ${o.buyer.email}, Status ${o.status}, Total ${o.totalAmount}`);
  }
}

inspect()
  .catch((e) => console.error("Error:", e))
  .finally(() => prisma.$disconnect());
