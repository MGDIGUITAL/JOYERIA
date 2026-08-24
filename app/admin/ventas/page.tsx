'use client';
import React, { useState, useEffect } from 'react';
import { T } from '../components/shared';
import { supabase } from '@/lib/supabase/client';

export default function VentasPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error(error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } else {
      alert('Error actualizando estado');
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: '16px',
        padding: '32px',
        boxShadow: T.shadow,
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: T.text, marginBottom: '24px' }}>Gestión de Ventas</h2>
        
        {loading ? (
          <p style={{ color: T.textMuted }}>Cargando ventas...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: T.textMuted }}>No hay ventas registradas.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}`, color: T.textMuted, fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 16px' }}>Orden</th>
                  <th style={{ padding: '12px 16px' }}>Fecha</th>
                  <th style={{ padding: '12px 16px' }}>Cliente</th>
                  <th style={{ padding: '12px 16px' }}>Monto Total</th>
                  <th style={{ padding: '12px 16px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: `1px solid ${T.bg}` }}>
                    <td style={{ padding: '16px', fontWeight: 600, color: T.text }}>#{order.order_number}</td>
                    <td style={{ padding: '16px', color: T.textMuted, fontSize: '0.9rem' }}>
                      {new Date(order.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td style={{ padding: '16px', color: T.text }}>
                      <div>{order.client_name}</div>
                      <div style={{ fontSize: '0.8rem', color: T.textMuted }}>{order.client_email}</div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600, color: T.text }}>
                      ${(order.total || 0).toLocaleString('es-CL')}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: `1px solid ${T.border}`,
                          background: T.bg,
                          color: T.text,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagado">Pagado</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
