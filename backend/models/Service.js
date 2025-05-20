const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Service must belong to a provider']
  },
  title: {
    type: String,
    required: [true, 'Please provide service title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide service description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please specify service category'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please specify service price']
  },
  duration: {
    type: Number,
    required: [true, 'Please specify service duration in minutes']
  },
  availability: {
    type: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
      },
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      }
    }],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Service must have at least one availability slot'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;