const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:57823562PMXL@db.qyzhlmfcndkmkeosnjzf.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log("WIPING ALL ORDERS AND TEST TRANSACTIONS...");

  await client.query(`DELETE FROM "Payment"`);
  await client.query(`DELETE FROM "OrderItem"`);
  await client.query(`DELETE FROM "GuaranteeHold"`);
  await client.query(`DELETE FROM "WalletTransaction"`);
  await client.query(`DELETE FROM "Refund"`);
  await client.query(`DELETE FROM "Review"`);
  await client.query(`DELETE FROM "Subscription"`);
  await client.query(`DELETE FROM "AbandonedCart"`);
  await client.query(`DELETE FROM "Notification"`);
  await client.query(`DELETE FROM "RankingRecord"`);
  await client.query(`DELETE FROM "Order"`);

  await client.query(`UPDATE "Product" SET "salesCount" = 0, "reviewsCount" = 0`);
  await client.query(`UPDATE "AffiliateProduct" SET "conversionsCount" = 0, "clicksCount" = 0`);
  await client.query(`UPDATE "Wallet" SET "availableBalance" = 0, "pendingBalance" = 0, "withdrawnBalance" = 0, "totalBalance" = 0`);

  console.log("WIPE COMPLETE! TOTAL ORDERS ARE NOW ZERO.");
  await client.end();
}

run().catch(console.error);
