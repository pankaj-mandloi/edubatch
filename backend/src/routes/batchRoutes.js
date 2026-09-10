const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  changeBatchStatus,
  deleteBatch
} = require('../controllers/batchController');

// All routes require authentication
router.use(auth);

// GET all batches (filtered by role)
router.get('/', getBatches);

// GET single batch
router.get('/:id', getBatchById);

// Admin only routes
router.post('/', roleCheck('admin'), createBatch);
router.put('/:id', roleCheck('admin'), updateBatch);
router.patch('/:id/status', roleCheck('admin'), changeBatchStatus);
router.delete('/:id', roleCheck('admin'), deleteBatch);

module.exports = router;