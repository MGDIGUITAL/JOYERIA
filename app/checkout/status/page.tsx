'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/components/CartContext';
import Image from 'next/image';

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
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/checkout/flow-status?token=${token}`);
        const data = await res.json();

        if (data.status === 2) {
          setStatus('success');
          setOrderData(data);
          clearCart();
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    verify();
  }, [token, clearCart]);

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', background: S.offWhite, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24
      }}>
        <div style={{
          width: 48, height: 48, border: `2px solid ${S.nude}`,
          borderTop: `2px solid ${S.gold}`, borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: 'Inter, sans-serif', color: S.muted, fontSize: '0.9rem' }}>
          Verificando tu pago...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh', background: S.offWhite, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: 500, width: '100%', textAlign: 'center',
          padding: '60px 40px', background: '#fff',
          border: `1px solid ${S.nude}`, borderRadius: 2
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 24 }}>⚠️</div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.6rem', color: S.obsidian, marginBottom: 16, fontWeight: 400 }}>
            Pago No Confirmado
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', color: S.muted, marginBottom: 32, lineHeight: 1.6 }}>
            No pudimos confirmar tu pago. Si el dinero fue descontado, contáctanos y lo resolveremos de inmediato.
          </p>
          <button onClick={() => router.push('/')} style={{
            padding: '14px 32px', background: S.obsidian, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer'
          }}>
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  const orderId = orderData?.commerceOrder;
  const amount  = orderData?.amount;

  return (
    <div style={{ minHeight: '100vh', background: S.offWhite, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkDraw { to { stroke-dashoffset: 0; } }
        @keyframes circleDraw { to { stroke-dashoffset: 0; } }
      `}</style>

      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${S.nude}`, padding: '20px 40px',
        display: 'flex', justifyContent: 'center', background: S.offWhite
      }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', letterSpacing: '0.2em', color: S.obsidian }}>
          AMORA
        </span>
      </header>

      {/* Hero */}
      <div style={{
        maxWidth: 680, margin: '0 auto', padding: '80px 24px 60px',
        textAlign: 'center', animation: 'fadeUp 0.8s ease forwards'
      }}>

        {/* Animated checkmark */}
        <div style={{ marginBottom: 40 }}>
          <svg viewBox="0 0 80 80" width="80" height="80" style={{ display: 'block', margin: '0 auto' }}>
            <circle
              cx="40" cy="40" r="36"
              fill="none" stroke={S.gold} strokeWidth="1.5"
              strokeDasharray="226" strokeDashoffset="226"
              style={{ animation: 'circleDraw 0.8s ease forwards 0.2s' }}
            />
            <polyline
              points="24,42 35,53 56,30"
              fill="none" stroke={S.gold} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="50" strokeDashoffset="50"
              style={{ animation: 'checkDraw 0.5s ease forwards 0.9s' }}
            />
          </svg>
        </div>

        <p style={{ color: S.gold, fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 16 }}>
          Compra Confirmada
        </p>

        <h1 style={{
          fontFamily: 'Cinzel, serif', fontSize: '2.4rem', fontWeight: 300,
          color: S.obsidian, marginBottom: 16, lineHeight: 1.3
        }}>
          ¡Gracias por tu compra!
        </h1>

        <p style={{ color: S.muted, fontSize: '1rem', lineHeight: 1.8, marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
          Tu pedido ha sido recibido y está siendo procesado con el mayor cuidado.
          Recibirás un correo de confirmación con todos los detalles.
        </p>

        {/* Ticket / Orden */}
        <div style={{
          background: '#fff', border: `1px solid ${S.nude}`,
          borderRadius: 2, padding: '40px', marginBottom: 40,
          boxShadow: '0 8px 40px rgba(0,0,0,0.04)'
        }}>
          {/* Número de orden destacado */}
          <div style={{
            borderBottom: `1px dashed ${S.nude}`, paddingBottom: 24, marginBottom: 24
          }}>
            <p style={{ color: S.muted, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
              Número de Orden / Ticket
            </p>
            <p style={{
              fontFamily: 'Cinzel, serif', fontSize: '2rem', color: S.obsidian,
              fontWeight: 400, letterSpacing: '0.05em'
            }}>
              #{orderId?.toString().padStart(5, '0')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'left' }}>
            <div>
              <p style={{ color: S.muted, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                Total Pagado
              </p>
              <p style={{ color: S.obsidian, fontSize: '1.1rem', fontWeight: 500 }}>
                ${amount ? Number(amount).toLocaleString('es-CL') : '—'} CLP
              </p>
            </div>
            <div>
              <p style={{ color: S.muted, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                Estado
              </p>
              <p style={{ color: '#2E7D32', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E7D32', display: 'inline-block' }} />
                Pagado
              </p>
            </div>
          </div>

          {/* Divider decorativo */}
          <div style={{ borderTop: `1px dashed ${S.nude}`, marginTop: 24, paddingTop: 20 }}>
            <p style={{ color: S.muted, fontSize: '0.8rem', lineHeight: 1.7 }}>
              Guarda este número de orden. Lo necesitarás para cualquier consulta sobre tu despacho.
              Puedes escribirnos a{' '}
              <a href="mailto:amorajewelrychile@gmail.com" style={{ color: S.gold, textDecoration: 'none' }}>
                amorajewelrychile@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => router.push('/')} style={{
            padding: '16px 40px', background: S.obsidian, color: '#fff',
            border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
            letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            transition: 'opacity 0.3s'
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Seguir comprando
          </button>
          <button onClick={() => window.print()} style={{
            padding: '16px 40px', background: 'transparent', color: S.obsidian,
            border: `1px solid ${S.nudeDark}`, fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
            letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            transition: 'border-color 0.3s'
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = S.obsidian)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = S.nudeDark)}
          >
            Imprimir comprobante
          </button>
        </div>
      </div>

      {/* Footer sutil */}
      <div style={{
        borderTop: `1px solid ${S.nude}`, padding: '32px 24px',
        textAlign: 'center', marginTop: 40
      }}>
        <p style={{ color: S.muted, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          AMORA JEWELRY CHILE — Joyería Premium · amorajewelrychile@gmail.com
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
