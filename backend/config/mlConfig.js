module.exports = {
  // Model paths
  models: {
    dropout: './models/ml/dropout_model.pkl',
    performance: './models/ml/performance_model.pkl',
    clustering: './models/ml/clustering_model.pkl',
    anomaly: './models/ml/anomaly_model.pkl'
  },
  
  // Feature columns for prediction
  features: {
    dropout: ['attendance_percentage', 'internal_marks', 'assignment_submission_rate', 'previous_cgpa', 'class_participation'],
    performance: ['attendance_percentage', 'assignment_marks', 'quiz_marks', 'midterm_marks', 'lab_marks']
  },
  
  // Risk thresholds
  riskThresholds: {
    low: 0.3,
    medium: 0.6,
    high: 0.9
  },
  
  // Anomaly detection
  anomalyThreshold: 0.85
};