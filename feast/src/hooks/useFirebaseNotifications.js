import { useEffect, useRef } from 'react';
import { getToken, onMessage, getMessaging, isSupported } from 'firebase/messaging';
import { app } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com';
const rawVapid = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';
const VAPID_KEY = rawVapid.replace(/^"|"$/g, '') ||
  'BKf2_g9kh_N-RalfKrgsaq8IV9Mm6RHgnCICevFEf4-XfMbmF-FQrvCrYeopKIPkJtIhlJPVMA_BvmUtwI4pL8o';

// ── iOS Detection ──────────────────────────────────────────────────────────
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isIOSPWA() {
  // window.navigator.standalone is true only when installed as PWA on iOS
  return isIOS() && (window.navigator.standalone === true);
}

function getIOSVersion() {
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
  return match ? parseFloat(`${match[1]}.${match[2]}`) : 0;
}

// ── Register FCM token with backend ───────────────────────────────────────
async function registerTokenWithBackend(currentToken, authToken) {
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
}

// ── Core FCM Init ──────────────────────────────────────────────────────────
async function initFCM(authToken) {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('[FCM] Not supported in this browser/environment.');
      return null;
    }

    // iOS guard: only attempt FCM if installed as PWA AND iOS >= 16.4
    if (isIOS()) {
      if (!isIOSPWA()) {
        console.log('[FCM] iOS detected but not installed as PWA. Skipping FCM (must be added to Home Screen).');
        return null;
      }
      const iosVer = getIOSVersion();
      if (iosVer < 16.4) {
        console.log(`[FCM] iOS ${iosVer} detected — FCM requires iOS 16.4+. Skipping.`);
        return null;
      }
      console.log(`[FCM] iOS PWA ${iosVer} — proceeding with FCM init.`);
    }

    // Permission must be granted — do NOT auto-prompt here (Login.jsx handles it)
    if (Notification.permission !== 'granted') {
      console.log('[FCM] Notification permission not granted. Skipping FCM init.');
      return null;
    }

    const messaging = getMessaging(app);

    // Use navigator.serviceWorker.ready — the most reliable way to get an active SW
    let swReg = null;
    try {
      // Register the FCM SW (safe to call even if already registered)
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      // Wait for it to be truly active
      swReg = await navigator.serviceWorker.ready;
      console.log('[FCM] Service worker active.');
    } catch (swErr) {
      console.error('[FCM] SW registration failed:', swErr);
      return null;
    }

    // Get FCM token
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!currentToken) {
      console.warn('[FCM] No token received — check VAPID key or SW registration.');
      return null;
    }

    // Register token with backend
    await registerTokenWithBackend(currentToken, authToken);

    // Foreground handler — show via SW so it appears in OS notification tray
    const unsubscribe = onMessage(messaging, (payload) => {
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
        // Fallback: browser Notification API
        try { new Notification(title, { body, icon: '/pwa-192x192.png' }); } catch (_) {}
      });
    });

    return unsubscribe;
  } catch (err) {
    console.error('[FCM] Init error:', err);
    return null;
  }
}

export function useFirebaseNotifications() {
  const { token: authToken, isLoggedIn } = useAuth();
  const unsubscribeRef = useRef(null);
  const pollerRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn || !authToken) return;

    // Clean up any previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // If permission is already granted — init immediately
    if (Notification.permission === 'granted') {
      initFCM(authToken).then((unsub) => {
        if (unsub) unsubscribeRef.current = unsub;
      });
      return;
    }

    // If permission is 'default' (not yet decided) — poll until it changes.
    // This handles the case where the user grants permission from the Login.jsx
    // prompt AFTER this hook has already run.
    if (Notification.permission === 'default') {
      pollerRef.current = setInterval(async () => {
        if (Notification.permission === 'granted') {
          clearInterval(pollerRef.current);
          pollerRef.current = null;
          console.log('[FCM] Permission just granted — initialising FCM now.');
          const unsub = await initFCM(authToken);
          if (unsub) unsubscribeRef.current = unsub;
        } else if (Notification.permission === 'denied') {
          // User denied — stop polling
          clearInterval(pollerRef.current);
          pollerRef.current = null;
          console.log('[FCM] Permission denied — stopping poller.');
        }
      }, 1000); // check every second
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (pollerRef.current) {
        clearInterval(pollerRef.current);
        pollerRef.current = null;
      }
    };
  }, [isLoggedIn, authToken]);
}
