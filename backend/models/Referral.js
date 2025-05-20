const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUses: {
    type: Number,
    default: 10
  },
  pointsPerReferral: {
    type: Number,
    default: 100
  },
  referredUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    pointsAwarded: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
referralSchema.index({ code: 1 });
referralSchema.index({ referrer: 1 });

module.exports = mongoose.model('Referral', referralSchema);