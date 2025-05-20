const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Booking must belong to a service']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have a provider']
  },
  date: {
    type: Date,
    required: [true, 'Please specify booking date']
  },
  startTime: {
    type: String,
    required: [true, 'Please specify start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please specify end time']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: [true, 'Booking must have a price']
  },
  notes: {
    type: String,
    trim: true
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
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Populate references when querying
bookingSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'service',
    select: 'title price duration'
  })
  .populate({
    path: 'user',
    select: 'name email'
  })
  .populate({
    path: 'provider',
    select: 'name email'
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;