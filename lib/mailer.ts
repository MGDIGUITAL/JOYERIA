import nodemailer from 'nodemailer';

export interface ShippingEmailParams {
  to: string;
  clientName: string;
  orderId: string | number;
  trackingNumber: string;
  deliveryMethod?: string;
  address?: string;
}

export function buildShippingEmailHtml(params: ShippingEmailParams): string {
  const { clientName, orderId, trackingNumber, deliveryMethod, address } = params;
  const isPickup = deliveryMethod === 'punto' || deliveryMethod === 'retiro';
  const methodLabel = isPickup ? 'Retiro en Punto Blue Express' : 'Despacho a Domicilio';
  const cleanOrderId = String(orderId).substring(0, 8).toUpperCase();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Pedido ha sido Despachado — Amora Jewelry</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F3F0E9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #F3F0E9; padding: 30px 12px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FDFCF8; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background-color: #101010; text-align: center; padding: 32px 20px; }
    .header img { max-width: 170px; height: auto; display: block; margin: 0 auto; filter: brightness(0) invert(1); }
    .content { padding: 40px 32px; color: #1E1E1E; }
    .badge { display: inline-block; background-color: #2E7D32; color: #FFFFFF; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; margin-bottom: 20px; }
    h1 { font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: normal; letter-spacing: 1px; color: #101010; margin: 0 0 12px; }
    .order-id { font-size: 15px; color: #B8975A; font-weight: bold; margin-bottom: 24px; letter-spacing: 0.5px; }
    p { font-size: 15px; line-height: 1.7; color: #555047; margin: 0 0 18px; }
    .tracking-card { background-color: #F3F0E9; border: 2px dashed #B8975A; border-radius: 8px; padding: 24px 20px; margin: 28px 0; text-align: center; }
    .tracking-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px; color: #7A7468; margin-bottom: 8px; font-weight: bold; }
    .tracking-number { font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: bold; color: #101010; letter-spacing: 2px; margin-bottom: 16px; word-break: break-all; }
    .btn-track { display: inline-block; background-color: #101010; color: #B8975A !important; text-decoration: none; padding: 13px 28px; border-radius: 6px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1.2px; transition: background 0.2s; }
    .details-box { background-color: #FAF8F5; border-left: 3px solid #B8975A; padding: 16px 20px; border-radius: 0 6px 6px 0; margin-top: 24px; text-align: left; }
    .details-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #101010; margin-bottom: 8px; }
    .details-text { font-size: 13px; color: #666; margin: 4px 0; line-height: 1.5; }
    .footer { background-color: #101010; text-align: center; padding: 28px 20px; font-size: 11px; color: #A89F91; }
    .footer a { color: #B8975A; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Encabezado con Logo -->
      <div class="header">
        <img src="https://qrhspijmfimjxemravyz.supabase.co/storage/v1/object/public/email-assets/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" />
      </div>

      <!-- Contenido Principal -->
      <div class="content">
        <div style="text-align: center;">
          <span class="badge">✓ Pedido Despachado</span>
          <h1>¡Tu paquete va en camino, ${clientName}!</h1>
          <div class="order-id">Orden #${cleanOrderId}</div>
        </div>

        <p>Nos alegra informarte que tus joyas han sido preparadas, empaquetadas con el cuidado característico de <strong>Amora Jewelry</strong> y entregadas a <strong>Blue Express</strong> para su despacho.</p>

        <!-- Tarjeta de Seguimiento -->
        <div class="tracking-card">
          <div class="tracking-label">Número de Seguimiento Blue Express</div>
          <div class="tracking-number">${trackingNumber}</div>
          <a href="https://www.blue.cl/" target="_blank" rel="noopener noreferrer" class="btn-track">
            Rastrear en Blue Express &rarr;
          </a>
        </div>

        <!-- Detalles de Envío -->
        ${address ? `
        <div class="details-box">
          <div class="details-title">Destino de Entrega</div>
          <p class="details-text"><strong>Modalidad:</strong> ${methodLabel}</p>
          <p class="details-text"><strong>Dirección:</strong> ${address}</p>
        </div>
        ` : ''}

        <p style="margin-top: 28px; font-size: 14px; color: #7A7468; text-align: center;">
          Muchas gracias por tu compra y por confiar en nosotros para resaltar tu estilo con piezas únicas.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 8px; letter-spacing: 2px; text-transform: uppercase;">Amora Jewelry · Chile</p>
        <p style="margin: 0;">¿Tienes dudas? Escríbenos a <a href="mailto:amorajewelrychile@gmail.com">amorajewelrychile@gmail.com</a></p>
        <p style="margin: 12px 0 0; font-size: 10px; color: #7A7468;">&copy; ${new Date().getFullYear()} Amora Jewelry. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendShippingNotification(params: ShippingEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_PASS;

    if (!user || !pass) {
      console.warn('[sendShippingNotification] Gmail credentials not set, skipping email.');
      return { success: false, error: 'Credenciales de Gmail no configuradas' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    const cleanOrderId = String(params.orderId).substring(0, 8).toUpperCase();
    const info = await transporter.sendMail({
      from: `"Amora Jewelry" <${user}>`,
      to: params.to,
      subject: `¡Tu pedido #${cleanOrderId} ha sido despachado! 📦✨`,
      html: buildShippingEmailHtml(params),
    });

    console.log(`[sendShippingNotification] Email sent to ${params.to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[sendShippingNotification] Failed to send email:', err);
    return { success: false, error: err.message };
  }
}
