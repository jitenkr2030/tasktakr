const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientType'
  },
  recipientType: {
    type: String,
    required: true,
    enum: ['User', 'Provider']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PROVIDER_ASSIGNED', 'PAYMENT_SUCCESS', 'SERVICE_COMPLETED'],
    default: 'BOOKING_CONFIRMED'
  },
  pushToken: {
    type: String,
    trim: true
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipientType: 1, readStatus: 1 });

module.exports = mongoose.model('Notification', notificationSchema);