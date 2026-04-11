const mongoose = require('mongoose');

const analyticsDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kpis: {
    followers: String,
    followersChange: String,
    impressions: String,
    impressionsChange: String,
    engagementRate: String,
    engagementChange: String,
    postFrequency: String,
    frequencyChange: String
  },
  growthChart: {
    engagement: [Number],
    reach: [Number],
    conversions: [Number]
  },
  networkDistribution: [{
    platform: String,
    percent: Number
  }],
  audienceDNA: {
    primaryAge: String,
    regions: [{
      label: String,
      percent: Number
    }]
  }
});

module.exports = mongoose.model('AnalyticsData', analyticsDataSchema);
