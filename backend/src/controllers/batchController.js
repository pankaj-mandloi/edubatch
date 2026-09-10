const Batch = require('../models/Batch');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { validateBatch } = require('../middleware/validation');

// @desc    Create a new batch
// @route   POST /api/v1/batches
// @access  Admin only
const createBatch = async (req, res, next) => {
  try {
    const { error } = validateBatch(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { teacher, ...batchData } = req.body;

    // Check if teacher exists and is a teacher
    const teacherExists = await User.findOne({ _id: teacher, role: 'teacher' });
    if (!teacherExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher. Please assign a valid teacher.'
      });
    }

    // Create batch
    const batch = await Batch.create({
      ...batchData,
      teacher,
      createdBy: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: batch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all batches with filters
// @route   GET /api/v1/batches
// @access  Private (All authenticated users)
const getBatches = async (req, res, next) => {
  try {
    const { status, teacher } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (teacher) filter.teacher = teacher;

    // If user is teacher, only show their batches
    if (req.userRole === 'teacher') {
      filter.teacher = req.userId;
    }

    // If user is student, show active batches they can enroll in
    if (req.userRole === 'student') {
      filter.status = 'active';
    }

    const batches = await Batch.find(filter)
      .populate('teacher', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Get enrolled count for each batch
    const batchesWithCount = await Promise.all(batches.map(async (batch) => {
      const enrolledCount = await Enrollment.countDocuments({
        batch: batch._id,
        isActive: true
      });
      return {
        ...batch.toJSON(),
        enrolledCount,
        availableSeats: batch.capacity - enrolledCount
      };
    }));

    res.status(200).json({
      success: true,
      count: batchesWithCount.length,
      data: batchesWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single batch by ID
// @route   GET /api/v1/batches/:id
// @access  Private (All authenticated users)
const getBatchById = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('teacher', 'name email phone')
      .populate('createdBy', 'name');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check access for teacher
    if (req.userRole === 'teacher' && batch.teacher._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your assigned batches'
      });
    }

    // Get enrolled students
    const enrollments = await Enrollment.find({ 
      batch: batch._id, 
      isActive: true 
    }).populate('student', 'name email phone');

    const enrolledCount = enrollments.length;

    res.status(200).json({
      success: true,
      data: {
        ...batch.toJSON(),
        enrolledCount,
        availableSeats: batch.capacity - enrolledCount,
        students: enrollments.map(e => e.student)
      }
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

// @desc    Update batch
// @route   PUT /api/v1/batches/:id
// @access  Admin only
const updateBatch = async (req, res, next) => {
  try {
    let batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if trying to change teacher
    if (req.body.teacher && req.body.teacher !== batch.teacher.toString()) {
      const teacherExists = await User.findOne({ _id: req.body.teacher, role: 'teacher' });
      if (!teacherExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher. Please assign a valid teacher.'
        });
      }
    }

    // Update batch
    batch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('teacher', 'name email');

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: batch
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

// @desc    Change batch status
// @route   PATCH /api/v1/batches/:id/status
// @access  Admin only
const changeBatchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['upcoming', 'active', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status: upcoming, active, or archived'
      });
    }

    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('teacher', 'name email');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Batch status updated to ${status}`,
      data: batch
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

// @desc    Delete/Archive batch (soft delete)
// @route   DELETE /api/v1/batches/:id
// @access  Admin only
const deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if batch has active enrollments
    const activeEnrollments = await Enrollment.countDocuments({
      batch: batch._id,
      isActive: true
    });

    if (activeEnrollments > 0) {
      // Soft delete - archive instead
      batch.status = 'archived';
      await batch.save();
      return res.status(200).json({
        success: true,
        message: 'Batch archived successfully (had active enrollments)',
        data: batch
      });
    }

    // Hard delete if no enrollments
    await batch.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully'
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

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  changeBatchStatus,
  deleteBatch
};