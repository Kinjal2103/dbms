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
  },
  // Newly added fields for live computed caching mapping
  totalPosts: Number,
  draftPosts: Number,
  scheduledPosts: Number,
  publishedPosts: Number,
  platformBreakdown: mongoose.Schema.Types.Mixed,
  lastUpdated: Date,
  totalFollowers: Number,
  followersGrowth: Number,
  engagementRate: Number,
  aiInsight: String,
  aiInsightGeneratedAt: Date
});

module.exports = mongoose.model('DashboardStats', dashboardStatsSchema);
