const mongoose = require('mongoose');

const riskScoreSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  factors: {
    attendance: {
      score: Number,
      impact: String
    },
    academics: {
      score: Number,
      impact: String
    },
    assignments: {
      score: Number,
      impact: String
    },
    previousPerformance: {
      score: Number,
      impact: String
    }
  },
  recommendations: [String],
  predictedDropoutProbability: {
    type: Number,
    min: 0,
    max: 1
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  },
  history: [{
    riskScore: Number,
    riskLevel: String,
    calculatedAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('RiskScore', riskScoreSchema);