const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  markAttendance,
  bulkMarkAttendance,
  getAttendanceReports
} = require('../controllers/attendanceController');

router.use(protect);

// Faculty only routes
router.post('/mark', roleMiddleware('faculty'), markAttendance);
router.post('/bulk-mark', roleMiddleware('faculty'), bulkMarkAttendance);
router.get('/reports', roleMiddleware('faculty', 'admin'), getAttendanceReports);

module.exports = router;