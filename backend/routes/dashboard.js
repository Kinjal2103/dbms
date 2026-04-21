const express = require('express');
const { getStats, applyInsight, refreshInsights } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getStats);
router.post('/apply-insight', protect, applyInsight);
router.post('/refresh-insights', protect, refreshInsights);

module.exports = router;
