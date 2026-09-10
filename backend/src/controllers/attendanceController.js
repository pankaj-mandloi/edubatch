const Attendance = require('../models/Attendance');
const Batch = require('../models/Batch');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { validateAttendance } = require('../middleware/validation');

// @desc    Mark attendance for a batch
// @route   POST /api/v1/attendance
// @access  Teacher/Admin
const markAttendance = async (req, res, next) => {
  try {
    const { error } = validateAttendance(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { batchId, date, records } = req.body;

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Teacher can only mark attendance for their batches
    if (req.userRole === 'teacher' && batch.teacher.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark attendance for your batches'
      });
    }

    // Check if batch is active
    if (batch.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark attendance for archived batch'
      });
    }

    // Validate that all students are enrolled in this batch
    const studentIds = records.map(r => r.student);
    const enrollments = await Enrollment.find({
      batch: batchId,
      student: { $in: studentIds },
      isActive: true
    });

    const enrolledStudentIds = enrollments.map(e => e.student.toString());
    const invalidStudents = studentIds.filter(id => !enrolledStudentIds.includes(id));

    if (invalidStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some students are not enrolled in this batch',
        invalidStudents
      });
    }

    // Check if attendance already exists for this date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    let attendance = await Attendance.findOne({
      batch: batchId,
      date: attendanceDate
    });

    if (attendance) {
      // Update existing attendance
      attendance.records = records;
      attendance.markedBy = req.userId;
      await attendance.save();
    } else {
      // Create new attendance
      attendance = await Attendance.create({
        batch: batchId,
        date: attendanceDate,
        records,
        markedBy: req.userId
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a batch
// @route   GET /api/v1/attendance/batch/:batchId
// @access  Private
const getBatchAttendance = async (req, res, next) => {
  try {
    const { batchId } = req.params;
    const { startDate, endDate } = req.query;

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check access
    if (req.userRole === 'teacher' && batch.teacher.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view attendance for your batches'
      });
    }

    if (req.userRole === 'student') {
      // Student can only view attendance for batches they're enrolled in
      const enrollment = await Enrollment.findOne({
        student: req.userId,
        batch: batchId,
        isActive: true
      });
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this batch'
        });
      }
    }

    // Build date filter
    const filter = { batch: batchId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
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

// @desc    Get my attendance summary (student)
// @route   GET /api/v1/attendance/my
// @access  Student only
const getMyAttendance = async (req, res, next) => {
  try {
    // Get all enrollments for the student
    const enrollments = await Enrollment.find({
      student: req.userId,
      isActive: true
    }).populate('batch', 'name subject');

    const attendanceSummary = await Promise.all(enrollments.map(async (enrollment) => {
      const attendanceRecords = await Attendance.find({
        batch: enrollment.batch._id
      });

      let totalDays = 0;
      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;

      attendanceRecords.forEach(record => {
        const studentRecord = record.records.find(
          r => r.student.toString() === req.userId.toString()
        );
        if (studentRecord) {
          totalDays++;
          if (studentRecord.status === 'present') presentDays++;
          else if (studentRecord.status === 'absent') absentDays++;
          else if (studentRecord.status === 'late') lateDays++;
        }
      });

      const attendancePercentage = totalDays > 0 
        ? ((presentDays + lateDays * 0.5) / totalDays) * 100 
        : 0;

      return {
        batch: enrollment.batch,
        summary: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100
        }
      };
    }));

    res.status(200).json({
      success: true,
      data: attendanceSummary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a student in a batch
// @route   GET /api/v1/attendance/student/:studentId/batch/:batchId
// @access  Admin/Teacher
const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId, batchId } = req.params;

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
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

    // Check access
    if (req.userRole === 'teacher' && batch.teacher.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view attendance for your batches'
      });
    }

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      student: studentId,
      batch: batchId,
      isActive: true
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Student is not enrolled in this batch'
      });
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find({
      batch: batchId
    }).sort({ date: -1 });

    const studentAttendance = attendanceRecords.map(record => {
      const studentRecord = record.records.find(
        r => r.student.toString() === studentId
      );
      return {
        date: record.date,
        status: studentRecord ? studentRecord.status : 'not marked'
      };
    });

    const totalDays = studentAttendance.filter(a => a.status !== 'not marked').length;
    const presentDays = studentAttendance.filter(a => a.status === 'present').length;
    const absentDays = studentAttendance.filter(a => a.status === 'absent').length;
    const lateDays = studentAttendance.filter(a => a.status === 'late').length;

    const attendancePercentage = totalDays > 0 
      ? ((presentDays + lateDays * 0.5) / totalDays) * 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email
        },
        batch: {
          id: batch._id,
          name: batch.name
        },
        summary: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100
        },
        records: studentAttendance
      }
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Student or Batch not found'
      });
    }
    next(error);
  }
};

module.exports = {
  markAttendance,
  getBatchAttendance,
  getMyAttendance,
  getStudentAttendance
};