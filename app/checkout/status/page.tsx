'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/components/CartContext';
import { T } from '@/app/admin/components/shared';

function StatusContent() {
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get('token') : null;
  const router = useRouter();
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu pago...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se encontró información del pago.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/checkout/flow-status?token=${token}`);
        const data = await res.json();
        
        if (data.status === 2) {
          setStatus('success');
          setMessage('¡Pago exitoso! Tu orden ha sido confirmada.');
          clearCart(); // Limpiamos el carrito local
        } else {
          setStatus('error');
          setMessage('El pago no se pudo completar o fue rechazado.');
        }
      } catch (e) {
        setStatus('error');
        setMessage('Hubo un problema verificando tu pago.');
      }
    };

    verifyPayment();
  }, [token, clearCart]);

  return (
    <div style={{ padding: '80px 20px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ 
        maxWidth: '500px', 
        width: '100%', 
        background: T.surface, 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: T.shadow,
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '1.8rem', 
          marginBottom: '20px', 
          color: status === 'success' ? '#2E7D32' : (status === 'error' ? '#D32F2F' : T.text)
        }}>
          {status === 'loading' ? 'Procesando...' : (status === 'success' ? '¡Gracias por tu compra!' : 'Pago Fallido')}
        </h1>
        <p style={{ color: T.textMuted, marginBottom: '30px' }}>{message}</p>
        
        {status !== 'loading' && (
          <button 
            onClick={() => router.push('/')}
            style={{
              padding: '12px 24px',
              background: T.obsidian,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Volver a la tienda
          </button>
        )}
      </div>
    </div>
  );
}

export default function CheckoutStatusPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Cargando estado...</div>}>
      <StatusContent />
    </Suspense>
  );
}
