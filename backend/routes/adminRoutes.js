const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(protect);
router.use(roleMiddleware('admin'));

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const User = require('../models/User');
    const Student = require('../models/Student');
    const Faculty = require('../models/Faculty');
    const Department = require('../models/Department');
    const RiskScore = require('../models/RiskScore');
    
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const atRiskStudents = await RiskScore.countDocuments({ riskLevel: 'high' });
    
    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalDepartments,
        atRiskStudents,
        activeUsers: await User.countDocuments({ isActive: true })
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// Add more admin routes as needed...

module.exports = router;