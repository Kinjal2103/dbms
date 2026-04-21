const mongoose = require('mongoose');

const analyticsDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followerHistory: [{
    date: Date,
    count: Number
  }],
  engagementHistory: [{
    date: Date,
    rate: Number
  }],
  platformStats: {
    instagram: { posts: {type: Number, default: 0}, reach: {type: Number, default: 0}, engagement: {type: Number, default: 0} },
    twitter: { posts: {type: Number, default: 0}, reach: {type: Number, default: 0}, engagement: {type: Number, default: 0} },
    linkedin: { posts: {type: Number, default: 0}, reach: {type: Number, default: 0}, engagement: {type: Number, default: 0} }
  },
  topPosts: [],
  audienceRegions: [{ label: String, percent: Number }],
  weeklyKpis: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  
  // Legacy fields so old code doesn't instantly crash if any remains
  kpis: mongoose.Schema.Types.Mixed,
  growthChart: mongoose.Schema.Types.Mixed,
  networkDistribution: mongoose.Schema.Types.Mixed,
  audienceDNA: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('AnalyticsData', analyticsDataSchema);
