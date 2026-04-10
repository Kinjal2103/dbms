const Post = require('../models/Post');
const ConnectedAccount = require('../models/ConnectedAccount');
const { google } = require('googleapis');

exports.getRecentPosts = async (req, res) => {
  try {
    const account = await ConnectedAccount.findOne({ userId: req.user._id, platform: 'youtube' });
    if (!account || !account.accessToken) {
      return res.json([]);
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: account.accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    // Get the uploads playlist ID
    const channelRes = await youtube.channels.list({
      part: 'contentDetails',
      mine: true
    });
    
    if (!channelRes.data.items || channelRes.data.items.length === 0) {
      return res.json([]);
    }
    
    const uploadsPlaylistId = channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;
    
    // Get the top 4 videos
    const playlistRes = await youtube.playlistItems.list({
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: 4
    });

    if (!playlistRes.data.items) {
      return res.json([]);
    }

    const mapped = playlistRes.data.items.map(item => {
      const snippet = item.snippet;
      // Get the highest resolution thumbnail available
      const thumbnailInfo = snippet.thumbnails.maxres || snippet.thumbnails.high || snippet.thumbnails.medium || snippet.thumbnails.default;
      
      return {
        id: snippet.resourceId.videoId,
        title: snippet.title,
        date: new Date(snippet.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        likes: 0,
        comments: 0,
        type: 'Video',
        image: thumbnailInfo ? thumbnailInfo.url : ''
      };
    });

    res.json(mapped);
  } catch (error) {
    console.error('Error fetching youtube posts:', error.message);
    res.json([]);
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

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Ensure the user owns the post
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
