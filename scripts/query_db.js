const { PrismaClient } = require('./node_modules/@prisma/client');
process.env.DATABASE_URL = "postgresql://postgres:57823562PMXL@db.qyzhlmfcndkmkeosnjzf.supabase.co:5432/postgres";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      orders: {
        include: {
          items: {
            include: { product: true }
          }
        }
      },
      products: true
    }
  });

  console.log("=== USERS IN SYSTEM ===");
  for (const u of users) {
    console.log(`User ID: ${u.id} | Email: ${u.email} | Name: ${u.firstName} ${u.lastName} | Role: ${u.role}`);
    console.log(`   Products owned/created: ${u.products.length}`);
    for (const p of u.products) {
      console.log(`     - [Product] Title: "${p.title}" | ID: ${p.id} | SellerID: ${p.sellerId}`);
    }
    console.log(`   Orders (` + u.orders.length + `):`);
    for (const o of u.orders) {
      console.log(`     - [Order] ID: ${o.id} | Status: ${o.status} | Amount: ${o.totalAmount} | Date: ${o.createdAt}`);
      for (const item of o.items) {
        console.log(`        * Product Purchased: "${item.product?.title}" (SellerId: ${item.product?.sellerId})`);
      }
    }
  }

  const orders = await prisma.order.findMany({
    include: {
      buyer: true,
      items: { include: { product: true } }
    }
  });

  console.log("\n=== ALL ORDERS (" + orders.length + ") ===");
  for (const o of orders) {
    console.log(`Order ${o.id} | Buyer: ${o.buyer?.email} (${o.buyer?.firstName}) | Status: ${o.status} | Items: ${o.items.map(i => i.product?.title).join(', ')}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
