import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeFinancialSplit, convertCurrency } from "@/lib/currency";
import { validateOrderFraud } from "@/lib/fraud";
import { processOrderLedger } from "@/lib/ledger";
import { addSalesVolume } from "@/lib/ranking";
import { getPaymentProvider } from "@/lib/payments";
import { triggerWebhooksForSeller } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    const {
      productSlug,
      refCode,
      targetCurrency = "USD",
      paymentMethod = "MERCADOPAGO",
      includeOrderBump = false,
      couponCode = "",
      customerEmail = "",
      customerFirstName = "",
      customerLastName = "",
      customerCountryCode = "UY",
    } = await req.json();

    let buyerUser = currentUser;

    if (!buyerUser) {
      const cleanEmail = (customerEmail || "").trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return NextResponse.json(
          { success: false, error: "Por favor ingresa tu correo electrónico para enviarte los accesos del producto." },
          { status: 400 }
        );
      }

      let existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!existingUser) {
        const tempPassword = Math.random().toString(36).slice(-8) + Date.now().toString(36);
        const passwordHash = await hashPassword(tempPassword);

        existingUser = await prisma.user.create({
          data: {
            email: cleanEmail,
            firstName: (customerFirstName || "").trim() || "Cliente",
            lastName: (customerLastName || "").trim() || "FALKO",
            passwordHash,
            countryCode: customerCountryCode || "UY",
            preferredCurrency: targetCurrency || "USD",
            roles: {
              create: { role: "BUYER" },
            },
          },
        });
      }

      buyerUser = existingUser as any;
    }

    if (!buyerUser) {
      return NextResponse.json(
        { success: false, error: "No se pudo identificar los datos del comprador." },
        { status: 400 }
      );
    }

    // 1. Fetch live product from DB (Never trust client prices)
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      include: {
        seller: true,
      },
    });

    if (!product || product.status !== "APPROVED") {
      return NextResponse.json({ success: false, error: "El producto no está disponible para la compra." }, { status: 404 });
    }

    // 2. Validate Coupon if provided
    let discountPct = 0;
    let validCouponCode = null;
    if (couponCode) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const couponRecord = await prisma.coupon.findFirst({
        where: {
          code: cleanCoupon,
          isActive: true,
          OR: [{ productId: null }, { productId: product.id }],
        },
      });

      if (couponRecord) {
        discountPct = couponRecord.discountPct;
        validCouponCode = couponRecord.code;
        await prisma.coupon.update({
          where: { id: couponRecord.id },
          data: { usedCount: { increment: 1 } },
        });
      } else {
        const GLOBAL_PROMOS: Record<string, number> = {
          FALKO10: 10,
          FALKO20: 20,
          LANZAMIENTO50: 50,
          VIPCREADOR: 25,
          HALCON30: 30,
        };
        if (GLOBAL_PROMOS[cleanCoupon]) {
          discountPct = GLOBAL_PROMOS[cleanCoupon];
          validCouponCode = cleanCoupon;
        }
      }
    }

    // 3. Compute final base price factoring in Order Bump & Discounts
    let basePrice = product.price;
    let discountAmount = 0;

    if (discountPct > 0) {
      discountAmount = (basePrice * discountPct) / 100;
      basePrice = Math.max(1, basePrice - discountAmount);
    }

    let orderBumpAmount = 0;
    if (includeOrderBump && product.orderBumpPrice) {
      orderBumpAmount = product.orderBumpPrice;
      basePrice += orderBumpAmount;
    }

    // 4. Check for affiliate referral link
    let affiliateProduct = null;
    let affiliateUserId = null;

    if (refCode && product.affiliateEnabled) {
      affiliateProduct = await prisma.affiliateProduct.findFirst({
        where: {
          uniqueRefCode: refCode,
          productId: product.id,
          status: "APPROVED",
        },
        include: {
          affiliateProfile: true,
        },
      });

      if (affiliateProduct) {
        affiliateUserId = affiliateProduct.affiliateProfile.userId;
      }
    }

    // 5. Server-side Anti-Fraud Check
    const fraudCheck = await validateOrderFraud({
      buyerId: buyerUser.id,
      buyerEmail: buyerUser.email,
      affiliateProductId: affiliateProduct?.id,
      productSellerId: product.sellerId,
    });

    if (!fraudCheck.allowed) {
      return NextResponse.json({ success: false, error: fraudCheck.reason }, { status: 400 });
    }

    // 6. Calculate exact server-side financial division
    const split = computeFinancialSplit({
      productPrice: basePrice,
      currencyCode: product.currencyCode,
      affiliateCommissionPct: product.affiliateCommissionPct,
      hasAffiliate: !!affiliateProduct,
    });

    // 7. Initialize payment provider (MERCADOPAGO / MOCK)
    const paymentProvider = getPaymentProvider(paymentMethod);
    const orderNumber = `ORD-FLK-${Date.now().toString().slice(-6)}`;

    const paymentResult = await paymentProvider.createPayment({
      orderId: `temp_${Date.now()}`,
      orderNumber,
      amount: split.totalAmount,
      currency: split.currencyCode,
      description: `Compra FALKO: ${product.title}${includeOrderBump ? " (+ Bump)" : ""}`,
      customerEmail: buyerUser.email,
      customerName: `${buyerUser.firstName} ${buyerUser.lastName}`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/order/success?orderNumber=${orderNumber}&email=${encodeURIComponent(buyerUser.email)}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/order/failed`,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.errorMessage || "Error al procesar el pago." },
        { status: 500 }
      );
    }

    // 8. Guarantee release date calculation
    const guaranteeReleaseDate = new Date();
    guaranteeReleaseDate.setDate(guaranteeReleaseDate.getDate() + product.guaranteeDays);

    // 9. Persist Order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: buyerUser.id,
        affiliateProductId: affiliateProduct?.id || null,
        totalAmount: split.totalAmount,
        currencyCode: split.currencyCode,
        basePrice: product.price,
        couponCode: validCouponCode,
        discountAmount,
        hasOrderBump: includeOrderBump,
        orderBumpAmount,
        exchangeRate: 1.0,
        platformFeeUyu: split.platformFeeUyu,
        platformFeeConverted: split.platformFeeConverted,
        affiliateCommissionAmount: split.affiliateCommissionAmount,
        sellerEarningAmount: split.sellerEarningAmount,
        guaranteeDays: product.guaranteeDays,
        guaranteeReleaseDate,
        status: "CONFIRMED",
        paymentProvider: paymentProvider.name,
        paymentProviderId: paymentResult.transactionId,
        items: {
          create: {
            productId: product.id,
            price: basePrice,
            currencyCode: product.currencyCode,
          },
        },
        payments: {
          create: {
            provider: paymentProvider.name,
            transactionId: paymentResult.transactionId,
            status: "CONFIRMED",
            rawResponseJson: JSON.stringify(paymentResult.rawResponse || {}),
          },
        },
      },
    });

    // 10. Process Immutable Double-Entry Ledger & Guarantee Holds
    await processOrderLedger({
      orderId: order.id,
      sellerId: product.sellerId,
      sellerAmount: split.sellerEarningAmount,
      affiliateUserId,
      affiliateAmount: split.affiliateCommissionAmount,
      platformFeeAmount: split.platformFeeConverted,
      currencyCode: split.currencyCode,
      guaranteeDays: product.guaranteeDays,
    });

    // 11. Increment product sales count & affiliate conversion count
    await prisma.product.update({
      where: { id: product.id },
      data: { salesCount: { increment: 1 } },
    });

    if (affiliateProduct) {
      await prisma.affiliateProduct.update({
        where: { id: affiliateProduct.id },
        data: { conversionsCount: { increment: 1 } },
      });

      // Add sales volume USD to Affiliate ranking
      await addSalesVolume(affiliateUserId!, split.salesVolumeUsd);
    }

    // Add sales volume USD to Seller ranking
    await addSalesVolume(product.sellerId, split.salesVolumeUsd);

    // 12. Create In-App Notification for Seller
    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        title: "¡Nueva venta confirmada! 🎉",
        message: `Has vendido "${product.title}" por ${split.sellerEarningAmount.toFixed(2)} ${split.currencyCode} netos (retenidos por garantía ${product.guaranteeDays}d).`,
        type: "SALE",
        linkUrl: "/seller",
      },
    });

    if (affiliateUserId) {
      await prisma.notification.create({
        data: {
          userId: affiliateUserId,
          title: "¡Comisión de afiliado generada! 💰",
          message: `Has generado una comisión de ${split.affiliateCommissionAmount.toFixed(2)} ${split.currencyCode} promocionando "${product.title}".`,
          type: "COMMISSION",
          linkUrl: "/affiliate",
        },
      });
    }

    // 13. Dispatch Real-time Webhooks to Seller's Integrations (Zapier, Make, CRM, ActiveCampaign)
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
            id: buyerUser.id,
            name: `${buyerUser.firstName} ${buyerUser.lastName}`,
            email: buyerUser.email,
            country: buyerUser.countryCode,
          },
          amounts: {
            total: split.totalAmount,
            base_price: product.price,
            discount: discountAmount,
            order_bump: orderBumpAmount,
            seller_earning: split.sellerEarningAmount,
            affiliate_commission: split.affiliateCommissionAmount,
            currency: split.currencyCode,
          },
          coupon_applied: validCouponCode,
          payment: {
            provider: paymentProvider.name,
            transaction_id: paymentResult.transactionId,
            method: paymentMethod,
            status: "CONFIRMED",
          },
          affiliate: affiliateProduct
            ? {
                code: affiliateProduct.uniqueRefCode,
                commission: split.affiliateCommissionAmount,
              }
            : null,
          created_at: order.createdAt.toISOString(),
        },
      },
    }).catch((whErr) => console.error("Webhook dispatch async error:", whErr));

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      redirectUrl: `/order/success?orderNumber=${order.orderNumber}`,
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
