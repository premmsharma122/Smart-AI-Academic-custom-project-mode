
const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const RiskScore = require('../models/RiskScore');
const Prediction = require('../models/Prediction');
const mlService = require('../services/mlService');

exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('department')
      .populate({ path: 'user', select: '-password' });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const allowedUpdates = ['phone', 'address', 'parentName', 'parentPhone'];
    allowedUpdates.forEach((field) => {
      if (req.body[field]) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    if (req.body.name) {
      await User.findByIdAndUpdate(req.user.id, { name: req.body.name });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { subject, semester } = req.query;
    const query = { student: student._id };
    if (subject) query.subject = subject;
    if (semester) query.semester = Number(semester);

    const attendance = await Attendance.find(query)
      .populate('subject')
      .sort({ date: -1, createdAt: -1 });

    const totalDays = attendance.length;
    const presentDays = attendance.filter((a) => a.status === 'present').length;
    const absentDays = attendance.filter((a) => a.status === 'absent').length;
    const lateDays = attendance.filter((a) => a.status === 'late').length;
    const excusedDays = attendance.filter((a) => a.status === 'excused').length;
    const attendancePercentage = totalDays > 0 ? (((presentDays + lateDays * 0.5 + excusedDays * 0.75) / totalDays) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        attendance,
        summary: {
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          excusedDays,
          attendancePercentage: attendancePercentage.toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

function selectPrimaryMark(marksByExam) {
  return marksByExam.endterm || marksByExam.midterm || null;
}

exports.getMarks = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const marks = await Marks.find({ student: student._id })
      .populate('subject')
      .sort({ semester: -1, 'subject.code': 1, examType: 1, updatedAt: -1 });

    const grouped = new Map();

    for (const mark of marks) {
      const subject = mark.subject;
      if (!subject) continue;
      const key = `${subject._id}-${mark.semester}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          subjectId: subject._id,
          subjectCode: subject.code,
          subjectName: subject.name,
          semester: mark.semester,
          credits: subject.credits,
          midterm: null,
          endterm: null,
        });
      }

      const bucket = grouped.get(key);
      bucket[mark.examType] = {
        internalMarks: mark.internalMarks,
        externalMarks: mark.externalMarks,
        totalMarks: mark.totalMarks,
        grade: mark.grade,
        gradePoints: mark.gradePoints,
        updatedAt: mark.updatedAt,
      };
    }

    const rows = Array.from(grouped.values()).sort((a, b) => {
      if (a.semester !== b.semester) return b.semester - a.semester;
      return a.subjectCode.localeCompare(b.subjectCode);
    }).map((row) => {
      const primary = selectPrimaryMark(row);
      return {
        ...row,
        grade: primary?.grade || '-',
        gradePoints: primary?.gradePoints ?? 0,
        totalMarks: primary?.totalMarks ?? 0,
        examStatus: row.endterm ? 'End Term Available' : row.midterm ? 'Mid Term Available' : 'Pending',
      };
    });

    let totalGradePoints = 0;
    let totalCredits = 0;

    for (const row of rows) {
      const primary = row.endterm || row.midterm;
      if (!primary) continue;
      totalGradePoints += Number(primary.gradePoints || 0) * Number(row.credits || 0);
      totalCredits += Number(row.credits || 0);
    }

    const cgpa = totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      data: {
        marks: rows,
        cgpa,
        totalCredits,
        totalSubjects: rows.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getRiskAssessment = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    let riskScore = await RiskScore.findOne({ student: student._id });

    if (!riskScore) {
      const studentData = await mlService.prepareRiskData(student._id);
      const risk = await mlService.calculateRiskScore(studentData);
      riskScore = await RiskScore.create({
        student: student._id,
        riskScore: risk.score,
        riskLevel: risk.level,
        factors: risk.factors,
        recommendations: risk.recommendations,
        predictedDropoutProbability: risk.dropoutProbability,
        history: [{ riskScore: risk.score, riskLevel: risk.level, calculatedAt: new Date() }],
      });
      student.riskLevel = risk.level;
      student.riskScore = risk.score;
      await student.save();
    }

    res.status(200).json({ success: true, data: riskScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

exports.getPredictions = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    let predictions = await Prediction.find({ student: student._id }).sort({ semester: 1 });

    if (!predictions.length) {
      const studentData = await mlService.prepareStudentData(student._id);
      const dropoutPrediction = await mlService.getDropoutPrediction(studentData);
      const prediction = await mlService.predictPerformance({ ...studentData, dropoutPrediction });
      const newPrediction = await Prediction.create({
        student: student._id,
        semester: Math.min(student.semester + 1, 8),
        predictedCGPA: prediction.predictedCGPA,
        predictedGrade: prediction.predictedGrade,
        confidence: prediction.confidence,
        factors: prediction.factors,
        improvementSuggestions: prediction.suggestions,
        weakAreas: prediction.weakAreas,
        strongAreas: prediction.strongAreas,
      });
      predictions = [newPrediction];
    }

    res.status(200).json({ success: true, data: predictions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate('department').populate('user', 'name email');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const recentAttendance = await Attendance.find({ student: student._id })
      .populate('subject')
      .sort({ date: -1 })
      .limit(10);

    const recentMarks = await Marks.find({ student: student._id, examType: 'endterm' })
      .populate('subject')
      .sort({ updatedAt: -1 })
      .limit(10);

    let riskScore = await RiskScore.findOne({ student: student._id });
    if (!riskScore) {
      const studentData = await mlService.prepareRiskData(student._id);
      const risk = await mlService.calculateRiskScore(studentData);
      riskScore = await RiskScore.create({
        student: student._id,
        riskScore: risk.score,
        riskLevel: risk.level,
        factors: risk.factors,
        recommendations: risk.recommendations,
        predictedDropoutProbability: risk.dropoutProbability,
        history: [{ riskScore: risk.score, riskLevel: risk.level, calculatedAt: new Date() }],
      });
    }

    let prediction = await Prediction.findOne({ student: student._id }).sort({ semester: -1 });
    if (!prediction) {
      const studentData = await mlService.prepareStudentData(student._id);
      const dropoutPrediction = await mlService.getDropoutPrediction(studentData);
      const pred = await mlService.predictPerformance({ ...studentData, dropoutPrediction });
      prediction = await Prediction.create({
        student: student._id,
        semester: Math.min(student.semester + 1, 8),
        predictedCGPA: pred.predictedCGPA,
        predictedGrade: pred.predictedGrade,
        confidence: pred.confidence,
        factors: pred.factors,
        improvementSuggestions: pred.suggestions,
        weakAreas: pred.weakAreas,
        strongAreas: pred.strongAreas,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        student,
        recentAttendance,
        recentMarks,
        riskScore,
        prediction,
        stats: {
          totalSubjects: await getDistinctSubjectCount(student._id),
          attendanceRate: await getAttendanceRate(student._id),
          currentCGPA: await getCurrentCGPA(student._id),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

async function getAttendanceRate(studentId) {
  const attendance = await Attendance.find({ student: studentId });
  const total = attendance.length;
  const weightedPresent = attendance.reduce((sum, item) => {
    if (item.status === 'present') return sum + 1;
    if (item.status === 'late') return sum + 0.5;
    if (item.status === 'excused') return sum + 0.75;
    return sum;
  }, 0);
  return total > 0 ? Number(((weightedPresent / total) * 100).toFixed(2)) : 0;
}

async function getDistinctSubjectCount(studentId) {
  const distinct = await Marks.distinct('subject', { student: studentId });
  return distinct.length;
}

async function getCurrentCGPA(studentId) {
  const marks = await Marks.find({ student: studentId, examType: 'endterm' }).populate('subject');
  let totalGradePoints = 0;
  let totalCredits = 0;

  for (const mark of marks) {
    if (mark.subject && mark.gradePoints !== undefined) {
      totalGradePoints += mark.gradePoints * mark.subject.credits;
      totalCredits += mark.subject.credits;
    }
  }

  return totalCredits > 0 ? Number((totalGradePoints / totalCredits).toFixed(2)) : 0;
}
