'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/components/CartContext';
import { T } from '@/app/admin/components/shared';

export default function CheckoutStatusPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
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

    // Consultamos nuestro propio webhook o endpoint de estado para ver cómo quedó la orden.
    // O mejor, podemos usar un endpoint específico para el frontend que devuelva el status de la orden.
    // Por simplicidad, asumiremos que si llega con token y no está rechazado en Flow,
    // el webhook ya hizo su trabajo. Pero validémoslo vía un nuevo endpoint o directo a Flow.
    
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
