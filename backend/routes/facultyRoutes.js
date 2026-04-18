const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getProfile,
  getSubjects,
  getSubjectStudents,
  getDashboard
} = require('../controllers/facultyController');

router.use(protect);
router.use(roleMiddleware('faculty'));

router.get('/profile', getProfile);
router.get('/subjects', getSubjects);
router.get('/subjects/:subjectId/students', getSubjectStudents);
router.get('/dashboard', getDashboard);

module.exports = router;