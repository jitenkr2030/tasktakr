const mongoose = require('mongoose');

const serviceBundleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  }],
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  bannerImage: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  termsAndConditions: {
    type: String,
    required: true
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
serviceBundleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual field for calculating final price after discount
serviceBundleSchema.virtual('finalPrice').get(function() {
  return this.totalPrice * (1 - this.discountPercentage / 100);
});

module.exports = mongoose.model('ServiceBundle', serviceBundleSchema);