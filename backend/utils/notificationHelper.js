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
  return {
    tokens,
    // Android: high priority channels ensures status bar appearance on phones
    android: {
      priority: 'high',
      notification: {
        title,
        body,
        icon: 'ic_notification',       // fallback icon in drawable
        color: '#a83100',              // Feast brand color for the icon tint
        sound: 'default',
        channelId: 'feast_orders',     // custom channel id
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        defaultSound: true,
        defaultVibrateTimings: true,
        notificationPriority: 'PRIORITY_HIGH',
        visibility: 'PUBLIC',
      },
    },
    // We remove webpush.notification so it doesn't auto-handle.
    // Instead we rely entirely on data payload + service worker logic to force display.
    data: { 
      ...data, 
      title: String(title), 
      body: String(body), 
      click_action: '/', 
      timestamp: String(Date.now()) 
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
