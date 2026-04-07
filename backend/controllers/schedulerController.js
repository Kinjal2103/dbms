const Post = require('../models/Post');

exports.getTimeline = async (req, res) => {
  try {
    const posts = await Post.find({
      userId: req.user._id,
      status: { $in: ['scheduled', 'published'] }
    }).sort({ scheduledAt: 1, createdAt: 1 });
    
    // Formatting correctly for the UI
    const mapped = posts.map(p => ({
      id: p._id.toString(),
      title: p.title,
      type: p.type,
      platforms: p.platforms || [],
      status: p.status,
      scheduledAt: p.scheduledAt || p.createdAt,
      imageUrl: p.imageUrl,
      hashtags: p.caption ? (p.caption.match(/#[a-z0-9_]+/gi) || []).slice(0, 3) : [] // Extract hashtags or mock
    }));
    
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDrafts = async (req, res) => {
  try {
    const drafts = await Post.find({
      userId: req.user._id,
      status: 'draft'
    }).sort({ createdAt: -1 }).limit(5);

    const mapped = drafts.map(d => ({
      id: d._id.toString(),
      title: d.title,
      createdAt: d.createdAt.toISOString()
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHealth = async (req, res) => {
  try {
    const scheduledCount = await Post.countDocuments({
      userId: req.user._id,
      status: 'scheduled'
    });
    
    res.json({
      scheduledCount,
      optimisationScore: 85,
      trendingAlert: {
        active: true,
        platform: 'Twitter',
        message: 'Your latest thread is gaining traction!'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
