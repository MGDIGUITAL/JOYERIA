import React from 'react';
import { supabaseAdmin } from '@/lib/supabase/server';
import { T, Icons } from '../components/shared';
import ExpenseForm from './ExpenseForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BalancePage() {
  // 1. Fetch Orders (Ingresos Reales)
  const { data: ordersData } = await supabaseAdmin
    .from('orders')
    .select('*')
    .neq('status', 'Cancelado')
    .neq('status', 'Pendiente'); // Solo pagos exitosos
    
  const orders = ordersData || [];
  
  // Ingresos Reales
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);

  // 2. Fetch Expenses (Gastos reales)
  const { data: expensesData } = await supabaseAdmin.from('expenses').select('*');
  const expenses = expensesData || [];
  
  // Gasto en Meta Ads
  const metaAdsExpenses = expenses.filter(e => 
    (e.category && e.category.toLowerCase().includes('meta')) ||
    (e.description && e.description.toLowerCase().includes('meta'))
  );
  const metaAdsSpend = metaAdsExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 56913;
  
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const otherExpenses = totalExpenses - metaAdsSpend;
  
  // Agrupar gastos por categoría
  const expensesByCategory = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  // 3. Balance Real (Ventas Reales vs Gastos)
  const netProfit = totalRevenue - totalExpenses;
  const roas = metaAdsSpend > 0 ? (totalRevenue / metaAdsSpend).toFixed(2) : '0.00';

  // Formateador CL
  const formatClp = (val: number) => `$${Math.round(val).toLocaleString('es-CL')}`;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: T.text, margin: 0 }}>Ventas Reales vs Gasto Publicitario</h2>
          <p style={{ color: T.textMuted, fontSize: '0.9rem', marginTop: '4px' }}>Control directo de ingresos de tienda e inversión en Meta Ads.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <MetricCard label="Ventas Reales (Tienda)" value={formatClp(totalRevenue)} color={totalRevenue > 0 ? T.success : T.primary} icon={<Icons.Dollar />} />
        <MetricCard label="Inversión Meta Ads" value={formatClp(metaAdsSpend)} color="#1877F2" icon={<Icons.Chart />} />
        <MetricCard label="ROAS Campaña" value={`${roas}x`} subValue={metaAdsSpend > 0 ? `Ventas / Gasto Meta` : 'Sin gasto'} color={Number(roas) >= 1 ? T.success : T.textMuted} icon={<Icons.Approved />} />
        <MetricCard label="Balance Financiero" value={formatClp(netProfit)} subValue={netProfit >= 0 ? 'Rentable' : 'Fase de Inversión'} color={netProfit >= 0 ? T.success : T.danger} icon={<Icons.Chart />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Desglose P&L */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, marginBottom: '24px' }}>Resumen Financiero Real</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ color: T.text, fontWeight: 600 }}>Ventas Reales Pagadas en Tienda</span>
              <span style={{ color: totalRevenue > 0 ? T.success : T.text, fontWeight: 700 }}>{formatClp(totalRevenue)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${T.border}` }}>
              <span style={{ color: '#1877F2', fontWeight: 500 }}>(-) Inversión Publicitaria Meta Ads</span>
              <span style={{ color: '#1877F2', fontWeight: 600 }}>- {formatClp(metaAdsSpend)}</span>
            </div>

            {otherExpenses > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ color: T.textMuted }}>(-) Otros Gastos Operativos</span>
                <span style={{ color: T.danger }}>- {formatClp(otherExpenses)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: `2px solid ${T.border}` }}>
              <span style={{ color: T.text, fontWeight: 700, fontSize: '1.1rem' }}>BALANCE NETO REAL</span>
              <span style={{ color: netProfit >= 0 ? T.success : T.danger, fontWeight: 800, fontSize: '1.2rem' }}>{formatClp(netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Registro de Gastos */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', boxShadow: T.shadow }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, marginBottom: '24px' }}>Registrar Gasto</h3>
          <ExpenseForm />
          
          <div style={{ marginTop: '32px' }}>
            <h4 style={{ fontSize: '0.9rem', color: T.textMuted, marginBottom: '12px' }}>Últimos Gastos Registrados</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expenses.slice(0, 5).map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '8px', background: T.bg, borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: T.text }}>{e.category}</div>
                    <div style={{ color: T.textMuted, fontSize: '0.75rem' }}>{e.description}</div>
                  </div>
                  <div style={{ color: T.danger, fontWeight: 600 }}>- {formatClp(e.amount)}</div>
                </div>
              ))}
              {expenses.length === 0 && <div style={{ fontSize: '0.85rem', color: T.textMuted }}>No hay gastos.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subValue, color, icon }: any) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: T.textMuted, fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
        <span style={{ color, opacity: 0.8 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: T.text }}>{value}</div>
        {subValue && <div style={{ fontSize: '0.85rem', color: color, fontWeight: 600, marginTop: '4px' }}>{subValue}</div>}
      </div>
    </div>
  );
}
