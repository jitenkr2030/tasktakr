const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    proficiency: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    experience_years: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  services_offered: [{
    type: String,
    trim: true
  }],
  profile_image_url: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_ratings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  kyc_status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  availability_status: {
    type: String,
    enum: ['online', 'offline', 'busy'],
    default: 'offline'
  },
  auto_accept_bookings: {
    type: Boolean,
    default: false
  },
  calendar_sync: {
    google_calendar_id: String,
    last_synced: Date,
    is_synced: {
      type: Boolean,
      default: false
    }
  },
  current_location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    last_updated: Date
  },
  workload_metrics: {
    current_bookings: {
      type: Number,
      default: 0
    },
    max_daily_bookings: {
      type: Number,
      default: 8
    },
    preferred_working_hours: {
      start: String,
      end: String
    }
  },
  kyc_documents: {
    aadhar: {
      file_url: String,
      verification_status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      uploaded_at: Date
    },
    pan: {
      file_url: String,
      verification_status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      uploaded_at: Date
    },
    selfie: {
      file_url: String,
      verification_status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      uploaded_at: Date
    }
  },
  kyc_rejection_reason: String,
  kyc_verified_at: Date,
  masked_phone: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  service_areas: [{
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    active: {
      type: Boolean,
      default: true
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  preferredLanguage: {
    type: String,
    enum: ['en', 'hi', 'mr'],
    default: 'en'
  },
  ai_match_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

// Indexes for efficient queries
providerSchema.index({ location: '2dsphere' });
providerSchema.index({ category_id: 1, status: 1 });
providerSchema.index({ 'service_areas.pincode': 1 });

module.exports = mongoose.model('Provider', providerSchema);