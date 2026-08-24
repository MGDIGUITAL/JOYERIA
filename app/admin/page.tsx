import React from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { T, Icons } from './components/shared';

// ─── StatCard Component ──────────────────────────────────────────────────
function StatCard({ label, value, trend, isPositive, icon, trendLabel }: { label: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode, trendLabel: string }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: T.shadow,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: T.textMuted, fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
        <span style={{ color: T.textMuted, display: 'flex', opacity: 0.8 }}>{icon}</span>
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
}

// ─── Server Component ───────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // 1. Fetch Orders from Supabase
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
  }

  const allOrders = orders || [];
  
  // Basic analytics logic
  const totalOrders = allOrders.length;
  const approvedOrders = allOrders.filter(o => o.status !== 'Cancelado' && o.status !== 'Pendiente').length; // e.g. Pagado, Enviado, Completado
  const pendingOrders = allOrders.filter(o => o.status === 'Pendiente').length;
  const totalRevenue = allOrders.filter(o => o.status !== 'Cancelado').reduce((sum, o) => sum + (o.total || 0), 0);

  // Recent activity (latest 5 orders)
  const recentOrders = allOrders.slice(0, 5);

  const STATS = [
    { label: 'Pedidos Totales', value: totalOrders.toString(), trend: '0%', isPositive: true, icon: <Icons.Products />, trendLabel: 'historico' },
    { label: 'Pedidos Pendientes', value: pendingOrders.toString(), trend: 'N/A', isPositive: pendingOrders === 0, icon: <Icons.Approved />, trendLabel: 'por procesar' },
    { label: 'Total Ingresos', value: `$${totalRevenue.toLocaleString('es-CL')}`, trend: '0%', isPositive: true, icon: <Icons.Dollar />, trendLabel: 'historico' },
    { label: 'Envíos Completados', value: allOrders.filter(o => o.status === 'Enviado').length.toString(), trend: '0%', isPositive: true, icon: <Icons.Truck />, trendLabel: 'historico' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', color: T.text }}>
        Métricas de Tienda
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {STATS.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: T.text }}>Actividad Reciente</h3>
          
          {recentOrders.length === 0 ? (
            <p style={{ color: T.textMuted, fontSize: '0.9rem' }}>No hay actividad reciente.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map(order => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: `1px solid ${T.bg}` }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.95rem', color: T.text }}>{order.client_name}</div>
                    <div style={{ fontSize: '0.8rem', color: T.textMuted }}>{new Date(order.created_at).toLocaleDateString('es-CL')} - {order.client_email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontWeight: 600, color: T.text }}>${(order.total || 0).toLocaleString('es-CL')}</div>
                    <div style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                      background: order.status === 'Pendiente' ? '#FFF3CD' : (order.status === 'Enviado' ? '#D1E7DD' : '#E2E3E5'),
                      color: order.status === 'Pendiente' ? '#856404' : (order.status === 'Enviado' ? '#0F5132' : '#383D41')
                    }}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
