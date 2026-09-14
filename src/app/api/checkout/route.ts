import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeFinancialSplit, convertCurrency } from "@/lib/currency";
import { validateOrderFraud } from "@/lib/fraud";
import { processOrderLedger } from "@/lib/ledger";
import { addSalesVolume } from "@/lib/ranking";
import { getPaymentProvider } from "@/lib/payments";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Debes iniciar sesión para completar la compra." }, { status: 401 });
    }

    const { productSlug, refCode, targetCurrency = "USD", paymentMethod = "MERCADOPAGO" } = await req.json();

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

    // 2. Check for affiliate referral link
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

    // 3. Server-side Anti-Fraud Check
    const fraudCheck = await validateOrderFraud({
      buyerId: currentUser.id,
      buyerEmail: currentUser.email,
      affiliateProductId: affiliateProduct?.id,
      productSellerId: product.sellerId,
    });

    if (!fraudCheck.allowed) {
      return NextResponse.json({ success: false, error: fraudCheck.reason }, { status: 400 });
    }

    // 4. Calculate exact server-side financial division
    const split = computeFinancialSplit({
      productPrice: product.price,
      currencyCode: product.currencyCode,
      affiliateCommissionPct: product.affiliateCommissionPct,
      hasAffiliate: !!affiliateProduct,
    });

    // 5. Initialize payment provider (MERCADOPAGO / MOCK)
    const paymentProvider = getPaymentProvider(paymentMethod);
    const orderNumber = `ORD-FLK-${Date.now().toString().slice(-6)}`;

    const paymentResult = await paymentProvider.createPayment({
      orderId: `temp_${Date.now()}`,
      orderNumber,
      amount: split.totalAmount,
      currency: split.currencyCode,
      description: `Compra FALKO: ${product.title}`,
      customerEmail: currentUser.email,
      customerName: `${currentUser.firstName} ${currentUser.lastName}`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/order/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/order/failed`,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.errorMessage || "Error al procesar el pago." },
        { status: 500 }
      );
    }

    // 6. Guarantee release date calculation
    const guaranteeReleaseDate = new Date();
    guaranteeReleaseDate.setDate(guaranteeReleaseDate.getDate() + product.guaranteeDays);

    // 7. Persist Order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: currentUser.id,
        affiliateProductId: affiliateProduct?.id || null,
        totalAmount: split.totalAmount,
        currencyCode: split.currencyCode,
        basePrice: product.price,
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
            price: product.price,
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

    // 8. Process Immutable Double-Entry Ledger & Guarantee Holds
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

    // 9. Increment product sales count & affiliate conversion count
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

    // 10. Create In-App Notification for Seller
    await prisma.notification.create({
      data: {
        userId: product.sellerId,
        title: "¡Nueva venta confirmada! 🎉",
        message: `Has vendido "${product.title}" por ${split.sellerEarningAmount} ${split.currencyCode} netos (retenidos por garantía ${product.guaranteeDays}d).`,
        type: "SALE",
        linkUrl: "/seller",
      },
    });

    if (affiliateUserId) {
      await prisma.notification.create({
        data: {
          userId: affiliateUserId,
          title: "¡Comisión de afiliado generada! 💰",
          message: `Has generado una comisión de ${split.affiliateCommissionAmount} ${split.currencyCode} promocionando "${product.title}".`,
          type: "COMMISSION",
          linkUrl: "/affiliate",
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      redirectUrl: `/order/success?orderNumber=${order.orderNumber}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
