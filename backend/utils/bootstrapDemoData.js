
const Department = require('../models/Department');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const RiskScore = require('../models/RiskScore');
const Prediction = require('../models/Prediction');

const CSE_CURRICULUM = [
  { semester: 1, code: 'BSC101', name: 'Engineering Mathematics I', credits: 4, type: 'Theory' },
  { semester: 1, code: 'BSC102', name: 'Engineering Physics', credits: 4, type: 'Theory' },
  { semester: 1, code: 'ESC101', name: 'Basic Electrical Engineering', credits: 3, type: 'Theory' },
  { semester: 1, code: 'ESC102', name: 'Programming for Problem Solving', credits: 4, type: 'Theory' },
  { semester: 1, code: 'BSC151', name: 'Engineering Physics Lab', credits: 1, type: 'Lab' },
  { semester: 1, code: 'ESC151', name: 'Programming for Problem Solving Lab', credits: 1, type: 'Lab' },

  { semester: 2, code: 'BSC201', name: 'Engineering Mathematics II', credits: 4, type: 'Theory' },
  { semester: 2, code: 'BSC202', name: 'Engineering Chemistry', credits: 4, type: 'Theory' },
  { semester: 2, code: 'ESC201', name: 'Engineering Graphics', credits: 2, type: 'Theory' },
  { semester: 2, code: 'ESC202', name: 'Workshop Practice', credits: 2, type: 'Practical' },
  { semester: 2, code: 'BSC251', name: 'Engineering Chemistry Lab', credits: 1, type: 'Lab' },
  { semester: 2, code: 'HSMC201', name: 'Communication Skills', credits: 2, type: 'Theory' },

  { semester: 3, code: 'CSE301', name: 'Discrete Mathematics', credits: 4, type: 'Theory' },
  { semester: 3, code: 'CSE302', name: 'Data Structures', credits: 4, type: 'Theory' },
  { semester: 3, code: 'CSE303', name: 'Digital Logic Design', credits: 3, type: 'Theory' },
  { semester: 3, code: 'CSE304', name: 'Object Oriented Programming', credits: 3, type: 'Theory' },
  { semester: 3, code: 'CSE351', name: 'Data Structures Lab', credits: 1, type: 'Lab' },
  { semester: 3, code: 'CSE352', name: 'OOP Lab', credits: 1, type: 'Lab' },

  { semester: 4, code: 'CSE401', name: 'Design and Analysis of Algorithms', credits: 4, type: 'Theory' },
  { semester: 4, code: 'CSE402', name: 'Computer Organization and Architecture', credits: 3, type: 'Theory' },
  { semester: 4, code: 'CSE403', name: 'Database Management Systems', credits: 4, type: 'Theory' },
  { semester: 4, code: 'CSE404', name: 'Operating Systems', credits: 4, type: 'Theory' },
  { semester: 4, code: 'CSE451', name: 'DBMS Lab', credits: 1, type: 'Lab' },
  { semester: 4, code: 'CSE452', name: 'Operating Systems Lab', credits: 1, type: 'Lab' },

  { semester: 5, code: 'CSE501', name: 'Computer Networks', credits: 4, type: 'Theory' },
  { semester: 5, code: 'CSE502', name: 'Software Engineering', credits: 3, type: 'Theory' },
  { semester: 5, code: 'CSE503', name: 'Theory of Computation', credits: 4, type: 'Theory' },
  { semester: 5, code: 'CSE504', name: 'Web Technology', credits: 3, type: 'Theory' },
  { semester: 5, code: 'CSE551', name: 'Computer Networks Lab', credits: 1, type: 'Lab' },
  { semester: 5, code: 'CSE552', name: 'Web Technology Lab', credits: 1, type: 'Lab' },

  { semester: 6, code: 'CSE601', name: 'Compiler Design', credits: 4, type: 'Theory' },
  { semester: 6, code: 'CSE602', name: 'Machine Learning', credits: 4, type: 'Theory' },
  { semester: 6, code: 'CSE603', name: 'Artificial Intelligence', credits: 3, type: 'Theory' },
  { semester: 6, code: 'CSE604', name: 'Cloud Computing', credits: 3, type: 'Theory' },
  { semester: 6, code: 'CSE651', name: 'Machine Learning Lab', credits: 1, type: 'Lab' },
  { semester: 6, code: 'CSE652', name: 'Cloud Computing Lab', credits: 1, type: 'Lab' },

  { semester: 7, code: 'CSE701', name: 'Big Data Analytics', credits: 3, type: 'Theory' },
  { semester: 7, code: 'CSE702', name: 'Information Security', credits: 3, type: 'Theory' },
  { semester: 7, code: 'CSE703', name: 'DevOps and Automation', credits: 3, type: 'Theory' },
  { semester: 7, code: 'CSE704', name: 'Professional Elective I', credits: 3, type: 'Theory' },
  { semester: 7, code: 'CSE751', name: 'Minor Project', credits: 2, type: 'Project' },
  { semester: 7, code: 'CSE752', name: 'Seminar', credits: 1, type: 'Theory' },

  { semester: 8, code: 'CSE801', name: 'Professional Elective II', credits: 3, type: 'Theory' },
  { semester: 8, code: 'CSE802', name: 'Open Elective', credits: 3, type: 'Theory' },
  { semester: 8, code: 'CSE803', name: 'Internship', credits: 4, type: 'Practical' },
  { semester: 8, code: 'CSE804', name: 'Major Project', credits: 6, type: 'Project' },
  { semester: 8, code: 'CSE805', name: 'Entrepreneurship and Innovation', credits: 2, type: 'Theory' },
  { semester: 8, code: 'CSE806', name: 'Comprehensive Viva', credits: 2, type: 'Theory' },
];

const DEMO_STUDENTS = [
  {
    name: 'Demo Student',
    email: 'student1@college.edu',
    password: 'student123',
    studentId: 'STU001',
    semester: 5,
    gender: 'Male',
    previousCGPA: 7.18,
    profile: 'medium',
  },
  {
    name: 'Ananya Sharma',
    email: 'student2@college.edu',
    password: 'student123',
    studentId: 'STU002',
    semester: 5,
    gender: 'Female',
    previousCGPA: 5.82,
    profile: 'high',
  },
  {
    name: 'Rohan Verma',
    email: 'student3@college.edu',
    password: 'student123',
    studentId: 'STU003',
    semester: 5,
    gender: 'Male',
    previousCGPA: 8.34,
    profile: 'low',
  },
];

const PERFORMANCE_PROFILES = {
  high: {
    attendancePresentRatio: 0.58,
    midtermInternal: [10, 18],
    midtermExternal: [12, 22],
    endtermInternal: [13, 22],
    endtermExternal: [28, 45],
    riskScore: 0.74,
    riskLevel: 'high',
    confidence: 0.86,
    predictedCGPA: 5.9,
    predictedGrade: 'B',
    recommendations: [
      'Meet the faculty advisor this week and discuss a recovery plan subject-wise.',
      'Improve attendance in core theory classes and complete missed notes within 24 hours.',
      'Focus first on Theory of Computation, Computer Networks, and Software Engineering.',
      'Set weekly targets for assignments, quizzes, and lab submissions.',
    ],
    weakAreas: ['Attendance', 'Internal Assessments', 'Subject Clearance'],
    strongAreas: ['Lab Participation'],
  },
  medium: {
    attendancePresentRatio: 0.78,
    midtermInternal: [16, 24],
    midtermExternal: [18, 28],
    endtermInternal: [20, 27],
    endtermExternal: [42, 60],
    riskScore: 0.46,
    riskLevel: 'medium',
    confidence: 0.84,
    predictedCGPA: 7.4,
    predictedGrade: 'A',
    recommendations: [
      'Maintain regular attendance and revise one core subject every day after classes.',
      'Strengthen conceptual subjects through weekly problem-solving practice.',
      'Use faculty office hours for difficult units before the next assessment cycle.',
      'Keep lab records and project submissions up to date to improve consistency.',
    ],
    weakAreas: ['Theory of Computation', 'Consistency in Internal Tests'],
    strongAreas: ['Lab Work', 'Web Technology'],
  },
  low: {
    attendancePresentRatio: 0.9,
    midtermInternal: [22, 28],
    midtermExternal: [24, 30],
    endtermInternal: [24, 30],
    endtermExternal: [55, 68],
    riskScore: 0.19,
    riskLevel: 'low',
    confidence: 0.9,
    predictedCGPA: 8.7,
    predictedGrade: 'A+',
    recommendations: [
      'Maintain the current study discipline and continue mentoring peers where possible.',
      'Start preparation early for placement-focused subjects and aptitude practice.',
      'Take up one advanced project or certification aligned with your strengths.',
    ],
    weakAreas: [],
    strongAreas: ['Attendance', 'Programming Labs', 'Overall Academic Performance'],
  },
};

function rangeValue([min, max], offset = 0) {
  const span = max - min;
  return Math.round(min + (span * offset));
}

function computeGrade(total) {
  if (total >= 90) return { grade: 'O', gradePoints: 10 };
  if (total >= 80) return { grade: 'A+', gradePoints: 9 };
  if (total >= 70) return { grade: 'A', gradePoints: 8 };
  if (total >= 60) return { grade: 'B+', gradePoints: 7 };
  if (total >= 50) return { grade: 'B', gradePoints: 6 };
  if (total >= 40) return { grade: 'C', gradePoints: 5 };
  if (total >= 35) return { grade: 'P', gradePoints: 4 };
  return { grade: 'F', gradePoints: 0 };
}

async function ensureDefaultDepartment() {
  let department = await Department.findOne({ code: 'CS' });

  if (!department) {
    department = await Department.findOne();
  }

  if (!department) {
    department = await Department.create({
      name: 'Computer Science and Engineering',
      code: 'CS',
      description: 'Default department created for authentication and demo access.',
      establishedYear: 2020,
    });
  } else {
    department.name = 'Computer Science and Engineering';
    department.description = department.description || 'Computer Science and Engineering academic department.';
    department.establishedYear = department.establishedYear || 2020;
    await department.save();
  }

  return department;
}

async function upsertDemoUser({ name, email, password, role }) {
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    user = new User({ name, email, password, role, isActive: true });
  } else {
    user.name = name;
    user.role = role;
    user.isActive = true;
    user.password = password;
  }

  await user.save();
  return user;
}

async function ensureStudentProfile(user, department, config) {
  let student = await Student.findOne({ user: user._id });
  const payload = {
    user: user._id,
    studentId: config.studentId,
    department: department._id,
    semester: config.semester,
    batch: '2022-2026',
    enrollmentYear: 2022,
    dateOfBirth: config.gender === 'Female' ? new Date('2004-03-11') : new Date('2004-01-09'),
    gender: config.gender,
    previousCGPA: config.previousCGPA,
    enrollmentStatus: 'active',
    riskLevel: PERFORMANCE_PROFILES[config.profile].riskLevel,
    riskScore: PERFORMANCE_PROFILES[config.profile].riskScore,
    tuitionFeesUpToDate: config.profile !== 'high',
    debtor: config.profile === 'high',
    scholarshipHolder: config.profile === 'low',
    educationalSpecialNeeds: false,
    international: false,
  };

  if (!student) {
    student = await Student.create(payload);
  } else {
    Object.assign(student, payload);
    await student.save();
  }

  return student;
}

async function ensureFacultyProfile(user, department) {
  let faculty = await Faculty.findOne({ user: user._id });
  const payload = {
    user: user._id,
    facultyId: 'FAC001',
    department: department._id,
    designation: 'Assistant Professor',
    qualification: 'M.Tech',
    specialization: 'Computer Science and Engineering',
    joiningDate: new Date('2021-07-01'),
    isHOD: true,
  };

  if (!faculty) {
    faculty = await Faculty.create(payload);
  } else {
    Object.assign(faculty, payload);
    await faculty.save();
  }

  return faculty;
}

async function ensureSubjectCatalog(department, faculty) {
  const subjectIds = [];
  for (const item of CSE_CURRICULUM) {
    const subject = await Subject.findOneAndUpdate(
      { code: item.code },
      {
        name: item.name,
        department: department._id,
        semester: item.semester,
        credits: item.credits,
        faculty: faculty._id,
        type: item.type,
        maxMarks: { internal: 30, external: 70, total: 100 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    subjectIds.push(subject._id);
  }

  faculty.subjects = subjectIds;
  await faculty.save();
  return await Subject.find({ _id: { $in: subjectIds } }).sort({ semester: 1, code: 1 });
}

function getSemesterSubjects(subjects, semester) {
  return subjects.filter((subject) => Number(subject.semester) === Number(semester));
}

function generateAttendanceDates() {
  const dates = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  let added = 0;
  let offset = 0;
  while (added < 12) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - offset);
    offset += 1;
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    dates.push(new Date(d));
    added += 1;
  }
  return dates.reverse();
}

function getAttendanceStatus(profile, index) {
  const ratio = profile.attendancePresentRatio;
  if (index / 12 < ratio) return 'present';
  if (index % 5 === 0) return 'late';
  return 'absent';
}

async function ensureAttendanceRecords(student, faculty, subjects, profileName) {
  const existing = await Attendance.countDocuments({ student: student._id, semester: student.semester });
  if (existing > 0) return;

  const profile = PERFORMANCE_PROFILES[profileName];
  const dates = generateAttendanceDates();

  for (const subject of subjects) {
    for (let i = 0; i < dates.length; i += 1) {
      const status = getAttendanceStatus(profile, i);
      await Attendance.findOneAndUpdate(
        { student: student._id, subject: subject._id, date: dates[i] },
        {
          student: student._id,
          subject: subject._id,
          date: dates[i],
          status,
          remarks: status === 'absent' ? 'Marked absent by faculty' : status === 'late' ? 'Late arrival noted' : 'Attendance marked successfully',
          markedBy: faculty._id,
          semester: student.semester,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }
}

async function ensureMarksRecords(student, faculty, subjects, profileName) {
  const profile = PERFORMANCE_PROFILES[profileName];

  for (let i = 0; i < subjects.length; i += 1) {
    const subject = subjects[i];
    const offset = subjects.length > 1 ? i / (subjects.length - 1) : 0.5;
    const midtermInternal = rangeValue(profile.midtermInternal, offset);
    const midtermExternal = rangeValue(profile.midtermExternal, 1 - offset / 2);
    const endtermInternal = rangeValue(profile.endtermInternal, offset / 1.1);
    const endtermExternal = rangeValue(profile.endtermExternal, 1 - offset / 3);

    for (const [examType, internalMarks, externalMarks] of [
      ['midterm', midtermInternal, midtermExternal],
      ['endterm', endtermInternal, endtermExternal],
    ]) {
      const total = internalMarks + externalMarks;
      const gradeInfo = computeGrade(total);
      await Marks.findOneAndUpdate(
        { student: student._id, subject: subject._id, semester: student.semester, examType },
        {
          student: student._id,
          subject: subject._id,
          semester: student.semester,
          examType,
          internalMarks,
          externalMarks,
          totalMarks: total,
          grade: gradeInfo.grade,
          gradePoints: gradeInfo.gradePoints,
          assignmentMarks: Math.min(15, Math.max(7, Math.round(internalMarks / 2))),
          quizMarks: Math.min(10, Math.max(4, Math.round(internalMarks / 3))),
          labMarks: subject.type === 'Lab' ? Math.min(30, Math.max(18, Math.round(total / 3))) : 0,
          midtermMarks: examType === 'midterm' ? total : undefined,
          recordedBy: faculty._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }
}

async function ensureRiskAndPrediction(student, profileName) {
  const profile = PERFORMANCE_PROFILES[profileName];
  const riskPayload = {
    riskScore: profile.riskScore,
    riskLevel: profile.riskLevel,
    factors: {
      attendance: { score: Number((1 - profile.attendancePresentRatio).toFixed(2)), impact: profile.riskLevel === 'high' ? 'High' : profile.riskLevel === 'medium' ? 'Medium' : 'Low' },
      academics: { score: Number((1 - (student.previousCGPA / 10)).toFixed(2)), impact: student.previousCGPA < 6 ? 'High' : student.previousCGPA < 7.5 ? 'Medium' : 'Low' },
      assignments: { score: profile.riskLevel === 'high' ? 0.42 : profile.riskLevel === 'medium' ? 0.24 : 0.08, impact: profile.riskLevel === 'high' ? 'High' : profile.riskLevel === 'medium' ? 'Medium' : 'Low' },
      previousPerformance: { score: Number((1 - (student.previousCGPA / 10)).toFixed(2)), impact: student.previousCGPA < 6 ? 'High' : student.previousCGPA < 7.5 ? 'Medium' : 'Low' },
    },
    recommendations: profile.recommendations,
    predictedDropoutProbability: profile.riskScore,
    lastCalculated: new Date(),
    history: [
      { riskScore: Math.max(0.08, Number((profile.riskScore - 0.08).toFixed(2))), riskLevel: profile.riskScore > 0.6 ? 'medium' : 'low', calculatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
      { riskScore: profile.riskScore, riskLevel: profile.riskLevel, calculatedAt: new Date() },
    ],
  };

  await RiskScore.findOneAndUpdate({ student: student._id }, riskPayload, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  await Prediction.findOneAndUpdate(
    { student: student._id, semester: student.semester + 1 },
    {
      predictedCGPA: profile.predictedCGPA,
      predictedGrade: profile.predictedGrade,
      confidence: profile.confidence,
      factors: {
        attendance: Number((profile.attendancePresentRatio * 100).toFixed(2)),
        currentCGPA: student.previousCGPA,
        assignmentCompletion: profileName === 'high' ? 0.68 : profileName === 'medium' ? 0.84 : 0.95,
      },
      improvementSuggestions: profile.recommendations,
      weakAreas: profile.weakAreas,
      strongAreas: profile.strongAreas,
      predictionDate: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function bootstrapDemoData() {
  const department = await ensureDefaultDepartment();

  const adminUser = await upsertDemoUser({
    name: 'Demo Admin',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
  });

  const facultyUser = await upsertDemoUser({
    name: 'Demo Faculty',
    email: 'faculty1@college.edu',
    password: 'faculty123',
    role: 'faculty',
  });

  const faculty = await ensureFacultyProfile(facultyUser, department);
  const subjects = await ensureSubjectCatalog(department, faculty);

  const demoStudents = [];
  for (const config of DEMO_STUDENTS) {
    const user = await upsertDemoUser({
      name: config.name,
      email: config.email,
      password: config.password,
      role: 'student',
    });
    const student = await ensureStudentProfile(user, department, config);
    const semesterSubjects = getSemesterSubjects(subjects, student.semester);
    await ensureAttendanceRecords(student, faculty, semesterSubjects, config.profile);
    await ensureMarksRecords(student, faculty, semesterSubjects, config.profile);
    await ensureRiskAndPrediction(student, config.profile);
    demoStudents.push(student);
  }

  department.totalStudents = demoStudents.length;
  department.totalFaculty = 1;
  department.hod = faculty._id;
  await department.save();

  return { adminUser, facultyUser, department, demoStudents, subjectsCreated: subjects.length };
}

module.exports = {
  bootstrapDemoData,
  ensureDefaultDepartment,
};
