const Post = require('../models/Post');

exports.getQueue = async (req, res) => {
  try {
    const posts = await Post.find({
      userId: req.user._id,
      status: 'scheduled'
    }).sort({ scheduledAt: 1 });
    
    const scheduledPosts = posts.map(p => ({
      id: p._id.toString(),
      title: p.title,
      platform: p.platforms && p.platforms.length > 0 ? p.platforms[0].toLowerCase() : 'instagram',
      status: p.status,
      scheduledAt: p.scheduledAt || p.createdAt,
      imageUrl: p.imageUrl,
      hashtags: p.caption ? (p.caption.match(/#[a-z0-9_]+/gi) || []) : []
    }));
    
    const totalScheduled = scheduledPosts.length;
    const queueHealthScore = Math.min(100, Math.round((totalScheduled / 7) * 100));

    res.json({
      scheduledPosts,
      totalScheduled,
      queueHealthScore
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

exports.getDrafts = async (req, res) => {
  try {
    const drafts = await Post.find({
      userId: req.user._id,
      status: 'draft'
    }).sort({ createdAt: -1 });

    const mapped = drafts.map(d => ({
      id: d._id.toString(),
      title: d.title,
      createdAt: d.createdAt.toISOString(),
      timeAgo: getTimeAgo(d.createdAt)
    }));

    res.json({
      drafts: mapped,
      totalDrafts: mapped.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const trendingPost = await Post.findOne({
      userId: req.user._id,
      status: 'published'
    }).sort({ likes: -1 });
    
    if (!trendingPost) {
      return res.json({ trendingPost: null });
    }

    res.json({
      trendingPost: {
        title: trendingPost.title,
        platform: trendingPost.platforms && trendingPost.platforms.length > 0 ? trendingPost.platforms[0].toLowerCase() : 'instagram',
        likes: trendingPost.likes
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    await Post.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.reschedulePost = async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (scheduledAt) {
      post.scheduledAt = scheduledAt;
      await post.save();
    }
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
