import { NextResponse } from 'next/server';
import { getFlowPaymentStatus } from '@/lib/flow';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;

    if (!token) {
      return NextResponse.json({ error: 'Token no provisto' }, { status: 400 });
    }

    // Consultamos directamente a la API de Flow para evitar spoofing
    const paymentStatus = await getFlowPaymentStatus(token);

    const orderId = paymentStatus.commerceOrder;
    let newStatus = 'Pendiente';

    // Flow status: 1 = Pendiente, 2 = Pagado, 3 = Rechazado, 4 = Anulado
    if (paymentStatus.status === 2) {
      newStatus = 'Pagado';
    } else if (paymentStatus.status === 3 || paymentStatus.status === 4) {
      newStatus = 'Cancelado';
    }

    // Actualizamos la orden en Supabase (status + token de referencia)
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: newStatus,
        flow_token: token,
        flow_status: paymentStatus.status
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error actualizando orden tras webhook:', updateError);
    }

    // Siempre retornar HTTP 200 a Flow
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en Webhook de Flow:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
