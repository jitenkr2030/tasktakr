const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');
const { sendPushNotification } = require('../services/notificationService');
const { Expo } = require('expo-server-sdk');

// Initialize Expo SDK
const expo = new Expo();

// Update push token
router.post('/push-token', auth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!Expo.isExpoPushToken(token)) {
      return res.status(400).json({ message: 'Invalid Expo push token' });
    }

    // Update user's push token in their profile
    req.user.pushToken = token;
    await req.user.save();

    res.json({ message: 'Push token updated successfully' });
  } catch (error) {
    console.error('Push token update error:', error);
    res.status(500).json({ message: 'Error updating push token' });
  }
});

// Get user's notifications
router.get('/my-notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
      recipientType: req.user.role === 'provider' ? 'Provider' : 'User'
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.notificationId,
        recipient: req.user._id
      },
      { readStatus: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

module.exports = router;