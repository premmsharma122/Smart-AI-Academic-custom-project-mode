const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getPredictions,
  getStudentPrediction,
  generatePredictions,
  generateRiskScores,
  getAtRiskStudents,
  getPredictionAnalytics,
  trainPredictionModel,
  getModelStatus,
} = require('../controllers/predictionController');

router.use(protect);

router.get('/', roleMiddleware('faculty', 'admin'), getPredictions);
router.get('/at-risk', roleMiddleware('faculty', 'admin'), getAtRiskStudents);
router.get('/student/:studentId', roleMiddleware('faculty', 'admin'), getStudentPrediction);
router.get('/analytics', roleMiddleware('admin'), getPredictionAnalytics);
router.get('/model-status', roleMiddleware('admin'), getModelStatus);

router.post('/generate', roleMiddleware('admin'), generatePredictions);
router.post('/generate-risk', roleMiddleware('admin'), generateRiskScores);
router.post('/train-model', roleMiddleware('admin'), trainPredictionModel);

module.exports = router;
