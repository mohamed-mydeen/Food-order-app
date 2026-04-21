const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { NotificationToken } = require('../models');
const { sendToUser, sendToAll } = require('../utils/notificationHelper');
const { messaging } = require('../config/firebase');

// ─── POST /api/notifications/register ─────────────────────────
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { token, device_info } = req.body;
    const userId = req.user.userId;

    if (!token) {
      return res.status(400).json({ success: false, message: 'FCM Token is required.' });
    }

    const existing = await NotificationToken.findOne({ where: { token } });
    let isNewToken = false;
    if (existing) {
      existing.user_id = userId;
      if (device_info) existing.device_info = device_info;
      await existing.save();
    } else {
      isNewToken = true;
      await NotificationToken.create({
        user_id: userId,
        token,
        device_info: device_info || 'web'
      });
    }

    // Welcome push for brand-new device registrations
    if (isNewToken) {
      await sendToUser(userId, {
        title: 'Feast At Night-ku Welcome! 🎉',
        body: 'Inniku special offers iruku 🔥\nMenu check pannunga — hot deals waiting!',
        data: { type: 'welcome' }
      });
    }

    return res.json({ success: true, message: 'Push notification token registered.' });
  } catch (error) {
    console.error('Notification Register Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register token.' });
  }
});

// ─── POST /api/notifications/send (broadcast) ──────────────────
router.post('/send', authMiddleware, requireRole('admin', 'developer'), async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!messaging) {
      return res.status(503).json({ success: false, message: 'Firebase Admin not configured.' });
    }
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required.' });
    }

    const result = await sendToAll({ title, body, data: { type: 'broadcast' } });
    return res.json({
      success: true,
      message: `Broadcast sent. ✅ ${result.successCount} success, ❌ ${result.failureCount} failed.`,
    });
  } catch (error) {
    console.error('Notification Send Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to broadcast notification.' });
  }
});

// ─── POST /api/notifications/send-offer ────────────────────────
// Automatically send an offer notification to all users
router.post('/send-offer', authMiddleware, requireRole('admin', 'developer'), async (req, res) => {
  try {
    const { offerTitle, offerDescription, discount } = req.body;
    const title = `🔥 ${offerTitle || 'Special Offer for You!'}`;
    const body  = offerDescription || `Get ${discount || ''}% off today at Feast At Night! Don't miss out 🍗`;

    const result = await sendToAll({ title, body, data: { type: 'offer', discount: String(discount || '') } });
    return res.json({ success: true, message: `Offer notification sent to ${result.successCount} devices.` });
  } catch (error) {
    console.error('Offer Notification Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send offer notification.' });
  }
});

// ─── POST /api/notifications/recommendation ────────────────────
// Push a recommendation nudge to a specific user or all users
router.post('/recommendation', authMiddleware, requireRole('admin', 'developer'), async (req, res) => {
  try {
    const { userId, productName, category } = req.body;
    const title = `🍽️ You'll love this, ${category ? category + ' fan!' : 'try this!'} `;
    const body  = `${productName || 'A special dish'} is waiting for you at Feast At Night 😋`;

    if (userId) {
      await sendToUser(userId, { title, body, data: { type: 'recommendation' } });
    } else {
      await sendToAll({ title, body, data: { type: 'recommendation' } });
    }

    return res.json({ success: true, message: 'Recommendation notification sent.' });
  } catch (error) {
    console.error('Recommendation Notification Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send recommendation.' });
  }
});

// ─── GET /api/notifications/tokens (developer only) ────────────
router.get('/tokens', authMiddleware, requireRole('developer', 'admin'), async (req, res) => {
  try {
    const tokens = await NotificationToken.findAll({ attributes: ['id', 'user_id', 'device_info', 'created_at'] });
    return res.json({ success: true, count: tokens.length, data: tokens });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tokens.' });
  }
});

module.exports = router;
