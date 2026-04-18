const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: [true, 'Please add a student ID'],
    unique: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  batch: {
    type: String,
    required: true
  },
  enrollmentYear: {
    type: Number,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  parentName: String,
  parentPhone: String,
  previousCGPA: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },

  debtor: {
    type: Boolean,
    default: false
  },
  tuitionFeesUpToDate: {
    type: Boolean,
    default: true
  },
  scholarshipHolder: {
    type: Boolean,
    default: false
  },
  educationalSpecialNeeds: {
    type: Boolean,
    default: false
  },
  international: {
    type: Boolean,
    default: false
  },
  totalCredits: {
    type: Number,
    default: 0
  },
  earnedCredits: {
    type: Number,
    default: 0
  },
  enrollmentStatus: {
    type: String,
    enum: ['active', 'suspended', 'graduated', 'dropped'],
    default: 'active'
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current CGPA
studentSchema.virtual('currentCGPA').get(function() {
  // This would be calculated from marks
  return this.previousCGPA || 0;
});

// Virtual for attendance percentage
studentSchema.virtual('attendancePercentage').get(function() {
  // This would be calculated from attendance records
  return 85; // Placeholder
});

// Index for faster queries
studentSchema.index({ studentId: 1 });
studentSchema.index({ department: 1, semester: 1 });
studentSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('Student', studentSchema);