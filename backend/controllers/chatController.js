const Chat = require('../models/Chat');
const User = require('../models/User');
const Provider = require('../models/Provider');

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, senderType, receiverId, receiverType, message } = req.body;

    // Validate sender and receiver exist
    const sender = senderType === 'User' 
      ? await User.findById(senderId)
      : await Provider.findById(senderId);
    const receiver = receiverType === 'User'
      ? await User.findById(receiverId)
      : await Provider.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({
        status: 'error',
        message: 'Sender or receiver not found'
      });
    }

    // Create new chat message
    const chat = await Chat.create({
      sender: senderId,
      senderType,
      receiver: receiverId,
      receiverType,
      message
    });

    // If receiver has a push token, send notification
    if (receiver.pushToken) {
      // TODO: Implement push notification
    }

    res.status(201).json({
      status: 'success',
      data: chat
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chats = await Chat.find({ booking: booking_id })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'name')
      .populate('receiver', 'name pushToken');

    res.status(200).json({
      status: 'success',
      data: chats
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.markMessageAsRead = async (req, res) => {
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

    res.status(200).json({
      status: 'success',
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const chat = await Chat.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Message not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: chat
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};