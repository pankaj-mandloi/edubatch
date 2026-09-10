const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  getUsers,
  getUserById,
  updateProfile,
  changePassword,
  updateUserRole,
  toggleUserStatus,
  getDashboardStats,
  getUpcomingClasses,
  getRevenueChart
} = require('../controllers/userController');

// All routes require authentication
router.use(auth);

// Dashboard stats (role-based)
router.get('/dashboard', getDashboardStats);
router.get('/upcoming-classes', getUpcomingClasses);        
router.get('/revenue-chart', roleCheck('admin'), getRevenueChart);  

// Profile routes
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Admin only routes
router.get('/', roleCheck('admin'), getUsers);
router.get('/:id', roleCheck('admin'), getUserById);
router.put('/:id/role', roleCheck('admin'), updateUserRole);
router.patch('/:id/toggle-status', roleCheck('admin'), toggleUserStatus);

module.exports = router;