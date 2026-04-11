const DashboardStats = require('../models/DashboardStats');
const AnalyticsData = require('../models/AnalyticsData');
const { generateInsight } = require('../services/geminiService');

let cachedInsight = null;
let cacheTimestamp = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [dashboardStats, analyticsData] = await Promise.all([
      DashboardStats.findOne({ userId }),
      AnalyticsData.findOne({ userId })
    ]);

    let stats = dashboardStats ? dashboardStats.toObject() : {
      followers: { total: 842910, growthPercent: 12.4 },
      smartInsight: { text: "Your engagement spikes at 6 PM — schedule more posts here.", confidence: 98 },
      audienceBreakdown: [
        { country: "United States", percent: 42 },
        { country: "United Kingdom", percent: 18 },
        { country: "Germany", percent: 12 }
      ],
      activityDensity: Array.from({ length: 28 }).map((_, i) => [0, 4, 8, 12, 16, 20, 24].includes(i) ? 0.9 : [1, 5, 9, 13, 17, 21, 25].includes(i) ? 0.6 : [2, 6, 10, 14, 18, 22, 26].includes(i) ? 0.3 : 0.1),
      anomaly: { title: "Unusual growth spike in Southeast Asia", description: "Likely viral redistribution of your last post." }
    };

    let aData = analyticsData || {
      growthChart: {
        engagement: [2400, 3100, 2800, 4200],
        reach: [18000, 21000, 19500, 24500]
      }
    };

    const now = Date.now();
    if (cachedInsight && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION_MS) {
      console.log("⚡ Using cached insight");
      stats.smartInsight = cachedInsight;
    } else {
      const engagementData = {
        weeklyEngagement: aData.growthChart?.engagement || [2400, 3100, 2800, 4200],
        weeklyReach: aData.growthChart?.reach || [18000, 21000, 19500, 24500],
        topPostType: "Reel",
        topPlatform: "instagram",
        totalFollowers: stats.followers?.total || 842910,
        audienceTopCountry: stats.audienceBreakdown?.[0]?.country || "United States"
      };
      
      const freshInsight = await generateInsight(engagementData);
      cachedInsight = freshInsight;
      cacheTimestamp = Date.now();
      
      stats.smartInsight = cachedInsight;
    }

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.applyInsight = async (req, res) => {
  try {
    const { insightType } = req.body;
    res.json({ success: true, message: "Insight applied successfully" });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
