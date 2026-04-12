const express = require('express');
const { getQueue, getDrafts, getTrending, deletePost, reschedulePost } = require('../controllers/schedulerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/queue', protect, getQueue);
router.get('/drafts', protect, getDrafts);
router.get('/trending', protect, getTrending);
router.delete('/posts/:id', protect, deletePost);
router.patch('/posts/:id/reschedule', protect, reschedulePost);

module.exports = router;
