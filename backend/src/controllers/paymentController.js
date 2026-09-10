const crypto = require('crypto');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Batch = require('../models/Batch');
const User = require('../models/User');
const razorpayInstance = require('../config/razorpay');
const { validatePaymentVerification } = require('../middleware/validation');
const { sendPaymentReceipt } = require('../services/emailService');

const createOrder = async (req, res, next) => {
  try {
    const { enrollmentId } = req.body;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID is required'
      });
    }

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student', 'name email')
      .populate('batch', 'name fee');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.student._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay for your own enrollments'
      });
    }

    if (enrollment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This enrollment is already paid'
      });
    }

    if (!enrollment.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is inactive'
      });
    }

    await Payment.deleteMany({
      enrollment: enrollmentId,
      status: 'created'
    });

    const amount = enrollment.batch.fee;
    const receipt = `receipt_${Date.now()}_${enrollment._id}`;

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: receipt,
      notes: {
        enrollmentId: enrollment._id.toString(),
        studentId: req.userId.toString(),
        batchId: enrollment.batch._id.toString()
      }
    };

    const order = await razorpayInstance.orders.create(options);

    const payment = await Payment.create({
      enrollment: enrollmentId,
      student: req.userId,
      amount: amount,
      razorpayOrderId: order.id,
      status: 'created',
      receipt: receipt
    });

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

    const payment = await Payment.findOne({ razorpayOrderId: orderId })
      .populate('student', 'name email')
      .populate('enrollment');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already verified'
      });
    }

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

    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    const enrollment = await Enrollment.findById(enrollmentId);
    if (enrollment) {
      enrollment.paymentStatus = 'paid';
      enrollment.payment = payment._id;
      await enrollment.save();
    }

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

const getPaymentHistory = async (req, res, next) => {
  try {
    let filter = {};

    if (req.userRole === 'student') {
      filter.student = req.userId;
    }

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

const webhook = async (req, res, next) => {
  try {
    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const paymentId = payload.payment.entity.id;
      const orderId = payload.payment.entity.order_id;

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== 'paid') {
        payment.razorpayPaymentId = paymentId;
        payment.status = 'paid';
        payment.paidAt = new Date();
        await payment.save();

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
    res.status(200).json({ received: true });
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