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
    
    let actionButtonHtml = "";
    if (payload.template === "PURCHASE_CONFIRMATION" && payload.data.accessUrl) {
      actionButtonHtml = `
        <div style="margin: 32px 0; text-align: center;">
          <a href="${payload.data.accessUrl}" target="_blank" style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 18px 36px; border-radius: 14px; font-weight: 900; font-size: 16px; display: inline-block; box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
            📥 Descargar / Acceder a mi Producto
          </a>
        </div>
      `;
    }

    let instructionsHtml = "";
    if (payload.data?.accessInstructions) {
      instructionsHtml = `
        <div style="background-color: #0f172a; border: 1px dashed #06b6d4; border-radius: 14px; padding: 20px; margin: 24px 0; color: #38bdf8;">
          <strong style="color: #ffffff; display: block; margin-bottom: 8px; font-size: 15px;">📌 Instrucciones de Acceso del Vendedor:</strong>
          <span style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">${payload.data.accessInstructions}</span>
        </div>
      `;
    }

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${subject}</title>
      </head>
      <body style="background-color: #030712; color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px;">
        <div style="max-width: 580px; margin: 20px auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 36px;">
          <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; text-align: center; margin-bottom: 24px;">
            FAL<span style="color: #06b6d4;">KO</span>
          </div>
          
          <div style="font-size: 15px; line-height: 1.7; color: #cbd5e1; white-space: pre-line;">${body}</div>
          
          ${instructionsHtml}
          ${actionButtonHtml}

          ${
            payload.data?.accessUrl
              ? `<div style="font-size: 12px; color: #64748b; text-align: center; margin-top: 16px;">Si el botón no abre, copia y pega este enlace en tu navegador:<br><a href="${payload.data.accessUrl}" style="color: #38bdf8; word-break: break-all;">${payload.data.accessUrl}</a></div>`
              : ""
          }

          <hr style="border: 0; border-top: 1px solid #1e293b; margin-top: 36px; margin-bottom: 20px;" />
          <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
            FALKO Digital Marketplace • Seguridad Cifrada de Grado Bancario<br>
            Este es un mensaje automático enviado por FALKO.
          </p>
        </div>
      </body>
      </html>
    `;

    const res = await sendEmail({
      to: payload.to,
      subject,
      html: htmlBody,
      text: body + (payload.data?.accessUrl ? `\n\nAccede a tu producto aquí: ${payload.data.accessUrl}` : ""),
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
        subject: `¡Tu compra está lista! 📥 Accede a "${data.productTitle}" - FALKO #${data.orderNumber}`,
        body: `Hola ${data.name},\n\n¡Gracias por tu compra en FALKO! Tu orden de "${data.productTitle}" por ${data.amount} ${data.currency} ha sido confirmada con exito.\n\nPuedes acceder directamente a tu contenido, descargar tu archivo (PDF, ZIP o recursos) o consultar tus instrucciones de acceso usando el botón a continuación.\n\nTu compra cuenta con ${data.guaranteeDays} días de garantía de satisfacción.\n\nEquipo FALKO`,
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
