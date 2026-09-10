const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');

// All routes require authentication
router.use(auth);

// Get all notices
router.get('/', getNotices);

// Get single notice
router.get('/:id', getNoticeById);

// Teacher/Admin only routes
router.post('/', roleCheck('teacher', 'admin'), createNotice);
router.put('/:id', roleCheck('teacher', 'admin'), updateNotice);
router.delete('/:id', roleCheck('teacher', 'admin'), deleteNotice);

module.exports = router;