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

export default function AdminEnvios() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<'Pendiente' | 'Pagado' | 'Enviado'>('Pagado');
  const [loading, setLoading] = useState(true);
  const [printOrders, setPrintOrders] = useState<any[] | null>(null); // Orders being printed

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

  const handlePrintAll = (ordersToPrint: any[]) => {
    setPrintOrders(ordersToPrint);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handlePrintSingle = (order: any) => {
    setPrintOrders([order]);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'Pagado') return o.status === 'Pagado' || o.status === 'Pendiente';
    return o.status === filter;
  });

  const pendingDispatches = orders.filter(o => o.status === 'Pagado' || o.status === 'Pendiente');

  return (
    <div style={{ minHeight: '100vh', background: S.ivory, fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── CSS PRINT MEDIA STYLES ────────────────────────────────────────── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .a4-page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0 auto;
            background: #ffffff !important;
            color: #000000 !important;
            box-sizing: border-box;
            page-break-after: always;
            font-family: 'Helvetica Neue', Arial, sans-serif;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ── HEADER NO PRINT ──────────────────────────────────────────────── */}
      <header className="no-print" style={{ padding: '24px 5%', background: S.obsidian, color: S.offWhite, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={140} height={33} style={{ filter: 'invert(1)' }} />
          <div style={{ width: 1, height: 24, background: S.charcoal }}></div>
          <h1 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.2rem', color: S.gold }}>Módulo de Resumen de Envíos</h1>
        </div>

        {/* Botón Principal de Generación de Notas de Despacho */}
        <button 
          onClick={() => handlePrintAll(pendingDispatches)}
          disabled={pendingDispatches.length === 0}
          style={{
            background: pendingDispatches.length > 0 ? S.gold : S.muted,
            color: S.obsidian,
            border: 'none',
            padding: '12px 24px',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: pendingDispatches.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 14px rgba(184,151,90,0.3)',
            transition: 'transform 0.2s'
          }}
        >
          <span>🖨️</span>
          <span>Imprimir Notas de Despacho Pendientes ({pendingDispatches.length})</span>
        </button>
      </header>

      {/* ── MAIN CONTENT NO PRINT ────────────────────────────────────────── */}
      <main className="no-print" style={{ padding: '40px 5%', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <button 
              onClick={() => setFilter('Pagado')}
              style={{ 
                padding: '12px 24px', cursor: 'pointer', background: filter === 'Pagado' ? S.obsidian : 'transparent',
                color: filter === 'Pagado' ? S.offWhite : S.obsidian, border: `1px solid ${S.obsidian}`,
                fontWeight: 600, borderRadius: 4, transition: 'all 0.2s'
              }}>
              Por Despachar ({pendingDispatches.length})
            </button>
            <button 
              onClick={() => setFilter('Enviado')}
              style={{ 
                padding: '12px 24px', cursor: 'pointer', background: filter === 'Enviado' ? S.obsidian : 'transparent',
                color: filter === 'Enviado' ? S.offWhite : S.obsidian, border: `1px solid ${S.obsidian}`,
                fontWeight: 600, borderRadius: 4, transition: 'all 0.2s'
              }}>
              Historial Enviados ({orders.filter(o => o.status === 'Enviado').length})
            </button>
          </div>
        </div>

        {loading ? (
          <p>Cargando órdenes de envío...</p>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: 40, background: S.offWhite, border: `1px dashed ${S.nudeDark}`, textAlign: 'center', color: S.muted, borderRadius: 8 }}>
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
                    <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, fontSize: '1.1rem', color: S.obsidian }}>Orden #{order.id?.substring(0,8).toUpperCase()}</span>
                    <span style={{ marginLeft: 16, fontSize: '0.85rem', color: S.charcoal }}>{new Date(order.created_at).toLocaleString('es-CL')}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button 
                      onClick={() => handlePrintSingle(order)}
                      style={{ padding: '8px 16px', background: S.obsidian, color: S.gold, border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                      🖨️ Nota A4 Individual
                    </button>

                    {order.status !== 'Enviado' ? (
                      <button 
                        onClick={() => markAsShipped(order)}
                        style={{ padding: '8px 16px', background: S.green, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                        ✓ Marcar como Enviado
                      </button>
                    ) : (
                      <span style={{ color: S.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>✓</span> Enviado
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', padding: 24, gap: 32, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: S.muted, textTransform: 'uppercase', marginBottom: 12 }}>Datos del Destinatario</h3>
                    <p style={{ margin: '4px 0', fontWeight: 600, color: S.obsidian }}>{order.client_name}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>RUT: {order.client_rut}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>Email: {order.client_email}</p>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>Teléfono: {order.client_phone || 'N/A'}</p>
                  </div>

                  <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '0.9rem', color: S.muted, textTransform: 'uppercase', marginBottom: 12 }}>Dirección & Courier</h3>
                    <div style={{ 
                      display: 'inline-block', padding: '4px 12px', background: S.charcoal, color: S.gold, 
                      borderRadius: 16, fontSize: '0.8rem', fontWeight: 600, marginBottom: 12
                    }}>
                      {order.delivery_method === 'domicilio' ? '🏠 Domicilio (Blue Express)' : '🏪 Punto Blue Express'}
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
                    <h3 style={{ fontSize: '0.9rem', color: S.muted, textTransform: 'uppercase', marginBottom: 12 }}>Contenido del Paquete</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {order.order_items?.map((item: any) => (
                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${S.nude}` }}>
                          <span style={{ fontSize: '0.9rem' }}>{item.quantity}x {item.product_title}</span>
                          <span style={{ fontSize: '0.85rem', color: S.muted }}>${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── PRINT AREA (A4 DISPATCH NOTES TEMPLATE) ───────────────────────── */}
      <div id="print-area">
        {printOrders && printOrders.map((order) => (
          <div key={order.id} className="a4-page" style={{ position: 'relative', border: '1px solid #ddd', background: '#fff' }}>
            {/* Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #101010', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontFamily: 'Cinzel, Georgia, serif', letterSpacing: '2px', color: '#101010', textTransform: 'uppercase' }}>AMORA JEWELRY</h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Alta Joyería en Chile • www.amorajewelry.cl</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: '#101010', color: '#B8975A', padding: '6px 16px', fontWeight: 'bold', fontSize: '14px', borderRadius: '4px', display: 'inline-block' }}>
                  NOTA DE DESPACHO
                </div>
                <div style={{ fontSize: '12px', marginTop: '6px', fontWeight: 'bold', color: '#333' }}>
                  N° {String(order.id).substring(0, 8).toUpperCase()}
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  Fecha: {new Date(order.created_at).toLocaleDateString('es-CL')}
                </div>
              </div>
            </div>

            {/* Info Grid (2 columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              
              {/* Customer Box */}
              <div style={{ border: '1px solid #E3DBCC', padding: '16px', borderRadius: '6px', background: '#FDFCF8' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', textTransform: 'uppercase', color: '#B8975A', borderBottom: '1px solid #E3DBCC', paddingBottom: '4px', letterSpacing: '1px' }}>
                  DATOS DEL CLIENTE / DESTINATARIO
                </h3>
                <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#222' }}>
                  <div><strong>Nombre:</strong> {order.client_name}</div>
                  <div><strong>RUT:</strong> {order.client_rut}</div>
                  <div><strong>Email:</strong> {order.client_email}</div>
                  <div><strong>Teléfono:</strong> {order.client_phone || 'No registrado'}</div>
                </div>
              </div>

              {/* Delivery Box */}
              <div style={{ border: '1px solid #E3DBCC', padding: '16px', borderRadius: '6px', background: '#FDFCF8' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '11px', textTransform: 'uppercase', color: '#B8975A', borderBottom: '1px solid #E3DBCC', paddingBottom: '4px', letterSpacing: '1px' }}>
                  DATOS DE ENVÍO Y DESTINO
                </h3>
                <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#222' }}>
                  <div><strong>Courier / Método:</strong> {order.delivery_method === 'domicilio' ? 'Blue Express (Domicilio)' : 'Punto Blue Express'}</div>
                  <div><strong>Región:</strong> {order.shipping_region}</div>
                  <div><strong>Comuna:</strong> {order.shipping_comuna}</div>
                  <div>
                    <strong>Dirección / Entrega:</strong>{' '}
                    {order.delivery_method === 'domicilio' ? order.shipping_address : `${order.pickup_point_name} (${order.pickup_point_address})`}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase', color: '#101010', letterSpacing: '1px' }}>
                DETALLE DE PRODUCTOS A ENTREGAR
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#101010', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', width: '50px' }}>Cant.</th>
                    <th style={{ padding: '10px 12px' }}>Producto / Descripción</th>
                    <th style={{ padding: '10px 12px', width: '100px', textAlign: 'right' }}>Precio Unit.</th>
                    <th style={{ padding: '10px 12px', width: '100px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items?.map((item: any, idx: number) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.product_title}</div>
                        {item.size && <div style={{ fontSize: '11px', color: '#666' }}>Talla: {item.size}</div>}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>${(item.price || 0).toLocaleString('es-CL')}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold' }}>
                        ${((item.price || 0) * item.quantity).toLocaleString('es-CL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Summary Box */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
              <div style={{ width: '250px', background: '#FDFCF8', border: '1px solid #E3DBCC', padding: '12px', borderRadius: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                  <span>Subtotal Productos:</span>
                  <span>${((order.total || 0) - (order.shipping_cost || 0)).toLocaleString('es-CL')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                  <span>Envío Courier:</span>
                  <span>${(order.shipping_cost || 0).toLocaleString('es-CL')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #101010', fontWeight: 'bold', fontSize: '14px', color: '#101010' }}>
                  <span>TOTAL GENERAL:</span>
                  <span>${(order.total || 0).toLocaleString('es-CL')} CLP</span>
                </div>
              </div>
            </div>

            {/* Signature / Receiving Acknowledgment Section */}
            <div style={{ position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', borderTop: '2px dashed #ccc', paddingTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', marginBottom: '15px', textAlign: 'center' }}>
                ACREEDITACIÓN DE RECEPCIÓN Y CONFORMIDAD DEL CLIENTE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '11px' }}>
                <div style={{ borderBottom: '1px solid #000', paddingBottom: '40px' }}>
                  <strong>Nombre del Receptor:</strong>
                </div>
                <div style={{ borderBottom: '1px solid #000', paddingBottom: '40px' }}>
                  <strong>RUT del Receptor:</strong>
                </div>
                <div style={{ borderBottom: '1px solid #000', paddingBottom: '40px' }}>
                  <strong>Firma / Fecha:</strong>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '10px', color: '#999', marginTop: '20px' }}>
                Documento generado automáticamente por Amora Jewelry ERP • {new Date().toLocaleString('es-CL')}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
