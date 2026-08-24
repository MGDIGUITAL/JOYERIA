'use client';
import React from 'react';
import { T, Icons } from './components/shared';

// ─── MOCK DATA ──────────────────────────────────────────────────────────
const STATS = [
  { label: 'Pedidos', value: '201', trend: '+8.2%', isPositive: true, icon: <Icons.Products /> },
  { label: 'Aprobados', value: '36', trend: '+3.4%', isPositive: true, icon: <Icons.Approved /> },
  { label: 'Total mensual', value: '$25,410', trend: '-0.2%', isPositive: false, icon: <Icons.Dollar /> },
  { label: 'Ingresos', value: '1,352', trend: '-1.2%', isPositive: false, icon: <Icons.CreditCard /> },
];

function StatCard({ label, value, trend, isPositive, icon }: typeof STATS[0]) {
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
          <span style={{ color: T.textMuted }}>desde el mes pasado</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px', color: T.text }}>
        Métricas de Tienda
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {STATS.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: T.textMuted }}>[Gráfico de Ventas Mensuales Aquí]</p>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: T.textMuted }}>[Actividad Reciente]</p>
        </div>
      </div>
    </div>
  );
}
