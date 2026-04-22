const ConnectedAccount = require('../models/ConnectedAccount');
const AnalyticsData = require('../models/AnalyticsData');
const Post = require('../models/Post');
const { seedIntegrationData } = require('../services/integrationSeedService');

const ALL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C' },
  { id: 'twitter',   label: 'Twitter / X', color: '#1DA1F2' },
  { id: 'linkedin',  label: 'LinkedIn', color: '#0A66C2' },
  { id: 'tiktok',    label: 'TikTok', color: '#010101' },
  { id: 'youtube',   label: 'YouTube', color: '#FF0000' },
];

exports.getIntegrations = async (req, res) => {
  try {
    const accounts = await ConnectedAccount.find({ userId: req.user._id });

    const integrations = ALL_PLATFORMS.map(p => {
      const acc = accounts.find(a => a.platform === p.id);
      if (acc && acc.connected) {
        return {
          platform: p.id,
          label: p.label,
          color: p.color,
          connected: true,
          username: acc.username,
          followers: acc.followers || 0,
          connectedAt: acc.connectedAt
        };
      }
      return {
        platform: p.id,
        label: p.label,
        color: p.color,
        connected: false,
        username: "",
        followers: 0,
        connectedAt: null
      };
    });

    res.json({ integrations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.connectIntegration = async (req, res) => {
  try {
    const { platform, username } = req.body;
    
    if (!ALL_PLATFORMS.find(p => p.id === platform)) {
      return res.status(400).json({ success: false, message: 'Invalid platform' });
    }

    let acc = await ConnectedAccount.findOne({ userId: req.user._id, platform });
    if (acc) {
      acc.connected = true;
      acc.username = username;
      acc.connectedAt = new Date();
      await acc.save();
    } else {
      acc = await ConnectedAccount.create({
        userId: req.user._id,
        platform,
        username,
        connected: true,
        connectedAt: new Date()
      });
    }

    const seedResult = await seedIntegrationData({ userId: req.user._id, platform });
    acc = await ConnectedAccount.findOne({ userId: req.user._id, platform });

    res.json({
      success: true,
      integration: {
        platform,
        username,
        connected: true,
        followers: acc?.followers || seedResult.followers || 0,
        connectedAt: acc?.connectedAt || null
      },
      seeded: seedResult.seeded || false
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.disconnectIntegration = async (req, res) => {
  try {
    const { platform } = req.body;
    let acc = await ConnectedAccount.findOne({ userId: req.user._id, platform });
    if (acc) {
      acc.connected = false;
      acc.username = '';
      acc.accessToken = null;
      acc.refreshToken = null;
      await acc.save();
    }
    res.json({ success: true, platform });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getIntegrationStats = async (req, res) => {
  try {
    const { platform } = req.params;
    let acc = await ConnectedAccount.findOne({ userId: req.user._id, platform });
    
    if (!acc || !acc.connected) {
      return res.json({ connected: false });
    }

    const posts = await Post.find({
      userId: req.user._id,
      platforms: platform,
      status: 'published'
    }).select('likes comments createdAt');

    const analytics = await AnalyticsData.findOne({ userId: req.user._id });
    const platformStats = analytics?.platformStats?.[platform];
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);

    const hourBuckets = posts.reduce((accumulator, post) => {
      const hour = new Date(post.createdAt).getHours();
      accumulator[hour] = (accumulator[hour] || 0) + 1;
      return accumulator;
    }, {});

    const bestHour = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0]?.[0];
    const bestTime = bestHour !== undefined
      ? new Date(2000, 0, 1, Number(bestHour)).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      : 'N/A';

    res.json({
      posts: platformStats?.posts ?? posts.length,
      avgLikes: posts.length ? Math.round(totalLikes / posts.length) : 0,
      avgComments: posts.length ? Math.round(totalComments / posts.length) : 0,
      bestTime
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
