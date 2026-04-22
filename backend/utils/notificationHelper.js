/**
 * notificationHelper.js
 * Central helper to send FCM push notifications with proper
 * Android/web config to ensure delivery to the system tray.
 */
const { messaging } = require('../config/firebase');
const { NotificationToken } = require('../models');

/**
 * Send a push notification to one user (by user_id).
 * Handles token cleanup automatically.
 */
async function sendToUser(userId, { title, body, data = {} }) {
  if (!messaging) return;
  try {
    const rows = await NotificationToken.findAll({
      where: { user_id: userId },
      attributes: ['id', 'token'],
    });
    if (!rows.length) return;

    const tokenList = rows.map(r => r.token);
    const result = await messaging.sendEachForMulticast(buildPayload(tokenList, title, body, data));
    await cleanupBadTokens(rows, result);
  } catch (err) {
    console.error('sendToUser error:', err.message);
  }
}

/**
 * Broadcast to ALL registered devices.
 * Returns { successCount, failureCount }
 */
async function sendToAll({ title, body, data = {} }) {
  if (!messaging) return { successCount: 0, failureCount: 0 };
  try {
    const rows = await NotificationToken.findAll({ attributes: ['id', 'token'] });
    if (!rows.length) return { successCount: 0, failureCount: 0 };

    const tokenList = rows.map(r => r.token);
    const result = await messaging.sendEachForMulticast(buildPayload(tokenList, title, body, data));
    await cleanupBadTokens(rows, result);
    return { successCount: result.successCount, failureCount: result.failureCount };
  } catch (err) {
    console.error('sendToAll error:', err.message);
    return { successCount: 0, failureCount: 0 };
  }
}

/**
 * Build a FCM multicast payload with Android + WebPush config
 * that forces the notification into the system tray at high priority.
 */
function buildPayload(tokens, title, body, data = {}) {
  const clickUrl = data.click_action || '/';
  return {
    tokens,

    // ── Android: strictly defined for high priority delivery ──────────────
    android: {
      priority: 'high',
      notification: {
        title,
        body,
        icon: 'ic_notification',
        color: '#a83100',
        sound: 'default',
        channelId: 'feast_orders',
        defaultSound: true,
        defaultVibrateTimings: true,
        notificationPriority: 'PRIORITY_HIGH',
        visibility: 'PUBLIC',
      },
    },

    // ── WebPush: The standard way to ensure system tray delivery ──────────
    webpush: {
      headers: {
        Urgency: 'high',
        TTL: '86400',
      },
      notification: {
        title,
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: data.order_id ? `order-${data.order_id}` : 'feast-notification',
        renotify: true,
        requireInteraction: true,
      },
      fcmOptions: {
        link: clickUrl,
      },
    },

    // ── Data payload: used by service worker if notification is suppressed ──
    data: {
      ...data,
      title: String(title),
      body: String(body),
      click_action: clickUrl,
    },
  };
}

/**
 * Remove tokens that are no longer registered (uninstalled app, etc.)
 */
async function cleanupBadTokens(rows, result) {
  const toDelete = [];
  result.responses.forEach((resp, i) => {
    if (!resp.success) {
      const code = resp.error?.code || '';
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        toDelete.push(rows[i]?.id);
      }
    }
  });
  if (toDelete.length) {
    await NotificationToken.destroy({ where: { id: toDelete } });
  }
}

module.exports = { sendToUser, sendToAll, buildPayload };
