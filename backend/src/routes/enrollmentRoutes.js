const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createEnrollment,
  getEnrollments,
  getMyEnrollments,
  getBatchEnrollments,
  deactivateEnrollment
} = require('../controllers/enrollmentController');

// All routes require authentication
router.use(auth);

// Get all enrollments (role filtered)
router.get('/', getEnrollments);

// Get my enrollments (student)
router.get('/my', roleCheck('student'), getMyEnrollments);

// Get batch enrollments
router.get('/batch/:batchId', getBatchEnrollments);

// Admin only routes
router.post('/', roleCheck('admin'), createEnrollment);
router.delete('/:id', roleCheck('admin'), deactivateEnrollment);

module.exports = router;