const mongoose = require('mongoose');

const connectedAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['twitter', 'youtube', 'reddit'],
    required: true
  },
  username: {
    type: String,
    required: true
  },
  profileImageUrl: {
    type: String
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  expiresAt: {
    type: Date
  },
  connectedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ConnectedAccount', connectedAccountSchema);
