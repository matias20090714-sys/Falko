process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function run() {
  console.log("Triggering POST reset-test-data...");
  const res = await fetch("https://falko.dpdns.org/api/admin/reset-test-data", { method: "POST" });
  const data = await res.json();
  console.log("POST RESET RESPONSE:", data);

  const debugRes = await fetch("https://falko.dpdns.org/api/admin/debug-orders");
  const debugData = await debugRes.json();
  console.log("VERIFY DEBUG ORDERS TOTAL:", debugData.totalOrders);
}

run().catch(console.error);
