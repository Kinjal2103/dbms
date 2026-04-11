const mongoose = require('mongoose');

const connectedAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['instagram', 'twitter', 'linkedin', 'tiktok'],
    required: true
  },
  username: {
    type: String,
    required: true
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  connected: {
    type: Boolean,
    default: false
  },
  followers: {
    type: Number,
    default: 0
  },
  connectedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ConnectedAccount', connectedAccountSchema);
