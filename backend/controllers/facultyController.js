
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');
const RiskScore = require('../models/RiskScore');

exports.getProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id })
      .populate('department')
      .populate('subjects')
      .populate({ path: 'user', select: '-password' });

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found' });
    }

    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id });
    const subjects = await Subject.find({ _id: { $in: faculty.subjects } })
      .populate('department')
      .sort({ semester: 1, code: 1 });

    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getSubjectStudents = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { date } = req.query;

    const faculty = await Faculty.findOne({ user: req.user.id });
    const subject = await Subject.findById(subjectId).populate('department');

    if (!faculty || !subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const students = await Student.find({
      enrollmentStatus: 'active',
      department: subject.department._id,
      semester: subject.semester,
    })
      .populate('user', 'name email')
      .populate('department')
      .sort({ studentId: 1 });

    const attendanceDate = date ? new Date(date) : null;
    let attendanceMap = new Map();

    if (attendanceDate) {
      const records = await Attendance.find({
        subject: subject._id,
        date: attendanceDate,
        student: { $in: students.map((item) => item._id) },
      });
      attendanceMap = new Map(records.map((item) => [String(item.student), item]));
    }

    const data = students.map((student) => ({
      ...student.toObject(),
      attendanceStatus: attendanceMap.get(String(student._id))?.status || 'not-marked',
      attendanceMarkedAt: attendanceMap.get(String(student._id))?.updatedAt || null,
    }));

    res.status(200).json({
      success: true,
      data,
      subject: {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        semester: subject.semester,
        department: subject.department?.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ user: req.user.id }).populate('subjects');

    const subjects = faculty.subjects || [];
    const totalStudents = await Student.countDocuments({
      department: faculty.department,
      enrollmentStatus: 'active',
    });

    const recentAttendance = await Attendance.find({ markedBy: faculty._id })
      .sort('-updatedAt')
      .limit(50)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('subject');

    const atRiskStudents = await RiskScore.find({ riskLevel: { $in: ['medium', 'high'] } })
      .populate({
        path: 'student',
        match: { department: faculty.department, enrollmentStatus: 'active' },
        populate: { path: 'user', select: 'name email' },
      })
      .sort('-riskScore');

    res.status(200).json({
      success: true,
      data: {
        faculty,
        subjects: subjects.length,
        subjectList: subjects,
        totalStudents,
        recentAttendance,
        atRiskStudents: atRiskStudents.filter((item) => item.student),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
