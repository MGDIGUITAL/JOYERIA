import { NextResponse } from 'next/server';
import { getFlowPaymentStatus } from '@/lib/flow';
import { supabaseAdmin } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';

// ─── Email HTML de boleta ────────────────────────────────────────────────────
function buildBoletaHtml(order: any, items: any[]) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #F3F0E9; color: #101010; font-size: 14px;">
        ${item.product_title}${item.size ? ` <span style="color:#7A7468;font-size:12px;">(Talla: ${item.size})</span>` : ''}
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #F3F0E9; text-align: center; color: #7A7468; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #F3F0E9; text-align: right; color: #101010; font-size: 14px; font-weight: 500;">
        $${(item.price * item.quantity).toLocaleString('es-CL')} CLP
      </td>
    </tr>
  `).join('');

  const orderDate = new Date(order.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
  const deliveryInfo = order.delivery_method === 'domicilio'
    ? `Despacho a Domicilio — ${order.shipping_address}, ${order.shipping_comuna}, ${order.shipping_region}`
    : `Retiro en Blue Express — ${order.pickup_point_name}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boleta #${String(order.id).padStart(5,'0')} - Amora Jewelry</title>
</head>
<body style="margin:0;padding:0;background:#F3F0E9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#F3F0E9">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table width="100%" style="max-width:620px;background:#FDFCF8;border:1px solid #E3DBCC;" border="0" cellspacing="0" cellpadding="0">

          <!-- Header -->
          <tr>
            <td style="padding: 28px 40px; border-bottom: 1px solid #E3DBCC; background: #101010;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:20px;letter-spacing:4px;color:#FDFCF8;font-family:Georgia,serif;">AMORA</p>
                    <p style="margin:4px 0 0;font-size:11px;letter-spacing:2px;color:#C8BBA8;">JEWELRY</p>
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:11px;letter-spacing:2px;color:#C8BBA8;text-transform:uppercase;">Boleta N°</p>
                    <p style="margin:4px 0 0;font-size:22px;color:#B8975A;font-family:Georgia,serif;">#${String(order.id).padStart(5,'0')}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#7A7468;">${orderDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Estado -->
          <tr>
            <td style="padding: 16px 40px; background: #F0FAF0; border-bottom: 1px solid #C8E6C9;">
              <p style="margin:0;color:#2E7D32;font-size:13px;font-weight:600;">✓ &nbsp;Pago Confirmado — Procesado por Flow / Webpay</p>
            </td>
          </tr>

          <!-- Cliente -->
          <tr>
            <td style="padding: 28px 40px; border-bottom: 1px solid #E3DBCC;">
              <p style="margin:0 0 16px;font-size:11px;letter-spacing:2px;color:#7A7468;text-transform:uppercase;">Datos del Cliente</p>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="font-size:13px;color:#7A7468;padding:4px 0;">Nombre: <strong style="color:#101010;">${order.client_name}</strong></td>
                  <td width="50%" style="font-size:13px;color:#7A7468;padding:4px 0;">RUT: <strong style="color:#101010;">${order.client_rut}</strong></td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#7A7468;padding:4px 0;">Email: <strong style="color:#101010;">${order.client_email}</strong></td>
                  <td style="font-size:13px;color:#7A7468;padding:4px 0;">Teléfono: <strong style="color:#101010;">${order.client_phone || '—'}</strong></td>
                </tr>
                <tr>
                  <td colspan="2" style="font-size:13px;color:#7A7468;padding:8px 0 0;">
                    Entrega: <strong style="color:#101010;">${deliveryInfo}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Productos -->
          <tr>
            <td style="padding: 28px 40px; border-bottom: 1px solid #E3DBCC;">
              <p style="margin:0 0 16px;font-size:11px;letter-spacing:2px;color:#7A7468;text-transform:uppercase;">Detalle de Productos</p>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <th style="text-align:left;font-size:11px;letter-spacing:1px;color:#C8BBA8;padding-bottom:10px;font-weight:400;text-transform:uppercase;border-bottom:1px solid #E3DBCC;">Producto</th>
                  <th style="text-align:center;font-size:11px;letter-spacing:1px;color:#C8BBA8;padding-bottom:10px;font-weight:400;text-transform:uppercase;border-bottom:1px solid #E3DBCC;">Cant.</th>
                  <th style="text-align:right;font-size:11px;letter-spacing:1px;color:#C8BBA8;padding-bottom:10px;font-weight:400;text-transform:uppercase;border-bottom:1px solid #E3DBCC;">Total</th>
                </tr>
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- Totales -->
          <tr>
            <td style="padding: 24px 40px; border-bottom: 1px solid #E3DBCC;" align="right">
              <table border="0" cellspacing="0" cellpadding="0" style="min-width:240px;">
                <tr>
                  <td style="font-size:13px;color:#7A7468;padding:5px 0;">Subtotal</td>
                  <td style="font-size:13px;color:#101010;padding:5px 0;padding-left:40px;text-align:right;">$${(order.subtotal||0).toLocaleString('es-CL')} CLP</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#7A7468;padding:5px 0;">Despacho</td>
                  <td style="font-size:13px;color:${order.shipping_cost === 0 ? '#2E7D32' : '#101010'};padding:5px 0;padding-left:40px;text-align:right;">${order.shipping_cost === 0 ? 'Gratis' : `$${(order.shipping_cost||0).toLocaleString('es-CL')} CLP`}</td>
                </tr>
                <tr>
                  <td style="font-size:16px;color:#101010;padding:14px 0 0;border-top:2px solid #E3DBCC;font-family:Georgia,serif;letter-spacing:1px;">TOTAL</td>
                  <td style="font-size:18px;color:#101010;padding:14px 0 0;padding-left:40px;text-align:right;border-top:2px solid #E3DBCC;font-family:Georgia,serif;font-weight:bold;">$${(order.total||0).toLocaleString('es-CL')} CLP</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Nota -->
          <tr>
            <td style="padding: 20px 40px; background: #FDFCF8; border-bottom: 1px solid #E3DBCC;">
              <p style="margin:0;font-size:12px;color:#7A7468;line-height:1.7;">
                📦 Tu pedido será gestionado para su envío a la brevedad.<br>
                Para consultas cita el número de orden <strong style="color:#101010;">#${String(order.id).padStart(5,'0')}</strong> al correo 
                <a href="mailto:amorajewelrychile@gmail.com" style="color:#B8975A;text-decoration:none;">amorajewelrychile@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background: #F3F0E9; text-align: center;">
              <p style="margin:0;font-size:11px;color:#C8BBA8;letter-spacing:2px;">TU HISTORIA, TU BRILLO, TU <strong style="color:#101010;">AMORA</strong></p>
              <p style="margin:8px 0 0;font-size:11px;color:#C8BBA8;">@AMORAJWLRY · amorajewelry.cl</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;

    if (!token) {
      return NextResponse.json({ error: 'Token no provisto' }, { status: 400 });
    }

    // Verificar pago con Flow
    const paymentStatus = await getFlowPaymentStatus(token);
    const orderId = paymentStatus.commerceOrder;
    let newStatus = 'Pendiente';

    if (paymentStatus.status === 2) newStatus = 'Pagado';
    else if (paymentStatus.status === 3 || paymentStatus.status === 4) newStatus = 'Cancelado';

    // Actualizar orden en Supabase
    await supabaseAdmin.from('orders').update({
      status: newStatus,
      flow_token: token,
      flow_status: paymentStatus.status
    }).eq('id', orderId);

    // Si el pago fue exitoso, enviar boleta por email
    if (paymentStatus.status === 2) {
      try {
        // Obtener datos completos de la orden
        const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();
        const { data: items } = await supabaseAdmin.from('order_items').select('*').eq('order_id', orderId);

        if (order && process.env.GMAIL_USER && process.env.GMAIL_PASS) {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
          });

          await transporter.sendMail({
            from: `"Amora Jewelry" <${process.env.GMAIL_USER}>`,
            to: order.client_email,
            subject: `✓ Boleta de Compra #${String(order.id).padStart(5,'0')} - Amora Jewelry`,
            html: buildBoletaHtml(order, items || [])
          });
        }
      } catch (emailErr) {
        console.error('Error enviando boleta por email:', emailErr);
        // No fallamos el webhook por error de email
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en Webhook de Flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
