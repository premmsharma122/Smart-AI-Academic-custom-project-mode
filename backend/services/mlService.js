
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Student = require('../models/Student');
const pythonModelService = require('./pythonModelService');

class MLService {
  async getStudentMetrics(studentId) {
    const student = await Student.findById(studentId).populate('department');
    const attendance = await Attendance.find({ student: studentId });
    const rawMarks = await Marks.find({ student: studentId }).populate('subject');
    const marks = this.normalizeMarksForAnalytics(rawMarks);

    const attendancePercentage = this.calculateAttendancePercentage(attendance);
    const assignmentCompletion = this.calculateAssignmentRate(marks);
    const currentCGPA = this.calculateCGPA(marks);
    const averageInternalMarks = this.calculateAverageInternalMarks(marks);
    const averageTotalMarks = this.calculateAverageTotalMarks(marks);
    const subjectsEnrolled = marks.length;
    const subjectsPassed = marks.filter((m) => (m.gradePoints || 0) >= 4).length;
    const evaluatedSubjects = marks.filter((m) => (m.totalMarks || 0) > 0).length;
    const creditedSubjects = marks.filter((m) => (m.gradePoints || 0) >= 5).length;
    const ageAtEnrollment = this.calculateAgeAtEnrollment(student);

    return {
      studentId: student._id.toString(),
      name: student.user?.name,
      department: student.department?.name,
      semester: student.semester,
      gender: student.gender || 'Male',
      attendancePercentage,
      assignmentCompletion,
      currentCGPA,
      previousCGPA: student.previousCGPA || currentCGPA,
      averageInternalMarks,
      averageTotalMarks,
      averageGrade20: Math.min(20, Math.max(0, averageTotalMarks / 10)),
      subjectsEnrolled,
      subjectsEvaluated: evaluatedSubjects,
      subjectsPassed,
      subjectsCredited: creditedSubjects,
      ageAtEnrollment,
      debtor: student.debtor ? 1 : 0,
      tuitionFeesUpToDate: student.tuitionFeesUpToDate === false ? 0 : 1,
      scholarshipHolder: student.scholarshipHolder ? 1 : 0,
      international: student.international ? 1 : 0,
      daytimeAttendance: 1,
      displaced: 1,
      educationalSpecialNeeds: student.educationalSpecialNeeds ? 1 : 0,
      courseCode: this.mapCourseCode(student),
      applicationModeCode: 8,
      applicationOrder: 1,
      previousQualificationCode: 1,
      nationalityCode: 1,
      maritalStatusCode: 1,
      motherQualificationCode: 13,
      fatherQualificationCode: 14,
      motherOccupationCode: 6,
      fatherOccupationCode: 8,
      unemploymentRate: 11.1,
      inflationRate: 1.4,
      gdp: 0.32,
      weakAreas: this.identifyWeakAreas({
        attendance_percentage: attendancePercentage,
        internal_marks: averageInternalMarks,
        assignment_submission_rate: assignmentCompletion,
        previous_cgpa: student.previousCGPA || currentCGPA,
      }),
      strongAreas: this.identifyStrongAreas({
        attendance_percentage: attendancePercentage,
        internal_marks: averageInternalMarks,
        assignment_submission_rate: assignmentCompletion,
        previous_cgpa: student.previousCGPA || currentCGPA,
      }),
    };
  }

  normalizeMarksForAnalytics(marks) {
    const grouped = new Map();

    for (const mark of marks) {
      const key = `${mark.subject?._id || mark.subject}-${mark.semester}`;
      const current = grouped.get(key);
      const currentPriority = current?.examType === 'endterm' ? 2 : 1;
      const nextPriority = mark.examType === 'endterm' ? 2 : 1;

      if (!current || nextPriority >= currentPriority) {
        grouped.set(key, mark);
      }
    }

    return Array.from(grouped.values());
  }

  async prepareStudentData(studentId) {
    return this.getStudentMetrics(studentId);
  }

  async prepareRiskData(studentId) {
    return this.getStudentMetrics(studentId);
  }

  async getDropoutPrediction(input) {
    const studentData = input.studentId ? await this.getStudentMetrics(input.studentId) : input;
    return pythonModelService.runScript('predict_dropout.py', { student: studentData });
  }

  async predictPerformance(data) {
    const modelOutput = data.modelOutput || data.dropoutPrediction || await this.getDropoutPrediction(data);

    if (modelOutput && modelOutput.performancePrediction) {
      const performance = modelOutput.performancePrediction;
      const suggestions = Array.isArray(performance.suggestions) && performance.suggestions.length
        ? performance.suggestions
        : (modelOutput.recommendations || []);

      return {
        predictedCGPA: Number(performance.predictedCGPA || 0),
        predictedGrade: performance.predictedGrade || 'C',
        confidence: Number(performance.confidence || modelOutput.confidence || 0.8),
        factors: {
          attendance: Number((data.attendancePercentage || 0).toFixed(2)),
          currentCGPA: Number((data.currentCGPA || data.previousCGPA || 0).toFixed(2)),
          assignmentCompletion: Number((data.assignmentCompletion || 0).toFixed(3)),
        },
        suggestions,
        weakAreas: performance.weakAreas || data.weakAreas || [],
        strongAreas: performance.strongAreas || data.strongAreas || [],
        dropoutProbability: Number(modelOutput.dropoutProbability || 0),
      };
    }

    const dropoutPrediction = modelOutput || await this.getDropoutPrediction(data);
    const currentCGPA = Number(data.currentCGPA || data.previousCGPA || 0);
    const attendanceImpact = (Number(data.attendancePercentage || 0) / 100) * 0.5;
    const assignmentImpact = Number(data.assignmentCompletion || 0) * 0.8;
    const internalImpact = (Number(data.averageInternalMarks || 0) / 100) * 1.4;
    const dropoutPenalty = Number(dropoutPrediction.dropoutProbability || 0) * 1.2;

    const predictedCGPA = Math.max(
      0,
      Math.min(10, currentCGPA * 0.65 + attendanceImpact + assignmentImpact + internalImpact - dropoutPenalty)
    );

    let predictedGrade = 'C';
    if (predictedCGPA >= 9) predictedGrade = 'O';
    else if (predictedCGPA >= 8) predictedGrade = 'A+';
    else if (predictedCGPA >= 7) predictedGrade = 'A';
    else if (predictedCGPA >= 6) predictedGrade = 'B+';
    else if (predictedCGPA >= 5) predictedGrade = 'B';
    else if (predictedCGPA >= 4) predictedGrade = 'C';
    else predictedGrade = 'F';

    const suggestions = [...(dropoutPrediction.recommendations || [])];
    if (predictedCGPA >= currentCGPA && suggestions.length === 0) {
      suggestions.push('Current trend is positive. Maintain attendance, assignment discipline, and internal marks.');
    }

    return {
      predictedCGPA: Number(predictedCGPA.toFixed(2)),
      predictedGrade,
      confidence: Number(dropoutPrediction.confidence || 0.8),
      factors: {
        attendance: Number((data.attendancePercentage || 0).toFixed(2)),
        currentCGPA: Number(currentCGPA.toFixed(2)),
        assignmentCompletion: Number((data.assignmentCompletion || 0).toFixed(3)),
      },
      suggestions,
      weakAreas: data.weakAreas || this.identifyWeakAreas({
        attendance_percentage: data.attendancePercentage,
        internal_marks: data.averageInternalMarks,
        assignment_submission_rate: data.assignmentCompletion,
        previous_cgpa: currentCGPA,
      }),
      strongAreas: data.strongAreas || this.identifyStrongAreas({
        attendance_percentage: data.attendancePercentage,
        internal_marks: data.averageInternalMarks,
        assignment_submission_rate: data.assignmentCompletion,
        previous_cgpa: currentCGPA,
      }),
      dropoutProbability: Number(dropoutPrediction.dropoutProbability || 0),
    };
  }

  async calculateRiskScore(data) {
    const dropoutPrediction = data.dropoutPrediction || await this.getDropoutPrediction(data);
    return {
      score: Number(dropoutPrediction.riskScore || dropoutPrediction.dropoutProbability || 0),
      level: dropoutPrediction.riskLevel || 'low',
      dropoutProbability: Number(dropoutPrediction.dropoutProbability || 0),
      confidence: Number(dropoutPrediction.confidence || 0),
      factors: {
        attendance: dropoutPrediction.factors?.attendance || { score: 0, impact: 'Low' },
        academics: dropoutPrediction.factors?.academics || { score: 0, impact: 'Low' },
        assignments: dropoutPrediction.factors?.assignments || { score: 0, impact: 'Low' },
        previousPerformance: dropoutPrediction.factors?.previousPerformance || { score: 0, impact: 'Low' },
      },
      recommendations: dropoutPrediction.recommendations || [],
      model: {
        predictionLabel: dropoutPrediction.predictionLabel,
        threshold: dropoutPrediction.threshold,
      },
    };
  }

  mapCourseCode(student) {
    const name = String(student.department?.name || '').toLowerCase();
    if (name.includes('computer') || name.includes('cse')) return 11;
    if (name.includes('electrical')) return 9;
    if (name.includes('mechanical')) return 7;
    if (name.includes('civil')) return 5;
    return 11;
  }

  calculateAttendancePercentage(attendance) {
    if (!attendance.length) return 0;
    const weightedPresent = attendance.reduce((sum, item) => {
      if (item.status === 'present') return sum + 1;
      if (item.status === 'late') return sum + 0.5;
      if (item.status === 'excused') return sum + 0.75;
      return sum;
    }, 0);
    return Number(((weightedPresent / attendance.length) * 100).toFixed(2));
  }

  calculateAssignmentRate(marks) {
    if (!marks.length) return 0;
    const submitted = marks.filter((m) => (m.assignmentMarks || 0) > 0).length;
    return Number((submitted / marks.length).toFixed(3));
  }

  calculateCGPA(marks) {
    if (!marks.length) return 0;
    let totalPoints = 0;
    let totalCredits = 0;
    for (const mark of marks) {
      const credits = Number(mark.subject?.credits || 1);
      totalPoints += Number(mark.gradePoints || 0) * credits;
      totalCredits += credits;
    }
    return Number((totalCredits > 0 ? totalPoints / totalCredits : 0).toFixed(2));
  }

  calculateAverageInternalMarks(marks) {
    if (!marks.length) return 0;
    const sum = marks.reduce((acc, item) => acc + Number(item.internalMarks || 0), 0);
    return Number((sum / marks.length).toFixed(2));
  }

  calculateAverageTotalMarks(marks) {
    if (!marks.length) return 0;
    const sum = marks.reduce((acc, item) => acc + Number(item.totalMarks || 0), 0);
    return Number((sum / marks.length).toFixed(2));
  }

  calculateAgeAtEnrollment(student) {
    if (!student?.dateOfBirth || !student?.enrollmentYear) return 20;
    const birthYear = new Date(student.dateOfBirth).getFullYear();
    const age = student.enrollmentYear - birthYear;
    return age > 15 && age < 70 ? age : 20;
  }

  identifyWeakAreas(data) {
    const weakAreas = [];
    if (Number(data.attendance_percentage || 0) < 75) weakAreas.push('Attendance');
    if (Number(data.internal_marks || 0) < 60) weakAreas.push('Internal Assessments');
    if (Number(data.assignment_submission_rate || 0) < 0.8) weakAreas.push('Assignment Submission');
    if (Number(data.previous_cgpa || 0) < 6) weakAreas.push('Overall Academic Performance');
    return weakAreas;
  }

  identifyStrongAreas(data) {
    const strongAreas = [];
    if (Number(data.attendance_percentage || 0) >= 90) strongAreas.push('Excellent Attendance');
    if (Number(data.internal_marks || 0) >= 85) strongAreas.push('Strong Internal Performance');
    if (Number(data.assignment_submission_rate || 0) >= 0.95) strongAreas.push('Consistent Assignment Submission');
    if (Number(data.previous_cgpa || 0) >= 8) strongAreas.push('High Academic Achievement');
    return strongAreas;
  }
}

module.exports = new MLService();
