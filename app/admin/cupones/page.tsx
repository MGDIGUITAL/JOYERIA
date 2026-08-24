'use client';
import React from 'react';
import { T } from '../components/shared';

export default function CuponesPage() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: '16px',
        padding: '32px',
        boxShadow: T.shadow,
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: T.text, marginBottom: '16px' }}>Códigos de Descuento</h2>
        <p style={{ color: T.textMuted, fontSize: '1rem' }}>
          Crea promociones, establece límites de uso y fechas de caducidad para los cupones de la tienda.
        </p>
      </div>
    </div>
  );
}
