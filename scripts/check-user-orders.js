const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'matias', mode: 'insensitive' } },
        { firstName: { contains: 'matias', mode: 'insensitive' } },
        { lastName: { contains: 'matias', mode: 'insensitive' } }
      ]
    },
    include: {
      orders: {
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      },
      products: true
    }
  });

  console.log('--- USERS MATCHING MATIAS ---');
  for (const u of users) {
    console.log(`User ID: ${u.id} | Email: ${u.email} | Name: ${u.firstName} ${u.lastName}`);
    console.log(`  Products Created: ${u.products.length}`);
    for (const p of u.products) {
      console.log(`    * [Product] ID: ${p.id} | Title: ${p.title} | Slug: ${p.slug}`);
    }
    console.log(`  Orders (` + u.orders.length + `):`);
    for (const o of u.orders) {
      console.log(`    * [Order] ID: ${o.id} | Status: ${o.status} | Total: ${o.totalAmount} | Date: ${o.createdAt}`);
      for (const item of o.items) {
        console.log(`       -> Product: ${item.product?.title} (ID: ${item.productId})`);
      }
    }
  }

  const allOrders = await prisma.order.findMany({
    include: {
      buyer: true,
      items: { include: { product: true } }
    }
  });

  console.log('\n--- ALL ORDERS IN DATABASE (' + allOrders.length + ') ---');
  for (const o of allOrders) {
    console.log(`Order ${o.id} | Buyer: ${o.buyer?.email || o.buyerId} | Status: ${o.status} | Items: ${o.items.map(i => i.product?.title).join(', ')}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
