const mongoose = require('mongoose');

const formatHistory = (historyArray, valueKey) => {
  if (!historyArray || historyArray.length === 0) {
    return { labels: [], data: [] };
  }
  const labels = [];
  const data = [];
  
  historyArray.forEach(item => {
    const d = new Date(item.date);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    data.push(item[valueKey] || 0);
  });
  
  return { labels, data };
};

const getFallbackData = () => ({
  followerHistory: { labels: [], data: [] },
  engagementHistory: { labels: [], data: [] },
  platformStats: {
    instagram: { posts: 0, reach: 0, engagement: 0 },
    twitter: { posts: 0, reach: 0, engagement: 0 },
    linkedin: { posts: 0, reach: 0, engagement: 0 }
  },
  topPosts: [],
  audienceRegions: [],
  weeklyKpis: { impressions: 0, clicks: 0, shares: 0, comments: 0 },
  kpis: { followers: 0, followersChange: "+0%", impressions: 0, impressionsChange: "+0%", engagementRate: "0%", engagementChange: "0%", postFrequency: 0, frequencyChange: "+0%" },
  growthChart: { engagement: [], reach: [], conversions: [] },
  networkDistribution: [],
  audienceDNA: { primaryAge: 'N/A', regions: [] }
});

const mapToLegacyPayload = (data) => {
  if (!data) return getFallbackData();
  
  const payload = {
    // New structures
    followerHistory: formatHistory(data.followerHistory, 'count'),
    engagementHistory: formatHistory(data.engagementHistory, 'rate'),
    platformStats: data.platformStats || getFallbackData().platformStats,
    topPosts: data.topPosts || [],
    audienceRegions: data.audienceRegions || [],
    weeklyKpis: data.weeklyKpis || getFallbackData().weeklyKpis,
    
    // Legacy Structures mapped robustly
    kpis: data.kpis || {
      followers: data.followerHistory?.length > 0 ? data.followerHistory[data.followerHistory.length - 1].count : 0,
      followersChange: "+0%",
      impressions: data.weeklyKpis?.impressions || 0,
      impressionsChange: "+0%",
      engagementRate: data.engagementHistory?.length > 0 ? `${data.engagementHistory[data.engagementHistory.length - 1].rate}%` : "0%",
      engagementChange: "0%",
      postFrequency: "0",
      frequencyChange: "0%"
    },
    growthChart: data.growthChart || {
      engagement: data.engagementHistory ? data.engagementHistory.map(e => e.rate * 1000) : [],
      reach: data.followerHistory ? data.followerHistory.map(f => f.count) : [],
      conversions: data.followerHistory ? data.followerHistory.map(f => Math.floor(f.count * 0.05)) : []
    },
    networkDistribution: data.networkDistribution || [],
    audienceDNA: data.audienceDNA || { primaryAge: "22-28", regions: data.audienceRegions || [] }
  };
  
  return payload;
};

require('mongoose').connect('mongodb://localhost:27017/socialops').then(async () => { 
  const AnalyticsData = require('./models/AnalyticsData'); 
  const data = await AnalyticsData.findOne(); 
  console.log(JSON.stringify(mapToLegacyPayload(data), null, 2)); 
  process.exit(0); 
});
