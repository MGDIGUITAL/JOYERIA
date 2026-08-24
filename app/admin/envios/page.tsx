'use client';
import React from 'react';
import { T } from '../components/shared';

export default function EnviosPage() {
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: T.text, marginBottom: '16px' }}>Logística y Envíos</h2>
        <p style={{ color: T.textMuted, fontSize: '1rem', marginBottom: '16px' }}>
          Asignación de números de seguimiento y gestión de despachos.
        </p>
        <div style={{ display: 'inline-block', background: 'rgba(37, 99, 235, 0.1)', color: T.primary, padding: '8px 16px', borderRadius: '8px', fontWeight: 600 }}>
          Integración futura con Blue Express / Copec
        </div>
      </div>
    </div>
  );
}
