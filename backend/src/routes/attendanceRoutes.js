const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  markAttendance,
  getBatchAttendance,
  getMyAttendance,
  getStudentAttendance
} = require('../controllers/attendanceController');

// All routes require authentication
router.use(auth);

// Mark attendance (Teacher/Admin)
router.post('/', roleCheck('teacher', 'admin'), markAttendance);

// Get attendance for a batch
router.get('/batch/:batchId', getBatchAttendance);

// Get my attendance summary (Student)
router.get('/my', roleCheck('student'), getMyAttendance);

// Get attendance for a specific student in a batch (Admin/Teacher)
router.get('/student/:studentId/batch/:batchId', roleCheck('admin', 'teacher'), getStudentAttendance);

module.exports = router;