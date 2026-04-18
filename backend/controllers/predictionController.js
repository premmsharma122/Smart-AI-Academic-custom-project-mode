const fs = require('fs');
const path = require('path');
const Prediction = require('../models/Prediction');
const Student = require('../models/Student');
const RiskScore = require('../models/RiskScore');
const mlService = require('../services/mlService');
const pythonModelService = require('../services/pythonModelService');

async function upsertPredictionForStudent(student, semesterOverride) {
  const studentData = await mlService.prepareStudentData(student._id);
  const dropoutPrediction = await mlService.getDropoutPrediction(studentData);
  const prediction = await mlService.predictPerformance({
    ...studentData,
    dropoutPrediction,
  });

  const targetSemester = semesterOverride || Math.min((student.semester || 1) + 1, 8);

  const record = await Prediction.findOneAndUpdate(
    { student: student._id, semester: targetSemester },
    {
      predictedCGPA: prediction.predictedCGPA,
      predictedGrade: prediction.predictedGrade,
      confidence: prediction.confidence,
      factors: prediction.factors,
      improvementSuggestions: prediction.suggestions,
      weakAreas: prediction.weakAreas,
      strongAreas: prediction.strongAreas,
      predictionDate: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return record;
}

async function upsertRiskForStudent(student) {
  const studentData = await mlService.prepareRiskData(student._id);
  const risk = await mlService.calculateRiskScore(studentData);

  const riskScore = await RiskScore.findOneAndUpdate(
    { student: student._id },
    {
      riskScore: risk.score,
      riskLevel: risk.level,
      factors: risk.factors,
      recommendations: risk.recommendations,
      predictedDropoutProbability: risk.dropoutProbability,
      lastCalculated: new Date(),
      $push: {
        history: {
          riskScore: risk.score,
          riskLevel: risk.level,
          calculatedAt: new Date(),
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  student.riskLevel = risk.level;
  student.riskScore = risk.score;
  await student.save();

  return riskScore;
}

exports.getPredictions = async (req, res) => {
  try {
    const { semester, department, riskLevel } = req.query;

    const query = {};
    if (semester) query.semester = semester;

    if (department) {
      const students = await Student.find({ department }).select('_id');
      query.student = { $in: students.map((item) => item._id) };
    }

    if (riskLevel) {
      const riskScores = await RiskScore.find({ riskLevel }).select('student');
      query.student = { $in: riskScores.map((item) => item.student) };
    }

    const predictions = await Prediction.find(query)
      .populate({ path: 'student', populate: { path: 'department' } })
      .sort('-predictionDate');

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getStudentPrediction = async (req, res) => {
  try {
    const { studentId } = req.params;
    const prediction = await Prediction.findOne({ student: studentId }).sort('-semester').populate('student');

    if (!prediction) {
      return res.status(404).json({ success: false, message: 'No prediction found for this student' });
    }

    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.generatePredictions = async (req, res) => {
  try {
    const { semester } = req.body;
    const students = await Student.find({ enrollmentStatus: 'active' });
    const results = [];

    for (const student of students) {
      const prediction = await upsertPredictionForStudent(student, semester);
      results.push(prediction);
    }

    res.status(200).json({
      success: true,
      message: `Generated predictions for ${results.length} students`,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

exports.generateRiskScores = async (req, res) => {
  try {
    const students = await Student.find({ enrollmentStatus: 'active' });
    const results = [];

    for (const student of students) {
      const riskScore = await upsertRiskForStudent(student);
      results.push(riskScore);
    }

    res.status(200).json({
      success: true,
      message: `Generated risk scores for ${results.length} students`,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

exports.getAtRiskStudents = async (req, res) => {
  try {
    const riskScores = await RiskScore.find({ riskLevel: { $in: ['medium', 'high'] } })
      .populate({
        path: 'student',
        populate: [
          { path: 'user', select: 'name email' },
          { path: 'department' },
        ],
      })
      .sort('-riskScore');

    res.status(200).json({ success: true, count: riskScores.length, data: riskScores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getPredictionAnalytics = async (req, res) => {
  try {
    const riskLevels = await RiskScore.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
          avgRiskScore: { $avg: '$riskScore' },
        },
      },
    ]);

    const predictionsBySemester = await Prediction.aggregate([
      {
        $group: {
          _id: '$semester',
          avgPredictedCGPA: { $avg: '$predictedCGPA' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        riskLevels,
        predictionsBySemester,
        totalAtRisk: await RiskScore.countDocuments({ riskLevel: 'high' }),
        totalMediumRisk: await RiskScore.countDocuments({ riskLevel: 'medium' }),
        model: pythonModelService.getModelMetadata(),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.trainPredictionModel = async (req, res) => {
  try {
    const result = await pythonModelService.runScript('train_dropout_model.py', {});
    res.status(200).json({
      success: true,
      message: 'Project-aligned AI models trained successfully',
      data: result.metadata || result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Model training failed' });
  }
};

exports.getModelStatus = async (req, res) => {
  try {
    const metadata = pythonModelService.getModelMetadata();
    const modelPath = path.join(__dirname, '..', 'ml', 'model_artifacts', 'smart_ai_dropout_risk_model.pkl');

    res.status(200).json({
      success: true,
      data: {
        available: fs.existsSync(modelPath),
        metadata,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports.upsertPredictionForStudent = upsertPredictionForStudent;
module.exports.upsertRiskForStudent = upsertRiskForStudent;
