const User = require('../models/User');
const Post = require('../models/Post');
const DashboardStats = require('../models/DashboardStats');
const AnalyticsData = require('../models/AnalyticsData');
const ConnectedAccount = require('../models/ConnectedAccount');

const bootstrapNewUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('Bootstrap failed: User not found');
      return;
    }

    const usernameStr = (user.name || 'user').toLowerCase().replace(/\s+/g, '');
    const now = Date.now();

    // 1. Create 6 Posts
    const postsPromises = [
      Post.create({
        userId,
        content: 'Just getting started with my new Instagram strategy! #firstpost #socialops',
        platform: 'instagram',
        status: 'draft'
      }),
      Post.create({
        userId,
        content: 'Check out this amazing sunset! #nature #vibes',
        platform: 'instagram',
        status: 'draft'
      }),
      Post.create({
        userId,
        content: 'Excited to announce my new project! Stay tuned for more details tomorrow. 🚀',
        platform: 'twitter',
        status: 'scheduled',
        scheduledFor: new Date(now + 2 * 24 * 60 * 60 * 1000)
      }),
      Post.create({
        userId,
        content: 'Productivity tip: Use SocialOps to manage all your accounts in one place! 💡',
        platform: 'twitter',
        status: 'scheduled',
        scheduledFor: new Date(now + 4 * 24 * 60 * 60 * 1000)
      }),
      Post.create({
        userId,
        content: 'I recently learned a lot about social media management. Finding the right tools is key to scaling your reach and impact.',
        platform: 'linkedin',
        status: 'published',
        publishedAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
      }),
      Post.create({
        userId,
        content: 'Hello network! I am looking for new opportunities to learn and grow in the marketing space. Feel free to connect.',
        platform: 'linkedin',
        status: 'published',
        publishedAt: new Date(now - 3 * 24 * 60 * 60 * 1000)
      })
    ];

    // 2. Create DashboardStats
    const dashboardStatsPromise = DashboardStats.create({
      userId,
      totalFollowers: 0,
      followersGrowth: 0,
      totalPosts: 6,
      scheduledPosts: 2,
      publishedPosts: 2,
      draftPosts: 2,
      engagementRate: 0,
      platformBreakdown: { instagram: 2, twitter: 2, linkedin: 2 },
      aiInsight: "Welcome to SocialOps! Start by publishing your first post to get personalized AI insights.",
      aiInsightGeneratedAt: new Date(),
      lastUpdated: new Date()
    });

    // 3. Create AnalyticsData
    const followerHistory = [];
    const engagementHistory = [];
    
    // Normalize "today" to start of day (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate exactly 14 objects, starting 13 days ago up to today (ascending order)
    for (let i = 13; i >= 0; i--) {
      const historyDate = new Date(today);
      historyDate.setDate(today.getDate() - i);
      
      followerHistory.push({ date: historyDate, count: 0 });
      engagementHistory.push({ date: historyDate, rate: 0 });
    }

    const analyticsPromise = AnalyticsData.create({
      userId,
      followerHistory,
      engagementHistory,
      platformStats: {
        instagram: { posts: 2, reach: 0, engagement: 0 },
        twitter: { posts: 2, reach: 0, engagement: 0 },
        linkedin: { posts: 2, reach: 0, engagement: 0 }
      },
      topPosts: [],
      audienceRegions: [],
      weeklyKpis: { impressions: 0, clicks: 0, shares: 0, comments: 0 },
      createdAt: new Date()
    });

    // 4. Create 3 ConnectedAccounts
    const accountsPromise = [
      ConnectedAccount.create({
        userId,
        platform: 'instagram',
        accountHandle: `@${usernameStr}_ig`,
        status: 'connected',
        connectedAt: new Date(),
        avatarUrl: ''
      }),
      ConnectedAccount.create({
        userId,
        platform: 'twitter',
        accountHandle: `@${usernameStr}_tw`,
        status: 'connected',
        connectedAt: new Date(),
        avatarUrl: ''
      }),
      ConnectedAccount.create({
        userId,
        platform: 'linkedin',
        accountHandle: `@${usernameStr}_in`,
        status: 'connected',
        connectedAt: new Date(),
        avatarUrl: ''
      })
    ];

    await Promise.all([
      ...postsPromises,
      dashboardStatsPromise,
      analyticsPromise,
      ...accountsPromise
    ]);

  } catch (error) {
    console.error('Error during new user bootstrap:', error);
  }
};

module.exports = { bootstrapNewUser };
