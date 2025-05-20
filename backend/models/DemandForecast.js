const mongoose = require('mongoose');

const demandForecastSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  demandScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  predictedBookings: {
    type: Number,
    required: true,
    min: 0
  },
  confidenceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  factors: {
    weather: {
      temperature: Number,
      condition: String,
      impact: Number
    },
    seasonality: {
      month: Number,
      season: String,
      impact: Number
    },
    historical: {
      avgBookings: Number,
      trend: String,
      impact: Number
    }
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
demandForecastSchema.index({ location: 1, validFrom: 1, validTo: 1 });

// Method to check if forecast is current
demandForecastSchema.methods.isCurrent = function() {
  const now = new Date();
  return now >= this.validFrom && now <= this.validTo;
};

// Static method to get current demand ranking for a location
demandForecastSchema.statics.getDemandRanking = async function(location) {
  const now = new Date();
  return this.find({
    location,
    validFrom: { $lte: now },
    validTo: { $gte: now }
  })
  .sort({ demandScore: -1 })
  .populate('service', 'name category')
  .exec();
};

module.exports = mongoose.model('DemandForecast', demandForecastSchema);