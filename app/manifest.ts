import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Amora Jewelry | Alta Joyería Premium',
    short_name: 'Amora Jewelry',
    description: 'Colección exclusiva de alta joyería en Chile. Anillos, collares, pulseras y aros en Plata y Oro.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#080808',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
