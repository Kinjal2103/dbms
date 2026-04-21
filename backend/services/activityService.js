const logActivity = async (userId, type, metadata = {}) => {
  console.log(`[ACTIVITY] User ${userId} | ${type} | ${JSON.stringify(metadata)}`);
  // In a full implementation, you would save this to an Activity model in MongoDB
};

module.exports = {
  logActivity
};
