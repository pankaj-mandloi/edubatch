const Notice = require('../models/Notice');
const Batch = require('../models/Batch');
const Enrollment = require('../models/Enrollment');
const { validateNotice } = require('../middleware/validation');

// @desc    Create a notice
// @route   POST /api/v1/notices
// @access  Teacher/Admin
const createNotice = async (req, res, next) => {
  try {
    const { error } = validateNotice(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { title, body, batchId, pinned } = req.body;

    // If batchId is provided, check if batch exists and user has access
    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Teacher can only post to their batches
      if (req.userRole === 'teacher' && batch.teacher.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only post notices to your batches'
        });
      }
    }

    // Create notice
    const notice = await Notice.create({
      title,
      body,
      batch: batchId || null,
      createdBy: req.userId,
      pinned: pinned || false
    });

    // Populate createdBy
    await notice.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notices
// @route   GET /api/v1/notices
// @access  Private
const getNotices = async (req, res, next) => {
  try {
    const { batchId } = req.query;

    let filter = { isActive: true };

    // If batchId provided, filter by batch
    if (batchId) {
      filter.batch = batchId;
    } else {
      // If no batch specified, get global notices + batch-specific notices for user's batches
      if (req.userRole === 'student') {
        // Get student's enrolled batches
        const enrollments = await Enrollment.find({
          student: req.userId,
          isActive: true
        }).select('batch');
        const batchIds = enrollments.map(e => e.batch);
        filter = {
          isActive: true,
          $or: [
            { batch: null }, // Global notices
            { batch: { $in: batchIds } } // Batch-specific notices
          ]
        };
      } else if (req.userRole === 'teacher') {
        // Get teacher's assigned batches
        const batches = await Batch.find({ teacher: req.userId }).select('_id');
        const batchIds = batches.map(b => b._id);
        filter = {
          isActive: true,
          $or: [
            { batch: null },
            { batch: { $in: batchIds } }
          ]
        };
      }
      // Admin sees all notices
    }

    const notices = await Notice.find(filter)
      .populate('createdBy', 'name')
      .populate('batch', 'name subject')
      .sort({ pinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notice by ID
// @route   GET /api/v1/notices/:id
// @access  Private
const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('batch', 'name subject');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check access
    if (req.userRole === 'student' && notice.batch) {
      const enrollment = await Enrollment.findOne({
        student: req.userId,
        batch: notice.batch._id,
        isActive: true
      });
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this notice'
        });
      }
    }

    if (req.userRole === 'teacher' && notice.batch) {
      const batch = await Batch.findById(notice.batch._id);
      if (batch && batch.teacher.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this notice'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }
    next(error);
  }
};

// @desc    Update notice
// @route   PUT /api/v1/notices/:id
// @access  Teacher/Admin (only their own notices)
const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if user created this notice
    if (notice.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own notices'
      });
    }

    // If batch is being updated, validate access
    if (req.body.batchId) {
      const batch = await Batch.findById(req.body.batchId);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }
      if (req.userRole === 'teacher' && batch.teacher.toString() !== req.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only post notices to your batches'
        });
      }
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        body: req.body.body,
        batch: req.body.batchId || null,
        pinned: req.body.pinned !== undefined ? req.body.pinned : notice.pinned
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      data: updatedNotice
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }
    next(error);
  }
};

// @desc    Delete notice
// @route   DELETE /api/v1/notices/:id
// @access  Teacher/Admin (only their own notices)
const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    // Check if user created this notice
    if (notice.createdBy.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own notices'
      });
    }

    // Soft delete
    notice.isActive = false;
    await notice.save();

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }
    next(error);
  }
};

module.exports = {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice
};