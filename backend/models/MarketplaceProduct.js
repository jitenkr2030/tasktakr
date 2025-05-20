const mongoose = require('mongoose');

const marketplaceProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['TOOLS', 'KITS', 'SUPPLIES', 'UNIFORMS']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative']
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative']
  },
  images: [{
    url: String,
    alt: String
  }],
  specifications: [{
    key: String,
    value: String
  }],
  forServiceCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  brand: {
    type: String,
    trim: true
  },
  warranty: {
    duration: Number, // in months
    description: String
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'],
    default: 'ACTIVE'
  },
  providerDiscount: {
    type: Number,
    min: 0,
    max: 100,
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

// Update the updatedAt timestamp before saving
marketplaceProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if product is on sale
marketplaceProductSchema.virtual('isOnSale').get(function() {
  return this.discountedPrice && this.discountedPrice < this.price;
});

// Method to check if product is available for purchase
marketplaceProductSchema.methods.isAvailable = function() {
  return this.status === 'ACTIVE' && this.stock > 0;
};

// Method to calculate final price for providers
marketplaceProductSchema.methods.getProviderPrice = function() {
  const basePrice = this.discountedPrice || this.price;
  return basePrice * (1 - this.providerDiscount / 100);
};

// Indexes for efficient querying
marketplaceProductSchema.index({ category: 1, status: 1 });
marketplaceProductSchema.index({ 'forServiceCategories': 1 });

module.exports = mongoose.model('MarketplaceProduct', marketplaceProductSchema);