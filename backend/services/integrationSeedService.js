const AnalyticsData = require('../models/AnalyticsData');
const ConnectedAccount = require('../models/ConnectedAccount');
const DashboardStats = require('../models/DashboardStats');
const Post = require('../models/Post');

const PLATFORM_SEEDS = {
  instagram: {
    followers: 1840,
    followersGrowth: 8.4,
    engagementRate: 4.6,
    avgLikes: 286,
    avgComments: 18,
    bestTime: '6:00 PM',
    weeklyKpis: { impressions: 18600, clicks: 420, shares: 74, comments: 48 },
    platformStats: { reach: 24100, engagement: 1280 },
    insight: 'Your visuals are strongest in the evening.',
    anomaly: { title: 'Reel momentum building', description: 'Short-form content on this account is pulling higher engagement than your baseline.' },
    audienceRegions: [
      { label: 'United States', percent: 38 },
      { label: 'India', percent: 34 },
      { label: 'United Kingdom', percent: 28 }
    ],
    audienceAge: '22-28',
    posts: [
      { title: 'Fresh product teaser', caption: 'Launching something exciting soon. #launch #brand', type: 'Post', likes: 312, comments: 21 },
      { title: 'Behind the scenes reel', caption: 'Quick look at the process behind the scenes. #bts #creator', type: 'Reel', likes: 421, comments: 28 }
    ]
  },
  twitter: {
    followers: 920,
    followersGrowth: 5.2,
    engagementRate: 2.8,
    avgLikes: 94,
    avgComments: 12,
    bestTime: '11:00 AM',
    weeklyKpis: { impressions: 9400, clicks: 185, shares: 36, comments: 27 },
    platformStats: { reach: 12100, engagement: 430 },
    insight: 'Short updates and timely commentary are resonating most.',
    anomaly: { title: 'Thread engagement spike', description: 'Longer thread-style posts are earning more interaction than single updates.' },
    audienceRegions: [
      { label: 'United States', percent: 42 },
      { label: 'Canada', percent: 31 },
      { label: 'Germany', percent: 27 }
    ],
    audienceAge: '25-34',
    posts: [
      { title: 'Quick launch update', caption: 'We shipped a cleaner workflow today. #buildinpublic #shipping', type: 'Post', likes: 88, comments: 11 },
      { title: 'Thread on growth lessons', caption: 'A few hard-earned lessons from our recent content experiments. #marketing #growth', type: 'Post', likes: 116, comments: 15 }
    ]
  },
  linkedin: {
    followers: 2460,
    followersGrowth: 11.1,
    engagementRate: 5.4,
    avgLikes: 176,
    avgComments: 24,
    bestTime: '9:00 AM',
    weeklyKpis: { impressions: 16300, clicks: 360, shares: 52, comments: 66 },
    platformStats: { reach: 19800, engagement: 870 },
    insight: 'Professional storytelling is outperforming plain announcements.',
    anomaly: { title: 'Thought leadership lift', description: 'Insight-led posts are getting stronger saves and comments from your audience.' },
    audienceRegions: [
      { label: 'India', percent: 40 },
      { label: 'United States', percent: 33 },
      { label: 'Singapore', percent: 27 }
    ],
    audienceAge: '28-36',
    posts: [
      { title: 'Career lesson from this quarter', caption: 'Three practical lessons from leading our latest campaign. #leadership #career', type: 'Post', likes: 164, comments: 22 },
      { title: 'Workflow win for the team', caption: 'Small process change, big quality improvement. #operations #teamwork', type: 'Post', likes: 189, comments: 26 }
    ]
  },
  tiktok: {
    followers: 3280,
    followersGrowth: 14.8,
    engagementRate: 6.3,
    avgLikes: 540,
    avgComments: 34,
    bestTime: '8:00 PM',
    weeklyKpis: { impressions: 27600, clicks: 510, shares: 112, comments: 94 },
    platformStats: { reach: 34900, engagement: 1860 },
    insight: 'Faster, trend-aware videos are pulling the strongest reach.',
    anomaly: { title: 'Watch-time surge', description: 'Recent short videos are holding attention longer than earlier uploads.' },
    audienceRegions: [
      { label: 'India', percent: 44 },
      { label: 'United States', percent: 30 },
      { label: 'Australia', percent: 26 }
    ],
    audienceAge: '18-24',
    posts: [
      { title: 'Trend remix clip', caption: 'Trying a trend with our own spin. #trend #fyp', type: 'Reel', likes: 612, comments: 39 },
      { title: 'Fast tips video', caption: 'Two quick tips you can use today. #tips #creator', type: 'Reel', likes: 503, comments: 31 }
    ]
  }
};

const toTitle = (value = '') => value.charAt(0).toUpperCase() + value.slice(1);

const emptyPlatformMetric = () => ({ posts: 0, reach: 0, engagement: 0 });

const normalizePlatformMetric = (metric) => ({
  posts: Number(metric?.posts || 0),
  reach: Number(metric?.reach || 0),
  engagement: Number(metric?.engagement || 0)
});

const buildFollowerHistory = (followers) => {
  const history = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const progress = (13 - i) / 13;
    history.push({
      date,
      count: Math.round(followers * (0.72 + (progress * 0.28)))
    });
  }

  history[history.length - 1].count = followers;
  return history;
};

const buildEngagementHistory = (engagementRate) => {
  const history = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const wave = ((13 - i) % 4) * 0.18;
    history.push({
      date,
      rate: Number(Math.max(0.6, engagementRate - 0.9 + wave).toFixed(2))
    });
  }

  history[history.length - 1].rate = Number(engagementRate.toFixed(2));
  return history;
};

const hasNonZeroHistory = (items = [], key) => items.some((item) => Number(item?.[key] || 0) > 0);

const mergeRegions = (existing = [], incoming = []) => {
  const merged = new Map();

  [...existing, ...incoming].forEach((region) => {
    if (!region?.label) return;
    merged.set(region.label, region.percent);
  });

  return Array.from(merged.entries())
    .map(([label, percent]) => ({ label, percent }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 4);
};

const buildNetworkDistribution = (accounts = []) => {
  const connected = accounts.filter((account) => account.connected);
  const totalFollowers = connected.reduce((sum, account) => sum + (account.followers || 0), 0);

  if (!totalFollowers) return [];

  return connected.map((account) => ({
    platform: toTitle(account.platform),
    percent: Math.round(((account.followers || 0) / totalFollowers) * 100)
  }));
};

const createSeedPosts = async ({ userId, platform, posts }) => {
  const existingCount = await Post.countDocuments({ userId, platforms: platform });
  if (existingCount > 0 || !posts?.length) {
    return await Post.countDocuments({ userId, platforms: platform, status: 'published' });
  }

  const now = Date.now();
  await Post.insertMany(
    posts.map((post, index) => ({
      userId,
      title: post.title,
      caption: post.caption,
      type: post.type,
      platforms: [platform],
      status: 'published',
      likes: post.likes,
      comments: post.comments,
      createdAt: new Date(now - ((index + 1) * 2 * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(now - ((index + 1) * 2 * 24 * 60 * 60 * 1000))
    }))
  );

  return posts.length;
};

const seedIntegrationData = async ({ userId, platform }) => {
  const seed = PLATFORM_SEEDS[platform];
  if (!seed) {
    return { followers: 0 };
  }

  let account = await ConnectedAccount.findOne({ userId, platform });
  if (!account) return { followers: 0 };

  if (!account.followers || account.followers === 0) {
    account.followers = seed.followers;
    await account.save();
  }

  const publishedPostCount = await createSeedPosts({ userId, platform, posts: seed.posts });

  const connectedAccounts = await ConnectedAccount.find({ userId, connected: true });
  const totalFollowers = connectedAccounts.reduce((sum, connectedAccount) => sum + (connectedAccount.followers || 0), 0);
  const networkDistribution = buildNetworkDistribution(connectedAccounts);

  let analytics = await AnalyticsData.findOne({ userId });
  if (!analytics) {
    analytics = new AnalyticsData({ userId });
  }

  if (!hasNonZeroHistory(analytics.followerHistory, 'count')) {
    analytics.followerHistory = buildFollowerHistory(totalFollowers);
  } else if (analytics.followerHistory?.length) {
    analytics.followerHistory[analytics.followerHistory.length - 1].count = totalFollowers;
  }

  if (!hasNonZeroHistory(analytics.engagementHistory, 'rate')) {
    analytics.engagementHistory = buildEngagementHistory(seed.engagementRate);
  }

  const currentPlatformStats = analytics.platformStats?.toObject?.() || analytics.platformStats || {};

  analytics.platformStats = {
    instagram: normalizePlatformMetric(currentPlatformStats.instagram || emptyPlatformMetric()),
    twitter: normalizePlatformMetric(currentPlatformStats.twitter || emptyPlatformMetric()),
    linkedin: normalizePlatformMetric(currentPlatformStats.linkedin || emptyPlatformMetric()),
    tiktok: normalizePlatformMetric(currentPlatformStats.tiktok || emptyPlatformMetric()),
    youtube: normalizePlatformMetric(currentPlatformStats.youtube || emptyPlatformMetric())
  };

  analytics.platformStats[platform] = {
    posts: publishedPostCount,
    reach: seed.platformStats.reach,
    engagement: seed.platformStats.engagement
  };

  analytics.weeklyKpis = {
    impressions: Math.max(analytics.weeklyKpis?.impressions || 0, seed.weeklyKpis.impressions),
    clicks: Math.max(analytics.weeklyKpis?.clicks || 0, seed.weeklyKpis.clicks),
    shares: Math.max(analytics.weeklyKpis?.shares || 0, seed.weeklyKpis.shares),
    comments: Math.max(analytics.weeklyKpis?.comments || 0, seed.weeklyKpis.comments)
  };

  analytics.audienceRegions = mergeRegions(analytics.audienceRegions, seed.audienceRegions);
  analytics.networkDistribution = networkDistribution;
  analytics.audienceDNA = {
    primaryAge: seed.audienceAge,
    regions: analytics.audienceRegions
  };

  await analytics.save();

  let dashboardStats = await DashboardStats.findOne({ userId });
  if (!dashboardStats) {
    dashboardStats = new DashboardStats({ userId });
  }

  dashboardStats.totalFollowers = totalFollowers;
  dashboardStats.followersGrowth = seed.followersGrowth;
  dashboardStats.engagementRate = seed.engagementRate;
  dashboardStats.aiInsight = `Your ${toTitle(platform)} account is connected. ${seed.insight}`;
  dashboardStats.aiInsightGeneratedAt = new Date();
  dashboardStats.lastUpdated = new Date();
  dashboardStats.audienceBreakdown = analytics.audienceRegions.map((region) => ({
    country: region.label,
    percent: region.percent
  }));
  dashboardStats.anomaly = seed.anomaly;

  await dashboardStats.save();

  return {
    followers: account.followers,
    connectedAt: account.connectedAt,
    seeded: true
  };
};

module.exports = {
  seedIntegrationData
};
