const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { google } = require('googleapis');
const ConnectedAccount = require('../models/ConnectedAccount');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Simple in-memory storage for state and PKCE verifiers
// In a real app with many users, you might use a Redis cache or signed cookies.
const oauthStateCache = new Map();

// Generate a random string for state
const generateState = () => crypto.randomBytes(32).toString('hex');

// Generate PKCE code verifier and challenge
const generatePKCE = () => {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
};

// ----------------------------------------------------
// GET /api/auth/:platform/url
// Generates the OAuth consent URL for a specific platform
// ----------------------------------------------------
router.get('/:platform/url', protect, (req, res) => {
  const { platform } = req.params;
  const state = generateState();
  
  try {
    if (platform === 'twitter') {
      const { verifier, challenge } = generatePKCE();
      
      oauthStateCache.set(state, {
        userId: req.user._id,
        platform,
        code_verifier: verifier,
        createdAt: Date.now()
      });

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.TWITTER_CLIENT_ID,
        redirect_uri: process.env.TWITTER_REDIRECT_URI || 'http://localhost:5000/api/authIntegrations/twitter/callback',
        scope: 'tweet.read tweet.write users.read offline.access',
        state: state,
        code_challenge: challenge,
        code_challenge_method: 'S256'
      });

      return res.json({ url: `https://twitter.com/i/oauth2/authorize?${params.toString()}` });
    } 
    
    else if (platform === 'youtube') {
      const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5000/api/authIntegrations/youtube/callback'
      );

      oauthStateCache.set(state, {
        userId: req.user._id,
        platform,
        createdAt: Date.now()
      });

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Gets refresh_token
        scope: [
          'https://www.googleapis.com/auth/youtube.upload',
          'https://www.googleapis.com/auth/youtube.readonly'
        ],
        state: state,
        prompt: 'consent' // Forces consent screen to ensure refresh token is returned
      });

      return res.json({ url });
    } 
    
    else if (platform === 'reddit') {
      oauthStateCache.set(state, {
        userId: req.user._id,
        platform,
        createdAt: Date.now()
      });

      const params = new URLSearchParams({
        client_id: process.env.REDDIT_CLIENT_ID,
        response_type: 'code',
        state: state,
        redirect_uri: process.env.REDDIT_REDIRECT_URI || 'http://localhost:5000/api/authIntegrations/reddit/callback',
        duration: 'permanent', // Required for refresh_token
        scope: 'identity submit read'
      });

      return res.json({ url: `https://www.reddit.com/api/v1/authorize?${params.toString()}` });
    }

    return res.status(400).json({ message: 'Unsupported platform' });
  } catch (error) {
    console.error(`Error generating URL for ${platform}:`, error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ----------------------------------------------------
// GET /api/auth/:platform/callback
// Handles OAuth callback, exchanges code for token, and saves account
// ----------------------------------------------------
router.get('/:platform/callback', async (req, res) => {
  const { platform } = req.params;
  const { code, state, error } = req.query;

  // Cleanup: Delete stale state entries older than 15 minutes
  for (const [key, val] of oauthStateCache.entries()) {
    if (Date.now() - val.createdAt > 15 * 60 * 1000) {
      oauthStateCache.delete(key);
    }
  }

  if (error) {
    console.error(`${platform} OAuth error:`, error);
    return res.redirect('http://localhost:3000/?integration=error');
  }

  if (!code || !state) {
    console.error('Missing code or state');
    return res.redirect('http://localhost:3000/?integration=error');
  }

  // Validate state
  const cachedState = oauthStateCache.get(state);
  if (!cachedState || cachedState.platform !== platform) {
    console.error('Invalid or expired state');
    return res.redirect('http://localhost:3000/?integration=error');
  }

  oauthStateCache.delete(state); // Use it once
  const { userId, code_verifier } = cachedState;

  try {
    let accessToken, refreshToken, username, profileImageUrl, expiresAt;

    if (platform === 'twitter') {
      const basicAuth = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');
      
      const tokenRes = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          code: code.toString(),
          grant_type: 'authorization_code',
          client_id: process.env.TWITTER_CLIENT_ID,
          redirect_uri: process.env.TWITTER_REDIRECT_URI || 'http://localhost:5000/api/authIntegrations/twitter/callback',
          code_verifier: code_verifier
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`
          }
        }
      );

      accessToken = tokenRes.data.access_token;
      refreshToken = tokenRes.data.refresh_token;
      if (tokenRes.data.expires_in) {
         expiresAt = new Date(Date.now() + tokenRes.data.expires_in * 1000);
      }

      // Fetch user profile
      const userRes = await axios.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      username = userRes.data.data.username;
      profileImageUrl = userRes.data.data.profile_image_url;
    }

    else if (platform === 'youtube') {
      const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5000/api/authIntegrations/youtube/callback'
      );

      const { tokens } = await oauth2Client.getToken(code.toString());
      accessToken = tokens.access_token;
      refreshToken = tokens.refresh_token; 
      if (tokens.expiry_date) {
         expiresAt = new Date(tokens.expiry_date);
      }

      oauth2Client.setCredentials(tokens);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
      const channelRes = await youtube.channels.list({ part: 'snippet', mine: true });
      
      if (channelRes.data.items && channelRes.data.items.length > 0) {
        const channel = channelRes.data.items[0];
        username = channel.snippet.title;
        profileImageUrl = channel.snippet.thumbnails?.default?.url;
      } else {
        username = 'YouTube User';
      }
    }

    else if (platform === 'reddit') {
      const basicAuth = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64');
      
      const tokenRes = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code.toString(),
          redirect_uri: process.env.REDDIT_REDIRECT_URI || 'http://localhost:5000/api/authIntegrations/reddit/callback'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`,
            'User-Agent': 'SocialOps/1.0.0 by YourApp' // Reddit requires a unique User-Agent
          }
        }
      );

      accessToken = tokenRes.data.access_token;
      refreshToken = tokenRes.data.refresh_token;
      if (tokenRes.data.expires_in) {
         expiresAt = new Date(Date.now() + tokenRes.data.expires_in * 1000);
      }

      const userRes = await axios.get('https://oauth.reddit.com/api/v1/me', {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'SocialOps/1.0.0 by YourApp'
        }
      });
      username = userRes.data.name;
      // Reddit icon_img can contain query params which we can strip if needed, but it's fine as is
      profileImageUrl = userRes.data.icon_img?.split('?')[0]; 
    }

    // Save to database
    await ConnectedAccount.findOneAndUpdate(
      { userId, platform },
      {
        userId,
        platform,
        username,
        profileImageUrl,
        accessToken,
        refreshToken,
        expiresAt,
        connectedAt: Date.now()
      },
      { upsert: true, new: true }
    );

    res.redirect('http://localhost:3000/?integration=success');

  } catch (error) {
    console.error(`Callback error for ${platform}:`, error.response?.data || error.message);
    res.redirect('http://localhost:3000/?integration=error');
  }
});

module.exports = router;
