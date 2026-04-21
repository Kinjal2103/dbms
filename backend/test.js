const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const AnalyticsData = require('./models/AnalyticsData');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/socialops')
  .then(async () => {
    const data = await AnalyticsData.findOne();
    console.log(JSON.stringify(data, null, 2));

    const { mapToLegacyPayload } = require('./controllers/analyticsController'); // wait, it's not exported.
    process.exit(0);
  });
