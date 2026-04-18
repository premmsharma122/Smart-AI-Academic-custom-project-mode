
const Marks = require('../models/Marks');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');

function normalizeExamType(examType) {
  if (examType === 'midterm' || examType === 'endterm') return examType;
  return 'endterm';
}

exports.uploadMarks = async (req, res) => {
  try {
    const examType = normalizeExamType(req.body.examType);
    const { studentId, subjectId, internalMarks, externalMarks } = req.body;

    const student = await Student.findOne({ studentId });
    const subject = await Subject.findById(subjectId);
    const faculty = await Faculty.findOne({ user: req.user.id });

    if (!student || !subject) {
      return res.status(404).json({ success: false, message: 'Student or Subject not found' });
    }

    const marks = await Marks.findOneAndUpdate(
      { student: student._id, subject: subjectId, semester: student.semester, examType },
      {
        student: student._id,
        subject: subjectId,
        semester: student.semester,
        internalMarks,
        externalMarks,
        recordedBy: faculty._id,
        examType,
        midtermMarks: examType === 'midterm' ? Number(internalMarks || 0) + Number(externalMarks || 0) : undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: marks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

exports.bulkUploadMarks = async (req, res) => {
  try {
    const examType = normalizeExamType(req.body.examType);
    const { subjectId, marksList } = req.body;

    const subject = await Subject.findById(subjectId);
    const faculty = await Faculty.findOne({ user: req.user.id });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const results = [];
    for (const item of marksList) {
      const student = await Student.findOne({ studentId: item.studentId });
      if (!student) continue;

      const marks = await Marks.findOneAndUpdate(
        { student: student._id, subject: subjectId, semester: student.semester, examType },
        {
          student: student._id,
          subject: subjectId,
          semester: student.semester,
          internalMarks: Number(item.internalMarks) || 0,
          externalMarks: Number(item.externalMarks) || 0,
          assignmentMarks: Number(item.assignmentMarks) || 0,
          quizMarks: Number(item.quizMarks) || 0,
          labMarks: Number(item.labMarks) || 0,
          midtermMarks: examType === 'midterm'
            ? (Number(item.internalMarks) || 0) + (Number(item.externalMarks) || 0)
            : undefined,
          recordedBy: faculty._id,
          examType,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(marks);
    }

    res.status(200).json({
      success: true,
      count: results.length,
      message: `${examType === 'midterm' ? 'Mid Term' : 'End Term'} marks saved successfully`,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

exports.getMarksReport = async (req, res) => {
  try {
    const { subjectId, semester, studentId, examType } = req.query;

    const query = {};
    if (subjectId) query.subject = subjectId;
    if (semester) query.semester = Number(semester);
    if (examType) query.examType = normalizeExamType(examType);
    if (studentId) {
      const student = await Student.findOne({ studentId });
      if (student) query.student = student._id;
    }

    const marks = await Marks.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .populate('subject')
      .sort({ semester: -1, examType: 1, createdAt: -1 });

    const stats = {
      totalRecords: marks.length,
      totalStudents: new Set(marks.map((mark) => String(mark.student?._id || mark.student))).size,
      averageMarks: 0,
      highestMarks: 0,
      lowestMarks: marks.length ? 100 : 0,
      gradeDistribution: { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, P: 0, F: 0 },
    };

    let totalMarks = 0;
    marks.forEach((mark) => {
      totalMarks += Number(mark.totalMarks || 0);
      stats.highestMarks = Math.max(stats.highestMarks, Number(mark.totalMarks || 0));
      stats.lowestMarks = Math.min(stats.lowestMarks, Number(mark.totalMarks || 0));
      if (stats.gradeDistribution[mark.grade] !== undefined) {
        stats.gradeDistribution[mark.grade] += 1;
      }
    });

    stats.averageMarks = marks.length > 0 ? Number((totalMarks / marks.length).toFixed(2)) : 0;

    res.status(200).json({ success: true, data: marks, stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
