import { PaymentIntentRequest, PaymentIntentResponse, PaymentProvider } from "./types";

export class MockPaymentProvider implements PaymentProvider {
  name = "MOCK";

  async createPayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const transactionId = `MOCK_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      transactionId,
      provider: "MOCK",
      status: "CONFIRMED",
      redirectUrl: `${req.returnUrl}?payment_id=${transactionId}&status=success`,
      clientSecret: `mock_secret_${transactionId}`,
      rawResponse: {
        mode: "development_sandbox",
        timestamp: new Date().toISOString(),
        note: "Simulated instant payment fulfillment for FALKO marketplace testing.",
      },
    };
  }

  async confirmPayment(transactionId: string): Promise<{ success: boolean; status: string; orderId?: string }> {
    return {
      success: true,
      status: "CONFIRMED",
      orderId: transactionId,
    };
  }

  async refundPayment(
    transactionId: string,
    amount: number,
    currency: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    return {
      success: true,
      refundId: `MOCK_REF_${Date.now()}`,
    };
  }

  async getPaymentStatus(transactionId: string): Promise<{ status: string; paid: boolean }> {
    return {
      status: "CONFIRMED",
      paid: true,
    };
  }
}

export class StripePaymentProvider implements PaymentProvider {
  name = "STRIPE";

  async createPayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return {
        success: false,
        transactionId: "",
        provider: "STRIPE",
        status: "FAILED",
        errorMessage: "Payment Provider Not Configured: STRIPE_SECRET_KEY is missing in .env",
      };
    }
    // Production connector ready
    throw new Error("Stripe connector is unconfigured in current environment");
  }

  async confirmPayment(transactionId: string) {
    return { success: false, status: "NOT_CONFIGURED" };
  }

  async refundPayment(transactionId: string, amount: number, currency: string) {
    return { success: false, error: "Stripe credentials not provided" };
  }

  async getPaymentStatus(transactionId: string) {
    return { status: "UNCONFIGURED", paid: false };
  }
}

export class MercadoPagoPaymentProvider implements PaymentProvider {
  name = "MERCADOPAGO";

  async createPayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      return {
        success: false,
        transactionId: "",
        provider: "MERCADOPAGO",
        status: "FAILED",
        errorMessage: "Payment Provider Not Configured: MERCADOPAGO_ACCESS_TOKEN is missing in .env",
      };
    }
    throw new Error("Mercado Pago connector is unconfigured in current environment");
  }

  async confirmPayment(transactionId: string) {
    return { success: false, status: "NOT_CONFIGURED" };
  }

  async refundPayment(transactionId: string, amount: number, currency: string) {
    return { success: false, error: "Mercado Pago credentials not provided" };
  }

  async getPaymentStatus(transactionId: string) {
    return { status: "UNCONFIGURED", paid: false };
  }
}

export function getPaymentProvider(providerName = process.env.PAYMENT_PROVIDER || "MOCK"): PaymentProvider {
  switch (providerName.toUpperCase()) {
    case "STRIPE":
      return new StripePaymentProvider();
    case "MERCADOPAGO":
    case "MERCADO_PAGO":
      return new MercadoPagoPaymentProvider();
    case "MOCK":
    default:
      return new MockPaymentProvider();
  }
}
