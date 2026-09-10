const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Batch = require('../models/Batch');
const Payment = require('../models/Payment'); // ✅ FIXED: Added Payment import
const { validateProfile, validatePassword } = require('../middleware/validation');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Admin only
const getUsers = async (req, res, next) => {
  try {
    const { role, isActive } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Admin only
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { error } = validateProfile(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, avatar },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/v1/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { error } = validatePassword(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.userId).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.refreshToken = undefined; // Invalidate all refresh tokens
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/v1/users/:id/role
// @access  Admin only
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!role || !['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role: admin, teacher, or student'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    next(error);
  }
};

// @desc    Toggle user status (activate/deactivate)
// @route   PATCH /api/v1/users/:id/toggle-status
// @access  Admin only
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating yourself
    if (user._id.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/v1/users/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    let stats = {};

    if (req.userRole === 'admin') {
      // Admin stats
      const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
      const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
      const totalBatches = await Batch.countDocuments({ status: { $ne: 'archived' } });
      const activeBatches = await Batch.countDocuments({ status: 'active' });
      
      // ✅ FIXED: Payment is now imported
      const paidPayments = await Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalRevenue = paidPayments.length > 0 ? paidPayments[0].total : 0;

      // Pending fees
      const pendingEnrollments = await Enrollment.countDocuments({ 
        paymentStatus: 'pending',
        isActive: true 
      });

      stats = {
        totalStudents,
        totalTeachers,
        totalBatches,
        activeBatches,
        totalRevenue,
        pendingFees: pendingEnrollments
      };
    } else if (req.userRole === 'teacher') {
      // Teacher stats
      const assignedBatches = await Batch.countDocuments({ 
        teacher: req.userId,
        status: { $ne: 'archived' }
      });
      
      const activeBatches = await Batch.countDocuments({ 
        teacher: req.userId,
        status: 'active'
      });

      // Get total students in teacher's batches
      const teacherBatches = await Batch.find({ teacher: req.userId }).select('_id');
      const batchIds = teacherBatches.map(b => b._id);
      const totalStudents = await Enrollment.countDocuments({
        batch: { $in: batchIds },
        isActive: true
      });

      stats = {
        assignedBatches,
        activeBatches,
        totalStudents
      };
    } else if (req.userRole === 'student') {
      // Student stats
      const enrolledBatches = await Enrollment.countDocuments({
        student: req.userId,
        isActive: true
      });
      
      const paidBatches = await Enrollment.countDocuments({
        student: req.userId,
        paymentStatus: 'paid',
        isActive: true
      });

      const pendingBatches = await Enrollment.countDocuments({
        student: req.userId,
        paymentStatus: 'pending',
        isActive: true
      });

      stats = {
        enrolledBatches,
        paidBatches,
        pendingBatches
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateProfile,
  changePassword,
  updateUserRole,
  toggleUserStatus,
  getDashboardStats
};