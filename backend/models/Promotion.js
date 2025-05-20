const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Promotion name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Promo code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['FLAT', 'PERCENTAGE', 'FIRST_TIME'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: [0, 'Discount value cannot be negative']
  },
  maxDiscount: {
    type: Number,
    required: function() {
      return this.type === 'PERCENTAGE';
    }
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  targeting: {
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    }],
    cities: [String],
    userType: {
      type: String,
      enum: ['ALL', 'NEW', 'EXISTING']
    }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'EXPIRED'],
    default: 'ACTIVE'
  },
  description: {
    type: String,
    trim: true
  },
  termsAndConditions: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
promotionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to validate if promotion is active and valid
promotionSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.status === 'ACTIVE' &&
    now >= this.startDate &&
    now <= this.endDate &&
    this.usageCount < this.usageLimit
  );
};

// Method to check if user is eligible for promotion
promotionSchema.methods.isUserEligible = async function(userId) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  
  if (!user) return false;
  
  // Check user type eligibility
  if (this.targeting.userType === 'NEW' && user.bookingsCount > 0) {
    return false;
  }
  
  return true;
};

// Indexes for efficient querying
promotionSchema.index({ code: 1 });
promotionSchema.index({ status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);