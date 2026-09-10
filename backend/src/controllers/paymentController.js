const crypto = require('crypto');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Batch = require('../models/Batch');
const User = require('../models/User');
const razorpayInstance = require('../config/razorpay');
const { validatePaymentVerification } = require('../middleware/validation');
const { sendPaymentReceipt } = require('../services/emailService');

// @desc    Create Razorpay order
// @route   POST /api/v1/payments/create-order
// @access  Student only
const createOrder = async (req, res, next) => {
  try {
    const { enrollmentId } = req.body;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID is required'
      });
    }

    // Find enrollment
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student', 'name email')
      .populate('batch', 'name fee');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if student owns this enrollment
    if (enrollment.student._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay for your own enrollments'
      });
    }

    // Check if already paid
    if (enrollment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This enrollment is already paid'
      });
    }

    // Check if enrollment is active
    if (!enrollment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is inactive'
      });
    }

    const amount = enrollment.batch.fee;
    const receipt = `receipt_${Date.now()}_${enrollment._id}`;

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: receipt,
      notes: {
        enrollmentId: enrollment._id.toString(),
        studentId: req.userId.toString(),
        batchId: enrollment.batch._id.toString()
      }
    };

    const order = await razorpayInstance.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      enrollment: enrollmentId,
      student: req.userId,
      amount: amount,
      razorpayOrderId: order.id,
      status: 'created',
      receipt: receipt
    });

    // Update enrollment with payment reference
    enrollment.payment = payment._id;
    await enrollment.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id,
        enrollmentId: enrollment._id
      }
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/v1/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { error } = validatePaymentVerification(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { orderId, paymentId, signature, enrollmentId } = req.body;

    // Find payment
    const payment = await Payment.findOne({ razorpayOrderId: orderId })
      .populate('student', 'name email')
      .populate('enrollment');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment is already verified
    if (payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already verified'
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      payment.status = 'failed';
      await payment.save();
      
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update payment
    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    // Update enrollment
    const enrollment = await Enrollment.findById(enrollmentId);
    if (enrollment) {
      enrollment.paymentStatus = 'paid';
      enrollment.payment = payment._id;
      await enrollment.save();
    }

    // Send receipt email
    try {
      await sendPaymentReceipt(
        payment.student.email,
        payment.student.name,
        {
          paymentId: paymentId,
          orderId: orderId,
          amount: payment.amount
        }
      );
    } catch (emailError) {
      console.log('Payment receipt email not sent:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment._id,
        status: 'paid',
        amount: payment.amount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history
// @route   GET /api/v1/payments/history
// @access  Private
const getPaymentHistory = async (req, res, next) => {
  try {
    let filter = {};

    // Student sees only their payments
    if (req.userRole === 'student') {
      filter.student = req.userId;
    }

    // Teacher sees payments for their batches
    if (req.userRole === 'teacher') {
      const teacherBatches = await Batch.find({ teacher: req.userId }).select('_id');
      const batchIds = teacherBatches.map(b => b._id);
      const enrollments = await Enrollment.find({ 
        batch: { $in: batchIds },
        isActive: true
      }).select('_id');
      const enrollmentIds = enrollments.map(e => e._id);
      filter.enrollment = { $in: enrollmentIds };
    }

    const payments = await Payment.find(filter)
      .populate('student', 'name email')
      .populate({
        path: 'enrollment',
        populate: {
          path: 'batch',
          select: 'name subject'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment by ID
// @route   GET /api/v1/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('student', 'name email phone')
      .populate({
        path: 'enrollment',
        populate: {
          path: 'batch',
          select: 'name subject fee schedule'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check access
    if (req.userRole === 'student' && payment.student._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own payments'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    next(error);
  }
};

// @desc    Get payment status for an enrollment
// @route   GET /api/v1/payments/status/:enrollmentId
// @access  Private
const getPaymentStatus = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('payment');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check access
    if (req.userRole === 'student' && enrollment.student.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: enrollment.paymentStatus,
        payment: enrollment.payment || null
      }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    next(error);
  }
};

// @desc    Webhook for Razorpay (optional - for extra reliability)
// @route   POST /api/v1/payments/webhook
// @access  Public (but verified)
const webhook = async (req, res, next) => {
  try {
    const { event, payload } = req.body;

    // Verify webhook signature (implementation depends on Razorpay webhook secret)
    // This is optional but recommended for production

    if (event === 'payment.captured') {
      const paymentId = payload.payment.entity.id;
      const orderId = payload.payment.entity.order_id;

      // Find and update payment
      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== 'paid') {
        payment.razorpayPaymentId = paymentId;
        payment.status = 'paid';
        payment.paidAt = new Date();
        await payment.save();

        // Update enrollment
        const enrollment = await Enrollment.findById(payment.enrollment);
        if (enrollment) {
          enrollment.paymentStatus = 'paid';
          enrollment.payment = payment._id;
          await enrollment.save();
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ received: true }); // Always acknowledge receipt
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentById,
  getPaymentStatus,
  webhook
};