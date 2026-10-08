import { NextRequest, NextResponse } from "next/server";
import { confirmOrderPayment, rejectOrderPayment, verifyMercadoPagoPayment } from "@/lib/orders";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const idFromQuery = url.searchParams.get("id") || url.searchParams.get("data.id");

    let paymentId = idFromQuery;

    try {
      const body = await req.json();
      if (body?.data?.id) {
        paymentId = body.data.id;
      } else if (body?.id) {
        paymentId = body.id;
      }
    } catch {
      // Body may be empty in some IPN callbacks
    }

    if (!paymentId) {
      return NextResponse.json({ success: true, message: "Ignored, no payment id" });
    }

    // Verify payment directly with Mercado Pago API
    const paymentVerification = await verifyMercadoPagoPayment(paymentId);

    if (!paymentVerification.valid) {
      console.warn("Mercado Pago webhook verification failed:", paymentVerification.errorMessage);
      return NextResponse.json({ success: false, error: paymentVerification.errorMessage }, { status: 400 });
    }

    const externalRef = paymentVerification.externalReference;
    if (!externalRef) {
      return NextResponse.json({ success: true, message: "Ignored, no external reference" });
    }

    if (paymentVerification.status === "approved") {
      await confirmOrderPayment({
        orderNumber: externalRef,
        paymentId: paymentId.toString(),
        paymentProvider: "MERCADOPAGO",
        rawResponse: paymentVerification,
      });
      console.log(`✅ Order ${externalRef} CONFIRMED via Mercado Pago Webhook (Payment ID: ${paymentId})`);
    } else if (paymentVerification.status === "rejected" || paymentVerification.status === "cancelled") {
      await rejectOrderPayment(externalRef, `Pago ${paymentVerification.status} en Mercado Pago`);
      console.log(`❌ Order ${externalRef} REJECTED via Mercado Pago Webhook (Payment ID: ${paymentId})`);
    }

    return NextResponse.json({ success: true, status: paymentVerification.status });
  } catch (error: any) {
    console.error("Mercado Pago Webhook Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Support GET webhooks/IPN from Mercado Pago
  return POST(req);
}
