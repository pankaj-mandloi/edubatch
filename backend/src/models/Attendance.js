const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: [true, 'Status is required']
  },
  // Optional: Add remarks
  remarks: {
    type: String,
    trim: true,
    maxlength: [100, 'Remarks cannot exceed 100 characters']
  }
});

const attendanceSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    set: function(date) {
      if (date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      }
      return date;
    }
  },
  records: {
    type: [attendanceRecordSchema],
    validate: {
      validator: function(records) {
        return records && records.length > 0;
      },
      message: 'At least one attendance record is required'
    }
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Marked by is required']
  }
}, {
  timestamps: true
});

// ✅ FIXED: Ensure only one attendance record per batch per day
attendanceSchema.index({ batch: 1, date: 1 }, { unique: true });

// ✅ FIXED: Add index for faster queries
attendanceSchema.index({ batch: 1, 'records.student': 1 });

// Virtual for getting attendance percentage for a student
attendanceSchema.methods.getStudentAttendance = function(studentId) {
  const record = this.records.find(
    r => r.student.toString() === studentId.toString()
  );
  return record ? record.status : null;
};

// Static method to get attendance summary for a student in a batch
attendanceSchema.statics.getStudentSummary = async function(batchId, studentId) {
  const records = await this.find({ batch: batchId });
  
  let totalDays = 0;
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;

  records.forEach(record => {
    const studentRecord = record.records.find(
      r => r.student.toString() === studentId.toString()
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
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100
  };
};

module.exports = mongoose.model('Attendance', attendanceSchema);