import { prisma } from "@/lib/db";
import { processOrderLedger } from "@/lib/ledger";
import { addSalesVolume } from "@/lib/ranking";
import { triggerWebhooksForSeller } from "@/lib/webhooks";
import { getEmailProvider } from "@/lib/emails";

export async function confirmOrderAndFulfill(orderId: string, paymentData?: any) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
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
    return null;
  }

  if (order.status === "CONFIRMED") {
    return order;
  }

  const product = order.items[0]?.product;
  const affiliateProduct = order.affiliateProduct;
  const affiliateUserId = affiliateProduct?.affiliateProfile?.userId || null;
  const transactionId = paymentData?.id ? String(paymentData.id) : (order.paymentProviderId || "");

  // 1. Update Order & Payments status to CONFIRMED
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CONFIRMED",
      paymentProviderId: transactionId || order.paymentProviderId,
      payments: {
        updateMany: {
          where: { orderId: order.id },
          data: {
            status: "CONFIRMED",
            transactionId: transactionId || undefined,
            ...(paymentData ? { rawResponseJson: JSON.stringify(paymentData) } : {}),
          },
        },
      },
    },
  });

  // 2. Create Subscription if this is a Subscription product
  if (product && product.pricingType === "SUBSCRIPTION") {
    const existingSub = await prisma.subscription.findFirst({
      where: { orderId: order.id },
    });

    if (!existingSub) {
      const interval = product.billingInterval || "MONTHLY";
      const nextBilling = new Date();
      if (interval === "YEARLY") {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      } else if (interval === "QUARTERLY") {
        nextBilling.setMonth(nextBilling.getMonth() + 3);
      } else {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
      }

      await prisma.subscription.create({
        data: {
          userId: order.buyerId,
          productId: product.id,
          orderId: order.id,
          status: "ACTIVE",
          billingInterval: interval,
          amount: order.totalAmount,
          currencyCode: order.currencyCode,
          nextBillingDate: nextBilling,
        },
      });
    }
  }

  // 3. Process Immutable Double-Entry Ledger & Guarantee Holds
  if (product) {
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
  }

  // 4. Update Product Sales Count & Stock
  if (product) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        salesCount: { increment: 1 },
        ...(product.productType === "PHYSICAL" && product.stock !== null && product.stock > 0
          ? { stock: { decrement: 1 } }
          : {}),
      },
    });

    await addSalesVolume(product.sellerId, order.totalAmount);
  }

  // 5. Update Affiliate Stats
  if (affiliateProduct) {
    await prisma.affiliateProduct.update({
      where: { id: affiliateProduct.id },
      data: { conversionsCount: { increment: 1 } },
    });

    if (affiliateUserId) {
      await addSalesVolume(affiliateUserId, order.totalAmount);
    }
  }

  // 6. Create Notifications & Send Real Purchase Confirmation Emails
  if (product) {
    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        title: "¡Nueva venta confirmada! 🎉",
        message: `Has vendido "${product.title}" por ${order.sellerEarningAmount.toFixed(2)} ${order.currencyCode} netos (retenidos por garantía ${order.guaranteeDays}d).`,
        type: "SALE",
        linkUrl: "/seller",
      },
    });
  }

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

  // 6b. Send Email Notifications (Buyer purchase confirmation, Seller sale alert)
  try {
    const emailProvider = getEmailProvider();
    
    // Send Buyer Confirmation Email
    if (order.buyer?.email) {
      emailProvider.sendEmail({
        to: order.buyer.email,
        subject: `Confirmación de compra #${order.orderNumber} - FALKO`,
        template: "PURCHASE_CONFIRMATION",
        data: {
          name: order.buyer.firstName || "Comprador",
          orderNumber: order.orderNumber,
          productTitle: product?.title || "Producto Digital",
          amount: order.totalAmount,
          currency: order.currencyCode,
          guaranteeDays: order.guaranteeDays,
        },
      }).catch((err) => console.error("Error sending buyer purchase email:", err));
    }

    // Send Seller Sale Alert Email
    if (product) {
      prisma.user.findUnique({ where: { id: product.sellerId } }).then((seller) => {
        if (seller?.email) {
          emailProvider.sendEmail({
            to: seller.email,
            subject: `¡Nueva venta realizada! - "${product.title}"`,
            template: "SELLER_SALE_ALERT",
            data: {
              productTitle: product.title,
              netAmount: order.sellerEarningAmount,
              currency: order.currencyCode,
            },
          }).catch((err) => console.error("Error sending seller sale email:", err));
        }
      }).catch((err) => console.error("Error fetching seller for email:", err));
    }
  } catch (emailErr) {
    console.error("Order fulfillment email error:", emailErr);
  }

  // 7. Dispatch Webhooks
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
            transaction_id: transactionId,
            status: "CONFIRMED",
          },
          created_at: order.createdAt.toISOString(),
        },
      },
    }).catch((whErr) => console.error("Webhook dispatch async error:", whErr));
  }

  return { ...order, status: "CONFIRMED" };
}
