const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany();
  const subs = await prisma.subscription.findMany();
  const users = await prisma.user.findMany({ select: { id: true, email: true, firstName: true } });
  console.log("=== ORDERS count:", orders.length);
  console.log("ORDERS:", JSON.stringify(orders, null, 2));
  console.log("=== SUBS count:", subs.length);
  console.log("SUBS:", JSON.stringify(subs, null, 2));
  console.log("=== USERS count:", users.length);
  console.log("USERS:", JSON.stringify(users, null, 2));
}

main().finally(() => prisma.$disconnect());
