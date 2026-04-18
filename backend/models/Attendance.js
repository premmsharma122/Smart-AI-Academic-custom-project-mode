const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  remarks: String,
  semester: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique attendance per student per subject per date
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

// Virtual for attendance percentage
attendanceSchema.virtual('attendancePercentage').get(function() {
  // This would be calculated in aggregation
  return 0;
});

module.exports = mongoose.model('Attendance', attendanceSchema);