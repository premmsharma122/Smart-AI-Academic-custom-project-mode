const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyId: {
    type: String,
    required: [true, 'Please add a faculty ID'],
    unique: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  designation: {
    type: String,
    required: true,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer']
  },
  qualification: String,
  specialization: String,
  joiningDate: {
    type: Date,
    required: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  isHOD: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);