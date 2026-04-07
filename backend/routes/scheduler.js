const express = require('express');
const { getTimeline, getDrafts, getHealth } = require('../controllers/schedulerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/timeline', protect, getTimeline);
router.get('/drafts', protect, getDrafts);
router.get('/health', protect, getHealth);

module.exports = router;
