const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Provider = require('../models/Provider');

// Get chat history for a booking
router.get('/:booking_id', auth, async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Chat.find({ booking: booking_id })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name')
      .populate('receiver', 'name pushToken');

    res.json(messages);
  } catch (error) {
    console.error('Fetch chat history error:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// Send a new message
router.post('/', auth, async (req, res) => {
  try {
    const { booking_id, receiver_id, receiver_type, message } = req.body;

    const newMessage = new Chat({
      booking: booking_id,
      sender: req.user._id,
      senderType: req.user.role === 'provider' ? 'Provider' : 'User',
      receiver: receiver_id,
      receiverType: receiver_type,
      message
    });

    await newMessage.save();

    // Emit the message through Socket.IO
    req.app.get('io').to(booking_id).emit('new_message', {
      ...newMessage.toObject(),
      sender: {
        _id: req.user._id,
        name: req.user.name
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Mark messages as read
router.patch('/:booking_id/read', auth, async (req, res) => {
  try {
    const { booking_id } = req.params;
    
    await Chat.updateMany(
      {
        booking: booking_id,
        receiver: req.user._id,
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

module.exports = router;