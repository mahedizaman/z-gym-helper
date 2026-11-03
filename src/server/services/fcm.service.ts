import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

let isFirebaseInitialized = false;

/**
 * Safely initializes Firebase Admin using FIREBASE_SERVICE_ACCOUNT_BASE64.
 * The service account is decoded only in-memory on the server and is never logged or exposed.
 */
function getFirebaseAdmin(): App | null {
  const existingApps = getApps();
  if (isFirebaseInitialized && existingApps.length > 0) {
    return existingApps[0];
  }

  const base64ServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64ServiceAccount) {
    return null;
  }

  try {
    const jsonString = Buffer.from(base64ServiceAccount, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(jsonString);

    if (existingApps.length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }

    isFirebaseInitialized = true;
    return getApps()[0];
  } catch {
    console.warn('[FCM] Failed to initialize Firebase Admin SDK (invalid or corrupted credentials format)');
    return null;
  }
}

export interface FcmPayload {
  title: string;
  body: string;
  url?: string;
  data?: Record<string, string>;
}

export const fcmService = {
  isConfigured(): boolean {
    return !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  },

  /**
   * Sends multicast push notifications to a list of device tokens.
   */
  async sendToTokens(tokens: string[], payload: FcmPayload): Promise<{ successCount: number; failureCount: number }> {
    if (!tokens || tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    const app = getFirebaseAdmin();
    if (!app) {
      // In development or when credentials are not configured, return cleanly without error
      return { successCount: 0, failureCount: tokens.length };
    }

    try {
      const messaging = getMessaging(app);
      const response = await messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          url: payload.url || '/',
          ...(payload.data || {}),
        },
        webpush: {
          fcmOptions: {
            link: payload.url || '/',
          },
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
          },
        },
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch {
      console.warn('[FCM] Error sending multicast notification');
      return { successCount: 0, failureCount: tokens.length };
    }
  },

  /**
   * Broadcasts a push notification to an FCM topic (e.g. "announcements").
   */
  async sendToTopic(topic: string, payload: FcmPayload): Promise<boolean> {
    const app = getFirebaseAdmin();
    if (!app) {
      return false;
    }

    try {
      const messaging = getMessaging(app);
      await messaging.send({
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: {
          url: payload.url || '/',
          ...(payload.data || {}),
        },
        webpush: {
          fcmOptions: {
            link: payload.url || '/',
          },
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
          },
        },
      });
      return true;
    } catch {
      console.warn(`[FCM] Error broadcasting to topic: ${topic}`);
      return false;
    }
  },

  /**
   * Subscribes tokens to a topic.
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    const app = getFirebaseAdmin();
    if (!app || !tokens.length) return false;

    try {
      const messaging = getMessaging(app);
      await messaging.subscribeToTopic(tokens, topic);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Unsubscribes tokens from a topic.
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
    const app = getFirebaseAdmin();
    if (!app || !tokens.length) return false;

    try {
      const messaging = getMessaging(app);
      await messaging.unsubscribeFromTopic(tokens, topic);
      return true;
    } catch {
      return false;
    }
  },
};
