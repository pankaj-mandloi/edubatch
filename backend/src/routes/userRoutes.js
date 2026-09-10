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
  getDashboardStats
} = require('../controllers/userController');

// All routes require authentication
router.use(auth);

// Dashboard stats (role-based)
router.get('/dashboard', getDashboardStats);

// Profile routes
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Admin only routes
router.get('/', roleCheck('admin'), getUsers);
router.get('/:id', roleCheck('admin'), getUserById);
router.put('/:id/role', roleCheck('admin'), updateUserRole);
router.patch('/:id/toggle-status', roleCheck('admin'), toggleUserStatus);

module.exports = router;