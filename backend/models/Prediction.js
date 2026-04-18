const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  predictedCGPA: {
    type: Number,
    min: 0,
    max: 10
  },
  predictedGrade: String,
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  factors: {
    attendance: Number,
    currentCGPA: Number,
    assignmentCompletion: Number
  },
  improvementSuggestions: [String],
  weakAreas: [String],
  strongAreas: [String],
  predictionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

predictionSchema.index({ student: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);