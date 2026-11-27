'use client';
import React, { useState, useEffect } from 'react';

export default function WhatsAppButton() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Teléfono de atención al cliente Amora Jewelry
  const phoneNumber = '56951555556';
  const defaultMessage = encodeURIComponent('¡Hola Amora Jewelry! ✨ Tengo una consulta sobre una de sus joyas.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      {/* Tooltip flotante persuasivo */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '0',
          background: '#ffffff',
          color: '#101010',
          padding: '14px 18px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          width: '260px',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          border: '1px solid #E3DBCC',
          animation: 'fadeUp 0.3s ease-out'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 600, color: '#101010' }}>
            💬 ¿Dudas con tu joya o el envío?
          </p>
          <p style={{ margin: '0 0 12px 0', color: '#555', fontSize: '0.8rem' }}>
            Te asesoramos de inmediato por WhatsApp antes de comprar.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              background: '#25D366',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.82rem'
            }}
          >
            Chatear por WhatsApp
          </a>
        </div>
      )}

      {/* Botón Circular Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contactar por WhatsApp"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#25D366',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.96.541 1.961.826 2.796.826 3.183 0 5.77-2.587 5.77-5.766.001-3.182-2.585-5.813-5.77-5.813zm3.432 8.167c-.145.407-.841.748-1.161.797-.318.048-.734.072-2.378-.609-1.979-.821-3.253-2.825-3.351-2.957-.099-.133-.802-1.066-.802-2.031 0-.965.505-1.44.685-1.636.18-.197.394-.246.525-.246.132 0 .263.002.378.007.121.006.283-.046.443.337.165.394.563 1.37.612 1.47.049.098.082.213.017.344-.066.13-.099.213-.197.328-.099.115-.208.256-.297.344-.099.098-.202.205-.087.402.115.197.511.843 1.096 1.365.753.672 1.388.88 1.585.978.197.098.312.082.427-.049.115-.131.492-.574.623-.77.131-.197.262-.164.443-.098.18.066 1.147.541 1.344.64.197.098.328.147.377.23.049.082.049.475-.096.882z" />
        </svg>
      </button>
    </div>
  );
}
