const mongoose = require('mongoose');

const dashboardStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followers: {
    total: Number,
    growthPercent: Number
  },
  smartInsight: {
    text: String,
    confidence: Number
  },
  audienceBreakdown: [{
    country: String,
    percent: Number
  }],
  activityDensity: [Number],
  anomaly: {
    title: String,
    description: String
  }
});

module.exports = mongoose.model('DashboardStats', dashboardStatsSchema);
