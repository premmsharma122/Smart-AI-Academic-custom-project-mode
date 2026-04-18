const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getProfile,
  updateProfile,
  getAttendance,
  getMarks,
  getRiskAssessment,
  getPredictions,
  getDashboard
} = require('../controllers/studentController');

router.use(protect);
router.use(roleMiddleware('student'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/attendance', getAttendance);
router.get('/marks', getMarks);
router.get('/risk-assessment', getRiskAssessment);
router.get('/predictions', getPredictions);
router.get('/dashboard', getDashboard);

module.exports = router;