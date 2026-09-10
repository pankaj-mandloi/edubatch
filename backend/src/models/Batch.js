const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide batch name'],
    trim: true,
    maxlength: [100, 'Batch name cannot exceed 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Please provide subject'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  schedule: {
    days: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide capacity'],
    min: [1, 'Capacity must be at least 1'],
    max: [200, 'Capacity cannot exceed 200']
  },
  fee: {
    type: Number,
    required: [true, 'Please provide fee amount'],
    min: [0, 'Fee cannot be negative']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a teacher']
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'archived'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for enrolled count
batchSchema.virtual('enrolledCount', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'batch',
  count: true,
  match: { isActive: true }
});

// ✅ FIXED: Unique days (no next parameter)
batchSchema.pre('save', function() {
  if (this.schedule && this.schedule.days) {
    this.schedule.days = [...new Set(this.schedule.days)];
  }
});

batchSchema.set('toJSON', { virtuals: true });
batchSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Batch', batchSchema);