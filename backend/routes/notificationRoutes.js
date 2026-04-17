const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { NotificationToken } = require('../models');
const { messaging } = require('../config/firebase');

// ─── POST /api/notifications/register ─────────────────────────
// Clients call this to register their FCM token upon login/consent
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { token, device_info } = req.body;
    const userId = req.user.userId;

    if (!token) {
      return res.status(400).json({ success: false, message: 'FCM Token is required.' });
    }

    // Upsert logic: if token exists, update user_id (in case of re-login), else create
    const existing = await NotificationToken.findOne({ where: { token } });
    if (existing) {
      existing.user_id = userId;
      if (device_info) existing.device_info = device_info;
      await existing.save();
    } else {
      await NotificationToken.create({
        user_id: userId,
        token,
        device_info: device_info || 'web'
      });
    }

    return res.json({ success: true, message: 'Push notification token registered.' });
  } catch (error) {
    console.error('Notification Register Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register token.' });
  }
});

// ─── POST /api/notifications/send ──────────────────────────────
// Admins call this to manually broadcast a message (e.g. Offers)
router.post('/send', authMiddleware, requireRole('admin', 'developer'), async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;

    if (!messaging) {
      return res.status(503).json({ success: false, message: 'Firebase Admin not configured on server.' });
    }
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'Title and body are required.' });
    }

    // Fetch all unique tokens
    const tokens = await NotificationToken.findAll({ attributes: ['token'] });
    const tokenList = tokens.map(t => t.token);

    if (tokenList.length === 0) {
      return res.json({ success: true, message: 'No devices registered for notifications.' });
    }

    const payload = {
      notification: {
        title,
        body,
        ...(imageUrl && { image: imageUrl })
      },
      tokens: tokenList
    };

    const response = await messaging.sendEachForMulticast(payload);
    
    // Optional: Cleanup invalid tokens (NotRegistered)
    const tokensToRemove = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error.code === 'messaging/registration-token-not-registered') {
        tokensToRemove.push(tokenList[idx]);
      }
    });

    if (tokensToRemove.length > 0) {
      await NotificationToken.destroy({ where: { token: tokensToRemove } });
    }

    return res.json({
      success: true,
      message: `Message sent. Success: ${response.successCount}, Failed: ${response.failureCount}`,
    });
  } catch (error) {
    console.error('Notification Send Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to broadcast notification.' });
  }
});

module.exports = router;
