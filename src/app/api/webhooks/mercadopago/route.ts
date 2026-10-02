import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { confirmOrderAndFulfill } from "@/lib/order-fulfillment";
import { processOrderLedger } from "@/lib/ledger";
import { addSalesVolume } from "@/lib/ranking";
import { triggerWebhooksForSeller } from "@/lib/webhooks";
import { computeFinancialSplit } from "@/lib/currency";

export async function POST(req: NextRequest) {
  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const body = await req.json().catch(() => ({}));
    const searchParams = req.nextUrl.searchParams;

    // Mercado Pago sends payment ID either in body.data.id or searchParams 'data.id' / 'id'
    const paymentId = body?.data?.id || searchParams.get("data.id") || searchParams.get("id");
    const topic = body?.type || body?.topic || searchParams.get("topic") || searchParams.get("type");

    if (!paymentId || (topic && topic !== "payment")) {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    if (!token) {
      console.error("MercadoPago webhook error: MERCADOPAGO_ACCESS_TOKEN not set");
      return NextResponse.json({ error: "Missing token" }, { status: 500 });
    }

    // Fetch full payment details from Mercado Pago API
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Failed to fetch payment details from Mercado Pago:", errData);
      return NextResponse.json({ error: "Failed to fetch payment" }, { status: 400 });
    }

    const paymentData = await res.json();
    const orderNumber = paymentData.external_reference;
    const status = paymentData.status;

    if (!orderNumber) {
      console.warn("Mercado Pago payment missing external_reference:", paymentId);
      return NextResponse.json({ status: "no_order_reference" }, { status: 200 });
    }

    // Find corresponding order in database
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        buyer: true,
        items: {
          include: {
            product: true,
          },
        },
        affiliateProduct: {
          include: {
            affiliateProfile: true,
          },
        },
      },
    });

    if (!order) {
      console.warn("Order not found for Mercado Pago payment:", orderNumber);
      return NextResponse.json({ status: "order_not_found" }, { status: 200 });
    }

    // If payment is approved and order is pending, confirm order and fulfill
    if (status === "approved" && order.status !== "CONFIRMED") {
      await confirmOrderAndFulfill(order.id, paymentData);
    }

    return NextResponse.json({ status: "processed", paymentStatus: status }, { status: 200 });
  } catch (error: any) {
    console.error("Mercado Pago Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "MercadoPago Webhook Receiver Active" });
}
