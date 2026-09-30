import { PaymentIntentRequest, PaymentIntentResponse, PaymentProvider } from "./types";

export class MockPaymentProvider implements PaymentProvider {
  name = "MOCK";

  async createPayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    return {
      success: false,
      transactionId: "",
      provider: "MOCK",
      status: "FAILED",
      errorMessage: "Las compras de prueba están permanentemente deshabilitadas. Solo se procesan compras reales con Mercado Pago.",
    };
  }

  async confirmPayment(transactionId: string): Promise<{ success: boolean; status: string; orderId?: string }> {
    return {
      success: false,
      status: "FAILED",
    };
  }

  async refundPayment(
    transactionId: string,
    amount: number,
    currency: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    return {
      success: false,
      error: "Reembolso no disponible en modo simulado",
    };
  }

  async getPaymentStatus(transactionId: string): Promise<{ status: string; paid: boolean }> {
    return {
      status: "FAILED",
      paid: false,
    };
  }
}

export class MercadoPagoPaymentProvider implements PaymentProvider {
  name = "MERCADOPAGO";

  async createPayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const token =
      process.env.MERCADOPAGO_ACCESS_TOKEN ||
      "APP_USR-6259061397586-091418-4453cf8384c0d811a4bce4854a1a7f63-132459287";
    if (!token) {
      return {
        success: false,
        transactionId: "",
        provider: "MERCADOPAGO",
        status: "FAILED",
        errorMessage: "Mercado Pago no está configurado (falta MERCADOPAGO_ACCESS_TOKEN).",
      };
    }

    try {
      // Map currency to Mercado Pago accepted currency code (UYU, ARS, BRL, MXN, CLP, COP, PEN, USD)
      const currencyId = req.currency.toUpperCase();

      const preferencePayload = {
        items: [
          {
            id: req.orderId || `item_${Date.now()}`,
            title: req.description || `Compra en FALKO (${req.orderNumber})`,
            description: `Orden digital ${req.orderNumber}`,
            quantity: 1,
            unit_price: parseFloat(req.amount.toFixed(2)),
            currency_id: currencyId,
          },
        ],
        payer: {
          email: req.customerEmail,
          name: req.customerName,
        },
        back_urls: {
          success: req.returnUrl,
          failure: req.cancelUrl || req.returnUrl,
          pending: req.returnUrl,
        },
        auto_return: "approved",
        external_reference: req.orderNumber,
        statement_descriptor: "FALKO DIGITAL",
        binary_mode: true, // Only approve or reject, no pending ambiguity
      };

      const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify(preferencePayload),
      });

      const data = await res.json();

      if (!res.ok || !data.id) {
        console.error("Mercado Pago Preference Error:", data);
        const errorDetail = data.message || (data.cause && data.cause[0] ? data.cause[0].description : "Error al inicializar la pasarela de Mercado Pago.");
        return {
          success: false,
          transactionId: "",
          provider: "MERCADOPAGO",
          status: "FAILED",
          errorMessage: `Mercado Pago: ${errorDetail}`,
        };
      }

      return {
        success: true,
        transactionId: data.id,
        provider: "MERCADOPAGO",
        status: "PENDING",
        redirectUrl: data.init_point || data.sandbox_init_point,
        clientSecret: data.id,
        rawResponse: data,
      };
    } catch (err: any) {
      console.error("Mercado Pago connection error:", err);
      return {
        success: false,
        transactionId: "",
        provider: "MERCADOPAGO",
        status: "FAILED",
        errorMessage: err.message || "Error al conectar con los servidores de Mercado Pago.",
      };
    }
  }

  async confirmPayment(transactionId: string) {
    return { success: true, status: "CONFIRMED" };
  }

  async refundPayment(transactionId: string, amount: number, currency: string) {
    return { success: true, refundId: `MP_REF_${Date.now()}` };
  }

  async getPaymentStatus(transactionId: string) {
    return { status: "CONFIRMED", paid: true };
  }
}

export function getPaymentProvider(providerName = process.env.PAYMENT_PROVIDER || "MERCADOPAGO"): PaymentProvider {
  switch (providerName.toUpperCase()) {
    case "MERCADOPAGO":
    case "MERCADO_PAGO":
    case "PIX":
    case "SPEI":
    case "PSE":
    case "BROU_PREX":
    case "CARD":
    default:
      return new MercadoPagoPaymentProvider();
  }
}
