const Enrollment = require('../models/Enrollment');
const Batch = require('../models/Batch');
const User = require('../models/User');
const { validateEnrollment } = require('../middleware/validation');
const { sendEnrollmentConfirmation } = require('../services/emailService');

// @desc    Enroll student in a batch
// @route   POST /api/v1/enrollments
// @access  Admin only
const createEnrollment = async (req, res, next) => {
  try {
    const { error } = validateEnrollment(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { studentId, batchId } = req.body;

    // Check if student exists and is a student
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if batch is active or upcoming
    if (batch.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in archived batch'
      });
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      batch: batchId,
      isActive: true
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this batch'
      });
    }

    // Check capacity
    const enrolledCount = await Enrollment.countDocuments({
      batch: batchId,
      isActive: true
    });

    if (enrolledCount >= batch.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Batch capacity is full',
        capacity: batch.capacity,
        enrolled: enrolledCount
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      batch: batchId,
      paymentStatus: 'pending'
    });

    // Populate the enrollment
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('student', 'name email')
      .populate('batch', 'name subject fee schedule');

    // Send enrollment confirmation email
    try {
      await sendEnrollmentConfirmation(
        student.email,
        student.name,
        {
          batchName: batch.name,
          subject: batch.subject,
          schedule: `${batch.schedule.days.join(', ')} ${batch.schedule.startTime} - ${batch.schedule.endTime}`,
          fee: batch.fee
        }
      );
    } catch (emailError) {
      console.log('Enrollment email not sent:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: populatedEnrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enrollments (role filtered)
// @route   GET /api/v1/enrollments
// @access  Private
const getEnrollments = async (req, res, next) => {
  try {
    let filter = { isActive: true };

    // Student can only see their enrollments
    if (req.userRole === 'student') {
      filter.student = req.userId;
    }

    // Teacher can see enrollments for their batches
    if (req.userRole === 'teacher') {
      const teacherBatches = await Batch.find({ teacher: req.userId }).select('_id');
      const batchIds = teacherBatches.map(b => b._id);
      filter.batch = { $in: batchIds };
    }

    const enrollments = await Enrollment.find(filter)
      .populate('student', 'name email phone')
      .populate('batch', 'name subject fee schedule status')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my enrollments (student)
// @route   GET /api/v1/enrollments/my
// @access  Student only
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.userId,
      isActive: true
    })
      .populate('batch', 'name subject fee schedule status')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrollments for a batch
// @route   GET /api/v1/enrollments/batch/:batchId
// @access  Admin/Teacher
const getBatchEnrollments = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Teacher can only see their batches
    if (req.userRole === 'teacher' && batch.teacher.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view enrollments for your batches'
      });
    }

    const enrollments = await Enrollment.find({
      batch: batchId,
      isActive: true
    })
      .populate('student', 'name email phone')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }
    next(error);
  }
};

// @desc    Deactivate enrollment (remove student)
// @route   DELETE /api/v1/enrollments/:id
// @access  Admin only
const deactivateEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Check if payment is pending
    if (enrollment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate enrollment with paid status. Please process refund first.'
      });
    }

    enrollment.isActive = false;
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Enrollment deactivated successfully'
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

module.exports = {
  createEnrollment,
  getEnrollments,
  getMyEnrollments,
  getBatchEnrollments,
  deactivateEnrollment
};