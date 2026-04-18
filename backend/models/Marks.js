
const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
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
  semester: {
    type: Number,
    required: true
  },
  internalMarks: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  externalMarks: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalMarks: {
    type: Number,
    min: 0,
    default: 0
  },
  grade: {
    type: String,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F'],
    default: 'P'
  },
  gradePoints: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  assignmentMarks: {
    type: Number,
    default: 0
  },
  quizMarks: {
    type: Number,
    default: 0
  },
  labMarks: {
    type: Number,
    default: 0
  },
  midtermMarks: {
    type: Number,
    default: 0
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  examType: {
    type: String,
    enum: ['midterm', 'endterm'],
    default: 'endterm'
  }
}, {
  timestamps: true
});

marksSchema.pre('save', function(next) {
  this.totalMarks = Number(this.internalMarks || 0) + Number(this.externalMarks || 0);

  if (this.totalMarks >= 90) {
    this.grade = 'O';
    this.gradePoints = 10;
  } else if (this.totalMarks >= 80) {
    this.grade = 'A+';
    this.gradePoints = 9;
  } else if (this.totalMarks >= 70) {
    this.grade = 'A';
    this.gradePoints = 8;
  } else if (this.totalMarks >= 60) {
    this.grade = 'B+';
    this.gradePoints = 7;
  } else if (this.totalMarks >= 50) {
    this.grade = 'B';
    this.gradePoints = 6;
  } else if (this.totalMarks >= 40) {
    this.grade = 'C';
    this.gradePoints = 5;
  } else if (this.totalMarks >= 35) {
    this.grade = 'P';
    this.gradePoints = 4;
  } else {
    this.grade = 'F';
    this.gradePoints = 0;
  }

  next();
});

marksSchema.index({ student: 1, subject: 1, semester: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
