const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  uploadMarks,
  bulkUploadMarks,
  getMarksReport
} = require('../controllers/marksController');

router.use(protect);

// Faculty only routes
router.post('/upload', roleMiddleware('faculty'), uploadMarks);
router.post('/bulk-upload', roleMiddleware('faculty'), bulkUploadMarks);
router.get('/report', roleMiddleware('faculty', 'admin'), getMarksReport);

module.exports = router;