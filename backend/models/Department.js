const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  hod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  description: String,
  establishedYear: Number,
  totalStudents: {
    type: Number,
    default: 0
  },
  totalFaculty: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);