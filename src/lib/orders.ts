import { prisma } from "./db";
import { processOrderLedger } from "./ledger";
import { addSalesVolume } from "./ranking";
import { triggerWebhooksForSeller } from "./webhooks";

const MP_ACCESS_TOKEN =
  process.env.MERCADOPAGO_ACCESS_TOKEN ||
  "APP_USR-6259061397586-091418-4453cf8384c0d811a4bce4854a1a7f63-132459287";

/**
 * Verify payment directly with Mercado Pago REST API
 */
export async function verifyMercadoPagoPayment(paymentId: string | number): Promise<{
  valid: boolean;
  status: string;
  externalReference?: string;
  amount?: number;
  currencyId?: string;
  errorMessage?: string;
}> {
  if (!paymentId) {
    return { valid: false, status: "unknown", errorMessage: "No payment ID provided" };
  }

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN.trim()}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return { valid: false, status: "error", errorMessage: `Mercado Pago API error: ${errText}` };
    }

    const data = await res.json();
    return {
      valid: true,
      status: data.status, // "approved", "rejected", "cancelled", "pending", "in_process"
      externalReference: data.external_reference,
      amount: data.transaction_amount,
      currencyId: data.currency_id,
    };
  } catch (error: any) {
    return { valid: false, status: "error", errorMessage: error.message };
  }
}

/**
 * Confirm order payment and execute ledger credits
 * Idempotent: Can be called multiple times safely without duplicate credits
 */
export async function confirmOrderPayment(params: {
  orderId?: string;
  orderNumber?: string;
  paymentId?: string;
  paymentProvider?: string;
  rawResponse?: any;
}) {
  const { orderId, orderNumber, paymentId, paymentProvider = "MERCADOPAGO", rawResponse } = params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        ...(orderId ? [{ id: orderId }] : []),
        ...(orderNumber ? [{ orderNumber }] : []),
      ],
    },
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
    throw new Error("Orden no encontrada para confirmación.");
  }

  // Idempotency: If already confirmed, do not double-credit
  if (order.status === "CONFIRMED") {
    return { success: true, order, alreadyConfirmed: true };
  }

  const product = order.items[0]?.product;
  if (!product) {
    throw new Error("Producto no encontrado en la orden.");
  }

  const affiliateUserId = order.affiliateProduct?.affiliateProfile?.userId || null;
  const salesVolumeUsd = parseFloat((order.totalAmount || 0).toFixed(2));

  // 1. Update order status to CONFIRMED
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CONFIRMED",
      paymentProviderId: paymentId || order.paymentProviderId,
      payments: {
        create: {
          provider: paymentProvider,
          transactionId: paymentId || `PAY_${Date.now()}`,
          status: "CONFIRMED",
          rawResponseJson: rawResponse ? JSON.stringify(rawResponse) : null,
        },
      },
    },
    include: {
      buyer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // 2. Process Immutable Double-Entry Ledger & Guarantee Holds
  await processOrderLedger({
    orderId: order.id,
    sellerId: product.sellerId,
    sellerAmount: order.sellerEarningAmount,
    affiliateUserId,
    affiliateAmount: order.affiliateCommissionAmount,
    platformFeeAmount: order.platformFeeConverted,
    currencyCode: "USD",
    guaranteeDays: order.guaranteeDays,
  });

  // 3. Increment product sales count & decrement stock if physical
  await prisma.product.update({
    where: { id: product.id },
    data: {
      salesCount: { increment: 1 },
      ...(product.productType === "PHYSICAL" && product.stock !== null && product.stock > 0
        ? { stock: { decrement: 1 } }
        : {}),
    },
  });

  // 4. Update Affiliate stats
  if (order.affiliateProduct && affiliateUserId) {
    await prisma.affiliateProduct.update({
      where: { id: order.affiliateProduct.id },
      data: { conversionsCount: { increment: 1 } },
    });

    await addSalesVolume(affiliateUserId, salesVolumeUsd);
  }

  // 5. Update Seller Ranking volume
  await addSalesVolume(product.sellerId, salesVolumeUsd);

  // 6. Notifications
  await prisma.notification.create({
    data: {
      userId: product.sellerId,
      title: "¡Nueva venta confirmada! 🎉",
      message: `Has vendido "${product.title}" por $${order.sellerEarningAmount.toFixed(2)} USD netos (retenidos por garantía ${order.guaranteeDays}d).`,
      type: "SALE",
      linkUrl: "/seller",
    },
  });

  if (affiliateUserId) {
    await prisma.notification.create({
      data: {
        userId: affiliateUserId,
        title: "¡Comisión de afiliado generada! 💰",
        message: `Has generado una comisión de $${order.affiliateCommissionAmount.toFixed(2)} USD promocionando "${product.title}".`,
        type: "COMMISSION",
        linkUrl: "/affiliate",
      },
    });
  }

  // 7. Dispatch Webhooks
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
          seller_earning: order.sellerEarningAmount,
          affiliate_commission: order.affiliateCommissionAmount,
          currency: "USD",
        },
        payment: {
          provider: paymentProvider,
          transaction_id: paymentId,
          status: "CONFIRMED",
        },
      },
    },
  }).catch((whErr) => console.error("Webhook dispatch async error:", whErr));

  return { success: true, order: updatedOrder, alreadyConfirmed: false };
}

/**
 * Mark order as rejected/cancelled when payment fails
 */
export async function rejectOrderPayment(orderNumberOrId: string, reason = "Pago rechazado por pasarela") {
  return await prisma.order.updateMany({
    where: {
      OR: [{ id: orderNumberOrId }, { orderNumber: orderNumberOrId }],
      status: "PENDING",
    },
    data: {
      status: "REJECTED",
    },
  });
}
