'use client';
import { useState, useEffect, useMemo } from 'react';
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
  goldLight:'#E8DCC4',
  green:    '#1B5E20',
  greenBg:  '#E8F5E9',
  greenBorder: '#A5D6A7',
  blue:     '#0D47A1',
  blueBg:   '#E3F2FD',
};

export default function AdminEnvios() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pendientes' | 'despachados'>('pendientes');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Per-order input states for tracking number: { [orderId]: string }
  const [trackingInputs, setTrackingInputs] = useState<{ [orderId: string]: string }>({});
  // Loading state per order: { [orderId]: boolean }
  const [processingOrders, setProcessingOrders] = useState<{ [orderId: string]: boolean }>({});
  // Success banner notifications: { type: 'success' | 'error', message: string } | null
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/orders?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setFetchError(`Error del servidor (${res.status}): ${errData.error || 'Error cargando pedidos'}`);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
        // Pre-fill trackingInputs for shipped orders if needed
        const inputs: { [id: string]: string } = {};
        for (const o of data.orders) {
          if (o.tracking_number) inputs[o.id] = o.tracking_number;
        }
        setTrackingInputs(inputs);
      } else if (data.error) {
        setFetchError(`Error de base de datos: ${data.error}`);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setFetchError(`Error de conexión: ${err.message}`);
    }
    setLoading(false);
  };

  // Separa las órdenes en los 2 pasos claros definidos por el usuario:
  // Paso 1: "Por Despachar" (Pendientes de empaque y tracking)
  const pendingOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'Enviado');
  }, [orders]);

  // Paso 2: "Despachados" (Completados con tracking enviado al cliente)
  const shippedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Enviado');
  }, [orders]);

  // Filtrado por buscador
  const filterList = (list: any[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(o => {
      const idMatch = (o.id || '').toLowerCase().includes(q);
      const nameMatch = (o.client_name || '').toLowerCase().includes(q);
      const rutMatch = (o.client_rut || '').toLowerCase().includes(q);
      const emailMatch = (o.client_email || '').toLowerCase().includes(q);
      const trackingMatch = (o.tracking_number || '').toLowerCase().includes(q);
      return idMatch || nameMatch || rutMatch || emailMatch || trackingMatch;
    });
  };

  const currentList = activeTab === 'pendientes' ? filterList(pendingOrders) : filterList(shippedOrders);

  // Acción principal: Marcar como Despachado e ingresar N° de Blue Express
  const handleDispatchOrder = async (order: any) => {
    const trackingNum = (trackingInputs[order.id] || '').trim();

    if (!trackingNum) {
      const confirmWithout = window.confirm(
        '¿Deseas marcar como despachado SIN ingresar el número de seguimiento de Blue Express?\n\n(Recomendado: ingresa el número de pedido de Blue Express para que el cliente pueda rastrearlo).'
      );
      if (!confirmWithout) return;
    }

    setProcessingOrders(prev => ({ ...prev, [order.id]: true }));
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: 'Enviado',
          trackingNumber: trackingNum || 'Pendiente de asignación'
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Actualizar estado local inmediatamente
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Enviado', tracking_number: trackingNum } : o));

        const emailMsg = data.emailSent
          ? `✓ Se envió automáticamente el correo con el seguimiento a ${order.client_email}`
          : `⚠️ Pedido despachado (Aviso de email: ${data.emailError || 'Gmail no configurado'})`;

        setFeedback({
          type: 'success',
          message: `¡Orden #${order.id.substring(0, 8).toUpperCase()} marcada como DESPACHADA con éxito! ${emailMsg}`
        });
      } else {
        setFeedback({
          type: 'error',
          message: `Error al despachar orden: ${data.error || 'Error desconocido'}`
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Error de red al actualizar: ${err.message}`
      });
    } finally {
      setProcessingOrders(prev => ({ ...prev, [order.id]: false }));
    }
  };

  // Re-enviar correo de seguimiento al cliente si lo solicita
  const handleResendEmail = async (order: any) => {
    if (!order.client_email) {
      alert('Esta orden no tiene un correo de cliente asociado.');
      return;
    }

    setProcessingOrders(prev => ({ ...prev, [order.id]: true }));
    try {
      const res = await fetch('/api/emails/order-shipped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: order.client_email,
          orderId: order.id,
          name: order.client_name,
          method: order.delivery_method,
          address: order.delivery_method === 'domicilio' ? order.shipping_address : order.pickup_point_name,
          trackingNumber: order.tracking_number || 'Pendiente'
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: `Correo de seguimiento reenviado exitosamente a ${order.client_email}`
        });
      } else {
        alert('Error reenviando correo: ' + (data.error || 'No se pudo enviar'));
      }
    } catch (err: any) {
      alert('Error de conexión: ' + err.message);
    } finally {
      setProcessingOrders(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const handlePrintAll = () => {
    window.open('/admin/envios/imprimir', '_blank');
  };

  const handlePrintSingle = (orderId: string) => {
    window.open(`/admin/envios/imprimir?id=${orderId}`, '_blank');
  };

  const formatClp = (val: number) => `$ ${Math.round(val || 0).toLocaleString('es-CL')}`;

  const getCleanPhone = (phone: string) => {
    if (!phone) return null;
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length === 9) return `56${clean}`;
    if (clean.startsWith('56')) return clean;
    return clean;
  };

  return (
    <div style={{ minHeight: '100vh', background: S.ivory, fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>
      
      {/* ── ENCABEZADO SAAS ─────────────────────────────────────────────────── */}
      <header style={{ padding: '20px 5%', background: S.obsidian, color: S.offWhite, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/Amora_Jewelry_logo_header_480x114.png" alt="Amora Jewelry" width={130} height={31} style={{ filter: 'brightness(0) invert(1)' }} priority />
          <div style={{ width: 1, height: 24, background: '#333' }} />
          <div>
            <h1 style={{ margin: 0, fontFamily: 'Cinzel, serif', fontSize: '1.15rem', color: S.gold, letterSpacing: '0.05em' }}>Módulo de Despachos y Logística</h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: S.nudeDark }}>Gestión rápida de envíos Blue Express y notificación a clientes</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={fetchOrders}
            style={{
              background: 'transparent',
              color: S.nudeDark,
              border: `1px solid ${S.nudeDark}`,
              padding: '8px 14px',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🔄</span> Refrescar
          </button>

          {pendingOrders.length > 0 && (
            <button
              onClick={handlePrintAll}
              style={{
                background: S.gold,
                color: S.obsidian,
                border: 'none',
                padding: '9px 18px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(184,151,90,0.3)'
              }}
            >
              <span>🖨️</span> Imprimir Todo ({pendingOrders.length})
            </button>
          )}
        </div>
      </header>

      {/* ── CUERPO PRINCIPAL ─────────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px' }}>

        {/* Banner de feedback / éxito / error */}
        {feedback && (
          <div style={{
            background: feedback.type === 'success' ? S.greenBg : '#FFEBEE',
            border: `1px solid ${feedback.type === 'success' ? S.greenBorder : '#FFCDD2'}`,
            color: feedback.type === 'success' ? S.green : '#C62828',
            padding: '14px 20px',
            borderRadius: 8,
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.92rem',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── LOS 2 PASOS CLAROS (TABS PRINCIPALES) ─────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          
          <div style={{ display: 'flex', gap: 10, background: S.offWhite, padding: 6, borderRadius: 10, border: `1px solid ${S.nude}` }}>
            
            {/* Paso 1: Por Despachar */}
            <button
              onClick={() => setActiveTab('pendientes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 22px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'pendientes' ? S.obsidian : 'transparent',
                color: activeTab === 'pendientes' ? S.offWhite : S.charcoal,
                fontWeight: 700,
                fontSize: '0.92rem',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'pendientes' ? '0 2px 10px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              <span>📦</span>
              <span>1. Por Despachar</span>
              <span style={{
                background: activeTab === 'pendientes' ? S.gold : S.nude,
                color: S.obsidian,
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: '0.78rem',
                fontWeight: 800
              }}>
                {pendingOrders.length}
              </span>
            </button>

            {/* Paso 2: Despachados */}
            <button
              onClick={() => setActiveTab('despachados')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 22px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'despachados' ? S.obsidian : 'transparent',
                color: activeTab === 'despachados' ? S.offWhite : S.charcoal,
                fontWeight: 700,
                fontSize: '0.92rem',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === 'despachados' ? '0 2px 10px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              <span>✅</span>
              <span>2. Despachados (Historial)</span>
              <span style={{
                background: activeTab === 'despachados' ? S.gold : S.nude,
                color: S.obsidian,
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: '0.78rem',
                fontWeight: 800
              }}>
                {shippedOrders.length}
              </span>
            </button>
          </div>

          {/* Buscador Rápido */}
          <div style={{ position: 'relative', minWidth: 280 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, orden, RUT..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                borderRadius: 8,
                border: `1px solid ${S.nudeDark}`,
                background: '#FFFFFF',
                fontSize: '0.88rem',
                outline: 'none',
                color: S.obsidian
              }}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, fontSize: '0.9rem' }}>
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: S.muted }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── ESTADOS DE CARGA Y VACÍO ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: S.offWhite, borderRadius: 12, border: `1px solid ${S.nude}` }}>
            <p style={{ fontSize: '1.1rem', color: S.muted, margin: 0 }}>⏳ Cargando órdenes de envío...</p>
          </div>
        ) : fetchError ? (
          <div style={{ padding: '32px 24px', background: '#FFF3CD', border: '1px solid #FFCA28', borderRadius: 10, textAlign: 'center' }}>
            <p style={{ color: '#856404', fontWeight: 700, margin: '0 0 8px' }}>⚠️ Error al conectar con Supabase</p>
            <p style={{ color: '#856404', fontSize: '0.9rem', margin: '0 0 16px' }}>{fetchError}</p>
            <button onClick={fetchOrders} style={{ background: S.obsidian, color: S.gold, border: 'none', padding: '10px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
              🔄 Reintentar Conexión
            </button>
          </div>
        ) : currentList.length === 0 ? (
          <div style={{ padding: '60px 20px', background: S.offWhite, borderRadius: 12, border: `2px dashed ${S.nudeDark}`, textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>
              {activeTab === 'pendientes' ? '🎉' : '📭'}
            </div>
            <h3 style={{ margin: '0 0 8px', color: S.obsidian, fontSize: '1.2rem', fontWeight: 600 }}>
              {activeTab === 'pendientes' ? '¡Todo al día! No hay pedidos pendientes de despacho.' : 'No hay órdenes despachadas en el registro.'}
            </h3>
            <p style={{ margin: 0, color: S.muted, fontSize: '0.9rem' }}>
              {activeTab === 'pendientes'
                ? 'Cuando un cliente compre en la tienda web, su pedido aparecerá automáticamente aquí para armar el paquete.'
                : 'A medida que ingreses el número de Blue Express y marques como enviado, los pedidos quedarán registrados aquí.'}
            </p>
          </div>
        ) : (
          /* ── LISTADO DE TARJETAS DE ÓRDENES ───────────────────────────────── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {currentList.map(order => {
              const orderNum = (order.id || '').substring(0, 8).toUpperCase();
              const dateStr = new Date(order.created_at).toLocaleString('es-CL', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              });
              const isShipped = order.status === 'Enviado';
              const isProcessing = processingOrders[order.id];
              const phoneClean = getCleanPhone(order.client_phone);
              const items = order.order_items || [];
              const totalAmount = order.total || order.subtotal || 0;

              return (
                <div
                  key={order.id}
                  style={{
                    background: S.offWhite,
                    border: `1px solid ${isShipped ? '#CFD8DC' : S.nudeDark}`,
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                    transition: 'border 0.2s ease'
                  }}
                >
                  {/* Encabezado de la Tarjeta */}
                  <div style={{
                    padding: '14px 22px',
                    background: isShipped ? '#ECEFF1' : S.nude,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    borderBottom: `1px solid ${isShipped ? '#CFD8DC' : S.nudeDark}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1.05rem', color: S.obsidian }}>
                        ORDEN #{orderNum}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: S.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>🕒</span> {dateStr}
                      </span>
                      <span style={{
                        background: S.obsidian,
                        color: S.gold,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 12
                      }}>
                        Total: {formatClp(totalAmount)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Botón Nota A4 */}
                      <button
                        onClick={() => handlePrintSingle(order.id)}
                        style={{
                          background: S.obsidian,
                          color: S.gold,
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                        title="Imprimir Nota de Despacho en formato A4 para el paquete"
                      >
                        <span>🖨️</span> Nota A4
                      </button>

                      {/* Insignia de estado */}
                      {isShipped ? (
                        <span style={{
                          background: S.greenBg,
                          color: S.green,
                          border: `1px solid ${S.greenBorder}`,
                          padding: '6px 14px',
                          borderRadius: 20,
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <span>✓</span> DESPACHADO
                        </span>
                      ) : (
                        <span style={{
                          background: '#FFF8E1',
                          color: '#F57F17',
                          border: '1px solid #FFE082',
                          padding: '6px 14px',
                          borderRadius: 20,
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <span>⏳</span> POR DESPACHAR
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo con 3 Columnas Claras */}
                  <div style={{ padding: '22px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                    
                    {/* Columna 1: Datos del Destinatario */}
                    <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, border: `1px solid ${S.nude}` }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: S.muted, fontWeight: 700 }}>
                        👤 Datos del Destinatario
                      </h4>
                      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.95rem', color: S.obsidian }}>
                        {order.client_name}
                      </p>
                      <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: S.charcoal }}>
                        <strong>RUT:</strong> {order.client_rut || 'No informado'}
                      </p>
                      <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: S.charcoal }}>
                        <strong>Email:</strong> <a href={`mailto:${order.client_email}`} style={{ color: S.blue, textDecoration: 'none' }}>{order.client_email}</a>
                      </p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: S.charcoal, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong>Teléfono:</strong> {order.client_phone || 'N/A'}
                        {phoneClean && (
                          <a
                            href={`https://wa.me/${phoneClean}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#25D366',
                              color: '#FFFFFF',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            WhatsApp
                          </a>
                        )}
                      </p>
                    </div>

                    {/* Columna 2: Dirección y Modalidad de Entrega */}
                    <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, border: `1px solid ${S.nude}` }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: S.muted, fontWeight: 700 }}>
                        🚚 Modalidad de Entrega
                      </h4>
                      
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        background: order.delivery_method === 'domicilio' ? S.blueBg : '#FFF3E0',
                        color: order.delivery_method === 'domicilio' ? S.blue : '#E65100',
                        borderRadius: 6,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        marginBottom: 10
                      }}>
                        {order.delivery_method === 'domicilio' ? '🏠 Domicilio (Blue Express)' : '🏪 Punto Blue Express'}
                      </div>

                      <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: S.charcoal }}>
                        <strong>Región:</strong> {order.shipping_region || '—'}
                      </p>
                      <p style={{ margin: '0 0 4px', fontSize: '0.85rem', color: S.charcoal }}>
                        <strong>Comuna:</strong> {order.shipping_comuna || '—'}
                      </p>

                      {order.delivery_method === 'domicilio' ? (
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: S.obsidian }}>
                          <strong>Dirección:</strong> {order.shipping_address || '—'}
                        </p>
                      ) : (
                        <div style={{ marginTop: 4 }}>
                          <p style={{ margin: '0 0 2px', fontSize: '0.85rem', fontWeight: 600, color: S.obsidian }}>
                            {order.pickup_point_name || 'Punto Blue Express'}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: S.muted }}>
                            {order.pickup_point_address || 'Dirección de punto'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Columna 3: Contenido del Paquete */}
                    <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 8, border: `1px solid ${S.nude}` }}>
                      <h4 style={{ margin: '0 0 10px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: S.muted, fontWeight: 700 }}>
                        💎 Contenido del Paquete ({items.length} {items.length === 1 ? 'joya' : 'joyas'})
                      </h4>

                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {items.length === 0 ? (
                          <li style={{ fontSize: '0.85rem', color: S.muted }}>1x Joya Amora (Detalle en nota)</li>
                        ) : (
                          items.map((item: any, idx: number) => (
                            <li key={item.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingBottom: 6, borderBottom: idx < items.length - 1 ? '1px dashed #EEE' : 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {item.image_url ? (
                                  <div style={{ width: 38, height: 38, borderRadius: 6, overflow: 'hidden', position: 'relative', background: '#F5F5F5', flexShrink: 0, border: '1px solid #E0E0E0' }}>
                                    <img src={item.image_url} alt={item.product_title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                  </div>
                                ) : (
                                  <div style={{ width: 38, height: 38, borderRadius: 6, background: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: S.muted, flexShrink: 0 }}>
                                    Joya
                                  </div>
                                )}
                                <div>
                                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: S.obsidian }}>
                                    {item.quantity}x {item.product_title}
                                  </p>
                                  {item.size && (
                                    <span style={{ fontSize: '0.75rem', color: S.muted }}>Talla: {item.size}</span>
                                  )}
                                </div>
                              </div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: S.charcoal, whiteSpace: 'nowrap' }}>
                                {formatClp((item.price || 0) * (item.quantity || 1))}
                              </span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* ── BARRA DE ACCIÓN RÁPIDA (EL CORAZÓN DEL PASO A PASO) ────── */}
                  <div style={{
                    padding: '16px 24px',
                    background: isShipped ? '#F9FBFA' : '#FCFAF7',
                    borderTop: `1px solid ${S.nude}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16
                  }}>
                    
                    {!isShipped ? (
                      /* PASO 1: INGRESAR N° BLUE EXPRESS Y DESPACHAR */
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', width: '100%' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 320px' }}>
                          <span style={{ fontSize: '1.2rem' }}>📦</span>
                          <input
                            type="text"
                            value={trackingInputs[order.id] || ''}
                            onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                            placeholder="Pegar o ingresar N° de seguimiento Blue Express..."
                            disabled={isProcessing}
                            style={{
                              flex: 1,
                              padding: '12px 14px',
                              borderRadius: 8,
                              border: `2px solid ${trackingInputs[order.id] ? S.gold : S.nudeDark}`,
                              fontSize: '0.9rem',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: S.obsidian,
                              outline: 'none',
                              background: '#FFFFFF'
                            }}
                          />
                        </div>

                        <button
                          onClick={() => handleDispatchOrder(order)}
                          disabled={isProcessing}
                          style={{
                            background: isProcessing ? S.muted : S.green,
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: isProcessing ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 3px 10px rgba(27,94,32,0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {isProcessing ? (
                            <>⏳ Despachando y enviando correo...</>
                          ) : (
                            <><span>✓</span> Marcar como Despachado y Notificar</>
                          )}
                        </button>
                      </div>
                    ) : (
                      /* PASO 2: PEDIDO DESPACHADO (SEGUIMIENTO Y ACCIONES) */
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.85rem', color: S.muted, fontWeight: 700, textTransform: 'uppercase' }}>
                            N° Seguimiento Blue Express:
                          </span>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: S.obsidian,
                            background: S.goldLight,
                            padding: '6px 12px',
                            borderRadius: 6,
                            letterSpacing: '0.05em'
                          }}>
                            {order.tracking_number || 'No especificado'}
                          </span>

                          {order.tracking_number && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(order.tracking_number);
                                alert(`N° de seguimiento copiado: ${order.tracking_number}`);
                              }}
                              style={{
                                background: 'transparent',
                                border: `1px solid ${S.nudeDark}`,
                                padding: '6px 12px',
                                borderRadius: 6,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                color: S.charcoal,
                                fontWeight: 600
                              }}
                            >
                              📋 Copiar
                            </button>
                          )}

                          <a
                            href="https://www.blue.cl/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: S.obsidian,
                              color: S.gold,
                              textDecoration: 'none',
                              padding: '6px 14px',
                              borderRadius: 6,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            🔗 Rastrear en Blue.cl
                          </a>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button
                            onClick={() => handleResendEmail(order)}
                            disabled={isProcessing}
                            style={{
                              background: 'transparent',
                              border: `1px solid ${S.gold}`,
                              color: S.charcoal,
                              padding: '7px 14px',
                              borderRadius: 6,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: isProcessing ? 'wait' : 'pointer'
                            }}
                            title="Re-enviar correo oficial al cliente con el código de seguimiento"
                          >
                            ✉️ Reenviar Notificación
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
