'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker in production or standard environments
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[Z-Gym PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[Z-Gym PWA] Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
