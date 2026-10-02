const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:57823562PMXL@db.qyzhlmfcndkmkeosnjzf.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log("CONNECTED TO SUPABASE POSTGRES");

  const usersRes = await client.query(`SELECT id, email, "firstName", "lastName" FROM "User" WHERE email ILIKE '%matias%' OR "firstName" ILIKE '%matias%'`);
  console.log("MATCHING USERS:", usersRes.rows);

  const ordersRes = await client.query(`
    SELECT o.id, o."orderNumber", o.status, o."totalAmount", o."createdAt", o."buyerId", u.email as buyer_email, p.title as product_title
    FROM "Order" o
    LEFT JOIN "User" u ON o."buyerId" = u.id
    LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
    LEFT JOIN "Product" p ON oi."productId" = p.id
    ORDER BY o."createdAt" DESC
  `);

  console.log(`\nALL ORDERS IN DATABASE (${ordersRes.rows.length}):`);
  for (const row of ordersRes.rows) {
    console.log(`Order ${row.orderNumber} (ID: ${row.id}) | Buyer: ${row.buyer_email} | Status: ${row.status} | Product: ${row.product_title} | Date: ${row.createdAt}`);
  }

  await client.end();
}

run().catch(console.error);
