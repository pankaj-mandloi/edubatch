const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Private routes
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

module.exports = router;