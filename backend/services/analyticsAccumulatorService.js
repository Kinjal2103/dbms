const AnalyticsData = require('../models/AnalyticsData');
const Post = require('../models/Post');

const accumulateDailyAnalytics = async () => {
  try {
    const BATCH_SIZE = 10;
    let skip = 0;
    let processedCount = 0;
    
    // Process users in batches using cursor/pagination logic
    while (true) {
      const analyticsBatch = await AnalyticsData.find().skip(skip).limit(BATCH_SIZE);
      if (analyticsBatch.length === 0) break;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const isMonday = new Date().getDay() === 1;

      for (const analytics of analyticsBatch) {
        let changed = false;

        // b. FOLLOWER GROWTH
        if (!analytics.followerHistory) analytics.followerHistory = [];
        const lastFollowerEntry = analytics.followerHistory[analytics.followerHistory.length - 1];
        const lastCount = lastFollowerEntry ? lastFollowerEntry.count : 0;
        const followerChange = Math.floor(Math.random() * 11) - 2;
        const newCount = Math.max(0, lastCount + followerChange);
        
        analytics.followerHistory.push({ date: today, count: newCount });
        if (analytics.followerHistory.length > 90) analytics.followerHistory.shift();

        // c. ENGAGEMENT RATE
        if (!analytics.engagementHistory) analytics.engagementHistory = [];
        const postsTodayCount = await Post.countDocuments({ 
          userId: analytics.userId, 
          createdAt: { $gte: yesterday } 
        });

        const newRate = postsTodayCount > 0 
          ? (Math.random() * 3 + 1.5).toFixed(2) 
          : (Math.random() * 0.8).toFixed(2);
          
        analytics.engagementHistory.push({ date: today, rate: parseFloat(newRate) });
        if (analytics.engagementHistory.length > 90) analytics.engagementHistory.shift();

        // d. PLATFORM STATS
        if (!analytics.platformStats) {
          analytics.platformStats = {
            instagram: { posts: 0, reach: 0, engagement: 0 },
            twitter: { posts: 0, reach: 0, engagement: 0 },
            linkedin: { posts: 0, reach: 0, engagement: 0 }
          };
        }

        const platforms = ['instagram', 'twitter', 'linkedin'];
        for (const platform of platforms) {
          if (!analytics.platformStats[platform]) {
            analytics.platformStats[platform] = { posts: 0, reach: 0, engagement: 0 };
          }
          
          analytics.platformStats[platform].reach += Math.floor(Math.random() * 50);
          analytics.platformStats[platform].posts = await Post.countDocuments({ 
            userId: analytics.userId, 
            platform, 
            status: 'published' 
          });
        }

        // e. WEEKLY KPIs
        if (!analytics.weeklyKpis) {
          analytics.weeklyKpis = { impressions: 0, clicks: 0, shares: 0, comments: 0 };
        }

        if (isMonday) {
          analytics.weeklyKpis.impressions = 0;
          analytics.weeklyKpis.clicks = 0;
          analytics.weeklyKpis.shares = 0;
          analytics.weeklyKpis.comments = 0;
        }

        analytics.weeklyKpis.impressions += Math.floor(Math.random() * 200 + 50);
        analytics.weeklyKpis.clicks += Math.floor(Math.random() * 40 + 5);

        await analytics.save();
        processedCount++;
      }

      skip += BATCH_SIZE;
    }

    console.log(`Analytics accumulated for ${processedCount} users`);
  } catch (error) {
    console.error('Failed to accumulate daily analytics:', error);
  }
};

module.exports = {
  accumulateDailyAnalytics
};
