require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Post = require('./models/Post');
const ConnectedAccount = require('./models/ConnectedAccount');
const DashboardStats = require('./models/DashboardStats');
const AnalyticsData = require('./models/AnalyticsData');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Step 1 — Clear all collections
    await User.deleteMany({});
    await Post.deleteMany({});
    await ConnectedAccount.deleteMany({});
    await DashboardStats.deleteMany({});
    await AnalyticsData.deleteMany({});
    console.log("🗑️ Cleared all collections");
    
    // Step 2 — Create User
    const user = new User({
      name: "Julian Blake",
      email: "test@socialops.com",
      password: "test1234"
    });
    const savedUser = await user.save();
    console.log("✅ User created: test@socialops.com");
    
    // Step 3 — Create 12 Posts
    const now = new Date();
    
    const posts = [
      // 4 PUBLISHED posts
      {
        userId: savedUser._id,
        title: "How we built the world's first decentralized analytics engine",
        caption: "Breaking boundaries in data science. #analytics #tech #innovation",
        type: "Reel",
        platforms: ["instagram", "linkedin"],
        likes: 12000,
        comments: 402,
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        imageUrl: "https://picsum.photos/seed/post_analytics/800/600",
        status: "published"
      },
      {
        userId: savedUser._id,
        title: "The future of generative art and social identity",
        caption: "Art meets AI in the most unexpected ways. #genart #ai #design",
        type: "Post", // Changing from Carousel to Post to respect Mongoose Schema enum definition
        platforms: ["instagram", "twitter"],
        likes: 8400,
        comments: 128,
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        imageUrl: "https://picsum.photos/seed/post_genart/800/600",
        status: "published"
      },
      {
        userId: savedUser._id,
        title: "Behind the scenes at the New York studio tour",
        caption: "A day in the life of a creative studio. #bts #nyc #creative",
        type: "Story",
        platforms: ["instagram"],
        likes: 2100,
        comments: 45,
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        imageUrl: "https://picsum.photos/seed/post_studio/800/600",
        status: "published"
      },
      {
        userId: savedUser._id,
        title: "10 tips for creating high-impact visuals in 2024",
        caption: "Visual storytelling that converts. #design #tips #socialmedia",
        type: "Reel",
        platforms: ["instagram", "twitter", "linkedin"],
        likes: 24000,
        comments: 1100,
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        imageUrl: "https://picsum.photos/seed/post_visuals/800/600",
        status: "published"
      },
      // 4 SCHEDULED posts
      {
        userId: savedUser._id,
        title: "Spring Campaign Teaser",
        caption: "Something big is coming. #spring #campaign #launch",
        type: "Reel",
        platforms: ["instagram"],
        scheduledAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).setHours(9, 0, 0, 0),
        imageUrl: "https://picsum.photos/seed/post_spring/800/600",
        status: "scheduled"
      },
      {
        userId: savedUser._id,
        title: "Weekly Tech Insights",
        caption: "This week in tech: what you need to know. #tech #weekly",
        type: "Post",
        platforms: ["linkedin"],
        scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).setHours(11, 30, 0, 0),
        imageUrl: "https://picsum.photos/seed/post_tech/800/600",
        status: "scheduled"
      },
      {
        userId: savedUser._id,
        title: "Product Launch Countdown",
        caption: "3 days to go. Are you ready? #launch #product #countdown",
        type: "Story",
        platforms: ["instagram", "twitter"],
        scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).setHours(14, 0, 0, 0),
        imageUrl: "https://picsum.photos/seed/post_launch/800/600",
        status: "scheduled"
      },
      {
        userId: savedUser._id,
        title: "Community Spotlight — Meet our top creators",
        caption: "Celebrating the humans behind the content. #community #creators",
        type: "Post",
        platforms: ["linkedin", "twitter"],
        scheduledAt: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).setHours(16, 0, 0, 0),
        imageUrl: "https://picsum.photos/seed/post_community/800/600",
        status: "scheduled"
      },
      // 4 DRAFT posts
      {
        userId: savedUser._id,
        title: "Morning Rituals of High Performers",
        caption: "What the top 1% do before 8 AM. #morning #productivity",
        type: "Post",
        platforms: ["instagram"],
        imageUrl: "https://picsum.photos/seed/post_morning/800/600",
        status: "draft"
      },
      {
        userId: savedUser._id,
        title: "Team Spotlight — Q4 Edition",
        caption: "Meet the people making it happen. #team #culture",
        type: "Post", // Changing from Carousel to Post to respect Mongoose Schema enum definition
        platforms: ["linkedin"],
        imageUrl: "https://picsum.photos/seed/post_team/800/600",
        status: "draft"
      },
      {
        userId: savedUser._id,
        title: "The minimalist content strategy that 10x'd our reach",
        caption: "Less is more — here's the proof. #strategy #growth",
        type: "Reel",
        platforms: ["instagram", "twitter"],
        imageUrl: "https://picsum.photos/seed/post_strategy/800/600",
        status: "draft"
      },
      {
        userId: savedUser._id,
        title: "Behind the algorithm — what platforms don't tell you",
        caption: "The truth about social media reach in 2024. #algorithm #socialmedia",
        type: "Story",
        platforms: ["instagram"],
        imageUrl: "https://picsum.photos/seed/post_algorithm/800/600",
        status: "draft"
      }
    ];

    await Post.insertMany(posts);
    console.log("✅ 12 Posts created (4 published, 4 scheduled, 4 drafts)");

    // Step 4 — Create ConnectedAccounts
    const accounts = [
      { userId: savedUser._id, platform: "instagram", connected: true, username: "@julianblake", followers: 142000, accessToken: "mock_access", refreshToken: "mock_refresh", connectedAt: new Date() },
      { userId: savedUser._id, platform: "linkedin", connected: true, username: "Julian Blake", followers: 28400, accessToken: "mock_access", refreshToken: "mock_refresh", connectedAt: new Date() },
      { userId: savedUser._id, platform: "tiktok", connected: true, username: "@julian.creates", followers: 312000, accessToken: "mock_access", refreshToken: "mock_refresh", connectedAt: new Date() },
      { userId: savedUser._id, platform: "twitter", connected: false, username: "", followers: 0, accessToken: null, refreshToken: null, connectedAt: new Date() }
    ];

    await mongoose.connection.collection('connectedaccounts').insertMany(accounts);
    console.log("✅ 4 ConnectedAccounts created");

    // Step 5 — Create DashboardStats
    const stats = new DashboardStats({
      userId: savedUser._id,
      followers: { total: 842910, growthPercent: 12.4 },
      smartInsight: {
        text: "Your engagement spikes at 6 PM — schedule more posts here to maximize reach.",
        confidence: 98
      },
      audienceBreakdown: [
        { country: "United States", percent: 42 },
        { country: "United Kingdom", percent: 18 },
        { country: "Germany", percent: 12 }
      ],
      activityDensity: [
        0.9, 0.6, 0.3, 0.1,  // Monday
        0.9, 0.6, 0.3, 0.1,  // Tuesday
        0.9, 0.6, 0.3, 0.1,  // Wednesday
        0.3, 0.1, 0.1, 0.1,  // Thursday
        0.9, 0.6, 0.3, 0.1,  // Friday
        0.1, 0.1, 0.1, 0.1,  // Saturday
        0.1, 0.1, 0.1, 0.1   // Sunday
      ],
      anomaly: {
        title: "Unusual growth spike in Southeast Asia",
        description: "Likely viral redistribution of your last post."
      }
    });

    await stats.save();
    console.log("✅ DashboardStats created");

    // Step 6 — Create AnalyticsData
    const analytics = new AnalyticsData({
      userId: savedUser._id,
      kpis: {
        followers: "1.24M", followersChange: "+12%",
        impressions: "24.5M", impressionsChange: "+42%",
        engagementRate: "4.82%", engagementChange: "-2%",
        postFrequency: "12.4", frequencyChange: "+8%"
      },
      growthChart: {
        engagement: [2400, 3100, 2800, 4200],
        reach: [18000, 21000, 19500, 24500],
        conversions: [320, 410, 390, 520]
      },
      networkDistribution: [
        { platform: "Instagram", percent: 42 },
        { platform: "TikTok", percent: 28 },
        { platform: "LinkedIn", percent: 18 }
      ],
      audienceDNA: {
        primaryAge: "18-24",
        regions: [
          { label: "United States", percent: 42 },
          { label: "United Kingdom", percent: 15 },
          { label: "Brazil", percent: 12 },
          { label: "India", percent: 10 }
        ]
      }
    });

    await analytics.save();
    console.log("✅ AnalyticsData created");

    // Step 7 — Final log
    console.log("🌱 Seeding complete! Login with test@socialops.com / test1234");
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
