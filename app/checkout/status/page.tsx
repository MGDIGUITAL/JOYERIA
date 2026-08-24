'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/components/CartContext';

const S = {
  offWhite: '#FDFCF8',
  ivory:    '#F3F0E9',
  nude:     '#E3DBCC',
  nudeDark: '#C8BBA8',
  obsidian: '#101010',
  muted:    '#7A7468',
  gold:     '#B8975A',
};

function StatusContent() {
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;
  const router = useRouter();
  const { clearCart } = useCart();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [flowData, setFlowData] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<{ order: any; items: any[] } | null>(null);

  useEffect(() => {
    if (!token) { setStatus('error'); return; }

    // Modo demo
    if (token === 'demo') {
      setStatus('success');
      setFlowData({ commerceOrder: '1', amount: 59900 });
      setOrderDetails({
        order: {
          id: 1, client_name: 'María González', client_email: 'maria@example.com',
          client_rut: '12.345.678-9', delivery_method: 'domicilio',
          shipping_region: 'Región Metropolitana', shipping_comuna: 'Las Condes',
          shipping_address: 'Av. Providencia 1234', subtotal: 49900,
          shipping_cost: 0, total: 59900, status: 'Pagado',
          created_at: new Date().toISOString()
        },
        items: [
          { id: 1, product_title: 'Aro Argolla Estrella Guía', quantity: 1, price: 39900, size: null },
          { id: 2, product_title: 'Collar Luna Menguante', quantity: 1, price: 19900, size: null },
        ]
      });
      return;
    }

    const verify = async () => {
      try {
        // 1. Verificar pago con Flow
        const flowRes = await fetch(`/api/checkout/flow-status?token=${token}`);
        const flow = await flowRes.json();

        if (flow.status !== 2) { setStatus('error'); return; }

        setFlowData(flow);
        clearCart();

        // 2. Obtener detalles completos de la orden
        const detailsRes = await fetch(`/api/checkout/order-details?orderId=${flow.commerceOrder}`);
        const details = await detailsRes.json();

        if (detailsRes.ok) setOrderDetails(details);
        setStatus('success');

      } catch { setStatus('error'); }
    };

    verify();
  }, [token, clearCart]);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: S.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{ width: 44, height: 44, border: `2px solid ${S.nude}`, borderTop: `2px solid ${S.gold}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: 'Inter, sans-serif', color: S.muted, fontSize: '0.9rem' }}>Verificando tu pago...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: S.offWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '56px 40px', background: '#fff', border: `1px solid ${S.nude}` }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 20 }}>⚠️</div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', color: S.obsidian, marginBottom: 12, fontWeight: 400 }}>Pago No Confirmado</h1>
          <p style={{ color: S.muted, marginBottom: 28, lineHeight: 1.7, fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
            No pudimos confirmar tu pago. Si el dinero fue descontado, escríbenos a{' '}
            <a href="mailto:amorajewelrychile@gmail.com" style={{ color: S.gold }}>amorajewelrychile@gmail.com</a>
          </p>
          <button onClick={() => router.push('/')} style={{ padding: '14px 32px', background: S.obsidian, color: '#fff', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  const order = orderDetails?.order;
  const items = orderDetails?.items || [];
  const orderId = flowData?.commerceOrder || order?.id;
  const orderDate = order?.created_at ? new Date(order.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: S.ivory, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .boleta { animation: fadeUp 0.6s ease forwards; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .boleta { box-shadow: none !important; }
        }
        @media (max-width: 640px) {
          .boleta { margin: 16px !important; padding: 28px 20px !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ background: S.obsidian, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', letterSpacing: '0.2em', color: '#fff' }}>AMORA</span>
        <span style={{ color: '#2E7D32', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E7D32', display: 'inline-block' }} />
          Pago Confirmado
        </span>
      </div>

      {/* Boleta */}
      <div style={{ maxWidth: 680, margin: '40px auto 60px', padding: '0 16px' }}>
        <div className="boleta" style={{ background: '#fff', border: `1px solid ${S.nude}`, padding: '48px 48px', boxShadow: '0 8px 48px rgba(0,0,0,0.06)' }}>

          {/* Encabezado boleta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, paddingBottom: 32, borderBottom: `1px solid ${S.nude}` }}>
            <div>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1.4rem', letterSpacing: '0.15em', color: S.obsidian, margin: 0 }}>AMORA JEWELRY</p>
              <p style={{ color: S.muted, fontSize: '0.75rem', marginTop: 6 }}>amorajewelrychile@gmail.com</p>
              <p style={{ color: S.muted, fontSize: '0.75rem' }}>@AMORAJWLRY · Chile</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: S.muted, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Boleta / Comprobante</p>
              <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1.8rem', color: S.obsidian, margin: 0, fontWeight: 400 }}>
                #{String(orderId).padStart(5, '0')}
              </p>
              <p style={{ color: S.muted, fontSize: '0.75rem', marginTop: 4 }}>{orderDate}</p>
            </div>
          </div>

          {/* Estado */}
          <div style={{ background: '#F0FAF0', border: '1px solid #C8E6C9', padding: '12px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#2E7D32', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: '#2E7D32', fontSize: '0.85rem', fontWeight: 600 }}>Pago Confirmado — Procesado exitosamente por Flow / Webpay</span>
          </div>

          {/* Datos del cliente */}
          {order && (
            <div style={{ marginBottom: 36 }}>
              <p style={{ color: S.muted, fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16, borderBottom: `1px solid ${S.nude}`, paddingBottom: 8 }}>
                Datos del Cliente
              </p>
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', fontSize: '0.85rem' }}>
                <div><span style={{ color: S.muted }}>Nombre: </span><span style={{ color: S.obsidian, fontWeight: 500 }}>{order.client_name}</span></div>
                <div><span style={{ color: S.muted }}>RUT: </span><span style={{ color: S.obsidian }}>{order.client_rut}</span></div>
                <div><span style={{ color: S.muted }}>Email: </span><span style={{ color: S.obsidian }}>{order.client_email}</span></div>
                <div><span style={{ color: S.muted }}>Teléfono: </span><span style={{ color: S.obsidian }}>{order.client_phone || '—'}</span></div>
              </div>
            </div>
          )}

          {/* Entrega */}
          {order && (
            <div style={{ marginBottom: 36 }}>
              <p style={{ color: S.muted, fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16, borderBottom: `1px solid ${S.nude}`, paddingBottom: 8 }}>
                Método de Entrega
              </p>
              <div style={{ fontSize: '0.85rem' }}>
                <p style={{ margin: '4px 0' }}>
                  <span style={{ color: S.muted }}>Tipo: </span>
                  <span style={{ color: S.obsidian, fontWeight: 500 }}>
                    {order.delivery_method === 'domicilio' ? '🏠 Despacho a Domicilio' : '🏪 Retiro en Blue Express'}
                  </span>
                </p>
                {order.delivery_method === 'domicilio' && (
                  <p style={{ margin: '4px 0' }}>
                    <span style={{ color: S.muted }}>Dirección: </span>
                    <span style={{ color: S.obsidian }}>{order.shipping_address}, {order.shipping_comuna}, {order.shipping_region}</span>
                  </p>
                )}
                {order.delivery_method === 'retiro' && (
                  <p style={{ margin: '4px 0' }}>
                    <span style={{ color: S.muted }}>Punto de retiro: </span>
                    <span style={{ color: S.obsidian }}>{order.pickup_point_name}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Productos */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: S.muted, fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16, borderBottom: `1px solid ${S.nude}`, paddingBottom: 8 }}>
              Detalle de Productos
            </p>

            {/* Header tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, padding: '8px 0', fontSize: '0.7rem', color: S.muted, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: `1px solid ${S.ivory}` }}>
              <span>Producto</span>
              <span style={{ textAlign: 'center' }}>Cant.</span>
              <span style={{ textAlign: 'right' }}>Precio</span>
            </div>

            {/* Items */}
            {items.length > 0 ? items.map((item: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, padding: '14px 0', borderBottom: `1px solid ${S.ivory}`, alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, color: S.obsidian, fontSize: '0.9rem', fontWeight: 500 }}>{item.product_title}</p>
                  {item.size && <p style={{ margin: '2px 0 0', color: S.muted, fontSize: '0.75rem' }}>Talla: {item.size}</p>}
                </div>
                <div style={{ textAlign: 'center', color: S.muted, fontSize: '0.85rem' }}>{item.quantity}</div>
                <div style={{ textAlign: 'right', color: S.obsidian, fontSize: '0.9rem', fontWeight: 500 }}>
                  ${(item.price * item.quantity).toLocaleString('es-CL')}
                </div>
              </div>
            )) : (
              <p style={{ color: S.muted, fontSize: '0.85rem', padding: '12px 0' }}>Sin productos registrados</p>
            )}
          </div>

          {/* Totales */}
          <div style={{ borderTop: `2px solid ${S.nude}`, paddingTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.85rem' }}>
                  <span style={{ color: S.muted }}>Subtotal</span>
                  <span style={{ color: S.obsidian }}>${(order?.subtotal || flowData?.amount || 0).toLocaleString('es-CL')} CLP</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: '0.85rem' }}>
                  <span style={{ color: S.muted }}>Despacho</span>
                  <span style={{ color: order?.shipping_cost === 0 ? '#2E7D32' : S.obsidian }}>
                    {order?.shipping_cost === 0 ? 'Gratis' : `$${(order?.shipping_cost || 0).toLocaleString('es-CL')} CLP`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: `1px solid ${S.nude}` }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: S.obsidian, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.3rem', color: S.obsidian, fontWeight: 400 }}>
                    ${(order?.total || flowData?.amount || 0).toLocaleString('es-CL')} CLP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Nota */}
          <div style={{ marginTop: 32, padding: '16px 20px', background: S.ivory, borderLeft: `3px solid ${S.gold}` }}>
            <p style={{ color: S.muted, fontSize: '0.8rem', lineHeight: 1.7, margin: 0 }}>
              📧 Se ha enviado una copia de este comprobante a <strong style={{ color: S.obsidian }}>{order?.client_email}</strong>. 
              Para consultas sobre tu despacho cita el número de orden <strong style={{ color: S.obsidian }}>#{String(orderId).padStart(5, '0')}</strong>.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="no-print" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/')} style={{ padding: '16px 40px', background: S.obsidian, color: '#fff', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Seguir comprando
          </button>
          <button onClick={() => window.print()} style={{ padding: '16px 40px', background: 'transparent', color: S.obsidian, border: `1px solid ${S.nudeDark}`, fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
            🖨 Imprimir Boleta
          </button>
        </div>

        <p className="no-print" style={{ textAlign: 'center', color: S.muted, fontSize: '0.75rem', marginTop: 24, letterSpacing: '0.08em' }}>
          TU HISTORIA, TU BRILLO, TU <strong>AMORA</strong>
        </p>
      </div>
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#FDFCF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A7468' }}>Cargando...</p>
      </div>
    }>
      <StatusContent />
    </Suspense>
  );
}
