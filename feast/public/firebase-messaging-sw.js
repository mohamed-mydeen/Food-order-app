importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyB6iFUSevmgKA9RB_H53R5c2RQ5Dypi9Vs",
  authDomain: "feast-790b4.firebaseapp.com",
  projectId: "feast-790b4",
  storageBucket: "feast-790b4.firebasestorage.app",
  messagingSenderId: "238045088917",
  appId: "1:238045088917:web:e48057aac007d92e271f9c"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ── Background / app-closed message handler ─────────────────────────────────
// This fires when the PWA is in the BACKGROUND or CLOSED.
// FCM auto-shows the notification, but we override here for custom options.
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM SW] Background message received:', payload);

  const { title, body, image } = payload.notification || {};
  const data = payload.data || {};

  // Build rich notification options
  const options = {
    body: body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    image: image || undefined,
    vibrate: [200, 100, 200, 100, 200],
    sound: 'default',
    requireInteraction: true,   // keeps it on screen until user interacts
    tag: data.order_id ? `order-${data.order_id}` : 'feast-notification',
    renotify: true,             // vibrate again if same tag is updated
    data: {
      url: data.click_action || '/',
      order_id: data.order_id || null,
      type: data.type || 'general',
    },
    actions: [
      { action: 'view',    title: '👁️ View Order' },
      { action: 'dismiss', title: '✖ Dismiss' },
    ],
  };

  // Show the notification
  self.registration.showNotification(title || 'Feast At Night', options);
});

// ── Notification click handler ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NOTIFICATION_CLICK', url: targetUrl });
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ── Push event fallback (in case Firebase compat doesn't handle it) ──────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const payload = event.data.json();
    // Firebase compat already handles this via onBackgroundMessage,
    // but we add a fallback for raw pushes sent without the notification field
    if (!payload.notification) {
      const { title = 'Feast At Night', body = '', data = {} } = payload.data || payload;
      event.waitUntil(
        self.registration.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          vibrate: [200, 100, 200],
          data: { url: '/' }
        })
      );
    }
  } catch (e) {
    console.warn('[FCM SW] Push parse error:', e);
  }
});
