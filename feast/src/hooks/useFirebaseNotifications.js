import { useEffect } from 'react';
import { getToken, onMessage, getMessaging, isSupported } from 'firebase/messaging';
import { app } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com';
const rawVapid = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
const VAPID_KEY = rawVapid.replace(/^"|"$/g, '') ||
  'BKf2_g9kh_N-RalfKrgsaq8IV9Mm6RHgnCICevFEf4-XfMbmF-FQrvCrYeopKIPkJtIhlJPVMA_BvmUtwI4pL8o';

// Wait until SW is fully activated (fixes "no active Service Worker" error)
function waitForActivation(reg) {
  if (reg.active) return Promise.resolve(reg.active);
  return new Promise((resolve, reject) => {
    const sw = reg.installing || reg.waiting;
    if (!sw) return reject(new Error('No SW installing or waiting'));
    sw.addEventListener('statechange', function handler(e) {
      if (e.target.state === 'activated') {
        sw.removeEventListener('statechange', handler);
        resolve(e.target);
      } else if (e.target.state === 'redundant') {
        sw.removeEventListener('statechange', handler);
        reject(new Error('SW became redundant'));
      }
    });
    // Timeout fallback after 10s
    setTimeout(() => resolve(null), 10000);
  });
}

export function useFirebaseNotifications() {
  const { token: authToken, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !authToken) return;

    let unsubscribeFn = null;

    const init = async () => {
      try {
        const supported = await isSupported();
        if (!supported) return;

        // Only run if permission already granted (don't auto-prompt here — Login.jsx handles it)
        if (Notification.permission !== 'granted') return;

        const messaging = getMessaging(app);

        // Register SW and WAIT for it to be truly active
        let swReg = null;
        try {
          swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/firebase-cloud-messaging-push-scope',
          });
          // Critical: wait for activation before subscribing
          await waitForActivation(swReg);
          console.log('[FCM] Service worker active.');
        } catch (swErr) {
          console.error('[FCM] SW registration/activation failed:', swErr);
          return;
        }

        // Get FCM token
        const currentToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (!currentToken) {
          console.warn('[FCM] No token — check VAPID key.');
          return;
        }

        // Register with backend
        try {
          await fetch(`${API}/api/notifications/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ token: currentToken, device_info: navigator.userAgent }),
          });
          console.log('[FCM] Token registered with backend.');
        } catch (regErr) {
          console.error('[FCM] Backend register failed:', regErr);
        }

        // Foreground handler — show via SW so it appears in OS tray
        unsubscribeFn = onMessage(messaging, (payload) => {
          const notif = payload.notification || {};
          const data  = payload.data || {};
          const title = notif.title || data.title || 'Feast At Night';
          const body  = notif.body  || data.body  || '';
          if (!title) return;
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, {
              body,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              vibrate: [200, 100, 200],
              tag: data.order_id ? `order-${data.order_id}` : 'feast-fg',
              renotify: true,
              data: { url: data.click_action || '/' },
            });
          }).catch(() => {
            new Notification(title, { body, icon: '/pwa-192x192.png' });
          });
        });

      } catch (err) {
        console.error('[FCM] Init error:', err);
      }
    };

    init();
    return () => { if (unsubscribeFn) unsubscribeFn(); };
  }, [isLoggedIn, authToken]);
}
