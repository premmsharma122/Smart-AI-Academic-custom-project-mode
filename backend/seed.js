const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Department = require('./models/Department');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
const Marks = require('./models/Marks');
const RiskScore = require('./models/RiskScore');
const Prediction = require('./models/Prediction');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Generate random data helpers
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Sample data
const studentNames = [
  'Aarav Sharma', 'Vivaan Gupta', 'Aditya Singh', 'Vihaan Kumar', 'Arjun Yadav',
  'Reyansh Reddy', 'Shaurya Patel', 'Dhruv Joshi', 'Krishna Iyer', 'Ishaan Nair',
  'Ananya Desai', 'Diya Mehta', 'Sara Khan', 'Aanya Verma', 'Riya Choudhary',
  'Ishita Malhotra', 'Anika Kapoor', 'Myra Saxena', 'Advika Thakur', 'Kavya Seth'
];

const facultyNames = [
  'Dr. Rajesh Kumar', 'Prof. Priya Sharma', 'Dr. Amit Patel', 'Prof. Neha Gupta',
  'Dr. Sanjay Singh', 'Prof. Meera Reddy', 'Dr. Vikram Joshi', 'Prof. Anjali Nair'
];

const subjectsData = {
  'Computer Science': [
    { code: 'CS301', name: 'Data Structures', credits: 4, type: 'Theory' },
    { code: 'CS302', name: 'Algorithms', credits: 4, type: 'Theory' },
    { code: 'CS303', name: 'Database Management', credits: 3, type: 'Theory' },
    { code: 'CS304', name: 'Operating Systems', credits: 3, type: 'Theory' },
    { code: 'CS305', name: 'Computer Networks', credits: 3, type: 'Theory' },
    { code: 'CS306', name: 'Web Development', credits: 3, type: 'Practical' },
    { code: 'CS307', name: 'Python Programming', credits: 3, type: 'Practical' },
    { code: 'CS308', name: 'Machine Learning', credits: 4, type: 'Theory' }
  ],
  'Information Technology': [
    { code: 'IT301', name: 'Web Technologies', credits: 4, type: 'Theory' },
    { code: 'IT302', name: 'Cloud Computing', credits: 3, type: 'Theory' },
    { code: 'IT303', name: 'Cyber Security', credits: 3, type: 'Theory' },
    { code: 'IT304', name: 'Mobile Development', credits: 3, type: 'Practical' }
  ],
  'Electronics': [
    { code: 'EC301', name: 'Circuit Theory', credits: 4, type: 'Theory' },
    { code: 'EC302', name: 'Digital Electronics', credits: 3, type: 'Theory' },
    { code: 'EC303', name: 'Microprocessors', credits: 3, type: 'Practical' }
  ]
};

// Generate CGPA based on performance level
const getCGPA = (level) => {
  if (level === 'high') return randomInt(80, 95) / 10;
  if (level === 'medium') return randomInt(55, 79) / 10;
  return randomInt(30, 54) / 10;
};

// Generate attendance based on performance level
const getAttendance = (level) => {
  if (level === 'high') return randomInt(85, 98);
  if (level === 'medium') return randomInt(65, 84);
  return randomInt(40, 64);
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Student.deleteMany({});
    await Faculty.deleteMany({});
    await Subject.deleteMany({});
    await Attendance.deleteMany({});
    await Marks.deleteMany({});
    await RiskScore.deleteMany({});
    await Prediction.deleteMany({});
    console.log('✅ Cleared existing data\n');

    console.log('👑 Creating admin account...');
    await User.create({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    console.log('✅ Created admin user\n');

    // ==================== CREATE DEPARTMENTS ====================
    console.log('📚 Creating departments...');
    const departments = await Department.insertMany([
      { name: 'Computer Science', code: 'CS', establishedYear: 2010, totalStudents: 0, totalFaculty: 0 },
      { name: 'Information Technology', code: 'IT', establishedYear: 2011, totalStudents: 0, totalFaculty: 0 },
      { name: 'Electronics', code: 'EC', establishedYear: 2012, totalStudents: 0, totalFaculty: 0 },
      { name: 'Mechanical', code: 'ME', establishedYear: 2010, totalStudents: 0, totalFaculty: 0 },
      { name: 'Civil', code: 'CE', establishedYear: 2011, totalStudents: 0, totalFaculty: 0 }
    ]);
    console.log(`✅ Created ${departments.length} departments\n`);

    // ==================== CREATE FACULTY ====================
    console.log('👨‍🏫 Creating faculty...');
    const facultyUsers = [];
    const faculties = [];

    for (let i = 0; i < facultyNames.length; i++) {
      const facultyUser = await User.create({
        name: facultyNames[i],
        email: `faculty${i + 1}@college.edu`,
        password: 'faculty123',
        role: 'faculty',
        isActive: true
      });
      facultyUsers.push(facultyUser);

      const department = randomItem(departments);
      const faculty = await Faculty.create({
        user: facultyUser._id,
        facultyId: `FAC${String(i + 1).padStart(3, '0')}`,
        department: department._id,
        designation: randomItem(['Professor', 'Associate Professor', 'Assistant Professor']),
        joiningDate: randomDate(new Date(2015, 0, 1), new Date(2022, 0, 1)),
        isHOD: i === 0
      });
      faculties.push(faculty);
    }
    console.log(`✅ Created ${faculties.length} faculty members\n`);

    // ==================== CREATE SUBJECTS ====================
    console.log('📖 Creating subjects...');
    const allSubjects = [];

    for (const department of departments) {
      const deptSubjects = subjectsData[department.name] || subjectsData['Computer Science'];
      for (let i = 0; i < deptSubjects.length; i++) {
        const subj = deptSubjects[i];
        const faculty = randomItem(faculties);
        const subject = await Subject.create({
          code: subj.code.startsWith(department.code)
            ? subj.code
            : `${department.code}${subj.code.slice(2)}`,
          name: subj.name,
          department: department._id,
          semester: randomInt(3, 6),
          credits: subj.credits,
          faculty: faculty._id,
          type: subj.type,
          maxMarks: { internal: 30, external: 70, total: 100 }
        });
        allSubjects.push(subject);
        
        // Add subject to faculty's subjects array
        await Faculty.findByIdAndUpdate(faculty._id, {
          $push: { subjects: subject._id }
        });
      }
    }
    console.log(`✅ Created ${allSubjects.length} subjects\n`);

    // ==================== CREATE STUDENTS ====================
    console.log('👨‍🎓 Creating students...');
    const students = [];
    const performanceLevels = ['high', 'medium', 'low'];

    for (let i = 0; i < studentNames.length; i++) {
      const performanceLevel = randomItem(performanceLevels);
      const cgpa = getCGPA(performanceLevel);
      const attendance = getAttendance(performanceLevel);
      
      // Determine risk level based on performance
      let riskLevel = 'low';
      let riskScore = 0.15;
      if (performanceLevel === 'medium') {
        riskLevel = 'medium';
        riskScore = 0.55;
      } else if (performanceLevel === 'low') {
        riskLevel = 'high';
        riskScore = 0.85;
      }

      const studentUser = await User.create({
        name: studentNames[i],
        email: `student${i + 1}@college.edu`,
        password: 'student123',
        role: 'student',
        isActive: true
      });

      const department = randomItem(departments);
      const student = await Student.create({
        user: studentUser._id,
        studentId: `STU${String(i + 1).padStart(3, '0')}`,
        department: department._id,
        semester: randomInt(3, 6),
        batch: `2022-2026`,
        enrollmentYear: 2022,
        dateOfBirth: randomDate(new Date(2000, 0, 1), new Date(2004, 11, 31)),
        gender: randomItem(['Male', 'Female']),
        previousCGPA: cgpa,
        enrollmentStatus: 'active',
        riskLevel: riskLevel,
        riskScore: riskScore
      });
      students.push(student);
    }
    console.log(`✅ Created ${students.length} students\n`);

    // ==================== CREATE ATTENDANCE RECORDS ====================
    console.log('📅 Creating attendance records...');
    const attendanceRecords = [];
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 2, 30);

    for (const student of students) {
      // Get subjects for student's department and semester
      const studentSubjects = allSubjects.filter(s => 
        s.department.toString() === student.department.toString() && 
        s.semester === student.semester
      );

      for (const subject of studentSubjects) {
        // Create 45-60 attendance records per subject
        const numRecords = randomInt(40, 60);
        for (let i = 0; i < numRecords; i++) {
          const date = randomDate(startDate, endDate);
          // Determine status based on student's risk level
          let status = 'present';
          const rand = Math.random();
          if (student.riskLevel === 'high') {
            if (rand < 0.4) status = 'absent';
            else if (rand < 0.55) status = 'late';
            else status = 'present';
          } else if (student.riskLevel === 'medium') {
            if (rand < 0.2) status = 'absent';
            else if (rand < 0.3) status = 'late';
            else status = 'present';
          } else {
            if (rand < 0.05) status = 'absent';
            else if (rand < 0.1) status = 'late';
            else status = 'present';
          }

          attendanceRecords.push({
            student: student._id,
            subject: subject._id,
            date: date,
            status: status,
            markedBy: subject.faculty,
            semester: student.semester
          });
        }
      }
    }
    await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${attendanceRecords.length} attendance records\n`);

    // ==================== CREATE MARKS ====================
    console.log('📝 Creating marks records...');
    const marksRecords = [];

    for (const student of students) {
      const studentSubjects = allSubjects.filter(s => 
        s.department.toString() === student.department.toString() && 
        s.semester === student.semester
      );

      for (const subject of studentSubjects) {
        // Calculate marks based on student's performance level
        let internalMarks, externalMarks;
        
        if (student.riskLevel === 'high') {
          internalMarks = randomInt(10, 18);
          externalMarks = randomInt(25, 45);
        } else if (student.riskLevel === 'medium') {
          internalMarks = randomInt(18, 25);
          externalMarks = randomInt(45, 60);
        } else {
          internalMarks = randomInt(25, 30);
          externalMarks = randomInt(60, 75);
        }

        const totalMarks = internalMarks + externalMarks;
        let grade, gradePoints;

        if (totalMarks >= 90) {
          grade = 'O';
          gradePoints = 10;
        } else if (totalMarks >= 80) {
          grade = 'A+';
          gradePoints = 9;
        } else if (totalMarks >= 70) {
          grade = 'A';
          gradePoints = 8;
        } else if (totalMarks >= 60) {
          grade = 'B+';
          gradePoints = 7;
        } else if (totalMarks >= 50) {
          grade = 'B';
          gradePoints = 6;
        } else if (totalMarks >= 40) {
          grade = 'C';
          gradePoints = 5;
        } else {
          grade = 'F';
          gradePoints = 0;
        }

        marksRecords.push({
          student: student._id,
          subject: subject._id,
          semester: student.semester,
          internalMarks: internalMarks,
          externalMarks: externalMarks,
          totalMarks: totalMarks,
          grade: grade,
          gradePoints: gradePoints,
          assignmentMarks: randomInt(8, 15),
          quizMarks: randomInt(5, 10),
          labMarks: randomInt(15, 25),
          midtermMarks: randomInt(15, 25),
          recordedBy: subject.faculty,
          examType: 'final'
        });
      }
    }
    await Marks.insertMany(marksRecords);
    console.log(`✅ Created ${marksRecords.length} marks records\n`);

    // ==================== CREATE RISK SCORES ====================
    console.log('⚠️ Creating risk assessments...');
    const riskScores = [];

    for (const student of students) {
      // Calculate attendance percentage
      const studentAttendance = attendanceRecords.filter(a => a.student.toString() === student._id.toString());
      const presentCount = studentAttendance.filter(a => a.status === 'present').length;
      const attendancePercentage = studentAttendance.length > 0 ? (presentCount / studentAttendance.length) * 100 : 0;

      // Calculate average marks
      const studentMarks = marksRecords.filter(m => m.student.toString() === student._id.toString());
      const avgMarks = studentMarks.length > 0 
        ? studentMarks.reduce((sum, m) => sum + m.internalMarks + m.externalMarks, 0) / studentMarks.length 
        : 0;

      // Calculate risk score
      let riskScoreValue = 0;
      let riskFactors = {};

      if (attendancePercentage < 70) {
        riskScoreValue += 0.4;
        riskFactors.attendance = { score: 0.4, impact: 'high' };
      } else if (attendancePercentage < 80) {
        riskScoreValue += 0.2;
        riskFactors.attendance = { score: 0.2, impact: 'medium' };
      } else {
        riskFactors.attendance = { score: 0.05, impact: 'low' };
      }

      if (avgMarks < 50) {
        riskScoreValue += 0.5;
        riskFactors.academics = { score: 0.5, impact: 'high' };
      } else if (avgMarks < 65) {
        riskScoreValue += 0.25;
        riskFactors.academics = { score: 0.25, impact: 'medium' };
      } else {
        riskFactors.academics = { score: 0.05, impact: 'low' };
      }

      let riskLevel = 'low';
      if (riskScoreValue >= 0.7) riskLevel = 'high';
      else if (riskScoreValue >= 0.4) riskLevel = 'medium';

      const recommendations = [];
      if (attendancePercentage < 75) recommendations.push('⚠️ Improve attendance - attend at least 75% of classes');
      if (avgMarks < 60) recommendations.push('📚 Focus on academics - attend extra help sessions');
      if (riskLevel === 'high') recommendations.push('🎯 Schedule meeting with academic advisor immediately');
      if (riskLevel === 'medium') recommendations.push('📈 Create a study plan to improve performance');
      if (recommendations.length === 0) recommendations.push('✅ Keep up the good work! Maintain current performance');

      riskScores.push({
        student: student._id,
        riskScore: riskScoreValue,
        riskLevel: riskLevel,
        factors: riskFactors,
        recommendations: recommendations,
        predictedDropoutProbability: riskScoreValue * 1.1,
        lastCalculated: new Date(),
        history: [{
          riskScore: riskScoreValue,
          riskLevel: riskLevel,
          calculatedAt: new Date()
        }]
      });
    }
    await RiskScore.insertMany(riskScores);
    console.log(`✅ Created ${riskScores.length} risk assessments\n`);

    // ==================== CREATE PREDICTIONS ====================
    console.log('🤖 Creating AI predictions...');
    const predictions = [];

    for (const student of students) {
      const studentMarks = marksRecords.filter(m => m.student.toString() === student._id.toString());
      const avgMarks = studentMarks.length > 0 
        ? studentMarks.reduce((sum, m) => sum + m.internalMarks + m.externalMarks, 0) / studentMarks.length 
        : 50;

      const studentAttendance = attendanceRecords.filter(a => a.student.toString() === student._id.toString());
      const presentCount = studentAttendance.filter(a => a.status === 'present').length;
      const attendancePercentage = studentAttendance.length > 0 ? (presentCount / studentAttendance.length) * 100 : 0;

      // Predict next semester CGPA
      let predictedCGPA;
      let predictedGrade;
      let confidence;

      if (student.riskLevel === 'high') {
        predictedCGPA = randomInt(40, 55) / 10;
        predictedGrade = 'C';
        confidence = 0.75;
      } else if (student.riskLevel === 'medium') {
        predictedCGPA = randomInt(55, 70) / 10;
        predictedGrade = 'B';
        confidence = 0.82;
      } else {
        predictedCGPA = randomInt(70, 90) / 10;
        predictedGrade = randomItem(['A', 'A+', 'O']);
        confidence = 0.88;
      }

      const improvementSuggestions = [];
      if (avgMarks < 60) improvementSuggestions.push('📖 Increase study hours by 2 hours daily');
      if (student.riskLevel !== 'low') improvementSuggestions.push('📝 Complete all assignments before deadlines');
      improvementSuggestions.push('👥 Join study groups for collaborative learning');
      
      predictions.push({
        student: student._id,
        semester: student.semester + 1,
        predictedCGPA: predictedCGPA,
        predictedGrade: predictedGrade,
        confidence: confidence,
        factors: {
          attendance: attendancePercentage,
          currentCGPA: student.previousCGPA,
          assignmentCompletion: randomInt(60, 95) / 100
        },
        improvementSuggestions: improvementSuggestions,
        weakAreas: avgMarks < 60 ? ['Core Subjects', 'Problem Solving'] : [],
        strongAreas: avgMarks > 75 ? ['Programming', 'Mathematics'] : [],
        predictionDate: new Date()
      });
    }
    await Prediction.insertMany(predictions);
    console.log(`✅ Created ${predictions.length} predictions\n`);

    // ==================== UPDATE DEPARTMENT COUNTS ====================
    for (const department of departments) {
      const studentCount = students.filter(s => s.department.toString() === department._id.toString()).length;
      const facultyCount = faculties.filter(f => f.department.toString() === department._id.toString()).length;
      await Department.findByIdAndUpdate(department._id, {
        totalStudents: studentCount,
        totalFaculty: facultyCount
      });
    }

    // ==================== SUMMARY ====================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📊 DATA SUMMARY:');
    console.log(`   • Departments: ${departments.length}`);
    console.log(`   • Faculty: ${faculties.length}`);
    console.log(`   • Students: ${students.length}`);
    console.log(`   • Subjects: ${allSubjects.length}`);
    console.log(`   • Attendance Records: ${attendanceRecords.length}`);
    console.log(`   • Marks Records: ${marksRecords.length}`);
    console.log(`   • Risk Assessments: ${riskScores.length}`);
    console.log(`   • AI Predictions: ${predictions.length}\n`);

    console.log('👥 USER CREDENTIALS:');
    console.log('   Admin:');
    console.log('     Email: admin@college.edu');
    console.log('     Password: admin123\n');
    console.log('   Faculty (sample):');
    console.log(`     Email: faculty1@college.edu`);
    console.log('     Password: faculty123\n');
    console.log('   Students (sample):');
    console.log('     Email: student1@college.edu');
    console.log('     Password: student123\n');
    console.log('   Total users created:');
    console.log(`     • 1 Admin`);
    console.log(`     • ${faculties.length} Faculty`);
    console.log(`     • ${students.length} Students\n`);

    console.log('📈 PERFORMANCE DISTRIBUTION:');
    const highRisk = riskScores.filter(r => r.riskLevel === 'high').length;
    const mediumRisk = riskScores.filter(r => r.riskLevel === 'medium').length;
    const lowRisk = riskScores.filter(r => r.riskLevel === 'low').length;
    console.log(`   • High Risk Students: ${highRisk} (${Math.round(highRisk/students.length*100)}%)`);
    console.log(`   • Medium Risk Students: ${mediumRisk} (${Math.round(mediumRisk/students.length*100)}%)`);
    console.log(`   • Low Risk Students: ${lowRisk} (${Math.round(lowRisk/students.length*100)}%)`);

    console.log('\n✨ Your database is now ready with realistic data!');
    console.log('🚀 Start your backend: npm run dev');
    console.log('🌐 Open frontend: http://localhost:3000');
    console.log('🔐 Login with any student account to see charts and data!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();