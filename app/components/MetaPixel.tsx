'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';

export const PIXEL_CAMPAIGN_ID = '1155113560347927'; // Píxel vinculado a la campaña activa
export const PIXEL_DATASET_ID  = '1374636215742817'; // Píxel conjunto de datos AMORA

export function pageview() {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'PageView');
  }
}

export function trackEvent(name: string, options: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', name, options);
  }
}

export function trackCustomEvent(name: string, options: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
    (window as any).fbq('trackCustom', name, options);
  }
}

function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    pageview();
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <MetaPixelPageView />
    </Suspense>
  );
}

