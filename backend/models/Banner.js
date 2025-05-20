const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  actionLink: {
    type: String,
    required: true
  },
  displayLocation: {
    type: String,
    required: true,
    enum: ['home', 'category', 'service', 'provider'],
    default: 'home'
  },
  targetUserRole: {
    type: String,
    enum: ['all', 'user', 'provider'],
    default: 'all'
  },
  priority: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
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

// Pre-save middleware to update the updatedAt timestamp
bannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
bannerSchema.index({ displayLocation: 1, isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Banner', bannerSchema);