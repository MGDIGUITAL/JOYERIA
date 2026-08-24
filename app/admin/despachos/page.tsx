'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import Image from 'next/image';

const S = {
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDark: '#C8BBA8',
  obsidian: '#101010',
  charcoal: '#1E1E1E',
  muted:    '#7A7468',
  gold:     '#B8975A',
  green:    '#2E7D32'
};

export default function AdminDespachos() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<'Pendiente' | 'Enviado'>('Pendiente');
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

  const markAsShipped = async (order: any) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Enviado' })
      .eq('id', order.id);
      
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Enviado' } : o));
      
      // Enviar correo de orden despachada
      try {
        await fetch('/api/emails/order-shipped', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: order.client_email,
            orderId: order.id,
            name: order.client_name,
            method: order.delivery_method,
            address: order.delivery_method === 'domicilio' ? order.shipping_address : order.pickup_point_name
          }),
        });
        alert('Orden marcada como Enviada. Correo enviado al cliente.');
      } catch (err) {
        console.error('Error enviando correo de despacho', err);
        alert('Orden actualizada, pero hubo un error enviando el correo.');
      }
    }
  };

  const filteredOrders = orders.filter(o => o.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: S.ivory, fontFamily: 'Inter, sans-serif' }}>
      <header style={{ padding: '24px 5%', background: S.obsidian, color: S.offWhite, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={140} height={33} style={{ filter: 'invert(1)' }} />
          <div style={{ width: 1, height: 24, background: S.charcoal }}></div>
          <h1 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: S.gold }}>Panel Logístico</h1>
        </div>
      </header>

      <main style={{ padding: '40px 5%', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
          <button 
            onClick={() => setFilter('Pendiente')}
            style={{ 
              padding: '12px 24px', cursor: 'pointer', background: filter === 'Pendiente' ? S.obsidian : 'transparent',
              color: filter === 'Pendiente' ? S.offWhite : S.obsidian, border: `1px solid ${S.obsidian}`,
              fontWeight: 600, borderRadius: 4, transition: 'all 0.2s'
            }}>
            Pendientes por Despachar ({orders.filter(o => o.status === 'Pendiente').length})
          </button>
          <button 
            onClick={() => setFilter('Enviado')}
            style={{ 
              padding: '12px 24px', cursor: 'pointer', background: filter === 'Enviado' ? S.obsidian : 'transparent',
              color: filter === 'Enviado' ? S.offWhite : S.obsidian, border: `1px solid ${S.obsidian}`,
              fontWeight: 600, borderRadius: 4, transition: 'all 0.2s'
            }}>
            Enviados / Historial
          </button>
        </div>

        {loading ? (
          <p>Cargando órdenes...</p>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: 40, background: S.offWhite, border: `1px dashed ${S.nudeDark}`, textAlign: 'center', color: S.muted }}>
            No hay órdenes en esta categoría.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {filteredOrders.map(order => (
              <div key={order.id} style={{ 
                background: S.offWhite, border: `1px solid ${S.nude}`, borderRadius: 8, overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ padding: '16px 24px', background: S.nude, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, fontSize: '1.1rem', color: S.obsidian }}>Orden #{order.order_number}</span>
                    <span style={{ marginLeft: 16, fontSize: '0.85rem', color: S.charcoal }}>{new Date(order.created_at).toLocaleString('es-CL')}</span>
                  </div>
                  {order.status === 'Pendiente' ? (
                    <button 
                      onClick={() => markAsShipped(order)}
                      style={{ padding: '8px 16px', background: S.green, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>
                      ✓ Marcar como Enviado
                    </button>
                  ) : (
                    <span style={{ color: S.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span> Enviado
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', padding: 24, gap: 32, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: S.muted, textTransform: 'uppercase', marginBottom: 12 }}>Datos del Cliente</h3>
                    <p style={{ margin: '4px 0', fontWeight: 600, color: S.obsidian }}>{order.client_name}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>RUT: {order.client_rut}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>Email: {order.client_email}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>Teléfono: {order.client_phone || 'N/A'}</p>
                  </div>

                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: S.muted, textTransform: 'uppercase', marginBottom: 12 }}>Información de Despacho</h3>
                    <div style={{ 
                      display: 'inline-block', padding: '4px 12px', background: S.charcoal, color: S.gold, 
                      borderRadius: 16, fontSize: '0.8rem', fontWeight: 600, marginBottom: 12
                    }}>
                      {order.delivery_method === 'domicilio' ? '🏠 A Domicilio' : '🏪 Punto Blue Express'}
                    </div>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Región:</strong> {order.shipping_region}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Comuna:</strong> {order.shipping_comuna}</p>
                    {order.delivery_method === 'domicilio' ? (
                      <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Dirección:</strong> {order.shipping_address}</p>
                    ) : (
                      <>
                        <p style={{ margin: '4px 0', fontSize: '0.9rem' }}><strong>Punto:</strong> {order.pickup_point_name}</p>
                        <p style={{ margin: '4px 0', fontSize: '0.9rem', color: S.muted }}>{order.pickup_point_address}</p>
                      </>
                    )}
                  </div>

                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: S.muted, textTransform: 'uppercase', marginBottom: 12 }}>Productos a Preparar</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {order.order_items?.map((item: any) => (
                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${S.nude}` }}>
                          <span style={{ fontSize: '0.9rem' }}>{item.quantity}x {item.product_title}</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: 16, fontSize: '0.9rem', color: S.muted }}>
                      Envío cobrado al cliente: ${order.shipping_cost.toLocaleString('es-CL')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
