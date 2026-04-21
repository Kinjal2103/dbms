const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./models/Post');
const DashboardStats = require('./models/DashboardStats');
const AnalyticsData = require('./models/AnalyticsData');
const { accumulateDailyAnalytics } = require('./services/analyticsAccumulatorService');

dotenv.config();

const simulateActivity = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socialops');
    
    console.log('❤️  Injecting random engagement into random posts...');
    const posts = await Post.find();
    let totalLikesAdded = 0;
    
    for (const post of posts) {
      if (Math.random() > 0.3) { // 70% chance to gain engagement
        const likesToAdd = Math.floor(Math.random() * 50) + 1;
        const commentsToAdd = Math.floor(Math.random() * 10);
        post.likes = (post.likes || 0) + likesToAdd;
        post.comments = (post.comments || 0) + commentsToAdd;
        await post.save();
        totalLikesAdded += likesToAdd;
      }
    }
    console.log(`✅ Added ${totalLikesAdded} total likes across posts!`);

    console.log('📈 Running Daily Analytics Accumulator (simulate follower growth/engagement rate)...');
    await accumulateDailyAnalytics();

    console.log('🔄 Randomizing dashboard statistics...');
    const stats = await DashboardStats.find();
    for (const stat of stats) {
      stat.totalFollowers = (stat.totalFollowers || stat.followers?.total || 1000) + Math.floor(Math.random() * 100);
      stat.followersGrowth = (Math.random() * 5).toFixed(2);
      await stat.save();
    }
    
    console.log('🚀 Simulation Complete! Data has been dynamically updated.');
    process.exit(0);
  } catch (err) {
    console.error('Simulation Failed:', err);
    process.exit(1);
  }
};

simulateActivity();
