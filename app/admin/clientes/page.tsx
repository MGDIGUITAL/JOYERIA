'use client';
import React from 'react';
import { T } from '../components/shared';

export default function ClientesPage() {
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: T.text, marginBottom: '16px' }}>Directorio de Clientes</h2>
        <p style={{ color: T.textMuted, fontSize: '1rem' }}>
          Lista de usuarios registrados y su historial de compras en la joyería.
        </p>
      </div>
    </div>
  );
}
