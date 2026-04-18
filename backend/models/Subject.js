const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
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
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  type: {
    type: String,
    enum: ['Theory', 'Practical', 'Lab', 'Project'],
    default: 'Theory'
  },
  maxMarks: {
    internal: { type: Number, default: 30 },
    external: { type: Number, default: 70 },
    total: { type: Number, default: 100 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);