import { useEffect } from 'react';
import { getToken, onMessage, getMessaging } from 'firebase/messaging';
import { app } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { isSupported } from 'firebase/messaging';

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com';

// Strip surrounding quotes that appear when env vars are written as VITE_X="value"
const rawVapid = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
const VAPID_KEY = rawVapid.replace(/^"|"$/g, '') ||
  'BKf2_g9kh_N-RalfKrgsaq8IV9Mm6RHgnCICevFEf4-XfMbmF-FQrvCrYeopKIPkJtIhlJPVMA_BvmUtwI4pL8o';

export function useFirebaseNotifications() {
  const { token: authToken, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !authToken) return;

    let unsubscribeFn = null;

    const init = async () => {
      try {
        // 1. Guard: check FCM is supported in this browser
        const supported = await isSupported();
        if (!supported) {
          console.warn('[FCM] Messaging not supported in this browser.');
          return;
        }

        // 2. Get the messaging instance (app is always initialized)
        const messaging = getMessaging(app);

        // 3. Request permission (or use existing grant)
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('[FCM] Notification permission denied.');
          return;
        }

        // 4. Register service worker with a specific scope to avoid PWA conflict
        let swReg = null;
        try {
          // Use the dedicated Firebase push scope (standard practice)
          swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/firebase-cloud-messaging-push-scope', 
          });
          console.log('[FCM] Service worker registered with scope:', swReg.scope);
        } catch (swErr) {
          console.error('[FCM] SW registration failed:', swErr);
        }

        // 5. Get FCM token
        const currentToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          ...(swReg ? { serviceWorkerRegistration: swReg } : {}),
        });

        if (!currentToken) {
          console.warn('[FCM] No token available — check VAPID key and SW scope.');
          return;
        }

        // 6. Register token with backend
        try {
          await fetch(`${API}/api/notifications/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              token: currentToken,
              device_info: navigator.userAgent,
            }),
          });
          console.log('[FCM] Token registered with backend.');
        } catch (regErr) {
          console.error('[FCM] Failed to register token with backend:', regErr);
        }

        // 7. Foreground message handler — show via SW so it lands in OS tray
        unsubscribeFn = onMessage(messaging, (payload) => {
          console.log('[FCM] Foreground message:', payload);
          const notif = payload.notification || {};
          const data  = payload.data || {};
          const title = notif.title || data.title || 'Feast At Night';
          const body  = notif.body  || data.body  || '';

          if (!title || Notification.permission !== 'granted') return;

          // Use SW to show the notification — works on both mobile & desktop
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, {
              body,
              icon:              '/pwa-192x192.png',
              badge:             '/pwa-192x192.png',
              vibrate:           [200, 100, 200],
              requireInteraction: false,
              tag:               data.order_id ? `order-${data.order_id}` : 'feast-fg',
              renotify:          true,
              data: {
                url:      data.click_action || '/',
                order_id: data.order_id || null,
                type:     data.type || 'general',
              },
            });
          }).catch(() => {
            // Last-resort fallback for desktop-only environments
            new Notification(title, { body, icon: '/pwa-192x192.png' });
          });
        });

      } catch (err) {
        console.error('[FCM] Init error:', err);
      }
    };

    init();

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [isLoggedIn, authToken]);
}
