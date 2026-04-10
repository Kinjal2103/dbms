const ConnectedAccount = require('../models/ConnectedAccount');

exports.getConnectedAccounts = async (req, res) => {
  try {
    const accounts = await ConnectedAccount.find({ userId: req.user._id });
    res.json(accounts.map(acc => ({ platform: acc.platform, username: acc.username })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.connectAccount = async (req, res) => {
  res.status(400).json({ message: 'Please use the /api/auth/:platform/url OAuth flow instead.' });
};

exports.disconnectAccount = async (req, res) => {
  try {
    const { platform } = req.params;
    await ConnectedAccount.findOneAndDelete({ userId: req.user._id, platform });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
