const Post = require('../models/Post');

exports.getRecentPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user._id, status: 'published' })
      .sort({ createdAt: -1 })
      .limit(4);
    
    const mapped = posts.map(p => ({
      id: p._id.toString(),
      title: p.title,
      date: p.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      likes: p.likes,
      comments: p.comments,
      type: p.type ? p.type.toUpperCase() : 'POST',
      image: p.imageUrl
    }));
    
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, caption, type, platforms, status, scheduledAt, imageUrls } = req.body;
    
    if (!title || !type || !platforms || platforms.length === 0) {
      return res.status(400).json({ message: 'Title, type, and at least one platform are required' });
    }

    if (status === 'scheduled' && !scheduledAt) {
      return res.status(400).json({ message: 'Scheduled date must be provided for scheduled posts' });
    }

    const post = await Post.create({
      userId: req.user._id,
      title,
      caption,
      type,
      platforms,
      imageUrl: imageUrls && imageUrls.length > 0 ? imageUrls[0] : null,
      status: status || 'draft',
      scheduledAt: status === 'scheduled' ? new Date(scheduledAt) : null
    });

    res.status(201).json({ success: true, post: { id: post._id, title: post.title, status: post.status, createdAt: post.createdAt } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
