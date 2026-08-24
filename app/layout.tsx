import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Amora Jewelry – Joyería Premium en Chile',
  description: 'Descubre nuestra colección exclusiva de anillos, collares y pulseras en oro y plata. Compra online con envío a todo Chile.',
  keywords: ['joyería', 'anillos', 'collares', 'pulseras', 'oro', 'plata', 'Chile'],
  openGraph: {
    title: 'Amora Jewelry – Joyería Premium en Chile',
    description: 'Colección exclusiva de joyería fina. Compra online con total confianza.',
    locale: 'es_CL',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: '#080808', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
