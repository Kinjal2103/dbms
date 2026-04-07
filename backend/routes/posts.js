const express = require('express');
const multer = require('multer');
const path = require('path');
const { getRecentPosts, createPost, uploadMedia, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.get('/recent', protect, getRecentPosts);
router.post('/', protect, createPost);
router.post('/upload-media', protect, upload.single('media'), uploadMedia);
router.delete('/:id', protect, deletePost);

module.exports = router;
