import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('products').select('*').order('id');
  if (error || !data) {
    return new NextResponse('Error generating feed', { status: 500 });
  }

  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'google_product_category',
    'fb_product_category'
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const clean = String(val).replace(/"/g, '""').replace(/\r?\n/g, ' ');
    return `"${clean}"`;
  };

  const rows = [headers.join(',')];
  for (const p of data) {
    const row = [
      escapeCsv(p.id),
      escapeCsv(p.title),
      escapeCsv(p.description || p.title),
      escapeCsv('in stock'),
      escapeCsv('new'),
      escapeCsv(`${p.sale_price} CLP`),
      escapeCsv(`https://amorajewelry.cl/product/${p.id}`),
      escapeCsv(p.image_url),
      escapeCsv('Amora Jewelry'),
      escapeCsv('Apparel & Accessories > Jewelry'),
      escapeCsv('Apparel & Accessories > Jewelry')
    ];
    rows.push(row.join(','));
  }

  const csv = rows.join('\n');
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="amora_catalog_meta.csv"',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
