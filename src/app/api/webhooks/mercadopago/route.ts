import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
      const product = order.items[0]?.product;
      const affiliateProduct = order.affiliateProduct;
      const affiliateUserId = affiliateProduct?.affiliateProfile?.userId || null;

      // Re-compute financial split for accuracy
      const split = computeFinancialSplit({
        productPrice: order.basePrice,
        currencyCode: order.currencyCode,
        affiliateCommissionPct: product?.affiliateCommissionPct || 0,
        hasAffiliate: !!affiliateProduct,
      });

      // Update Order Status to CONFIRMED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CONFIRMED",
          payments: {
            updateMany: {
              where: { transactionId: order.paymentProviderId || paymentId },
              data: {
                status: "CONFIRMED",
                rawResponseJson: JSON.stringify(paymentData),
              },
            },
          },
        },
      });

      // Process double-entry ledger & guarantee holds
      await processOrderLedger({
        orderId: order.id,
        sellerId: product.sellerId,
        sellerAmount: order.sellerEarningAmount,
        affiliateUserId,
        affiliateAmount: order.affiliateCommissionAmount,
        platformFeeAmount: order.platformFeeConverted,
        currencyCode: order.currencyCode,
        guaranteeDays: order.guaranteeDays,
      });

      // Increment product sales count
      if (product) {
        await prisma.product.update({
          where: { id: product.id },
          data: { salesCount: { increment: 1 } },
        });

        // Add sales volume to seller
        await addSalesVolume(product.sellerId, split.salesVolumeUsd);
      }

      // Increment affiliate conversions if applicable
      if (affiliateProduct) {
        await prisma.affiliateProduct.update({
          where: { id: affiliateProduct.id },
          data: { conversionsCount: { increment: 1 } },
        });

        if (affiliateUserId) {
          await addSalesVolume(affiliateUserId, split.salesVolumeUsd);
        }
      }

      // Seller in-app notification
      if (product) {
        await prisma.notification.create({
          data: {
            userId: product.sellerId,
            title: "¡Nueva venta confirmada! 🎉",
            message: `Has vendido "${product.title}" por ${order.sellerEarningAmount.toFixed(2)} ${order.currencyCode} netos.`,
            type: "SALE",
            linkUrl: "/seller",
          },
        });
      }

      // Affiliate in-app notification
      if (affiliateUserId && product) {
        await prisma.notification.create({
          data: {
            userId: affiliateUserId,
            title: "¡Comisión de afiliado generada! 💰",
            message: `Has generado una comisión de ${order.affiliateCommissionAmount.toFixed(2)} ${order.currencyCode} promocionando "${product.title}".`,
            type: "COMMISSION",
            linkUrl: "/affiliate",
          },
        });
      }

      // Trigger seller webhooks (Zapier/Make/CRM)
      if (product) {
        triggerWebhooksForSeller({
          sellerId: product.sellerId,
          productId: product.id,
          event: "order.completed",
          payload: {
            event: "order.completed",
            timestamp: new Date().toISOString(),
            data: {
              order_id: order.id,
              order_number: order.orderNumber,
              product: {
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: product.price,
              },
              buyer: {
                id: order.buyer.id,
                name: `${order.buyer.firstName} ${order.buyer.lastName}`,
                email: order.buyer.email,
                country: order.buyer.countryCode,
              },
              amounts: {
                total: order.totalAmount,
                base_price: order.basePrice,
                discount: order.discountAmount,
                seller_earning: order.sellerEarningAmount,
                affiliate_commission: order.affiliateCommissionAmount,
                currency: order.currencyCode,
              },
              payment: {
                provider: "MERCADOPAGO",
                transaction_id: paymentId,
                status: "CONFIRMED",
              },
              created_at: order.createdAt.toISOString(),
            },
          },
        }).catch((whErr) => console.error("Webhook dispatch error:", whErr));
      }
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
