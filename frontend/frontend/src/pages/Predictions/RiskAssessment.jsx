
import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/student';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const RiskAssessment = () => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

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
    loadRiskAssessment();
  }, []);

  const loadRiskAssessment = async () => {
    try {
      const response = await studentService.getRiskAssessment();
      setRiskData(response.data);
    } catch (error) {
      console.error('Failed to load risk assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const data = riskData;
  const riskColors = {
    low: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', icon: FaCheckCircle },
    medium: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', icon: FaInfoCircle },
    high: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200', icon: FaExclamationTriangle },
  };

  const currentRisk = riskColors[data?.riskLevel || 'low'];
  const RiskIcon = currentRisk.icon;

  const factorData = data?.factors ? Object.entries(data.factors).filter(([key]) => key !== 'model').map(([key, value]) => ({
    name: key,
    value: value.score,
    impact: value.impact,
  })) : [];

  const pieData = [
    { name: 'Risk Score', value: data?.riskScore ? data.riskScore * 100 : 0 },
    { name: 'Safe Zone', value: 100 - (data?.riskScore ? data.riskScore * 100 : 0) },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-hero p-6">
        <h1 className="text-2xl font-bold">AI Risk Assessment</h1>
        <p className="page-subtitle mt-2">This section highlights your current academic risk level and recommended support actions.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`${currentRisk.bg} rounded-2xl shadow-lg p-6 border ${currentRisk.border}`}>
          <div className="flex items-center space-x-4">
            <RiskIcon className={`${currentRisk.text} text-4xl`} />
            <div>
              <p className="text-gray-500 text-sm">Overall Risk Level</p>
              <p className={`text-3xl font-bold ${currentRisk.text} capitalize`}>{data?.riskLevel || 'Low'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Risk Score: {((data?.riskScore || 0) * 100).toFixed(1)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className={`h-2 rounded-full ${data?.riskLevel === 'high' ? 'bg-red-500' : data?.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${((data?.riskScore || 0) * 100)}%` }}></div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="page-section p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Score Visualisation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value">
                <Cell fill="#ef4444" />
                <Cell fill="#10b981" />
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-center text-sm text-gray-500 mt-2">Dropout Probability: {((data?.predictedDropoutProbability || 0) * 100).toFixed(1)}%</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="page-section p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Factors</h3>
          <div className="space-y-3">
            {factorData.map((factor, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-gray-600">{factor.name.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-gray-500">{Math.round((factor.value || 0) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-red-400 to-orange-400" style={{ width: `${(factor.value || 0) * 100}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Impact: {factor.impact}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="page-section theme-highlight p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data?.recommendations || []).map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-700">{rec}</p>
            </div>
          ))}
          {(!data?.recommendations || data.recommendations.length === 0) && (
            <div className="text-sm text-gray-500">No AI recommendations are available yet.</div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="page-section p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk History</h3>
        <div className="overflow-x-auto table-shell">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Risk Score</th>
                <th className="text-left py-3 px-4">Risk Level</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.history || []).slice().reverse().map((record, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{new Date(record.calculatedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{((record.riskScore || 0) * 100).toFixed(1)}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${record.riskLevel === 'high' ? 'bg-red-100 text-red-600' : record.riskLevel === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                      {record.riskLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4">{record.riskLevel === data?.riskLevel ? 'Current' : 'Previous'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default RiskAssessment;
