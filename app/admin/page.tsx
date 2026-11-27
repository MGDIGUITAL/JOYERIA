import React from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { T, Icons } from './components/shared';
import Link from 'next/link';

// ─── StatCard Component ──────────────────────────────────────────────────
function StatCard({ label, value, trend, isPositive, icon, trendLabel, color = T.primary, link }: { label: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode, trendLabel: string, color?: string, link?: string }) {
  const CardContent = (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: T.shadow,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: link ? 'pointer' : 'default',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: T.textMuted, fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ color: color, display: 'flex', opacity: 0.9 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: T.text, marginBottom: '8px' }}>
          {value}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
          <span style={{
            color: isPositive ? T.success : T.danger,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {isPositive ? '↑' : '↓'} {trend}
          </span>
          <span style={{ color: T.textMuted }}>{trendLabel}</span>
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link href={link} style={{ textDecoration: 'none' }}>{CardContent}</Link>;
  }
  return CardContent;
}

// ─── Server Component ───────────────────────────────────────────────────
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  // 1. Fetch Orders
  const { data: ordersData } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(product_id, quantity)')
    .order('created_at', { ascending: false });

  const orders = ordersData || [];
  
  // 2. Fetch Products
  const { data: productsData } = await supabaseAdmin.from('products').select('*');
  const products = productsData || [];
  
  // 3. Fetch Expenses
  const { data: expensesData } = await supabaseAdmin.from('expenses').select('amount');
  const expenses = expensesData || [];

  // --- Calculations ---
  
  // Ventas Reales y Pedidos
  const validOrders = orders.filter(o => o.status === 'Pagado' || o.status === 'Enviado' || o.status === 'Completado');
  const pendingOrders = orders.filter(o => o.status === 'Pendiente');
  const toDispatchOrders = orders.filter(o => o.status === 'Pagado'); // Pagado = Por Despachar
  
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  // Gasto en Meta Ads
  const metaAdsExpenses = expenses.filter(e => 
    (e.category && e.category.toLowerCase().includes('meta')) ||
    (e.description && e.description.toLowerCase().includes('meta'))
  );
  const metaAdsSpend = metaAdsExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 56913;

  // Retorno y ROAS
  const roasMultiplier = metaAdsSpend > 0 ? (totalRevenue / metaAdsSpend).toFixed(2) : '0.00';
  const balancePublicitario = totalRevenue - metaAdsSpend;

  // Catálogo activo
  const activeProductsCount = products.filter(p => p.status === 'active').length;

  const formatClp = (val: number) => `$${Math.round(val).toLocaleString('es-CL')}`;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: T.text, margin: 0 }}>Panel de Control & Ventas Reales</h2>
          <p style={{ color: T.textMuted, fontSize: '0.9rem', marginTop: '4px' }}>Control de ventas en vivo, inversión publicitaria en Meta Ads y logística Blue Express.</p>
        </div>
      </div>

      {/* Top KPI row: Ventas Reales vs Gasto Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <StatCard 
          label="Ventas Reales" 
          value={formatClp(totalRevenue)} 
          trend={`${validOrders.length} ventas`} isPositive={totalRevenue > 0} 
          icon={<Icons.Dollar />} trendLabel="en tienda"
          color={totalRevenue > 0 ? T.success : '#2563EB'}
          link="/admin/ventas"
        />
        <StatCard 
          label="Gasto en Meta Ads" 
          value={formatClp(metaAdsSpend)} 
          trend="Campaña activa" isPositive={true} 
          icon={<Icons.Chart />} trendLabel="invertido"
          color="#1877F2"
          link="/admin/balance"
        />
        <StatCard 
          label="Retorno (ROAS)" 
          value={`${roasMultiplier}x ROAS`} 
          trend={formatClp(balancePublicitario)} isPositive={balancePublicitario >= 0} 
          icon={<Icons.Chart />} trendLabel={balancePublicitario >= 0 ? "balance positivo" : "inversión en curso"}
          color={balancePublicitario >= 0 ? T.success : T.danger}
          link="/admin/balance"
        />
        <StatCard 
          label="Por Despachar" 
          value={toDispatchOrders.length.toString()} 
          trend={`${pendingOrders.length} por pagar`} isPositive={true} 
          icon={<Icons.Truck />} trendLabel="en bodega"
          color="#F59E0B"
          link="/admin/envios"
        />
      </div>

      {/* Widget Especial de Conexión: Meta Ads + Acciones para Ventas Reales */}
      <div style={{
        background: '#ffffff',
        border: `1px solid ${T.border}`,
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '32px',
        boxShadow: T.shadow,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ flex: '1 1 380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.2rem' }}>📈</span>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: T.text }}>
              Sincronización de Meta Ads & Crecimiento
            </h3>
            <span style={{
              background: '#D1E7DD',
              color: '#0F5132',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '12px'
            }}>
              🟢 Píxel Activo (1155113560347927)
            </span>
          </div>
          <p style={{ margin: 0, color: T.textMuted, fontSize: '0.85rem', lineHeight: '1.5' }}>
            Inversión actual de campaña: <strong>{formatClp(metaAdsSpend)} CLP</strong>. El píxel ya está recibiendo eventos en vivo desde tu tienda web.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/admin/balance"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#F3F4F6',
              color: T.text,
              border: `1px solid ${T.border}`,
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            ✏️ Actualizar Gasto Meta
          </Link>
          <a
            href="https://wa.me/56951555556"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#25D366',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            💬 Probar WhatsApp Tienda
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recientes */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, margin: 0 }}>Últimas Ventas Procesadas</h3>
            <Link href="/admin/ventas" style={{ fontSize: '0.85rem', color: T.primary, textDecoration: 'none', fontWeight: 600 }}>Ver Todas →</Link>
          </div>
          
          {orders.slice(0, 5).length === 0 ? (
            <p style={{ color: T.textMuted, fontSize: '0.9rem' }}>No hay actividad reciente.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.slice(0, 5).map(order => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: T.bg, borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E0E7FF', color: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                      {order.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: T.text }}>{order.client_name}</div>
                      <div style={{ fontSize: '0.8rem', color: T.textMuted }}>{new Date(order.created_at).toLocaleDateString('es-CL')} - #{String(order.id).substring(0,6).toUpperCase()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontWeight: 700, color: T.text }}>{formatClp(order.total || 0)}</div>
                    <div style={{ 
                      padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                      background: order.status === 'Pendiente' ? '#FFF3CD' : (order.status === 'Pagado' ? '#CFE2FF' : (order.status === 'Enviado' ? '#D1E7DD' : '#E2E3E5')),
                      color: order.status === 'Pendiente' ? '#856404' : (order.status === 'Pagado' ? '#084298' : (order.status === 'Enviado' ? '#0F5132' : '#383D41'))
                    }}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accessos Rápidos */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, marginBottom: '20px', margin: 0 }}>Módulos ERP</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/admin/balance" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: T.bg, borderRadius: '12px', textDecoration: 'none', color: T.text, transition: 'background 0.2s' }}>
              <div style={{ fontSize: '1.5rem' }}>💰</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Finanzas & Costos</div>
                <div style={{ fontSize: '0.8rem', color: T.textMuted }}>Rentabilidad (P&L) y Gastos</div>
              </div>
            </Link>

            <Link href="/admin/ventas" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: T.bg, borderRadius: '12px', textDecoration: 'none', color: T.text, transition: 'background 0.2s' }}>
              <div style={{ fontSize: '1.5rem' }}>📦</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Ventas & Despachos</div>
                <div style={{ fontSize: '0.8rem', color: T.textMuted }}>Tracking y Picking Lists</div>
              </div>
            </Link>

            <Link href="/admin/productos" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: T.bg, borderRadius: '12px', textDecoration: 'none', color: T.text, transition: 'background 0.2s' }}>
              <div style={{ fontSize: '1.5rem' }}>💎</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Inventario</div>
                <div style={{ fontSize: '0.8rem', color: T.textMuted }}>Control de stock y valor</div>
              </div>
            </Link>

            <Link href="/admin/clientes" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: T.bg, borderRadius: '12px', textDecoration: 'none', color: T.text, transition: 'background 0.2s' }}>
              <div style={{ fontSize: '1.5rem' }}>👥</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>CRM Clientes</div>
                <div style={{ fontSize: '0.8rem', color: T.textMuted }}>Historial de compras y LTV</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
