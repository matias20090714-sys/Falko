import crypto from "crypto";
import { prisma } from "@/lib/db";

export interface WebhookEventPayload {
  event: string;
  timestamp: string;
  data: {
    order_id?: string;
    order_number?: string;
    product: {
      id: string;
      title: string;
      slug: string;
      price: number;
    };
    buyer: {
      id?: string;
      name: string;
      email: string;
      phone?: string;
      country?: string;
    };
    amounts: {
      total: number;
      base_price: number;
      discount: number;
      order_bump: number;
      seller_earning: number;
      affiliate_commission: number;
      currency: string;
    };
    coupon_applied?: string | null;
    payment: {
      provider: string;
      transaction_id?: string;
      method?: string;
      status: string;
    };
    affiliate?: {
      code: string;
      sub_id?: string | null;
      commission: number;
    } | null;
    created_at: string;
  };
}

export function generateWebhookSignature(secretKey: string, payloadString: string): string {
  return crypto.createHmac("sha256", secretKey).update(payloadString).digest("hex");
}

export async function dispatchWebhook(webhook: {
  id: string;
  url: string;
  secretKey: string;
}, event: string, payload: any): Promise<{
  success: boolean;
  statusCode?: number;
  durationMs: number;
  responseBody?: string;
  error?: string;
}> {
  const startTime = Date.now();
  const payloadString = JSON.stringify(payload);
  const signature = generateWebhookSignature(webhook.secretKey, payloadString);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Falko-Webhooks/1.0",
        "X-Falko-Event": event,
        "X-Falko-Signature": `sha256=${signature}`,
        "X-Falko-Timestamp": `${Date.now()}`,
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - startTime;
    let responseBody = "";
    try {
      responseBody = await response.text();
      if (responseBody.length > 1000) {
        responseBody = responseBody.slice(0, 1000) + "... [Truncated]";
      }
    } catch {
      responseBody = "";
    }

    const isSuccess = response.ok;

    // Log delivery to database
    await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        statusCode: response.status,
        requestPayload: payloadString,
        responseBody,
        durationMs,
        status: isSuccess ? "SUCCESS" : "FAILED",
        error: isSuccess ? null : `HTTP ${response.status}: ${response.statusText}`,
      },
    }).catch((err) => console.error("Error logging webhook delivery:", err));

    return {
      success: isSuccess,
      statusCode: response.status,
      durationMs,
      responseBody,
      error: isSuccess ? undefined : `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err.name === "AbortError" ? "Request Timeout (8000ms)" : (err.message || "Network Error");

    await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        statusCode: null,
        requestPayload: payloadString,
        responseBody: null,
        durationMs,
        status: "FAILED",
        error: errorMessage,
      },
    }).catch((logErr) => console.error("Error logging webhook delivery failure:", logErr));

    return {
      success: false,
      statusCode: 0,
      durationMs,
      error: errorMessage,
    };
  }
}

export async function triggerWebhooksForSeller({
  sellerId,
  productId,
  event,
  payload,
}: {
  sellerId: string;
  productId?: string;
  event: "order.completed" | "order.created" | "order.refunded" | "cart.abandoned";
  payload: any;
}) {
  try {
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: {
        userId: sellerId,
        isActive: true,
        OR: [
          { productId: null },
          ...(productId ? [{ productId }] : []),
        ],
      },
    });

    const activeHooksForEvent = webhooks.filter((hook) => {
      const eventList = hook.events.split(",").map((e) => e.trim());
      return eventList.includes(event) || eventList.includes("*");
    });

    if (activeHooksForEvent.length === 0) return;

    // Execute webhooks asynchronously in background
    Promise.allSettled(
      activeHooksForEvent.map((hook) => dispatchWebhook(hook, event, payload))
    ).catch((err) => console.error("Error in webhook dispatcher batch:", err));
  } catch (error) {
    console.error("Error triggering seller webhooks:", error);
  }
}

export function generateSampleWebhookPayload(event: string = "order.completed", customProduct?: any): WebhookEventPayload {
  return {
    event,
    timestamp: new Date().toISOString(),
    data: {
      order_id: "ord_flk_demo_98234",
      order_number: "ORD-FLK-774921",
      product: {
        id: customProduct?.id || "prod_masterclass_01",
        title: customProduct?.title || "Masterclass en Growth & Automatización Digital",
        slug: customProduct?.slug || "masterclass-growth",
        price: customProduct?.price || 97.00,
      },
      buyer: {
        id: "usr_buyer_18293",
        name: "Carlos Mendoza",
        email: "carlos.mendoza@ejemplo.com",
        phone: "+54 9 11 5555-1234",
        country: "AR",
      },
      amounts: {
        total: 116.00,
        base_price: 97.00,
        discount: 10.00,
        order_bump: 29.00,
        seller_earning: 104.40,
        affiliate_commission: 0.00,
        currency: "USD",
      },
      coupon_applied: "LANZAMIENTO10",
      payment: {
        provider: "MERCADOPAGO",
        transaction_id: "mp_tx_8892013840",
        method: "CREDIT_CARD",
        status: "CONFIRMED",
      },
      affiliate: {
        code: "AFF-000042",
        sub_id: "facebook_campaign_q3",
        commission: 0.00,
      },
      created_at: new Date().toISOString(),
    },
  };
}
