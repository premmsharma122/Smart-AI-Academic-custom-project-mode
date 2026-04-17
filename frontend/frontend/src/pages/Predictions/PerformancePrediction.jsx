
import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/student';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FaRobot, FaLightbulb, FaArrowUp } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PerformancePrediction = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCgpa, setCurrentCgpa] = useState(0);
  const [currentSemester, setCurrentSemester] = useState(0);
  const { isDark } = useTheme();

  const chartTextColor = isDark ? '#cbd5e1' : '#475569';
  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? '#121b2b' : '#ffffff',
      border: `1px solid ${isDark ? '#27344a' : '#d8dfeb'}`,
      borderRadius: '12px',
      color: isDark ? '#edf3ff' : '#102038',
    },
    labelStyle: { color: isDark ? '#edf3ff' : '#102038' },
    itemStyle: { color: isDark ? '#edf3ff' : '#102038' },
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const [predictionResponse, dashboardResponse] = await Promise.all([
        studentService.getPredictions(),
        studentService.getDashboard(),
      ]);
      setPredictions(predictionResponse.data || []);
      setCurrentCgpa(Number(dashboardResponse?.data?.stats?.currentCGPA || 0));
      setCurrentSemester(Number(dashboardResponse?.data?.student?.semester || 0));
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const predList = predictions;
  const latestPred = predList[predList.length - 1];

  const chartData = [
    ...(currentSemester ? [{ semester: currentSemester, predictedCGPA: currentCgpa, confidence: 100, label: 'Current' }] : []),
    ...predList.map((pred) => ({
      semester: pred.semester,
      predictedCGPA: pred.predictedCGPA,
      confidence: Number((pred.confidence || 0) * 100).toFixed(0),
      label: 'Predicted',
    })),
  ];

  const getGradeColor = (grade) => ({ O: 'text-purple-600', 'A+': 'text-blue-600', A: 'text-green-600', 'B+': 'text-yellow-600', B: 'text-orange-600', C: 'text-red-600', F: 'text-gray-600' }[grade] || 'text-gray-600');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-hero p-6">
        <div className="flex items-center space-x-3">
          <FaRobot className="text-3xl" />
          <div>
            <h1 className="text-2xl font-bold">Academic Prediction Summary</h1>
            <p className="text-blue-100 mt-1">Projected academic trend based on attendance, marks, and overall consistency.</p>
          </div>
        </div>
      </motion.div>

      {latestPred && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="page-section p-6">
            <p className="text-gray-500 text-sm">Predicted CGPA</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{latestPred.predictedCGPA}</p>
            <p className="text-sm text-gray-500 mt-2">Confidence: {((latestPred.confidence || 0) * 100).toFixed(0)}%</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="page-section p-6">
            <p className="text-gray-500 text-sm">Predicted Grade</p>
            <p className={`text-5xl font-bold ${getGradeColor(latestPred.predictedGrade)} mt-2`}>{latestPred.predictedGrade}</p>
            <p className="text-sm text-gray-500 mt-2">Forecast for Semester {latestPred.semester}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="page-section p-6">
            <p className="text-gray-500 text-sm">Key Factors</p>
            <div className="space-y-2 mt-3">
              {Object.entries(latestPred.factors || {}).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-gray-600">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-gray-500">{value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${key === 'assignmentCompletion' ? Number(value) * 100 : Math.min(Number(value) * 10, 100)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="page-section p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Prediction Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
            <XAxis dataKey="semester" tick={{ fill: chartTextColor }} />
            <YAxis domain={[0, 10]} tick={{ fill: chartTextColor }} />
            <Tooltip {...chartTooltipStyle} />
            <Legend wrapperStyle={{ color: chartTextColor }} />
            <Line type="monotone" dataKey="predictedCGPA" name="CGPA" stroke="#a855f7" strokeWidth={2} />
            <Line type="monotone" dataKey="confidence" name="Confidence %" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {latestPred?.improvementSuggestions?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="page-section theme-highlight-warm p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaLightbulb className="text-yellow-500 text-2xl" />
            <h3 className="text-lg font-semibold text-gray-800">AI Improvement Suggestions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestPred.improvementSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <FaArrowUp className="text-green-500 mt-1" />
                <p className="text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {latestPred?.weakAreas?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="page-section p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Areas for Improvement</h3>
          <div className="flex flex-wrap gap-2">
            {latestPred.weakAreas.map((area, index) => (
              <span key={index} className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm">{area}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PerformancePrediction;
