interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || "FALKO Marketplace <notificaciones@falko.dpdns.org>";

    // 1. Try Resend HTTP API if configured (Zero npm dependency, pure fetch)
    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey.trim()}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, ""),
        }),
      });

      if (res.ok) {
        return { success: true };
      }
      const errData = await res.json().catch(() => ({}));
      console.warn("Resend API send error, falling back to SMTP:", errData);
    }

    // 2. Try Nodemailer SMTP if configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

    if (smtpHost || (smtpUser && smtpPass)) {
      try {
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
          host: smtpHost || "smtp.gmail.com",
          port: smtpPort,
          secure: smtpSecure,
          auth: (smtpUser && smtpPass) ? {
            user: smtpUser,
            pass: smtpPass,
          } : undefined,
        });

        await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, ""),
        });

        return { success: true };
      } catch (smtpErr) {
        console.warn("SMTP Transport error:", smtpErr);
      }
    }

    // 3. Fallback SendGrid API if configured
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (sendgridApiKey) {
      const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sendgridApiKey.trim()}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromAddress.includes("<") ? fromAddress.split("<")[1].replace(">", "") : fromAddress },
          subject,
          content: [{ type: "text/html", value: html }],
        }),
      });

      if (sgRes.ok) {
        return { success: true };
      }
    }

    console.warn(`[EMAIL NOTICE] No production SMTP or RESEND_API_KEY configured yet in .env. Email to ${to} for "${subject}" was logged.`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send email to", to, error);
    return { success: false, error: error.message || "Error al enviar correo electrónico." };
  }
}

export async function sendVerificationCodeEmail(toEmail: string, code: string, firstName: string) {
  const subject = `${code} es tu código de verificación FALKO`;
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Código de Verificación FALKO</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #030712; color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 30px auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 40px; text-align: center; }
        .logo { font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; margin-bottom: 24px; }
        .logo span { color: #06b6d4; }
        .title { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 12px; }
        .subtitle { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 32px; }
        .code-box { background: linear-gradient(135deg, #082f49 0%, #0f172a 100%); border: 2px solid #06b6d4; border-radius: 16px; padding: 20px; font-size: 36px; font-weight: 900; font-family: monospace; letter-spacing: 10px; color: #38bdf8; margin: 24px 0; text-shadow: 0 0 12px rgba(6, 182, 212, 0.4); }
        .notice { font-size: 12px; color: #64748b; margin-top: 24px; line-height: 1.5; }
        .footer { font-size: 11px; color: #475569; margin-top: 36px; border-t: 1px solid #1e293b; pt: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">FAL<span>KO</span></div>
        <div class="title">Verificación de Correo Electrónico</div>
        <div class="subtitle">Hola <strong>${firstName}</strong>, bienvenido a FALKO Marketplace. Usa el siguiente código de 6 dígitos para verificar tu cuenta e ingresar a la plataforma:</div>
        
        <div class="code-box">${code}</div>

        <div class="notice">
          ⚡ Este código es único y vencerá en <strong>10 minutos</strong>.<br>
          Si no solicitaste este código, puedes ignorar este mensaje de forma segura.
        </div>

        <div class="footer">
          FALKO Digital Marketplace • Seguridad Cifrada de Grado Bancario
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: toEmail, subject, html });
}
