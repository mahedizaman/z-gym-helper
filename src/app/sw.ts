import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, NetworkOnly, NetworkFirst } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. NEVER cache authenticated API endpoints
    {
      matcher: ({ url }) => url.pathname.startsWith('/api/'),
      handler: new NetworkOnly(),
    },
    // 2. Personal authenticated pages: NetworkFirst (never serve stale personal data offline)
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/log') ||
        url.pathname.startsWith('/progress') ||
        url.pathname.startsWith('/settings') ||
        url.pathname.startsWith('/admin') ||
        url.pathname.startsWith('/challenges'),
      handler: new NetworkFirst({
        cacheName: 'personal-pages-cache',
        networkTimeoutSeconds: 4,
      }),
    },
    // 3. Fallback to Serwist default cache for static assets, public pages, images, fonts
    ...defaultCache,
  ],
});

// Push notification event listener for FCM and Web Push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Z-Gym Helper';
    const options: NotificationOptions = {
      body: data.body || 'আপনার ফিটনেস আপডেট চেক করুন!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: {
        url: data.url || '/',
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Failed to parse push event payload', err);
  }
});

// Notification click event handler: open or focus tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

serwist.addEventListeners();
