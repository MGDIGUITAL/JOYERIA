import { NextResponse } from 'next/server';
import { sendShippingNotification } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, orderId, name, method, address, trackingNumber } = await request.json();

    if (!email || !orderId) {
      return NextResponse.json({ error: 'Faltan email u orderId' }, { status: 400 });
    }

    const result = await sendShippingNotification({
      to: email,
      clientName: name || 'Cliente',
      orderId: orderId,
      trackingNumber: trackingNumber || 'Pendiente',
      deliveryMethod: method,
      address: address
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error en api/emails/order-shipped:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
