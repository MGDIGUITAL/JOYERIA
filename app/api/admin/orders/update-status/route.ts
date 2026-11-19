import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendShippingNotification } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { orderId, status, trackingNumber } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId y status son requeridos' }, { status: 400 });
    }

    const updatePayload: any = { status };
    if (trackingNumber !== undefined) {
      updatePayload.tracking_number = trackingNumber;
    }

    // 1. Actualizar orden en PostgreSQL (Supabase)
    const { data: updatedOrders, error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select();

    if (error) {
      console.error('Error updating order status in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const order = updatedOrders && updatedOrders.length > 0 ? updatedOrders[0] : null;

    // 2. Si se marcó como "Enviado" y tiene email -> Enviar correo automático de notificación
    let emailResult = { success: false, skipped: true };
    if (status === 'Enviado' && order && order.client_email) {
      const address = order.delivery_method === 'domicilio'
        ? `${order.shipping_address || ''}, ${order.shipping_comuna || ''}, ${order.shipping_region || ''}`.replace(/^,\s*|,\s*$/g, '')
        : (order.pickup_point_name || order.pickup_point_address || 'Punto Blue Express');

      emailResult = await sendShippingNotification({
        to: order.client_email,
        clientName: order.client_name || 'Estimado/a Cliente',
        orderId: order.id,
        trackingNumber: trackingNumber || order.tracking_number || 'Pendiente de asignación',
        deliveryMethod: order.delivery_method,
        address: address,
      }) as any;
    }

    return NextResponse.json({
      success: true,
      data: order,
      emailSent: emailResult.success,
      emailError: (emailResult as any).error
    });

  } catch (err: any) {
    console.error('API Error in update-status route:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
