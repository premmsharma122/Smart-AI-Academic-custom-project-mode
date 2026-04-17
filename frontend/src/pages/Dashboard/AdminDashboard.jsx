import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  FaUniversity, 
  FaUsers, 
  FaChalkboardTeacher, 
  FaChartLine, 
  FaRobot, 
  FaDownload,
  FaSchool,
  FaBook,
  FaCalendarAlt
} from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const statsRes = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      const analyticsRes = await fetch('http://localhost:5000/api/predictions/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const analyticsData = await analyticsRes.json();

      const modelStatusRes = await fetch('http://localhost:5000/api/predictions/model-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const modelStatusData = await modelStatusRes.json();
      
      if (statsData.success) setStats(statsData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (modelStatusData.success) setModelInfo(modelStatusData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };


  const trainPredictionModel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/predictions/train-model', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Model training failed');
      }
      alert('Model trained successfully!');
      loadData();
    } catch (error) {
      alert(error.message || 'Failed to train model');
    }
  };

  const generatePredictions = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/predictions/generate-risk', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      await fetch('http://localhost:5000/api/predictions/generate', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('Risk scores and predictions generated successfully!');
      loadData();
    } catch (error) {
      alert('Failed to generate predictions');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: FaUsers, color: 'bg-blue-500' },
    { title: 'Total Faculty', value: stats?.totalFaculty || 0, icon: FaChalkboardTeacher, color: 'bg-green-500' },
    { title: 'Departments', value: stats?.totalDepartments || 0, icon: FaSchool, color: 'bg-purple-500' },
    { title: 'At-Risk Students', value: stats?.atRiskStudents || 0, icon: FaChartLine, color: 'bg-red-500' },
  ];

  const riskData = analytics?.riskLevels || [
    { _id: 'low', count: 45 },
    { _id: 'medium', count: 12 },
    { _id: 'high', count: 8 }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-hero p-6"
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="page-subtitle mt-2">College-wide analytics and AI insights</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={trainPredictionModel}
              className="btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FaRobot />
              <span>Train AI Models</span>
            </button>
            <button
              onClick={generatePredictions}
              className="btn-secondary px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FaRobot />
              <span>Generate AI Predictions</span>
            </button>
          </div>
        </div>
      </motion.div>

      {modelInfo?.metadata && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-section p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Live AI Model Suite</h3>
              <p className="text-sm text-gray-500 mt-1">{modelInfo.metadata.modelName}</p>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">AUC:</span> {modelInfo.metadata.riskModel?.metrics?.rocAuc ?? 'N/A'}
              </div>
              <div>
                <span className="font-medium">R²:</span> {modelInfo.metadata.performanceModel?.metrics?.r2 ?? 'N/A'}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Last trained: {modelInfo.metadata.trainedAt ? new Date(modelInfo.metadata.trainedAt).toLocaleString() : 'Not available'}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className="page-section p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="text-white text-xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="page-section p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="_id"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="page-section p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.predictionsBySemester || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
              <XAxis dataKey="_id" tick={{ fill: chartTextColor }} />
              <YAxis tick={{ fill: chartTextColor }} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ color: chartTextColor }} />
              <Line type="monotone" dataKey="avgPredictedCGPA" stroke="#a855f7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-section p-6"
      >
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
          <button className="text-slate-700 hover:text-slate-900 flex items-center space-x-2">
            <FaDownload />
            <span>Export Report</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors">
            <h4 className="font-semibold text-blue-800">Generate Reports</h4>
            <p className="text-sm text-blue-600 mt-1">Download department-wise reports</p>
          </button>
          <button className="p-4 bg-green-50 rounded-xl text-left hover:bg-green-100 transition-colors">
            <h4 className="font-semibold text-green-800">Manage Departments</h4>
            <p className="text-sm text-green-600 mt-1">Add or update department info</p>
          </button>
          <button className="p-4 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors">
            <h4 className="font-semibold text-purple-800">AI Analytics</h4>
            <p className="text-sm text-purple-600 mt-1">View detailed AI insights</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;