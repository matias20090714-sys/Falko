import { prisma } from "./db";

export interface FraudCheckResult {
  allowed: boolean;
  reason?: string;
  riskScore: number; // 0 to 100
}

/**
 * Validate order against self-referral, self-purchasing, and suspicious conversion patterns
 */
export async function validateOrderFraud(params: {
  buyerId: string;
  buyerEmail: string;
  affiliateProductId?: string | null;
  productSellerId: string;
}): Promise<FraudCheckResult> {
  const { buyerId, buyerEmail, affiliateProductId, productSellerId } = params;

  let riskScore = 0;

  // 1. Seller cannot buy their own product
  if (buyerId === productSellerId) {
    return {
      allowed: false,
      reason: "No está permitido comprar tus propios productos.",
      riskScore: 100,
    };
  }

  // 2. Affiliate Anti-Self Referral: Affiliate cannot earn commission on their own purchase
  if (affiliateProductId) {
    const affiliateProduct = await prisma.affiliateProduct.findUnique({
      where: { id: affiliateProductId },
      include: {
        affiliateProfile: {
          include: { user: true },
        },
      },
    });

    if (affiliateProduct) {
      // Check if buyer is the affiliate
      if (affiliateProduct.affiliateProfile.userId === buyerId) {
        return {
          allowed: false,
          reason: "Auto-referido detectado: No puedes utilizar tu propio enlace de afiliado para realizar compras.",
          riskScore: 95,
        };
      }

      // Check email similarity/domain
      if (affiliateProduct.affiliateProfile.user.email.toLowerCase() === buyerEmail.toLowerCase()) {
        return {
          allowed: false,
          reason: "Auto-referido detectado por coincidencia de correo electrónico.",
          riskScore: 90,
        };
      }
    }
  }

  // 3. Velocity check: Check recent purchases by buyer in the last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentOrdersCount = await prisma.order.count({
    where: {
      buyerId,
      createdAt: { gte: tenMinutesAgo },
    },
  });

  if (recentOrdersCount > 5) {
    riskScore += 30; // flag high velocity
  }

  return {
    allowed: true,
    riskScore,
  };
}
