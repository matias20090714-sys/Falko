import { sendEmail } from "@/lib/email";

export interface EmailPayload {
  to: string;
  subject: string;
  template:
    | "WELCOME"
    | "PURCHASE_CONFIRMATION"
    | "SELLER_SALE_ALERT"
    | "AFFILIATE_COMMISSION_ALERT"
    | "AFFILIATE_APPROVED"
    | "AFFILIATE_REJECTED"
    | "PRODUCT_APPROVED"
    | "PRODUCT_REJECTED"
    | "WITHDRAWAL_REQUESTED"
    | "WITHDRAWAL_PAID"
    | "REFUND_PROCESSED"
    | "PASSWORD_RESET";
  data: Record<string, any>;
}

export interface EmailProvider {
  name: string;
  sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class ProductionEmailProvider implements EmailProvider {
  name = "PRODUCTION";

  async sendEmail(payload: EmailPayload) {
    const { subject, body } = renderEmailTemplate(payload.template, payload.data);
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 30px; border-radius: 16px;">
        <h2 style="color: #06b6d4;">FALKO Marketplace</h2>
        <div style="font-size: 14px; line-height: 1.6; color: #cbd5e1; white-space: pre-line;">${body}</div>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin-top: 30px;" />
        <p style="font-size: 11px; color: #64748b;">Este es un mensaje automático enviado por FALKO Digital Marketplace.</p>
      </div>
    `;

    const res = await sendEmail({
      to: payload.to,
      subject,
      html: htmlBody,
      text: body,
    });

    return {
      success: res.success,
      messageId: res.success ? `email_${Date.now()}` : undefined,
      error: res.error,
    };
  }
}

export function getEmailProvider(): EmailProvider {
  return new ProductionEmailProvider();
}

/**
 * Generate standard HTML/Text templates for platform notifications
 */
export function renderEmailTemplate(template: EmailPayload["template"], data: Record<string, any>): { subject: string; body: string } {
  switch (template) {
    case "WELCOME":
      return {
        subject: `¡Bienvenido a FALKO, ${data.name}! 🦅`,
        body: `Hola ${data.name},\n\nTu cuenta en FALKO ha sido creada exitosamente. Explora miles de productos digitales de alta calidad o activa tu modo vendedor/afiliado para comenzar a monetizar tus conocimientos.\n\nEquipo FALKO`,
      };
    case "PURCHASE_CONFIRMATION":
      return {
        subject: `Confirmación de compra #${data.orderNumber} - FALKO`,
        body: `Hola ${data.name},\n\nTu compra de "${data.productTitle}" por ${data.amount} ${data.currency} ha sido confirmada. Ya puedes acceder al contenido desde tu biblioteca privada con garantía de ${data.guaranteeDays} días.\n\nEquipo FALKO`,
      };
    case "SELLER_SALE_ALERT":
      return {
        subject: `¡Nueva venta realizada! - "${data.productTitle}"`,
        body: `¡Felicidades! Has vendido "${data.productTitle}". Tus ganancias netas de ${data.netAmount} ${data.currency} han sido acreditadas en retención de garantía.\n\nEquipo FALKO`,
      };
    case "AFFILIATE_COMMISSION_ALERT":
      return {
        subject: `¡Comisión de afiliado generada! - FALKO 💰`,
        body: `¡Excelente trabajo! Has generado una venta referida para "${data.productTitle}". Tu comisión de ${data.commissionAmount} ${data.currency} ha sido acreditada a tu billetera.\n\nEquipo FALKO`,
      };
    case "WITHDRAWAL_PAID":
      return {
        subject: `Tu retiro #${data.withdrawalNumber} ha sido procesado`,
        body: `Tu solicitud de retiro por ${data.amount} ${data.currency} ha sido enviada exitosamente a tu cuenta de destino (${data.methodName}).\n\nEquipo FALKO`,
      };
    case "REFUND_PROCESSED":
      return {
        subject: `Reembolso procesado para la orden #${data.orderNumber}`,
        body: `Tu solicitud de reembolso por ${data.amount} ${data.currency} correspondiente a "${data.productTitle}" ha sido aprobada dentro del período de garantía.\n\nEquipo FALKO`,
      };
    default:
      return {
        subject: `Notificación de FALKO`,
        body: `Tienes una nueva actualización en tu cuenta FALKO.`,
      };
  }
}
