const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderType'
  },
  senderType: {
    type: String,
    required: true,
    enum: ['User', 'Provider']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverType'
  },
  receiverType: {
    type: String,
    required: true,
    enum: ['User', 'Provider']
  },
  message: {
    type: String,
    required: true
  },
  originalLanguage: {
    type: String,
    required: true,
    enum: ['en', 'hi', 'mr'],
    default: 'en'
  },
  translations: [{
    language: {
      type: String,
      required: true,
      enum: ['en', 'hi', 'mr']
    },
    translatedText: {
      type: String,
      required: true
    }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

// Index for efficient queries
chatSchema.index({ booking: 1, timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema);