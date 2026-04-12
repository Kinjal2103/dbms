const express = require('express');
const { getOverview, getGrowth, getFull, exportReport, shareReport } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/overview', protect, getOverview);
router.get('/growth', protect, getGrowth);
router.get('/full', protect, getFull);

router.post('/export', protect, exportReport);
router.post('/share', protect, shareReport);

module.exports = router;
