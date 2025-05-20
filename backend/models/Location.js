const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && 
                 v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  accuracy: {
    type: Number,
    min: 0
  },
  speed: {
    type: Number,
    min: 0
  },
  heading: {
    type: Number,
    min: 0,
    max: 360
  }
});

// Create a geospatial index for efficient location queries
locationSchema.index({ coordinates: '2dsphere' });

// Create a compound index for efficient provider+booking queries
locationSchema.index({ provider: 1, booking: 1, timestamp: -1 });

module.exports = mongoose.model('Location', locationSchema);