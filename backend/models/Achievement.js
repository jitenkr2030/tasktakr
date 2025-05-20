const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.providerId; }
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: function() { return !this.userId; }
  },
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['booking', 'rating', 'referral', 'engagement']
    },
    criteria: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  streaks: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date,
    history: [{
      date: Date,
      activity: String
    }]
  },
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    successfulReferrals: {
      type: Number,
      default: 0
    }
  },
  level: {
    current: {
      type: Number,
      default: 1
    },
    points: {
      type: Number,
      default: 0
    },
    nextLevelPoints: {
      type: Number,
      default: 100
    }
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

// Index for efficient querying
achievementSchema.index({ userId: 1 });
achievementSchema.index({ providerId: 1 });

// Pre-save middleware to update timestamps
achievementSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to add a badge
achievementSchema.methods.addBadge = function(badge) {
  if (!this.badges.some(b => b.name === badge.name)) {
    this.badges.push(badge);
    return true;
  }
  return false;
};

// Method to update streak
achievementSchema.methods.updateStreak = function(activity) {
  const today = new Date();
  const lastActivity = this.streaks.lastActivityDate;
  
  if (lastActivity) {
    const daysSinceLastActivity = Math.floor(
      (today - lastActivity) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastActivity <= 1) {
      this.streaks.currentStreak++;
      if (this.streaks.currentStreak > this.streaks.longestStreak) {
        this.streaks.longestStreak = this.streaks.currentStreak;
      }
    } else {
      this.streaks.currentStreak = 1;
    }
  } else {
    this.streaks.currentStreak = 1;
  }
  
  this.streaks.lastActivityDate = today;
  this.streaks.history.push({ date: today, activity });
};

// Static method to get leaderboard
achievementSchema.statics.getLeaderboard = async function(category, limit = 10) {
  return this.find({
    'stats.completedBookings': { $gt: 0 }
  })
  .sort({ 'level.points': -1 })
  .limit(limit)
  .populate('userId providerId', 'name avatar')
  .exec();
};

module.exports = mongoose.model('Achievement', achievementSchema);