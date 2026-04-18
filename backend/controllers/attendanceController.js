const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private/Faculty
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, subjectId, date, status, remarks } = req.body;
    
    const faculty = await Faculty.findOne({ user: req.user.id });
    const student = await Student.findOne({ studentId });
    const subject = await Subject.findById(subjectId);
    
    if (!student || !subject) {
      return res.status(404).json({
        success: false,
        message: 'Student or Subject not found'
      });
    }
    
    const attendance = await Attendance.findOneAndUpdate(
      { student: student._id, subject: subjectId, date },
      {
        student: student._id,
        subject: subjectId,
        date,
        status,
        remarks,
        markedBy: faculty._id,
        semester: student.semester
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk-mark
// @access  Private/Faculty
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const { subjectId, date, attendanceList } = req.body;
    
    const faculty = await Faculty.findOne({ user: req.user.id });
    const subject = await Subject.findById(subjectId);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    const results = [];
    for (const item of attendanceList) {
      const student = await Student.findOne({ studentId: item.studentId });
      if (student) {
        const attendance = await Attendance.findOneAndUpdate(
          { student: student._id, subject: subjectId, date },
          {
            student: student._id,
            subject: subjectId,
            date,
            status: item.status,
            markedBy: faculty._id,
            semester: student.semester
          },
          { upsert: true, new: true }
        );
        results.push(attendance);
      }
    }
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get attendance reports
// @route   GET /api/attendance/reports
// @access  Private/Faculty
exports.getAttendanceReports = async (req, res) => {
  try {
    const { subjectId, semester, startDate, endDate } = req.query;
    
    let query = {};
    if (subjectId) query.subject = subjectId;
    if (semester) query.semester = semester;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    const attendance = await Attendance.find(query)
      .populate('student')
      .populate('subject')
      .sort('-date');
    
    // Calculate summary
    const summary = {};
    for (const record of attendance) {
      const studentId = record.student._id.toString();
      if (!summary[studentId]) {
        summary[studentId] = {
          student: record.student,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      summary[studentId].total++;
      summary[studentId][record.status]++;
    }
    
    res.status(200).json({
      success: true,
      data: attendance,
      summary: Object.values(summary)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};