import './globals.css';
import type { Metadata, Viewport } from 'next';
import { CartProvider } from './components/CartContext';
import CookieConsent from './components/CookieConsent';

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://amorajewelry.cl'),
  title: {
    default: 'Amora Jewelry | Alta Joyería Premium en Chile',
    template: '%s | Amora Jewelry',
  },
  description: 'Descubre la elegancia atemporal de Amora Joyería Premium. Colección exclusiva de anillos, collares, pulseras y aros en Plata de Ley y Baño de Oro. Envío asegurado a todo Chile.',
  keywords: [
    'Amora Jewelry',
    'Joyería Chile',
    'Alta Joyería',
    'Anillos de Plata',
    'Collares de Oro',
    'Pulseras de Lujo',
    'Aros Elegantes',
    'Joyería Online Chile',
    'Regalos Especiales',
  ],
  authors: [{ name: 'Amora Jewelry', url: 'https://amorajewelry.cl' }],
  creator: 'Amora Jewelry',
  publisher: 'Amora Jewelry',
  alternates: {
    canonical: 'https://amorajewelry.cl',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
    description: 'Colección exclusiva de alta joyería fina. Compra online con total confianza y envío a todo Chile.',
    url: 'https://amorajewelry.cl',
    siteName: 'Amora Jewelry',
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Amora Jewelry - Alta Joyería Premium Chile',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amora Jewelry | Alta Joyería Premium en Chile',
    description: 'Descubre nuestra colección exclusiva de anillos, collares y pulseras en Chile.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'CI-f2dlJntCu_el7bJVCmy5ZA99_hjiPFJN6upPIP3g',
  },
};

const jewelryStoreSchema = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  name: 'Amora Jewelry',
  url: 'https://amorajewelry.cl',
  logo: 'https://amorajewelry.cl/icon-512.png',
  image: 'https://amorajewelry.cl/og-image.png',
  description: 'Tienda de alta joyería y accesorios de lujo en Chile. Anillos, collares, pulseras y aros exclusivos.',
  telephone: '+56951555556',
  priceRange: '$$$',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CL',
  },
  sameAs: [
    'https://wa.me/56951555556',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Amora Jewelry',
  url: 'https://amorajewelry.cl',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://amorajewelry.cl/#catalogo?q={search_term_string}',
    'query-input': 'required name=search_term_string',
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
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jewelryStoreSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
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

