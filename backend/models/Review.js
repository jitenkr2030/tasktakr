const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  isHelpful: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for efficient provider rating queries
reviewSchema.index({ provider: 1, createdAt: -1 });

// Pre-save middleware to check for profanity
reviewSchema.pre('save', function(next) {
  // Basic profanity check - can be enhanced with a proper profanity filter library
  const profanityList = ['badword1', 'badword2', 'badword3'];
  const reviewText = this.review.toLowerCase();
  
  const hasProfanity = profanityList.some(word => reviewText.includes(word));
  if (hasProfanity) {
    this.isFlagged = true;
  }
  
  next();
});

module.exports = mongoose.model('Review', reviewSchema);