const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  entityType: {
    type: String,
    required: true,
    enum: ['ADMIN', 'PROVIDER']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType'
  },
  period: {
    type: String,
    required: true,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  metrics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    cancelledBookings: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    categoryPerformance: [{
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      },
      bookingCount: Number,
      revenue: Number
    }],
    customerSatisfaction: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient querying
analyticsSchema.index({ entityType: 1, entityId: 1, period: 1, startDate: -1 });
analyticsSchema.index({ entityType: 1, period: 1, startDate: -1 });

// Static method to aggregate metrics
analyticsSchema.statics.aggregateMetrics = async function(entityType, entityId, period, startDate, endDate) {
  return this.findOne({
    entityType,
    entityId,
    period,
    startDate: { $gte: startDate },
    endDate: { $lte: endDate }
  }).exec();
};

module.exports = mongoose.model('Analytics', analyticsSchema);