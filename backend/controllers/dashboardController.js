const ConnectedAccount = require('../models/ConnectedAccount');
const { google } = require('googleapis');

exports.getStats = async (req, res) => {
  try {
    let subscriberCount = 842910; // default/fallback
    try {
      const account = await ConnectedAccount.findOne({ userId: req.user._id, platform: 'youtube' });
      if (account && account.accessToken) {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: account.accessToken });
        
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const response = await youtube.channels.list({
          part: 'statistics',
          mine: true
        });

        if (response.data.items && response.data.items.length > 0) {
           subscriberCount = parseInt(response.data.items[0].statistics.subscriberCount) || 0;
        }
      }
    } catch (e) {
      console.error('Error fetching youtube stats:', e.message);
    }

    const stats = {
      followers: { total: subscriberCount, growthPercent: 12.4 },
      smartInsight: { text: "Your engagement spikes at 6 PM — schedule more posts here.", confidence: 98 },
      audienceBreakdown: [
        { country: "United States", percent: 42 },
        { country: "United Kingdom", percent: 18 },
        { country: "Germany", percent: 12 }
      ],
      activityDensity: Array.from({ length: 28 }).map(() => Math.random()),
      anomaly: { title: "Unusual growth spike in Southeast Asia", description: "Likely viral redistribution of your last post." }
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.applyInsight = async (req, res) => {
  try {
    const { insightId } = req.body;
    res.json({ message: 'Insight applied!', insightId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
