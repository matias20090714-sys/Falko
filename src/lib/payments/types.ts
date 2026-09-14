export interface PaymentIntentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  transactionId: string;
  provider: string;
  status: "PENDING" | "CONFIRMED" | "FAILED" | "REQUIRES_ACTION";
  redirectUrl?: string;
  clientSecret?: string;
  errorMessage?: string;
  rawResponse?: Record<string, any>;
}

export interface PaymentProvider {
  name: string;
  createPayment(req: PaymentIntentRequest): Promise<PaymentIntentResponse>;
  confirmPayment(transactionId: string): Promise<{ success: boolean; status: string; orderId?: string }>;
  refundPayment(transactionId: string, amount: number, currency: string): Promise<{ success: boolean; refundId?: string; error?: string }>;
  getPaymentStatus(transactionId: string): Promise<{ status: string; paid: boolean }>;
}
