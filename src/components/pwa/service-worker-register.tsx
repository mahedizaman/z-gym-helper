'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';

    // 1. One-time cleanup on localhost: unregister any legacy service workers and purge caches
    if (isLocalhost) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((unregistered) => {
            if (unregistered) {
              console.log('[Z-Gym PWA] Unregistered legacy service worker on localhost:', registration.scope);
            }
          });
        }
      });

      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          for (const cacheName of cacheNames) {
            caches.delete(cacheName).then(() => {
              console.log('[Z-Gym PWA] Purged stale localhost cache:', cacheName);
            });
          }
        });
      }
    }

    // 2. Only register service worker in production builds (never in development)
    if (process.env.NODE_ENV === 'production' && !isLocalhost) {
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
