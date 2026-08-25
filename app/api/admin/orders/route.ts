import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(image_url, reference_image_url))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders via admin route:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch products for fallback matching by title
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, title, image_url, reference_image_url');

    const productsByTitle = new Map(
      (products || []).map(p => [p.title?.toLowerCase().trim(), p.image_url || p.reference_image_url])
    );

    const enrichedOrders = (orders || []).map(order => ({
      ...order,
      order_items: order.order_items?.map((item: any) => {
        const titleMatch = productsByTitle.get(item.product_title?.toLowerCase().trim());
        const imageUrl = item.products?.image_url || item.products?.reference_image_url || titleMatch || null;
        return {
          ...item,
          image_url: imageUrl
        };
      })
    }));

    return NextResponse.json({ orders: enrichedOrders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
