import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://amorajewelry.cl'),
  title: 'Amora Jewelry | Alta Joyería Premium en Chile',
  description: 'Descubre nuestra colección exclusiva de anillos, collares y pulseras en oro y plata. Compra online con envío a todo Chile.',
  keywords: ['joyería', 'anillos', 'collares', 'pulseras', 'oro', 'plata', 'Chile', 'joyas premium', 'regalos'],
  authors: [{ name: 'Amora Jewelry' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Amora Jewelry | Alta Joyería Premium en Chile',
    description: 'Colección exclusiva de joyería fina. Compra online con total confianza y envío a todo Chile.',
    url: 'https://amorajewelry.cl',
    siteName: 'Amora Jewelry',
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amora Jewelry | Alta Joyería Premium en Chile',
    description: 'Descubre nuestra colección exclusiva de anillos, collares y pulseras.',
  },
};

import { CartProvider } from './components/CartContext';
import CookieConsent from './components/CookieConsent';

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
      <body style={{ background: '#080808', color: '#fff', fontFamily: 'Inter, sans-serif' }} suppressHydrationWarning>
        <CartProvider>
          {children}
        </CartProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
