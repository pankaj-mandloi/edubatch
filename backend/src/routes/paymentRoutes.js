const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
  getPaymentStatus,
  webhook
} = require('../controllers/paymentController');

// Webhook - public (no auth)
router.post('/webhook', webhook);

// All other routes require authentication
router.use(auth);

// Payment flow
router.post('/create-order', roleCheck('student'), createOrder);
router.post('/verify', verifyPayment);

// Get payment history and status
router.get('/history', getPaymentHistory);
router.get('/:id', getPaymentById);
router.get('/status/:enrollmentId', getPaymentStatus);

module.exports = router;